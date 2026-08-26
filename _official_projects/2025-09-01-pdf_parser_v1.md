---
title: "PDF Parser v1 (LayoutLM) × Cloud Storage"
date: 2025-09-01
thumbnail: 
link: 
summary: ""
---


# [Parser 개선 v1 결과 요약]

|  | **AS-IS:** poppler-utils | **TO-BE: unstructured** |
| --- | --- | --- |
| **추출 방식** | 단순 텍스트 스트림 추출 | CV + OCR 기반 레이아웃 인식 |
| **구조 정보** | 손실 (평면 텍스트) | 보존 (Title, Sub title, Table 등) |
| **테이블 처리** | 행/열 관계 파괴 | HTML → MD 형식 구조 보존 |
| **처리 속도** | 매우 빠름 | 느림 |
| **RAG 적합성** | 낮음 | 높음 |
- (참고 사항) Parser 개선 v1, v2
    
    
    | 시점 | 파서 | 방식 |
    | --- | --- | --- |
    | ~2025.09 이전 | poppler-utils | 평문 텍스트만 추출 (레이아웃 소실) |
    | **2025.09 (1차 개선)** | **unstructured** (hi_res: detectron2/yolox layout 감지 + LayoutLM) | **레이아웃 보존형**, 오픈소스 자체 호스팅 |
    | 2026.06 (2차 개선) | OpenAI **GPT-5.4** | 순수 E2E 멀티모달 VLM |
- **2025.09**
    - 당시 멀티모달 모델(GPT-4o급)의 경우, 재무/업무 문서 파싱에서 서비스급 신뢰도에 미치지 못함
    - 1차 목표(레이아웃 보존)는 self-hosted `unstructured`로 저비용 달성 가능
    - VLM 적용을 미루고 layout 파서 선택.
- 모델 세대가 서비스급에 도달한 2026.06에 GPT-5.4로 전환

# [Parser 개선 계기]

- RAG 시스템의 성능은 입력 데이터 품질에 직접적으로 의존 - ‘Garbage In, Garbage Out’
- 기존 단순 텍스트 추출 방식(poppler-utils)의 한계:
- 테이블 구조 손실로 인한 데이터 관계성 파괴
- 헤더/섹션 구분 없는 평면적 텍스트로 문맥 단절
- 비효율적 청킹으로 의미 단위 분리 실패
- chunk data 품질 저하로 인한 retrieval 성능 저하 → llm에 12개의 chunk를 입력 → 과도한 LLM token 사용

# [Parser 선정]

## VLM vs **LayoutLM**

### 서비스 제공 운영 조건

| 조건 | 이유 |
| --- | --- |
| 로컬(자체 GPU) 상시 구동 회피 | GPU 서버 상시 구동비 vs 요청별 과금 |
| → MaaS(Model-as-a-Service)의 on-demand(요청별/토큰별) 추론이 운영상 유리 |  |
| 데이터 거버넌스 (no-training) | 보안에 민감한 회사 내부 문건을 저장하는 B2B Cloud Storage 서비스로, |
| 사용자가 입력한 PDF가 모델 학습에 사용되지 않아야 함 |  |
- 2025.09 기준, 위 조건을 모두 만족하는 문서 특화 VLM 존재 X
- MaaS로 제공되는 서비스 제공 가능 수준의 문서 parsing 품질을 갖춘 VLM 없음
- Azure에서 Qwen2.5-VL은 **Azure ML 관리형 온라인 엔드포인트에 자가 배포**(=GPU 프로비저닝·상시구동)해야 하는 형태로, “로컬(자체 GPU) 상시 구동 회피” 조건에 맞지 않음
- 문서 특화 VLM(olmOCR-2 등)은 **2025-10 이후** 등장 → 결정 시점엔 존재 자체가 없음.

## 품질

1. **성숙도 부족**
- 2025.09 기준 가용 멀티모달(GPT-4o급) 모델 재무/업무 문서 파싱 신뢰도가 서비스 기준 미달
1. **Hallucination 리스크**
- E2E VLM은 텍스트를 생성해 수치 오류 위험. 재무 문서는 숫자 하나로 의미가 바뀜. (2025.09 기준 리스크가 임계치 초과 → 2026 세대에서 하락)

## **LayoutLM 선정**

- **성능 체크 항목 및 기준**
- 성능 체크 문서 타입
    
    ```jsx
    - 학술 논문
    - 계약서
    - 보고서
    - 스캔 문서
    - 다국어 문서
    ```
    
