---
title: "Agent v1 × Cloud Storage"
date: 2026-04-01
thumbnail: https://github.com/user-attachments/assets/331ce99c-c4b6-4a1b-9473-93923304f443
link: 
summary: ""
---

# [1. 설계]

### 1.1 설계 원칙

- 사용자 입력을 **의도 분류 → 쿼리 정제 → 실행 계획 → 서브에이전트 실행 → 응답 생성**의 단계형 파이프라인으로 처리
- 각 단계는 독립된 stage로 분리하여 프롬프트/모델/temperature를 개별 튜닝 가능하도록 설계.
- 단순 질의는 불필요한 stage를 건너뛰도록 설계.

### 1.2 파이프라인 구조

<div class="diagram-embed" data-diagram-width="1400">
  <iframe src="/official-projects/diagrams/agent-v1-structure-v2.html" title="Agent V1 파이프라인 구조도"></iframe>
</div>

```
START
  → Intent Classifier      # 의도 분류 + 라우팅 결정
  → History Selector       # 대화 이력 선택 (needs_context일 때만)
  → Query Rewriter         # 쿼리 정제, 대명사 해소, 필터 추출
  → Planner                # sub-goal 분해, agent/tool 선택
  → Executor               # sub-agent 실행 + 결과 통합
  → Condenser              # 대용량 컨텍스트 압축
  → Generator              # 최종 응답 생성
END
```

주요 분기:

- **CHAT** intent → rewriter/planner 스킵, Generator 직행
- **WEB_SEARCH** intent → Planner 대신 `web_search_setup` 노드로 대체
- Executor는 필요 시 **Replan** 루프, 사용자 입력이 필요하면 **Wait Input**으로 종료

### 1.3 Stage 역할 요약

| Stage | 역할 |
| --- | --- |
| Intent Classifier | • agent 작동 기반 정보 판정 및 추출 |

```
  ◦ 대화 모드(file/folder/general)
  ◦ 작업 유형(doc_qa/doc_summary/doc_compare/file_search/web_search/chat)
  ◦ context 필요 여부(needs_context)
  ◦ web_search 여부
  ◦ 답변 언어 판정 |
```

History Selector | needs_context일 때 관련 대화 턴만 선택 |
Query Rewriter | • 파일명 힌트 • 검색 필터 추출 • 모호 표현 명확화 • 대명사 해소(“그 파일”→“계약서.pdf”) |
Planner | • 복합 작업 sub-goal 분해 • 실행순서 결정 • 단순 작업 agent/tool 선택 |
Executor | sub-agent 호출 + 반환 결과 통합·포맷팅 |
Condenser | 대용량 문서 컨텍스트 압축 |
Generator | 작업 유형별 프롬프트로 최종 응답 생성 |

### 1.4 Sub-agents & Tools

**Sub-agents** (모드별 구성):

| 모드 | Agent | 역할 |
| --- | --- | --- |
| File | RAGAgent | 선택 파일(file_seq) 범위 내 관련 청크 검색 |
| Folder | RAGAgent | 폴더(dir_seq) 내 전체 문서 청크 검색 |
| Folder | FileSearchAgent | 조건(작성자/확장자/기간) 필터 + 파일명 유사도 정렬 |
| 공통 | SummaryAgent | file_seq의 전체 청크 수집·병합 |
| 공통 | CompareAgent | 비교 대상 파일들의 전체 청크 수집 |
| 공통 | **WebSearchAgent** | 외부 웹 검색 결과 수집 (V1 경계에서 추가) |
| 공통 | FileResolverAgent | 파일명 힌트로 실제 파일 특정, 후보 2개↑면 사용자 확인 |

**Tools**: `vector_search`, `db_filename_search`, `db_query`, `web_search_api`, `web_content_parser`, `file_chunk_retriever`, `filename_similarity_scorer`, `user_confirmation_handler`

---

# [2. 구현 : 프롬프트 기본 검증]

설계한 파이프라인을 실제 프롬프트로 구현한 뒤, 테스트 폴더와 4턴 대화 이력을 기준으로 intent별 프롬프트 조합이 의도대로 동작하는지 확인

검증된 프롬프트 조합:

- **CHAT**: 일반 대화 + 인라인 텍스트 요약(문서 없이 붙여넣기)까지 CHAT으로 정상 처리, 다국어(ko/en/ja) 응답 확인
- **DOC_QA (Base)**: file/folder 모드 각각 `file_rag_agent` / `folder_rag_agent`로 라우팅
- **DOC_QA (+Persona +길이)**: `doc_qa_base` + `persona_cs`/`persona_marketing`/`persona_admin` + `response_length_short`/`detailed` 조합이 톤·길이에 반영됨
- **DOC_COMPARE**: file/folder 모드에서 표 형태 비교 응답 생성, folder는 `planner_folder_compare` 조합 사용
- **DOC_SUMMARY**: 단일/다중 파일 요약, folder 모드는 file_search → summary chain (복합 plan) 정상 동작

핵심 확인: **intent → 프롬프트 조합 → sub-agent 라우팅**의 연결이 설계대로 작동함.

---

# [3. 흐름 최적화 : Stage별 프롬프트 조합 검증]

