---
title: "PDF Parser v2 (VLM) × Cloud Storage"
date: 2026-06-01
thumbnail: 
link: 
summary: ""
---

# [Parser 개선 결과 요약]

| 구분 | AS-IS: unstructured | TO-BE: GPT-5.4 (VLM) |
| --- | --- | --- |
| 추출 방식 | CV(layout) + OCR 다단계 파이프라인 | 페이지 이미지 → E2E 멀티모달 직접 이해 (OCR-free) |
| 로컬 모델 | 3개 순차 구동 (YOLOX + table-transformer + Tesseract) | 없음 (외부 API) |
| 구조 정보 | 요소 태깅 보존, 단 단계별 오류 누적 | 시각+의미 통합 이해, 복잡·혼합 레이아웃에 강함 |
| 테이블 처리 | 단순 표 보존(TEDS ~0.82), 병합셀·중첩표 취약 | 병합셀·중첩·복잡표까지 문맥 반영 |
| 차트/이미지 | 처리 불가 | 차트·다이어그램·스캔문서 내용까지 해석 |
| 메모리/OOM | 워커당 1.9~7GB, OOM 빈발 | 로컬 파싱 연산 없음 → OOM 원천 제거 |
| 대용량/동시 처리 | 워커 2개 직렬, 500MB에서 불안정 | 페이지 단위 병렬 API, 파일 크기 무관 |
| 비용 구조 | 자체 호스팅 고정비 (GPU 불요) | 요청별 토큰 과금 (변동비) |
| RAG 적합성 | 높음 | 매우 높음 |

- 트레이드오프
    - **Hallucination**
        - VLM은 텍스트를 *생성*하므로 원문에 없는 값(특히 수치)을 만들어낼 위험
            
            → **모델 세대 향상(GPT-5.4)** + 출력형식 제약(구조화 프롬프트)·검증/재시도, 필요 시 원문 대조로 관리
            
    - **데이터 거버넌스**(전송·학습·리전)
        - 외부 API로 고객 PDF가 나감
            
            → Azure OpenAI(Japan)/Bedrock 리전 내 처리 + 학습 미사용(no-training)으로 통제
            
- (참고 사항) Parser 개선 v1, v2
    
    
    | 시점 | 파서 | 방식 |
    | --- | --- | --- |
    | ~2025.09 이전 | poppler-utils  | 평문 텍스트만 추출 (레이아웃 소실) |
    | **2025.09 (1차 개선)** | **unstructured** (hi_res: detectron2/yolox layout 감지 + LayoutLM) | **레이아웃 보존형**, 오픈소스 자체 호스팅 |
    | 2026.06 (2차 개선) | OpenAI **GPT-5.4** | 순수 E2E 멀티모달 VLM |
  
    - **2025.09**
        - 당시 멀티모달 모델(GPT-4o급)의 경우, 재무/업무 문서 파싱에서 서비스급 신뢰도에 미치지 못함
        - 1차 목표(레이아웃 보존)는 self-hosted `unstructured`로 저비용 달성 가능
        - VLM 적용을 미루고 layout 파서 선택.
    - 2026.06
        - 모델 세대가 서비스급에 도달하여 GPT-5.4로 전환

# [Parser 개선 계기]

- **주동인은 운영 안정성, 부동인은 품질**.
- **OOM 반복 발생**
    - 로컬 모델 3개 순차 구동(YOLOX + table-transformer + Tesseract)으로 메모리 폭증
    - **대용량(500MB)·동시 요청 불안정**
    - 서버 증설로 Parser v1 방법을 유지하는 건 한 세대 뒤처진 기술을 인프라 비용으로 보전하는 비효율적 방향
        - **기술 트렌드**: 다단계 OCR 파이프라인 → E2E VLM으로 결정적 이동. 2026년 VLM 성능·안정성이 크게 향상되어 더 이상 layout 방식을 고수할 이유 소멸
- **품질 (부동인)**
    - **이미지·pptx 변환 PDF 취약** — layout detection이 이미지 영역을 "이미지 있음"으로만 반환, 내부 텍스트 미추출 (layout 모델 공통 한계)
- **전환 계기**: 위 구조적 한계 + 모델 세대 성숙(2026) → E2E VLM 단일 모델로 **OOM·운영 복잡성 원천 제거 + 품질 향상** 동시 달성

