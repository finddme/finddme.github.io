---
title: "Daily AI report system 개발"
date: 2024-09-27
thumbnail: 
link:
summary: 
---

- **프로젝트 정의**
    
    매일 아침마다 확인하는 인공지능 관련 인기 논문과 뉴스 정보를 자동으로 요약 및 분류하는 system 개발
    
- **개발 목적**
    - Git Action 사용하여 매일 동일한 시간에 repository 실행해보기
    - 매일 아침 확인하는 인공지능 관련 인기 논문과 뉴스를 자동으로 정리하는 시스템을 구축하여 정보 수집 시간 단축
- **개발 단계**
    1.  매일 오전 10시 아래 출처로부터 정보를 수집하는 crawling 모듈 개발
        - news
            - https://hackernews.betacat.io/
            - https://www.technologyreview.kr/category/ai
        - papers
            - https://deeplearn.org
            - https://huggingface.co/papers
    2. 수집된 데이터 categoriziong 모듈 개발
    3. categorizing 결과 시각화 모듈 개발
    4. category별 논문 및 뉴스를 요약 모듈 개발
    5. 전체 pipeline 구축
    6. git action 설정
- **사용 기술**
    1. data collect, data processing
    2. data visualization
    3. LLM(summary, categorizing)
    4. LLM structured output
    5. git action
- **개발 언어**
    
    python 
    
- **개발 로그**
    
    https://finddme.github.io/dev log/2024/09/27/ai_report/
    
- **Git Repository**
    
    https://github.com/finddme/Daily_AI_report
