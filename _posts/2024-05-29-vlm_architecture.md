---
title: "VLM : Architecture / Fusion Methods"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}









Vision Language Model(VLM)은 visual data와 text data를 동시에 학습하여 두 modality 정보를 모두 활용할 수 있는 모델이다. VLM의 종류는 다양하지만 image와 text를 입력 받아 text 생성하는 모델이 가장 일반적이다. 이와 같은 모델은 vision model과 language model을 융합(fusion)시켜 만들어진다. 이때 융합(fusion)은 모델이 visual 정보와 그에 해당하는 text 정보를 입력 받아 두 modality의 정보를 연관/연동 시키는 방법을 학습함으로써 이루어질 수 있다. 

<center><img width="800" src="https://github.com/finddme/finddme.github.io/assets/53667002/800c5d79-5816-4a6f-979c-2b00fef6dd38"></center>
<center><em style="color:gray;">Edited by author</em></center><br>

Vision Language Model에는 one-size-fits-all architecture가 딱히 없다. vision language model의 구조는 task나 output에 따라 달라질 수 있다. task별 input과 output은 본 블로그 [Vision Language Model : Applications](https://finddme.github.io/multimodal/2024/05/28/vlm_task/) 게시물에서 확인 가능하다. 가장 일반적인 task는 아래 그림과 같이 input으로 image와 그와 관련된 text를 입력 받아 두 입력이 요구하는 정답을 text로 반환하는 것이다.

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/a630e86f-3544-4b8e-a110-4f96e0195cca"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

위 그림과 같이 두 유형의 data를 입력 받은 후 각 modality에 적합한 encoder를 거친 후 각각의 encoder에서 나온 embedding 결과를 융합시키기 위한 fusion layer를 거치고 마지막으로 fused representation 결과를 출력시킬 output block을 통해 최종 결과가 반환된다. 따라서 Vision Language Model은 크게 Vision Encoder, Language Encoder, Fusion Block, Output Block으로 구성된다.

# 1. Vision Encoder 

Vision Encoder는 visual input을 처리한다. 해당 부분에서는 visual data로부터 meaningful representation을 추출하여 이를 vector representation로 변환한다. 2024년 5월 기준 CLIP, ViT 등의 모델이 VLM model의 vision encoder로 많이 사용되고 있다. huggingface의 [OpenVLM Leaderboard](https://huggingface.co/spaces/opencompass/open_vlm_leaderboard)에서 동향을 확인할 수 있다.

# 2. Language Encoder

Language Encoder는 textual input을 처리한다. 해당 부분에서는 text data의 semantic information이 잘 포함된 embedding을 생성한다. Language Encoder가 text data의 seqence를 잘 파악할 수록 VLM의 성능이 올라간다.

# 3. Fusion Block

Fusion Block은 Vision Encoder와 Language Encoder를 통해 visual과 textual data를 각각의 vector representation으로 encoding한 이후 이를 잘 융합시켜 시각적 정보와 텍스트 정보를 모두 포괄하는 최종 embedding 결과를 도출하는 단계이다. Fusion 방식에는 매우 다양한 방법론이 존재한다. 대표적인 방법으로는 아래 다섯 가지가 있다.

- Contrastive Learning
- PrefixLM
- Multi-modal Fusing with Cross Attention
- MLM/ITM
- No Training

## 3.1 Contrastive Learning

Contrastive Learning(대조 학습)은 입력된 image와 text를 동일한 vector space에 놓고 쌍을 이룬 image-text의 각 embedding 거리를 최소화 하면서 맞춰가는 방법이다.(맞지 않는 쌍 간의 거리는 최대화 시키다.) 이때 거리 최소화 작업에 사용되는 vector간 거리 산출 공식은 보통 cosine distance formula이다. OpenAI도 CLIP(Contrastive Language-Image Pre-training) 모델에서 cosine distance formula를 사용하였다. 

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/35558d2c-d9a0-4efa-9032-16208671d81d"></center>
<center><em style="color:gray;">https://towardsdatascience.com/clip-intuitively-and-exhaustively-explained-1d02c07dbf40</em></center><br>


## 3.2 PrefixLM

PrefixLM은 Transformer의 Encoder와 Decoder가 결합된 모델로, prefix token set이 주어졌을 때 다음 token을 예측하는 모델이다. PrefixLM은 visual embedding과 text embedding을 병렬적으로 처리한다. 아래 그림과 같이 Transformer의 Encoder가 concat된 image와 text emebedding(-> prefix emebedding)을 입력 받고 Decoder 그 뒤에 이어질 token을 예측한다. 예측 token은 text이다. 

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/21877fa0-454d-433f-9819-4a6be520b9ff"></center>
<center><em style="color:gray;">SIMVLM: SIMPLE VISUAL LANGUAGE MODEL PRETRAINING WITH WEAK SUPERVISION</em></center><br>

## 3.3 Multi-modal Fusing with Cross Attention

Multi-modal Fusing with Cross Attention은 cross-attention mechanism을 통해 시각적 정보를 language model에 통합시키는 방법이다. 아래 이미지와 같이 visual encoder를 통해 image를 embedding한 후 이 embedding 결과를 language model의 cross-attention layer에 입력한다. 이 방법을 사용한 대표적인 모델은 VisualGPT이다. 

<center><img width="600" src="https://github.com/finddme/finddme.github.io/assets/53667002/69485549-121c-4aae-a176-8b7c07da2418"></center>
<center><em style="color:gray;">VisualGPT: Data-efficient Adaptation of Pretrained Language Models for Image Captioning</em></center><br>

## 3.4 Masked-Language Modeling

Masked-Language Modeling은 self-attention을 통해 input image와 input text를 align시킬 때 사용되는 task로, 이를 학습한 모델은 주로 주어진 caption이 어떠한 이미지에 대한 것인지 예측하는 과제로 많이 사용된다.

<center><img width="600" src="https://github.com/finddme/finddme.github.io/assets/53667002/42c2e63b-e813-4ed7-a531-a76015e20e0b"></center>
<center><em style="color:gray;">MASKED VISION AND LANGUAGE MODELING FOR MULTI-MODAL REPRESENTATION LEARNING</em></center><br>


# 4. Output Block

Output Block은 fused representation(embedding)을 통해 task에 따라 적절한 output을 생성하는 부분이다. Output Block은 해결하고자 하는 task에 따라 다르게 설계된다.



# Reference

> VisualGPT: Data-efficient Adaptation of Pretrained Language Models for Image Captioning

> MASKED VISION AND LANGUAGE MODELING FOR MULTI-MODAL REPRESENTATION LEARNING

> SIMVLM: SIMPLE VISUAL LANGUAGE MODEL PRETRAINING WITH WEAK SUPERVISION

> https://towardsdatascience.com/clip-intuitively-and-exhaustively-explained-1d02c07dbf40
