---
title: "Video Retrieval system 📽️"
category: Dev Log
tag: Development
---







* 목차
{:toc}












# Git Repository

[https://github.com/finddme/Video_Retrieval](https://github.com/finddme/Video_Retrieval)


# 개발 계획

- **기능**
  - DB에 저장된 다수의 비디오로부터 장면 검색 (video_scene_search)
  - 비디오 하나에 대한 요약 (video_summary)


- **데이터 처리**
  
  1. 영상 로드 -> 특정 구간 단위 영상 이미지 캡쳐 -> VLM을 통해 이미지 caption 생성 (중요 요소 prompting)
     
  2. 영상 내 음성 STT -> 특정 구간 단위로 text 분리 -> text 요약
     
  3. caption, stt결과, 요약 등에 대한 포함한 vectorDB 구축


- **Retrieval pipeline (video_scene_search)**

  1. retrieval :
     - query 내 내용에 관한 요소 -> stt결과, 요약 DB에서 검색
     - query 내 등장 객체에 대한 요소 -> caption DB에서 검색
    
  2. 검색 결과 기반 간단한 답변 생성 + 검색된 구간 반환

- **Summary pipeline (video_summary)**
  - Visual Caption Summary
  - STT Summary
  - Caption + STT Summary


# 개발 목적

- Video, Audio 데이터 다뤄보기

# 개발물 요약

## Model

Video scene captioning model: Qwen/Qwen2-VL-7B-Instruct

Speech to Text model: Whisper(turbo)

Text Generation model: claude-3-5-sonnet-20240620

## pipeline 

# Demo


