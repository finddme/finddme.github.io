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

- **장점**
  - 입력 데이터의 중요 부분에 선택적으로 집중할 수 있다.
  - token/pixel 간의 장거리 의존성을 효과적으로 포착할 수 있다. -> 전체 문맥/이미지 전역적 구조를 고려한 feature 추출이 가능하다

## ViT(Vision Transformer)

ViT 등장 전에는 주로 CNN기반 모델들을 활용하여 이미지를 처리했다. CNN 방식 모델들은 convolution 필터를 사용하여 이미지를 처리한다.

ViT는 이미지를 patch 단위로 나누어 하나의 sequence로 취급하여 처리하고, self-attention 기반으로 작동한다.

- patch
  - 입력 이미지를 동일한 크기의 patch로 나눈다. 일반적으로 16x16 또는 32x32 픽셀 크기의 패치 사용한다.
-  sequence 변환
  - 각 patch를 1차원 vector로 변환
  - 위치 정보를 포함하는 positional embedding 추가
- self-attention 사용으로 인한 장점:
  - 










