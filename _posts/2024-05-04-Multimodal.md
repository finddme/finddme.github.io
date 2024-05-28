---
title: Multimodal Learning with Transformers:A Survey
category: Multimodal
tag: Multimodal
---







* 목차
{:toc}










# 1. Introduction

인공지능은 인간의 지각 능력을 모방한 것이다. 일반적으로 modality는 특정한 센서를 통해 생성된 vison과 language와 같은 unique communication channel을 지칭한다. 인간은 세상과 상호작용할 때 다양한 modality 정보를 적절히 활용한다. 각 modality는 각각 다른 informationo source로 표현된다. 예를 들어 이미지는 수천개의 pixel을 통해 시각적으로 표현되고, 텍스트는 이산적인 단어들을 통해 표현된다. 인공지능 multimodal 구현을 위해서는 인간이 처리하는 각 modality 표현들과 유사한 정보를 데이터로 사용하고 각 정보들을 연결해야 한다.

본 논문은 다양한 modality와 task를 transformer를 통해 구현하고 학습시키는 것과 관련된 다양한 정보에 대해 다룬다. 

# 2. [Transformers](https://finddme.github.io/natural%20language%20processing/2019/11/19/Transformer/)

번역과제를 위해 NLP 분야에서 나온 모델로, 최근 다양한 인공지능 모델에 변형되어 활용되는 모델이다.<br>
<br>
Transformers의 구조도 중요하지만 Transformers에서 사용된 Attention도 중요하다. Transformers에 크게 두 가지 Attention이 사용된다<br>
&nbsp;&nbsp;<strong>1. Self Attention:</strong><br>
&nbsp;&nbsp;&nbsp;&nbsp;하나의 sequence 내에서 수행되는 attention <br>
&nbsp;&nbsp;&nbsp;&nbsp;modlity와 무관하게 입력된 sequence를 fully-connected graph로 처리할 수 있다.(graph의 노드는 tokenize된 token들이다.)<br>
&nbsp;&nbsp;<strong>2. Encoder-Decoder Cross Attention:</strong> encoder에서 decoder로 넘어갈 때 사용되는 attention <br>
<br>
Modality에 따라 Transformer의 Tokenization/Embedding 방식이 다르다.<br>
&nbsp;&nbsp;<strong>1. Vanilla Transformer(NLP)</strong><br>
&nbsp;&nbsp;&nbsp;&nbsp;Vanilla Transformer의 input은 token embedding과 position embedding 그리고 추가적으로 segment embedding과 같은 extra learnable embedding을 element wise로 더한 것이다.
&nbsp;&nbsp;<strong>2. Vision Transformer: ViT</strong><br>
&nbsp;&nbsp;&nbsp;&nbsp;Vision Transformer(ViT)에서 Vanilla Transformer의 token embedding 과정에 해당하는 과정은 입력된 이미지를 고정된 크기의 patch로 잘라 Linear Projection layer에 넣어 flatten 시켜 patch embedding을 구하는 방식으로 수행된다.<br>
&nbsp;&nbsp;&nbsp;&nbsp;그리고 Vanilla Transformer과 마찬가지로 positional embedding과 더하여 모델에 입력한다.
<center><img width="600" src="https://github.com/finddme/finddme.github.io/assets/53667002/0eac7634-5786-4ee7-97c4-71643ebfef75"></center>
><center><em style="color:gray;">Pinecone(https://www.pinecone.io/learn/series/image-search/vision-transformers/)</em></center><br>


# 2. Multimodel Transformers


# Reference

> Multimodal Learning with Transformers:A Survey
