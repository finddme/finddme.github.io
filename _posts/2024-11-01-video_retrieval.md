---
title: "Video Retrieval system 📽️"
category: Dev Log
tag: Development
---







* 목차
{:toc}












# Git Repository

[https://github.com/finddme/Video_Retrieval](https://github.com/finddme/Video_Retrieval)


# 개발 목적

- Video 데이터 다뤄보기
- Audio 및 Image captioning 모델 다뤄보기
- 추후 Multi Modal RAG 개발을 위한 준비

# 개발물 요약

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
    
## Model

- Video scene captioning model: Qwen/Qwen2-VL-7B-Instruct

- Speech to Text model: Whisper(turbo)

- Text Generation model: claude-3-5-sonnet-20240620


# 문제점 및 해결:

1. video_scene_search에서 STT와 caption 정보에 등장 인물의 이름이 없는 경우 검색이 되지 않는 문제.<br>
  예를 들어, ooo이 좋아하는 노래 알려줘 -> 1분 단위로 chunking된 정보들에서 "ooo"이 등장하지 않아 검색되지 않음<br>
  -> youtube subtitle/caption에서 "#ooo" 형식으로 기재된 정보를 모든 chunk에 추가. (한국 영상들의 경우 #태그를 이용해 등장 인물들에 대한 정보와 영상에 대한 키워드를 노출시키는 것으로 파악되어 이를 활용하여 문제를 해결함.)<br>

2. video_scene_search에 대한 초기 계획은 stt결과와 caption결과에 대한 retreival 결과에 대해 각각 답변을 생성하도록 설계하였다.<br>
   이 설계대로 구현한 결과, 동일한 시간에 대한 stt와 caption 검색 결과에 대한 답변이 각각 나가 조금 지저분해 보이고, 하나의 시간대에 대한 답변이 두 개 반환되는 것이 비효율적임. <br>
   동일한 시간대가 존재할 때 이를 merge하여 진행함으로써 동일 시간에 대한 stt와 caption에 대한 정보를 온전히 정리하여 높은 품질의 답변이 생성될 수 있도록 수정.<br>

# 추후 개선해야 할 점

chunking 방식 개선. 지금은 단순히 특정 시간 단위로 chunk를 나누었는데, stt의 경우, 의미 단위가 고려된 chunking이 필요해 보임. 

# Demo