각 stage에서 조건별로 어떤 시스템/유저 프롬프트가 조합되는지, 3-tier 로딩(첫 요청 DB → 이후 Redis 캐시)이 정상인지 stage 단위로 검증

**종합 결과: 64건 중 62 Pass, 1 Fail(수정 완료), 1 Warning.**

| Stage | 검증 내용 | 결과 |
| --- | --- | --- |
| IntentClassifier |   • web_search ON/OFF별 프롬프트 조합
  • default/web/history intent 분류 | 18건 중 16 Pass (오분류 1건 수정) |
| HistorySelector |   • 스킵 조건(no room_id / needs_context=false)
  • 관련 턴 선택 | 5/5 Pass |
| QueryRewriter |   • Path A(base) 
  • B(search_optimization) 
  • C(file_filter) 분기 | 18/18 Pass |
| Planner |   • intent별 agent 매핑
  • WEB_SEARCH/CHAT 스킵 | 10/10 Pass |
| Condenser |   • DOC_SUMMARY/COMPARE + 20K자 초과 시 트리거 | 3 Pass, 1 Warning |
| Generator |   • 7개 intent 분기별 프롬프트 조합 | 9/9 Pass |

**발견된 이슈:**

- IntentClassifier가 “pdf 파일이 총 몇 개야?” 류의 **개수 질문을 FILE_SEARCH가 아닌 DOC_QA로 오분류** → 4.1 에 해결 과정 기록
- Condenser 검증 중 folder mode file_search가 0건 반환 → 요약 도달 전 실패 (데이터 이슈)

**확정된 Agent 매핑:**

| Planner agent | folder_mode | file_mode |
| --- | --- | --- |
| document_retriever | folder_rag_agent | file_rag_agent |
| file_search | file_search_agent | - |
| summary / compare / web_search | (동일 이름 agent) | (동일) |

---

# [4. 안정성 개선]

흐름 검증 이후, 프로덕션 안정성을 위해 ① intent 오분류 보정 ② 모델 비용 최적화 ③ 장문 입력 대응 ④ temperature 결정성 확보를 진행

### 4.1 Intent 오분류 보정 (chat → doc_qa)

folder_mode에서 문서 기반 how-to 질문이 `chat`으로 오분류되어 RAG를 건너뛰고 출처(dc_doc_refs)가 누락되는 문제를 **프롬프트 + 코드** 양쪽에서 해결

- **프롬프트**: “When in doubt, ALWAYS choose doc_qa” 원칙 추가, chat은 “문서 내용과 명백히 무관한 질의에만” 으로 제한
- **코드**: `intent_classifier.py`에 `CHAT_CONFIDENCE_THRESHOLD = 0.85` 도입 → folder_mode에서 `chat` + confidence < 0.85면 `doc_qa`로 보정 (`_validate_intent()`)
- **검증**: HTTP 26/26 PASS (chat 정상 케이스 보존 확인 포함)

### 4.2 모델 최적화 (gpt-4.1 → mini 부분 전환)

각 stage를 gpt-4.1-mini로 교체 가능한지 stage별로 검증. 오분류가 전체 파이프라인 오작동으로 직결되는 stage만 gpt-4.1을 유지.

| Stage | mini 결과 | 최종 모델 |
| --- | --- | --- |
| intent_classifier | 11/13 (DOC_SUMMARY·DOC_COMPARE 분류 실패) | **gpt-4.1 유지** |
| query_rewriter | 18/18 PASS | gpt-4.1-mini |
| planner | 6/6 PASS | gpt-4.1-mini |
| history_selector | 5/5 PASS | gpt-4.1-mini |
| condenser | (답변 품질 직결) | gpt-4.1 유지 |

### 4.3 장문 입력 안정성 (2K → 20K자)

`MAX_QUESTION_LENGTH`를 2,000자 → 20,000자로 상향하기 전 사전 검증. **13/13 ALL PASS.**

- 직접 텍스트 붙여넣기 + 요약/분석 요청 → 예상대로 CHAT 분류
- 20,000자 → 200 OK, 20,001자 → 422 (경계값 정상)
- 20K 입력 시 prompt_tokens ≈ 41,679 (2K 대비 약 10배)

### 4.4 Temperature 최적화 (0.3 → 0.0)

orchestrator 내부 stage는 창의성이 아닌 **정확한 분류/구조화**가 목적이므로 전 stage temperature를 0.0으로 일괄 변경. **46/46 ALL PASS** - baseline(0.3)과 동등 결과, 재현성 100% 확보.

### 4.5 최종 확정 설정

| Stage | 모델 | Temperature |
| --- | --- | --- |
| intent_classifier | dc-east2-gpt-4.1 | 0.0 |
| query_rewriter | dc-east2-gpt-4.1-mini | 0.0 |
| planner | dc-east2-gpt-4.1-mini | 0.0 |
| history_selector | dc-east2-gpt-4.1-mini | 0.0 |
| condenser | dc-east2-gpt-4.1 | 0.0 |
| generator | (사용자 요청 모델) | — |

**안정성 향상 전체 테스트: 144건 중 142 통과 (98.6%)** - 실패 2건은 intent_classifier mini의 요약/비교 분류 실패로, gpt-4.1 유지로 해결.