# [VLM Model 선정]

## **후보 선정 (리더보드 기반)**

- 실무 IDP(청구서/송장/양식) 중심 테스트를 진행한 IDP Leaderboard 결과가 우리 서비스에 더 적합하기 때문에 IDP Leaderboard에서 제공사별 상위 모델을 선별해 poc를 진행
    - **Nanonets OCR-3**
    - GPT-5.4 → [Azure 사용 가능](https://ai.azure.com/explore/models/gpt-5.4/version/2026-03-05/registry/azure-openai?tid=8d409426-da90-48db-a7a5-4e04fcfbd4f3&isFromLeaderboardPage=true)
    - Gemini-3-Pro
    - **Claude Sonnet 4.6** → [Azure 사용 가능](https://ai.azure.com/explore/models/claude-sonnet-4-6/version/1/registry/azureml-anthropic?tid=8d409426-da90-48db-a7a5-4e04fcfbd4f3)
    - ~~Qwen3-VL-Plus → 중국~~

## **실험 설계**

| 항목 | 내용 |
| --- | --- |
| 규모 | 6 PDF × 7 parser 변종 = 42 combo (VLM 3사 × image/pdf-direct + unstructured baseline) |
| PDF | 계약서·Attention 논문·DirectCloud TOC·SHARP 매뉴얼·삼성 사업보고서·한영일 sample |
| 3단계 평가 | L1 텍스트 일치도(Levenshtein) · L2 항목 누락(passrate/entity recall) · L3 의미·구조(LLM judge F/C/S/R) |

## **핵심 결과**

| Combo | L1 평균 | L3 평균 | 속도(s/pg) | 100p 비용 |
| --- | --- | --- | --- | --- |
| claude/pdf-direct | 0.883 ① | 97.3 ① | ~10 (Tier2) | $3.39 |
| gpt5_openai/pdf-direct | 0.872 ② | 92.1 | 2.1 ① | $2.23 |
| nanonets/image-based | 0.833 | 84.7 | 5.2 | $0.15~1.0 (표 깨짐 위험) |
| unstructured (baseline) | 0.705 | 62.1 | 8~13 | — |

- **단순 텍스트 PDF**: baseline ≈ VLM (격차 5점 이내) → baseline으로도 충분
- **Dense 표/매트릭스 PDF**: baseline << VLM (**L3 격차 50~65점**), CJK 공백 손상이 VLM 대비 30~40배 → **VLM 보강 필수**
- unstructured는 속도·비용 어느 축도 우위 없음(VLM 대비 2~3배 느림)

## **최종 선정**

- **채택: GPT-5.4 / pdf-direct 단일 (시나리오 C)** — 비용·속도·품질 균형, 모든 PDF 유형 일관, 라우팅 분류기 불필요, unstructured 운영 부담(OP-7~11) 자동 종결

# **Parser v1 → v2 개선 결과**

|  | v1: unstructured | v2: GPT-5.4 (VLM) |
| --- | --- | --- |
| 추출 방식 | CV(layout)+OCR 다단계 파이프라인 | E2E 멀티모달 직접 이해 |
| 로컬 모델 | 3개 순차 구동 | 없음 (외부 API) |
| OOM/메모리 | 워커당 1.9~7GB, OOM 빈발 | 로컬 파싱 없음 → OOM 원천 제거 |
| 속도 | 8~13s/page | 2~5s/page (**2~3배↑**) |
| 품질(단순텍스트) | L3 95 | L3 100 (동등) |
| 품질(dense 표) | L3 35~45 | L3 90~100 (**+50~65**) |
| 대용량/동시 처리 | 워커 2개 직렬, 500MB 불안정 | 페이지 병렬 API, 파일 크기 무관 |
| 운영 부담 | 방어 코드가 코드 대부분(639줄) | 단순화, 모델 관리 불필요 |
| 100p 비용 | 인프라 증설 비용 | $2.23 (크레딧 차감) |

- (트레이드오프)
    - **Hallucination**: VLM은 텍스트를 *생성* → 모델 세대 향상(GPT-5.4) + 구조화 프롬프트·검증으로 관리
    - **데이터 거버넌스**: 외부 API 전송 → **Azure OpenAI(Japan) 리전 내 처리 + 학습 미사용**으로 통제
