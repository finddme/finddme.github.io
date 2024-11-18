---
title: "Vision : Self-Attention vs. Cross-Attention"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}









computer vision에서 attention mechanism이 어떻게 작동되는지 알아보자.

attention mechanism은 모델이 시각적 정보를 처리하는 방식을 크게 개선하여 vistion 분야에서 매우 크게 관심 받고 있는 mechanism이다.

> **Attention mechanism** <br>
> 모델이 입력데이터 내의 각 부분에 중요도를 다르게 부여할 수 있는 mechanism이다. 이는 입력 데이터의 모든 부분에 동등한 가중치를 부여하는 방식과 달리 주어진 task를 수행하기 위해 더 중요한 부분에 더 집중할 수 있게 한다.


# Self-Attention

- 입력된 데이터의 각 부분들 간의 관계를 계산하는 mechanism
- "self"라는 단어에서 알 수 있듯이 입력 데이터 하나 안에서만 관계를 파악한다.
- text를 처리할 때는 token단위로 attention score를 계산. image 처리 시에는 pixel/patch 단위로 attention score를 계산

1. 입력 데이터에 각각 다른 가중치 행렬($W_q, W_k, W_v$)를 곱해 Q,K,V 생성
  - attention mechanism 주요 구성요소:
    - Query : 현재 time step의 token/pixel이 다른 token/pixel을 어떻게 볼 것인가를 정의하는 vector 
    - Key : Query로 검색될 대상. 다른 token/pixel의 feature를 담고 있음.
    - Value : 다른 token/pixel들의 실제 정보를 담고 있는 vector.
2. Q와 K를 내적하여 attention score 계산
  - 모든 Query와 Key를 내적 -> 현재 time step의 Query와 다른 Key들의 내적을 통해 관련 있는 위치들을 찾아냄 -> 이렇게 현재 step과 관련도/유사도 높은 token을 찾음
3. 이 점수를 softmax에 통과시켜 0-1사이의 가중치로 만듦
4. 이 가중치랑 Value를 곱해서 최종 출력을 만듦 

<center><img width="500" src="https://github.com/user-attachments/assets/a056c951-1beb-4ac8-adb8-1e474499ec11"></center>
<center><em style="color:gray;">https://arxiv.org/pdf/2404.12457</em></center><br>

- **장점**
  - 입력 데이터의 중요 부분에 선택적으로 집중할 수 있다.
  - token/pixel 간의 장거리 의존성을 효과적으로 포착할 수 있다. -> 전체 문맥/이미지 전역적 구조를 고려한 feature 추출이 가능하다

## ViT(Vision Transformer)

ViT 등장 전에는 주로 CNN기반 모델들을 활용하여 이미지를 처리했다. CNN 방식 모델들은 convolution 필터를 사용하여 이미지를 처리한다.

ViT는 이미지를 patch 단위로 나누어 하나의 sequence로 취급하여 처리하고, self-attention 기반으로 작동한다. transformer의 encoder 부분의 구조와 유사한 구조르 가짐. 

- patch
  - 입력 이미지를 동일한 크기의 patch로 나눈다. 일반적으로 16x16 또는 32x32 픽셀 크기의 패치 사용한다.
-  sequence 변환
  - 각 patch를 1차원 vector로 변환
  - 위치 정보를 포함하는 positional embedding 추가
- self-attention 사용으로 인한 장점:
  - Long-range dependency 포착 : 이미지 내 멀리 떨어진 영역들 간의 관계 파악 용이, 이로 인해 전역적 문맥 이해에 효과적
  - Short-range dependency 포착: 인접한 patch들 간의 관계 파악 용이. 세부적 feature 추출 가능

### 주요 활용 분야

1. 이미지 분류(Image Classification)

  - 전체 이미지의 특징을 고려한 효과적인 분류

2. 객체 탐지(Object Detection)

  - 이미지 내 다양한 객체의 위치 파악
  - 객체 간의 관계성 이해
  - 정확한 경계 상자(bounding box) 예측

3. 세그멘테이션(Segmentation)

  - 픽셀 수준의 정확한 분할
  - 객체의 경계 정밀 파악
  - 의미적 세그멘테이션 수행


# Cross-Attention

multimodal model에 주로 사용됨. 

두 가지 데이터를 동시에 입력 받아 두 데이터 간의 관계를 파악.

1. 두 입력 데이터로부터 Q,K,V 생성
   - Query:
     - target data의 현재 time step에서부터 생성됨. 찾고자 하는 정보(일반적으로 다음 time step에 올 token/pixel)를 표현함. 
   - Key:
     - source 데이터로부터 생성됨. 즉, encoder의 출력 부분에서 생성됨.
     - source token/pixel들의 feature vector들
  - Value:
    -  source 데이터로부터 생성됨. 즉, encoder의 출력 부분에서 생성됨.
    -  source token/pixel들의 실제 정보 vectore들
    - 
2. Q와 K의 내적 -> 현재 원하는 게 Key에서 어떤 거와 가장 유사한지 점수 계산
3. Softmax 적용 (attention score들의 합이 1로 되도록 정규화)
4. Value vectore와 위 점수와 곱하여 Value에 가중치 적용 

<center><img width="500" src="https://github.com/user-attachments/assets/64b17909-b624-4f1c-951d-6fb80cae3f96"></center>
<center><em style="color:gray;">https://arxiv.org/pdf/2404.12457</em></center><br>

### 주요 활용 분야

1. Multi modal model
   - text to image model
     - 입력된 text를 image feature과 매칭
     - 상이한 modal 간의 의미적 유사도 확보
2. Image to Image model
   - Image 합성 모델
   - Image style transformation
3. Video Generation