- **페이지별 평가 항목**
    - **텍스트 추출 품질 (30점 만점)**
        - 기본 텍스트 정확도: 일반 텍스트의 추출 정확도
        - 다국어 지원: 한글, 영어, 일본어, 특수문자
            
            ```jsx
            평가 기준:
            30점 = 완벽 (오류 없음)
            25점 = 우수 (사소한 오류 1-2개)
            20점 = 보통 (일부 누락/오류)
            15점 = 미흡 (많은 오류)
            10점 = 불량 (대부분 실패)
            0점 = 추출 불가
            ```
            
    - **표 추출 품질 (30점 만점)**
        - 표(Table) 추출: 셀 구조, 병합 셀, 중첩 표 인식률
            
            ```jsx
            30점 = 구조와 내용 모두 완벽
            20점 = 구조는 맞지만 일부 내용 오류
            10점 = 표 인식했으나 구조 틀림
            0점 = 표 추출 실패
            ```
            
- **파일별 평가 항목**
    - **처리 속도 (20점 만점)**
        - 페이지당 처리 시간
        
        ```jsx
        처리 속도 순위에 따라 점수 차등 적용
        ```
        
    - **기능 지원 (20점 만점)**
        - 병렬 처리 지원 여부
        - 배치 처리 지원 여부
        - 지원 출력 포맷
            - markdown 출력 여부
            - json 출력 여부
            - html 출력 여부
        
        ```jsx
        각 4점. ture면 4점 false면 0점
        ```
        

### 실험 parser 목록

