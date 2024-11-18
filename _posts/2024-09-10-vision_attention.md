---
title: "Vision Transformer : Self-Attention vs. Cross-Attention"
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
- attention mechanism 주요 구성요소:
  - 















