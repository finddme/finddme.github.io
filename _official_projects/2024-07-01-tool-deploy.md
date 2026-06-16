---
title: "LLMOPS 내 Tool 배포(Report Generation)"
date: 2025-01-01
thumbnail: 
link:
summary: "Deployment of LLM Service within LLMOPS (Report Generation)"
---

- **프로젝트 정의**
    
    참조 문서를 입력 받아 보고서를 생성해 주는 Tool 개발
    
- **팀 구성**
    
    
    | 구분 | 상세 | 인원 |
    | --- | --- | --- |
    | 개발 | **백** | **3명 (본인 포함)** |
    |  | 프론트 | 1명 |
    |  | **엔진** | **2명 (본인 포함)** |
    |  | **DB** | **2명 (본인 포함)** |
    | 기획/디자인 |  | 1명  |
- **담당 업무**
    
    사용자로부터 원하는 보고서에 대한 설명과 참조 문서를 입력 받아 보고서 생성
    
- **사용 기술**
    
    1) LLM
    
    2) prompt engineering
    
- **개발 언어**
    
    python
    
- **수행 업무 요약**
    - 사용자가 원하는 보고서 설명으로부터 keyword 추출
    - 추출된 keyword로부터 보고서 section 및 head 생성
    - 사용자가 생성된 section과 head 수정 가능하도록 개발
    - 입력된 참조 문서로 부터 text 추출
    - 각 참조 문서별에서 section 및 head에 대한 관련 chunk 할당
    - 각 section 및 head에 할당된 chunk를 기반으로 문단 생성(각 참조 문서별로)
    - 각 section 및 head에 생성된 문단들 종합 (전체 참조 문서 종합)
