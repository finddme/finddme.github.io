---
title: "검색 엔진 개발 :LLM(tuning model)-RAG (한국국방연구원)"
date: 2024-05-01
thumbnail: 
link:
summary: "Development of search chatbot based on LLM (tuning model)"
---

- **프로젝트 정의**
    
    폐쇄망 환경에서 사용할 보고서 검색 시스템 개발(한국국방연구원 KIDA)
    
- **팀 구성**
    
    
    | 구분 | 상세 | 인원 |
    | --- | --- | --- |
    | 개발 | **백** | **3명 (본인 포함)** |
    |  | 프론트 | 1명 |
    |  | **엔진** | **2명 (본인 포함)** |
    |  | **DB** | **2명 (본인 포함)** |
    | 기획/디자인 |  | 1명  |
- **담당 업무**
    
    1) LLM tuning
    
    2) LLM 기반 검색 챗봇 개발
    
- **사용 기술**
    
    1) sLLM instruction tuning 기술 (Mistral, Solar DPO+Qlora tuning/ 7.24B,10.7B 모델 Merge)
    
    2) pdf로부터 instruction data 추출 (다수의 국방 용어가 사용된 문장 학습)
    
    3) Model Merge(mergekit)
    
    4) Model Quantization (AWQ)
    
    5) Retrieval Augmented Generation 기반 검색 시스템 개발 기술
    
    6) RAG에 사용될 vectorstore 구축 기술
    
    7) vLLM (추론 속도 가속화)
    
- **개발 언어**
    
    python (rag pipeline 구축에 사용된 library: Langchain / vectorstore: FAISS)
    
- **수행 업무 요약**
    - DPO+Qlora를 통해 개발한 자체 sLLM instruction tuning model과 huggingface에 공개된 7.24B급 모델들의 merge 실험을 통해 해당 과제에 사용될 모델을 개발.
    - PDF형식의 각종 연구 자료에서 dpo data(instruction, context, response, rejected)를 추출하여 DPO+Qlora 학습 데이터 수집.
    - 연구자료 분석 및 분류 결과로 metadata생성, 이를 기준으로 RAG pipeline 구축
    - vLLM 적용을 통해 추론 속도 향상
    - 각 section 및 head에 할당된 chunk를 기반으로 문단 생성(각 참조 문서별로)
    - 각 section 및 head에 생성된 문단들 종합 (전체 참조 문서 종합)
