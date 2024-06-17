---
title: "About Fine-tuning"
category: LLM / Multimodal
tag: NLP
---







* 목차
{:toc}









Fine-tuning은 일종의 transfer learning으로, Pre-trained Model를 특정 task에 적합하도록 model에 관련 지식을 주입하는 과정이다. Fine-tuning 시에는 model의 network architecture는 그대로 두고 모델의 weight만 업데이트시킨다. 매우 많은 비용이(방대한 학습 데이터, 컴퓨터 자원, 학습 시간 등) 소요되는 full pre-training과 달리 fine-tuning은 full pre-trained 된 모델을 활용하여 비교적 효율적으로 모델을 원하는 task에 맞게 학습시킬 수 있다.

# 1. Fine-tuning Data

## 1) Data collection and selection

데이터의 품질과 적합성은 tuning 결과에 주요한 영향을 미치기 때문에 데이터 선정은 매우 중요한 과정이다. 학습의 목적에 따라 적합한 데이터는 모두 상이하다. 학습의 목적이 [Domain adaptation](https://finddme.github.io/natural%20language%20processing/2022/11/29/DAPT/)인 경우에는 해당 domain과 관련 있는 un-labelled data가 필요하다. 학습의 목적이 특정 task를 수행하는 모델 개발인 경우에는 task에 적합한 labeled data가 필요하다. labeled data의 내용과 형식은 task에 따라 달라진다.

labeled data는 un-labelled data에 비해 수집에 많은 비용이 들고, 높은 품질의 labeled dataset을 구축하기도 어렵다. 최근에는 LLM을 사용하여 labeled data를 수집하는 방법도 크게 유행하고 있다. 이와 같은 방법은 human-labeling보다 비용이 적게 들고, 시간도 적게 소요된다는 장점이 있다.

> LLM pre-training 시에는 web-crawling data가 일반적으로 사용된다. 

## 2) Data pre-processing

1. Quality-related pre-processing(데이터 품질 관련 전처리)
  - 형식 구조화, 중복 제거, 개인정보 제거 
2. Basic pre-processing in NLP (기본적인 자연어 전처리)
  - tokenisation, embedding, chunking

# 2. Training

Tranformers 계열의 모델이 self-supervised learning
