---
title: "대화 엔진 개발 : LLM(tuning model)-RAG (보훈부 역사 인물 복원)"
date: 2023-12-01
thumbnail: 
link:
summary: "Development of conversational model based on LLM (tuning model)"
---

- **프로젝트 정의**
    
    환각 현상을 완화시킨 대규모 언어 모델 기반 대화 시스템 개발
    역사 인물 복원 사업에 사용 중(김구, 윤봉길, 안중근 기념관 키오스크 전시)
    
- **팀 구성**
    
    
    | 구분 | 상세 | 인원 |
    | --- | --- | --- |
    | 개발 | 백 | 2명 |
    |  | 프론트 | 3명 |
    |  | **엔진** | **2명 (본인: R&D)** |
    |  | DB | 1명 |
    | 기획/디자인 |  | 2명  |
- **담당 업무**
    - LLM 기반 김구 대화 엔진 R&D
        
        1) LLM 기반 멀티턴 대화 모델 개발
        
        2) LLM instruction data 수집 및 전처리
        
        3) 윤리 검증 모델 개발
        
        4) 윤리 검증 모델 학습 데이터 수집
        
        5) 감성 분석 모델 제공
        
- **사용 기술**
    
    1) LLM instruction tuning 기술 (LLaMa 2 13B Qlora tuning)
    
    2) Data 전처리 (vicuna + dolly + alpaca + korquad1.0 + korquad2.0 각 데이터별 특성 분석 후 동일한 instruction data로 변형)
    
    3) RAG(Retrieval Augmented Generation) 기반 챗봇 개발 기술
    
    4) RAG에 사용될 vectorstore 구축
    
    5) NLP-classifiacation model 개발 기술
    
- **개발 언어**
    
    python (framework: pytorch/ rag pipeline 구축에 사용된 library: Langchain / vectorstore: FAISS)
    
- **수행 업무 요약**
    
    LLM 기반 멀티턴 대화 모델 개발과 윤리 검증 모델, 감성 분석 모델 개발을 담당. 대화 모델의 경우 LLM의 환각현상을 줄이기 위해 RAG 기술을 적용, Retriever 정확도를 높이기 위해 vectorstore 저장 시 metadata에 데이터 출처와 소제목을 함께 저장. 
    
    네 가지 데이터를 수집하여 윤리 검증 모델 개발(f1-score 90.6) 
    
    사용자 감성 분석에 사용할 감성 분석 모델 개발
    - 각 section 및 head에 할당된 chunk를 기반으로 문단 생성(각 참조 문서별로)
    - 각 section 및 head에 생성된 문단들 종합 (전체 참조 문서 종합)
