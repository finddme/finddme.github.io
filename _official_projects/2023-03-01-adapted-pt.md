---
title: "Adapted Pretrained 모델 개발"
date: 2023-03-01
thumbnail: 
link:
summary: "Adapted pretrained model development"
---

- **프로젝트 정의**
    
    특수 도메인 데이터를 추가 학습시켜 도메인에 특화된 Pretrained model 개발
    
- **팀 구성**
    
    
    | 구분 | 상세 | 인원 |
    | --- | --- | --- |
    | 개발 | **엔진** | **1명 (본인)** |
    | 기획/디자인 |  | 1명  |
- **담당 업무**
    
    1) 특수 도메인에 사용될 Pretrained model 추가 학습 모델 개발(BERT, Electra, Roberta)
    
- **사용 기술**
    
    1) MLM task 수행 모델 구현 기술 (BERT, Electra, Roberta 적용)
    
- **개발 언어**
    
    python (framework: pytorch)
    
- **수행 업무 요약**
    
    헬스케어, 법률 등 일상적으로 사용되는 문어 혹은 구어와 상이한 어휘가 다수 분포된 도메인에 사용될 사전학습 모델 개발
    - 각 section 및 head에 할당된 chunk를 기반으로 문단 생성(각 참조 문서별로)
    - 각 section 및 head에 생성된 문단들 종합 (전체 참조 문서 종합)
