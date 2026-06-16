---
title: "검색 엔진 개발 : LLM(openai)-RAG (한국행정연구원)"
date: 2024-03-01
thumbnail: 
link:
summary: "Development of search chatbot based on LLM (OpenAI)-RAG"
---

- **프로젝트 정의**
    
    연구/개발 기관에서 사용할 보고서 검색 시스템 개발(한국행정연구원)
    
- **팀 구성**
    
    
    | 구분 | 상세 | 인원 |
    | --- | --- | --- |
    | 개발 | **백** | **2명 (본인 포함)** |
    |  | 프론트 | 1명 |
    |  | **엔진** | **1명 (본인 포함)** |
    |  | **DB** | **1명 (본인 포함)** |
    | 기획/디자인 |  | 3명  |
- **담당 업무**
    
    1) LLM 기반 검색 시스템 개발
    
- **사용 기술**
    
    1) Retrieval Augmented Generation 기반 검색 시스템 개발 기술
    
    - metadata filtering
    - hierarchical similarity search -> 3단계
        
        (1. query <-> document summary similarity search (속도 향상을 위한 filtering. top 10)
        
        2. 1번에서 검색된 document에 대한 similarity search (top 7)
        
        3. 2번에서 검색된 chunk의 parent chunk + 현재 chunk 병합 document에 대한  similarity search (top 3)
        
    - translate(en->ko)
    - binary vectorstore(document 내용 특성을 기준으로 분리)
    - diverse Prompts(query type에 따른 prompt 분리)
    - data summary for metadata
    - similarity-based reordering
    - return source file
    - 좋아요 싫어요 버튼 추가
    - [답변 일시, 소요 시간, 질문, 답변, 사용자 ip] 저장 기능 추가
    
    2) RAG에 사용될 vectorstore 구축
    
- **개발 언어**
    
    python (rag pipeline 구축에 사용된 library: Langchain / vectorstore: FAISS)
    
- **수행 업무 요약**
    - openai 에서 공개한 GPT-4-turbo 모델을 사용하여 LLM 기반 검색 시스템 개발
    - RAG pipeline의 정교화
    - retrieval 결과의 정확도 향상을 위해 hierarchical similarity search 적용.
    - retrieval data, 사용자 예상 질문 리스트 분석을 통해 retrieval data 카테고리 분류. 분류한 카테고리를 기준으로 retrieval data에 metadata 추. 이를 통해 retrieval에 소요되 시간 감축.
    - gpt-4-turbo의 영어 답변 반환 문제를 해결하기 위해 영-한 번역 플로우를 추가
