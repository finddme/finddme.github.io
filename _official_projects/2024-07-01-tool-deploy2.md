---
title: "LLMOPS 내 Tool 배포(Text-to-SQL)"
date: 2024-07-01
thumbnail: 
link:
summary: "Deploying LLM Services within LLMOPS (Text-to-SQL + RAG)"
---

- **프로젝트 정의**
    
    RDB 내 데이터가 필요한 비개발직군(e.g. 마케터)의 업무 효율 향상을 위한 Text-to-SQL 개발
    
    RDB 내 정보 취득이 필요한  비개발직군(e.g. 인사 담당자)의 정보 정보 접근을 위한 Text-to-SQL+RAG pipeline 구축
    
- **팀 구성**
    
    
    | 구분 | 상세 | 인원 |
    | --- | --- | --- |
    | 개발 | **백** | **3명 (본인 포함)** |
    |  | 프론트 | 1명 |
    |  | **엔진** | **2명 (본인 포함)** |
    |  | **DB** | **2명 (본인 포함)** |
    | 기획/디자인 |  | 1명  |
- **담당 업무**
    
    1) Text-to-SQL
    
    2) SQL query 결과로 사용자 query에 대한 답변 생성
    
- **사용 기술**
    
    1) LLM
    
    2) RAG
    
    3) Text-to-SQL
    
    4) prompt engineering
    
- **개발 언어**
    
    python
    
- **수행 업무 요약**
    - 입력된 사용자 질문에 대한 SQL문 생성 모듈 개발
    - DB에 SQL query 입력 → data 추출 모듈 개발
