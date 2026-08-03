---
title: "Video Retrieval system"
date: 2024-11-01
thumbnail: 
link:
summary: 
---

- **프로젝트 정의**
    
    비디오의 음성과 장면에서 데이터를 추출하여 이를 기반으로 검색 system을 구축하는 프로젝트
    
- **개발 목적**
    - Video 데이터 다뤄보기
    - Audio 및 Image captioning 모델 다뤄보기
    - 추후 Multi Modal RAG 개발을 위한 준비
- **개발 단계**
    - 데이터 처리 단계
        1. 영상 로드 -> 특정 구간 단위 영상 이미지 캡쳐 -> VLM을 통해 이미지 caption 생성 (중요 요소 prompting)
        2. 영상 내 음성 STT -> 특정 구간 단위로 text 분리 -> text 요약
        3. caption, stt결과, 요약 등에 대한 포함한 vectorDB 구축
    - Retrieval pipeline (video_scene_search) 구축 단계
        1. retrieval :
            - query 내 내용에 관한 요소 -> stt결과, 요약 DB에서 검색
            - query 내 등장 객체에 대한 요소 -> caption DB에서 검색
        2. 검색 결과 기반 간단한 답변 생성 + 검색된 구간 반환
    - Summary pipeline (video_summary) 구축 단계
        - Visual Caption Summary
        - STT Summary
        - Caption + STT Summary
- **사용 기술**
    
    1) LLM
    
    2) RAG
    
    3) STT
    
    4) Image captioning
    
    4) prompt engineering
    
- **개발 언어**
    
    python
    
- **개발 로그**
    
    https://finddme.github.io/dev log/2024/11/01/video_retrieval1/
    
- **Git Repository**
    
    https://github.com/finddme/Video_Retrieval
