---
title: "Video Retrieval system 📽️ 1"
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

- chunking 방식 개선. 지금은 단순히 특정 시간 단위로 chunk를 나누었는데, stt의 경우, 의미 단위가 고려된 chunking이 필요해 보임.
- youtube 추가 데이터로 yt.keywords 추가 여부 고민 중 

# Demo (streamlit)

- 데모 DB에 들어간 youtube 영상 리스트

1. [요정 재형 - 아 기빨려 애들아 난 잘테니 너네 떠들다 가...!](https://youtu.be/exUnQqXJFPU?si=UG96CMiV15k3Yq2b) 51:57
2. [슈카월드 - 금 투자하는 가장 좋은 방법](https://youtu.be/lr_4t8leaVA?si=BlUOg3CnMCBuBLwS) 19:06
3. [셜록현준 - 한국 멀찍이 vs 유럽 빈틈없이, 유럽이 건물을 딱 붙여서 짓는 이유는?](https://youtu.be/GB6kiB0Skzs?si=lzReKM-vST7L3sWS) 16:07
4. [셜록현준 - 트럼프에 배팅 성공? 일론 머스크의 사고방식은 무엇이 다른가](https://youtu.be/emsmfXg6QXY?si=VI3DFuD2li5mPWcr) 25:48
5. [TEO 테오 - \[SUB\] 그날부터 보고 싶었어요 \| EP.1 공유 \| 살롱드립☕](https://youtu.be/rvf2yzcfhXE?si=qHOViNrdNkPr3s87) 22:27
6. [백종원 PAIK JONG WON - 숟가락을 놓을 수 없는 악마 레시피! 에그 인 헬](https://youtu.be/1F4soB3rlMI?si=7ZKlNAEoe6JQTxad) 7:05
7. [KBS 다큐 -'일론 머스크' '젠슨 황' AI 리더들, 그들의 성공 비결은 바로 이것! \| 2024 미래기획 대전환 - 1부. 누가 부자가 되는가 \| KBS 20241109 방송](https://youtu.be/lJ2OALHh6pM?si=q2wZX2P8jqYtDQ_D) 47:47
8. [윤꾼의  북킹부킹 - 『다동력:여러 가지 일을 동시에 해내는 힘』호리에 다카후미(1)~(2)편까지 한번에 듣기](https://youtu.be/9CMYxO-b8RU?si=fwEo7Zos64oOS2Uq) 1:07:05

  
## 기능 선택 (sidebar)

<center><img width="300" src="https://github.com/user-attachments/assets/162fc340-4cef-461c-9eba-e2cca84046df"></center>
<center><em style="color:gray;">demo</em></center><br>

## scene search

### 단순 질문
<center><img width="500" src="https://github.com/user-attachments/assets/a6bf63db-66e0-4b29-963d-3e9b0203eb9d"></center>
<center><em style="color:gray;">demo</em></center><br>

### 여러 영상에 답변이 존재하는 경우
<center><img width="500" src="https://github.com/user-attachments/assets/e262376a-bf9f-4a96-8de4-d4841dd0f444"></center>
<center><em style="color:gray;">demo</em></center><br>

### 시각적 장면 질문

<center><img width="500" src="https://github.com/user-attachments/assets/c50022f3-5095-4217-88c0-a964e1f47a0f"></center>
<center><em style="color:gray;">demo</em></center><br>

위 결과를 보면 "TEO 테오 - \[SUB\] 그날부터 보고 싶었어요 \| EP.1 공유 \| 살롱드립☕"  영상의 10분 -12분 사이에 공유가 낚시한 물고기를 들고 있는 사진이 등장한다. 아래는 해당 영상의 10:48 부분이다.

<center><img width="500" src="https://github.com/user-attachments/assets/f1a0ab19-91ba-4852-bb40-5ddb9f703c4f"></center>
<center><em style="color:gray;">https://youtu.be/rvf2yzcfhXE?si=6knPxfPxr1aWJPwJ</em></center><br>

## summary

### 1시간 분량의 영상 요약

"윤꾼의  북킹부킹 - 『다동력:여러 가지 일을 동시에 해내는 힘』호리에 다카후미(1)~(2)편까지 한번에 듣기" 영상 요약
<center><img width="500" src="https://github.com/user-attachments/assets/c2cdc3a9-fe05-4563-ad5d-44f53a4827ba"></center>
<center><em style="color:gray;">demo</em></center><br>


