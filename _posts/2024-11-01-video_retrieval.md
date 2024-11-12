---
title: "Video Retrieval system 📽️(진행 중)"
category: Dev Log
tag: Development
---







* 목차
{:toc}












# Git Repository

[https://github.com/finddme/Video_Retrieval](https://github.com/finddme/Video_Retrieval)


# 개발 계획

- 기능
  - DB에 저장된 다수의 비디오로부터 장면 검색 (video_scene_search)
  - 비디오 하나에 대한 요약 (video_summary)


- 데이터 구축
  
  1. 영상 로드 -> 특정 구간 단위 영상 이미지 캡쳐 -> VLM을 통해 이미지 caption 생성 (중요 요소 prompting)
     
  2. 영상 내 음성 STT -> 특정 구간 단위로 text 분리 -> text 요약
     
  3. caption, stt결과, 요약 등에 대한 포함한 vectorDB 구축


- Retrieval pipeline (video_scene_search)

  1. query routing :
     - 내용에 관한 query -> stt결과, 요약 DB에서 검색
     - 등장 객체에 대한 query -> caption DB에서 검색
    
  2. 검색 결과 기반 간단한 답변 생성 + 검색된 구간 반환

- Summary pipeline (video_summary)
