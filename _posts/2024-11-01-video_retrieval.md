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
     
  3. caption과 stt결과를 포함한 vectorDB 구축


- **Retrieval pipeline (video_scene_search)**

  1. retrieval :<br>
    retrieval 결과 예시: (query: 아부라소바 레시피 알려줘)<br>
    ```json
    {
      "data": {
        "Get": {
          "Vid_result_test": [
            {
              "data": "## STT data: 그다음에 간장 스프가 들어가기 때문에 짤 필요 없어요 아이고 반 식초 반인데 좀 새콤한 거 좋아하시면 하나 넣으셔도 돼요 반 설탕 반 이렇게 잘 섞어주세요 1대 1대 1인데 하나하나 아니에요 1분의 1, 2분의 1, 2분의 1 반 숟갈 반 숟갈 반 숟갈 이건 한 숟갈 기름맛에 먹는 거라 아브라 카타브라 참기름 한 숟갈 야 밥 비비고 싶다 소스 완성 김가루도 조금 들어가야 되거든요 그러니까 가루김 있으면 가루김 쓰시고 집에 밥 드실 때 먹는 김 조미김 있으면 이거 조그만 한... 저는 김을 좋아하니까 세 장? 네 장? 세 장 김 향이 너무 강할 필요는 없거든요 이거는 기름 맛으로 먹는 거라 와... 냄새 예술이다 \n\n ## Caption data: 이미지에는 어두운 색상의 옷을 입은 사람이 두 손으로 빨간색 용기를 쥐고 있는 모습이 있다. 용기는 손바닥 크기로, 뚜껑을 여는 동작처럼 보인다. 중앙에는 갈색과 아이보리 색상의 식기 그릇이 놓여 있으며, 나무 테이블 위에 배치되어 있다. 그릇의 좌측 앞쪽에는 초록색 도마가 위치해 있고, 도마 위에는 흰색과 노란색 플라스틱 용기가 나란히 놓여 있다. 테이블 오른쪽에는 두꺼운 흰색 천과 몇 개의 병들이 가지런히 놓여져 있어 깔끔한 주방 환경을 연상시킨다. 화면 하단에는 '다 넣지 마시고 반만 넣으세요'라는 자막이 나타나며, 요리 과정을 설명하는 것 같다.",
              "description": "#백종원 #요리비책 #아부라소바",
              "time": "0:02:00",
              "url": "https://youtu.be/RuEyl_cMMns?si=gpg5OvwmnHO5BEYB",
              "vid_title": "집에_있는_라면으로_이거_꼭_한번_해보세요!"
            },
            {
              "data": "## STT data: 혹시 백라면 필요하시면 저기 밑에 나갈 겁니다 거기 가셔서 구매하시면 돼요 세일합니다 항상 항상은 아니에요 항상은 아니고 보통 아브라소바에는 생 달걀 써요 일본은 밥에 따도 그냥 올려서도 먹기도 하고 찍어 먹기도 하는데 우린 달걀 프라이를 넣을 거고 백라면이나 어떤 매운맛이 나는 라면 쓰시면 가능한 백라면 식초 식초 이왕이면 양조식초 같은 거 쓰세요 식초 사실 잘 사세요 그냥 일반적으로 양조식초를 사세요 양조식초 설탕은 항상 있을 것이고 간장 진간장 쓰시면 되고 간장 있을 거고 생기름이 있어야 돼 생기름 그다음에 김 조미김 있으면 되고 조미김 가루 있으면 조미김 좀 넣을 거고 파 좀 들어갈 겁니다 그래서 쪽파 있으면 쪽파 쓰시고 없으면 대파 쓰셔도 돼요 대파 반 갈라서 잘게 잘게 쓸러 쓰시면 되고 제일 먼저 할 일은 뭐냐면 라면을 삶기 전에 우선 소스부터 만들 거예요 여기다 소스를 먼저 만들어서 올릴 건데 라면 보시면 스프가 보통 두 가지예요 그렇죠? 프레이크는 같이 넣고 끓일 거고 프레이크 건더기 스프는 분말 스프 다 넣지 마시고 반만 넣으세요 반만 \n\n ## Caption data: 주방에 있는 남성이 검정색 셰프 유니폼을 입고 탁자 뒤에 서 있다. 탁자 위에는 다양한 요리 재료들이 배열되어 있다. 왼쪽부터 식용유, 라면 패키지, 그리고 각기 다른 색상의 소스 병들이 있다. 소스 병은 각각 노란색과 빨간색 라벨이 붙어 있으며, 뚜껑도 노란색으로 통일되어 있다. 패키지와 소스 병 옆에는 길게 자란 파가 놓여 있다. 배경에는 우드 톤의 선반이 있으며, 다양한 곡물과 양념이 담긴 병들이 가지런히 정리되어 있다. 선반 위쪽 오른편에는 목제 소금과 후추 그라인더가 위치하고, 몇 개의 사진과 주방 도구들이 장식되어 있다. 전반적인 장면은 깔끔하고 정돈된 느낌을 준다.",
              "description": "#백종원 #요리비책 #아부라소바",
              "time": "0:01:00",
              "url": "https://youtu.be/RuEyl_cMMns?si=gpg5OvwmnHO5BEYB",
              "vid_title": "집에_있는_라면으로_이거_꼭_한번_해보세요!"
            },
            {
              "data": "## STT data: 안녕하세요 백종원입니다 와 냄새 예술이다 국제 음식에서 팔아야겠는데요? 오늘은 라면을 이용해서 일본 여행 요새 많이 나가시더라고요 일본 가면 아브라소바라고 아브라가 기름입니다 아브라카다브라가 아니라 아... 아브라카다브라 몰라? 아브라카다브라 아 그렇다 그 노래를 아는 세대요? 오? 기름소바라고 한동안 일본에서 되게 유행했었어요 한국사람 입에도 맞고 그래서 그걸 쉽게 아브라 라면 아 나 한국말로 하면 기름라면이네? 갑자기 식용이 확 떨어지는데? 굳이 한국말인데 일본말을 쓰냐고 뭐라고 하시는 분을 위해서 예제를 아브라소바 기름라면 식용이 떨어지지 그래서 이건 뭐 그냥 문화적인 교류라고 생각하면 좋을 것 같아요 그래서 그걸 만드는 걸 할 건데 라면은 백라면 아니면 안 돼요 라고 하고 싶지만 다 돼요 웬만한 매운맛 나오는 라면은 다 돼요 백라면 혹시라도 있으면 이거 쓰시고 \n\n ## Caption data: 주방 장면으로, 앞쪽에는 '안녕하세요'라는 글자가 주요하게 배치되어 있습니다. 중앙에는 검은색 요리사 유니폼을 입은 남성이 서 있으며, 그의 배경으로는 조리대와 선반이 보입니다. 조리대 위에는 다양한 종류의 소스병과 재료들이 정렬되어 있으며, 이들 대부분은 색색의 라벨이 붙어 있습니다. 뒷편 선반에는 여러 크기와 모양의 투명한 유리병들이 놓여 있고, 각기 다른 곡물이나 재료들이 담겨 있습니다. 선반 상단에는 나무로 만든 그라인더와 장식품이 위치하며, 오른쪽 끝에는 몇 개의 사진이 작은 액자에 담겨 있습니다. 주방의 타일 배경과 전체적인 색 조합이 화사하고 깔끔한 느낌을 줍니다.",
              "description": "#백종원 #요리비책 #아부라소바",
              "time": "0:00:00",
              "url": "https://youtu.be/RuEyl_cMMns?si=gpg5OvwmnHO5BEYB",
              "vid_title": "집에_있는_라면으로_이거_꼭_한번_해보세요!"
            }
          ]
        }
      }
    }
    ```
    
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
- 캡쳐된 프레임에 대한 장면 변화를 감지하여 변화가 없는 경우는 넘어가는 기능 고려 중 (인터뷰 유형의 비디오에서 성능 저하를 야기할 것 같아 고려만 하는 중)

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