| Parser | 채택 여부 | 제외 사유 | 라이선스/상업 사용 | 장점 | 단점 |
| --- | --- | --- | --- | --- | --- |
| pymupdf4llm | 상세 실험 진행 후보 | - | • [상업적 사용 시 코드 공개 의무](https://pymupdf.readthedocs.io/en/latest/about.html#license-and-copyright) (AGPL) |  |  |
| • 상용 라이선스 구매 가능 | • 마크다운 출력 + 속도와 품질의 균형이 좋음(사용자 평가) |  |  |  |  |
- PyMuPDF 기반 LLM/RAG 특화 래퍼
• 마크다운 추출 및 LlamaIndex 문서 출력 지원
• 멀티컬럼 레이아웃 지원 | - |
| MinerU | 제외 | 상업 사용 불가 | 상업적 사용 제한, 코드 오픈소스 공개 필수 (프로덕션 사용 시 코드 변경 없이도 AGPL 준수 필요) | • PaddleOCR 사용으로 회전된 테이블 처리 우수
• 복잡한 테이블을 HTML로 렌더링하여 정확하게 인식 | - |
| EasyOCR | 제외 | OCR만 지원 + 느림 | 상업적 사용 가능, 완전 무료·제약 없음 | - | • layout detection만 지원(text 추출 별도 필요)
• GPU 필요, 느림 |
| pdf2md | 제외 | 비용 발생 | 상업적 사용 가능 | - | • OpenAI API 의존(비용 발생)
• 이미지 추출 불가 |
| markitdown | 제외 | 구조 정보 포맷팅 취약 | 상업적 사용 가능, 완전 무료·제약 없음 | - | • 이미지 내 텍스트 인식 실패 가능성 높음
• PDF 구조 정보 포맷팅 취약(OCR 약함) |
| PyPDFium2 | 제외 | 구조 정보 포맷팅 취약 | 상업적 사용 가능, 완전 무료·제약 없음 | • 빠름 | • layout 정보 미제공
• 기본 텍스트만 추출 |
| DocLing | 제외 | 속도 - 서비스 제공 불가 수준 | 상업적 사용 가능, 완전 무료·제약 없음 | • 깔끔하고 구조 정보가 풍부한 출력
• DocLayNet·TableFormer 등 AI 모델 사용 | • 매우 느림 → 병렬처리 가능 여부 확인 필요 (300페이지 리포트 50개 처리 시 약 17시간) |
| Unstructured | 상세 실험 진행 후보 | - | 상업적 사용 가능, 완전 무료·제약 없음 | • 의미론적으로 레이블된 청크 제공 | • 테이블 추출 관련 후기 부족(확인 필요), 복잡한 레이아웃 처리 취약 |

## 상세 실험 진행 (**Pymupdf4LLM vs Unstructured)**

### 결과 요약

| **구분** | **PyMuPDF4LLM (도입 불가)** | **Unstructured (도입 권장)** |
| --- | --- | --- |
| **투자 비용** | **[High]** |  |
- 상용 라이선스 구매 비용 발생 (AGPL 이슈 회피)
• 트래픽 증가 시 라이선스 비용 동반 상승 | **[Zero]**
• Apache 2.0 라이선스로 **무료 사용**
• 초기 인프라 세팅 외 소프트웨어 비용 없음 |
| **품질 효율**
| **[Low]**
• 헤더/테이블 인식률 저조로 데이터 유실 발생
• RAG 답변 정확도 하락의 원인 제공 | **[High]**
• 문서 구조(표, 헤더) 인식 우수
• 고품질 데이터 확보로 답변 정확도 상승 |
| **운영 비용** | **[High]**
• 낮은 품질 보완을 위해 **지속적인 후처리 로직 개발 필요**
• 파싱 오류 수정에 개발 리소스 지속 투입 | **[Low]**
• **초기 구축(Lambda 등) 시점에만 리소스 투입**
• 이후 별도 보정 로직 없이 안정적 운영 가능 |
| **최종 ROI** | **최악의 ROI (Negative)**
비용을 지출함에도 품질 리스크와 개발 공수가 증가하는 비효율적 구조 | **합리적 ROI (Positive)**
무비용으로 고품질을 확보하며, 운영 효율성까지 달성하는 최적의 선택 |
- **품질 평가 결과**

```
|  | Pymupdf4LLM | Unstructured |
| --- | --- | --- |
| 텍스트 추출 | 21.8점 | 24.9점 |
| 테이블 추출 | 18.9점 | 25.4점 |
| 처리 속도
(병렬 처리x) | 장당 0.17초 | 장당 1.6초 |
| **전체 점수** | 60.6점 | 63.5점 |
```

### pymupdf4llm 이슈

1. 개행을 매우 많이 사용 → chunking 단계에서 문제 발생 가능성 높음

    <img width="800" alt="fe827270-766f-4755-9e67-afd99f421a28" src="https://github.com/user-attachments/assets/05c39fec-b331-4107-ac8a-6ab2c8974991" />

    
    
2. markdown header를 사용해야 할 부분에 header를 사용하지 않음
    
    → markdown 형식으로 추출하는 이유는 1차적으로 header 기반 chunking을 함으로써 문서 구조를 최대한 보존하기 위함인데 header가 없으면 무의미하다.

    <img width="800" alt="a2788143-9913-47f1-b4b1-bfd0fc4912ab" src="https://github.com/user-attachments/assets/15fbc734-eee7-4a81-b5c9-7613300d1762" />

    
3. 정보 누락

    <img width="800" alt="d0137a15-821e-431e-86cd-48b48c926e83" src="https://github.com/user-attachments/assets/8f7e85a4-89a3-49dd-a7a6-0811deae631b" />

    <img width="570" alt="6bfe8c15-2c85-43cb-9214-d1a9e1a1077f" src="https://github.com/user-attachments/assets/bc5a201f-fa97-476a-acc8-fd52aa124c31" />

    
4. 테이블 추출 성능 낮음
    <img width="800" alt="d0abb68b-21df-44aa-b9ac-f15c986628fe" src="https://github.com/user-attachments/assets/bb58970c-88b7-45a2-8b49-03b6ece2a88b" />
    
    <img width="800" alt="4f527f36-4c88-4f1b-947c-9490b4e6a9b6" src="https://github.com/user-attachments/assets/37af1d5c-fb3a-452a-8f35-c01af0d4fba6" />
    
    <img width="800" alt="de8e3d1d-9016-491c-9708-f6c6d8a979f2" src="https://github.com/user-attachments/assets/8d03afde-9580-4abe-ada4-00d8f54a83eb" />
    
5. 후처리 불가 수준 텍스트 추출 경우 발견
    
    (이미지를 table로 인식)
   
    <img width="800" alt="3ed187de-fbde-43ce-899b-d30199939e3c" src="https://github.com/user-attachments/assets/0e5e0723-96a9-47c4-a2d9-2a96144041c5" />

# [chunking rule]

- 선정된 parser 특성을 고려 chunking rule
    
    ```mermaid
    flowchart TD
    A[PDF 페이지별 텍스트] --> B[페이지 통합]
    B --> C[테이블 Placeholder 대체]
    C --> D[MarkdownHeaderTextSplitter]
    
    D --> E{테이블 포함?}
    E -->|No| G{"길이 > 800자?"}
    G -->|Yes| H[RecursiveCharacterTextSplitter]
    G -->|No| I[유지]
    
    E -->|Yes| F1[context 추출 - 최대 150자]
    F1 --> F2[remaining 분리]
    
    F2 --> RB{"remaining_before > 800자?"}
    F2 --> TB{"테이블 >= 1200자?"}
    F2 --> RA{"remaining_after > 800자?"}
    
    RB -->|Yes| RB_S[분할]
    RB -->|No| RB_K[유지]
    
    TB -->|Yes| TB_S[Row 분할 + 헤더]
    TB -->|No| TB_K[분할 안 함]
    
    RA -->|Yes| RA_S[분할]
    RA -->|No| RA_K[유지]
    
    TB_S --> COMB[context + 테이블]
    TB_K --> COMB
    
    H --> J[청크 목록]
    I --> J
    RB_S --> J
    RB_K --> J
    COMB --> J
    RA_S --> J
    RA_K --> J
    
    J --> TOKEN{"numtoken: 토큰 > 8000?"}
    TOKEN -->|Yes| TOK_S[토큰 분할]
    TOKEN -->|No/일반| MERGE[짧은 청크 병합]
    TOK_S --> MERGE
    
    MERGE --> SHORT{"< 150자?"}
    SHORT -->|Yes, 헤더| NEXT[다음과 병합]
    SHORT -->|Yes, 일반| ADJ[인접과 병합]
    SHORT -->|No| KEEP[유지]
    
    NEXT --> END[최종 결과]
    ADJ --> END
    KEEP --> END
    ```
    
    [프로세스 상세]
    
1. 페이지별 통합 + 통합된 full text에서 각 page의 위치 인덱스 정보 저장
    - 목적: 각 페이지 텍스트 위치 추척을 위해 page의 full text내 위치 저장
    
    ```jsx
    [{"start": 0, "end": 1500, "page": 1},
     {"start": 1502, "end": 3000, "page": 2},...]
    ```
    
2. table 구조 보호를 위해 table들 placehoder로 대체
    - 목적: split할 때 table구조 깨지지 않도록 잠시 보호
    - 정규식으로 테이블 패턴 검색
    - f”*PROTECTED{pattern_name.upper()}_{placeholder_counter}*_” 패턴으로 대체
    - 원본 텍스트와 위치 정보 따로 저장해 둠
3. 마크다운 헤더 기준 분할
    - 목적: md형식으로 parsing된 결과 chunking 시 섹션 구분하기 위해 헤더 기준으로 우선 분할
    - `MarkdownHeaderTextSplitter` 사용
4. recursive split

4-1. (추가 구현 버전) 토큰 수 검증
    - md header 기준으로 분할된 chunk들을 돌면서
        - placeholder로 대체된 것들 위치에 맞게 복원
        - chunk별 page 정보 추적
            - chunk를 full text에서 find → 시작 index, 끝 index로 페이지 찾기
        - chunk type이 테이블(포함)인 경우:
            - 테이블 크기와 관계없이:
                - 앞뒤 텍스트에서 context 추출 (최대 150자씩)
                - remaining 텍스트는 별도 청크로 분리 (800자 초과 시 분할)
            - 1200자 이상이면 테이블 분할:
                - 테이블 헤더 추출 (구분선 있는 table은 2행까지, 아니면 1행까지)
                - row 단위로 분할
                - 분리된 테이블에 헤더 추가
                - 앞뒤 맥락(context) 추가
            - 1200자 미만이면:
                - 테이블은 분할하지 않고 context와 함께 사용
        - chunk type이 일반 텍스트일 경우:
            - chunk size가 800자 초과면 `RecursiveCharacterTextSplitter`로 분할
    - tiktoken으로 각 청크의 토큰 수 계산
    - max_tokens(8000) 초과 시 토큰 기준으로 추가 분할
    - 각 청크 메타데이터에 token_count 추가
5. 짧은 청크 병합

# [처리 속도 개선]
    - 최소 청크 크기(150으로 지정) 이하인 chunk가 있으면 병합
    - chunk가 md header를 포함하면 뒤에 붙이고
    - 포함하지 않으면 앞뒤 청크 중 더 짧은 것에 붙임
- **pdf split 적용**
    
    
    | split 적용 전 | split 적용 후 |
    | --- | --- |
    | 장당 약 11초 | 장당 약 1.5-2초 |
