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
## 2.1 Attention
Transformers의 구조도 중요하지만 Transformers에서 사용된 Attention도 중요하다. Transformers에 크게 두 가지 Attention이 사용된다<br>
&nbsp;&nbsp;<strong>1. Self Attention:</strong><br>
&nbsp;&nbsp;&nbsp;&nbsp;하나의 sequence 내에서 수행되는 attention <br>
&nbsp;&nbsp;&nbsp;&nbsp;modlity와 무관하게 입력된 sequence를 fully-connected graph로 처리할 수 있다.(graph의 노드는 tokenize된 token들이다.)<br>
&nbsp;&nbsp;<strong>2. Encoder-Decoder Cross Attention:</strong> <br>
&nbsp;&nbsp;&nbsp;&nbsp;encoder에서 decoder로 넘어갈 때 사용되는 attention <br>
<br>
## 2.2 Tokenization/Embedding
Modality에 따라 Transformer의 Tokenization/Embedding 방식이 다르다.<br>
&nbsp;&nbsp;<strong>1. Vanilla Transformer(NLP)</strong><br>
&nbsp;&nbsp;&nbsp;&nbsp;Vanilla Transformer의 input은 token embedding과 position embedding 그리고 추가적으로 segment embedding과 같은 extra learnable embedding을 element wise로 더한 것이다.<br>
&nbsp;&nbsp;<strong>2. Vision Transformer: ViT</strong><br>
&nbsp;&nbsp;&nbsp;&nbsp;Vision Transformer(ViT)에서 Vanilla Transformer의 token embedding 과정에 해당하는 과정은 입력된 이미지를 고정된 크기의 patch로 잘라 Linear Projection layer에 넣어 flatten 시켜 patch embedding을 구하는 방식으로 수행된다.<br>
&nbsp;&nbsp;&nbsp;&nbsp;그리고 Vanilla Transformer과 마찬가지로 positional embedding과 더하여 모델에 입력한다.<br>
<center><img width="600" src="https://github.com/finddme/finddme.github.io/assets/53667002/0eac7634-5786-4ee7-97c4-71643ebfef75"></center>
<center><em style="color:gray;">Pinecone(https://www.pinecone.io/learn/series/image-search/vision-transformers/)</em></center><br>


# 3. Multimodel Transformers

최근 Transformer를 활용한 Multimodal 연구가 활발히 이루어지고 있다. 연구 결과, discriminative task와 generative tasks에서 모두 여러 modlaity에 대해 호환되는 것으로 확인되었다. 

## 3.1  Multimodal Input

### 3.1.1 Tokenization and Embedding Processing

<strong>1) input tokenizing :</strong>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;입력된 input의 modality에맞게 tokenizing한다.

<strong>2) representation embedding space 선택:</strong>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;tokenizing된 것들으 token의 modality에 따라 그에 맞는 representation embedding space를 선택한다.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;예를 들어 아래 표와 같이 token의 modality가 RGB이면 token의 단위는 patch, embedding은 linear projection. token의 modality가 text이면 token 단위는 word, embedding은 learned embedding(Model parameter를 통해 embedding한 결과) 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;아래 표와 같이 다양한 modality에 대해 다양한 tokenizing 방식과 embedding space가 존재한다.

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/1ef8d6ae-a0d0-47d9-b2ba-2b210767f58f"></center>
<center><em style="color:gray;">Multimodal Learning with Transformers:A Survey</em></center><br>

### 3.1.1 Token Embedding Fusion

각 modality별로 tokenizing-embedding을 모두 마친 이후 중요한 것 각 modality별 embedding을 어떻게 합쳐서 multimodal 처리를 가능하게 할 것인가이다.

가장 단순한 fusion은 여러 modality들에 대한 embedding들을 token-wise sum하는 것이다. transformer는 하나의 position에 대해 여러 token embedding을 반영할 수 있기 때문에 가능한 방법이다. 예를 들어 BERT의 경우 한 position embedding에 token embedding과 segment embedding을 position을 기준으로 원소값별로 더하여(element-wise sum하여) 모델에 입력한다. 이를 시각적으로 표현하면 아래 이미지와 같다.

<center><img width="250" src="https://github.com/finddme/finddme.github.io/assets/53667002/ac4ec1b0-7cd9-4fff-ac57-a6f6f0ba21a4"></center>
<center><em style="color:gray;">Multimodal Learning with Transformers:A Survey(edited by author)</em></center><br>

## 3.2 Cross-modal interaction

Token Embedding Fusion외에도 다양한 modal간의 interaction 방법들이 있는데 multimodal Transformers에서는 self-attention과 변형된 self-attention을 통해 modality 간의 interaction을 수행한다. 

self-attention design 관점으로 Transformer의 multimodal modelling 방법을 나누면 크게 6가지로 분류할 수 있다.

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/507d0807-d1d8-4396-b161-bb40f6c8f0d8"></center>
<center><em style="color:gray;">Multimodal Learning with Transformers:A Survey</em></center><br>

### 3.2.1 Early summation (token-wise, weighted)

- 가장 단순한 Fusion 방식으로, token-wise sum 하는 방법이다. 3.1.1에서 다룬 방식과 동일.
- 각 modality의 token embedding들을 position을 기준으로 더하여 Transformers에 입력되는 방식.
- 단순한 방식으로 수행되는 만큼 계산 복잡도가 증가하지 않는다는 것이 주요 장점이다.
- 주요 단점은 가중치가 수동으로 설정되었다는 것이다. 

<center><img width="180" src="https://github.com/finddme/finddme.github.io/assets/53667002/c4448e6c-4287-4f19-a6c4-afa4ce5f8fd2"></center>
<center><em style="color:gray;">Multimodal Learning with Transformers:A Survey</em></center><br>


### 3.2.2 Early concatenation(= all-attention, CoTransformer)

- Modality들의 token embedding sequence concatenate하여 Transformer layer에 입력하는 방법이다.
- 이 방법은 modality들의 token position이 하나의 sequence로 처리되어 각 modality의 context를 반영할 수 있다는 장점을 가진다.
- VideoBERT는  multimodal Transformer의 초기 연구 중 하나로, 이와 같은 방식을 통해 video와 text를 결합하여 global multimodal context를 잘 encoding한 모델이다.
- 이 방법은 concatenation으로 길어진 Sequence로 인해 계산 복잡도가 증가된다는 단점을 가진다. 이는 Attention 자체의 한계점으로, sequence가 길어질수록 계산 복잡도가 높아진다.

<center><img width="300" src="https://github.com/finddme/finddme.github.io/assets/53667002/bc6e332e-9b4a-4b31-a131-c79b8517a4eb"></center>
<center><em style="color:gray;">Multimodal Learning with Transformers:A Survey</em></center><br>


### 3.2.3  Hierarchical attention (multi-stream to one-stream)

- Modality에 따라 각각 독립적인 Transformer를 통해 input을 encoding한 이후 각 Transformer stream들의 output embedding을 concat하여 하나의 또다른 Transformer에 입력함으로써 Embedding들을 융합시키는 방식이다.
- 이러한 방식은 late interaction/fusion로 분류될 수도 있고 early concatenation의 특수 케이스로 분류될 수도 있다.

<center><img width="300" src="https://github.com/finddme/finddme.github.io/assets/53667002/b8b0027f-6828-437b-953f-c83cd212e942"></center>
<center><em style="color:gray;">Multimodal Learning with Transformers:A Survey</em></center><br>

### 3.2.4  Hierarchical attention (one-stream to multi-stream)

- 각 Modality들의 token embedding들을 concat한 이후 하나의 Transformer Layer에 입력하고 그 Transformer output을 각 modality별로 나누어 각각 별도의 Transformer에 다시 입력하는 방식이다.
- 이와 같은 방식은 one-stream 단계에서 각 modality들의 toekn embedding이 concat된 것이 Transformer에 함께 임력됨으로써 modality들 간의 self-attention이 수행되어 이로 인해 각 modality 간의 interaction이 반영된다.
- 그리고 multi-stream 단계에서는 각 modality별로 독립적인 Transformer에 입력되어 최종 embedding을 산출하기 때문에 uni-modal representation의 독립성을 유지할 수 있다는 장점이 있다.
- 이 방법론이 적용된 대표적인 모델은 InterBERT이다.

<center><img width="300" src="https://github.com/finddme/finddme.github.io/assets/53667002/e3bda481-0fa9-4be5-bee0-7315e759bfbb"></center>
<center><em style="color:gray;">Multimodal Learning with Transformers:A Survey</em></center><br>

### 3.2.5 Cross-attention (= Coattention)

- 각 Modality별로 별도의 Transformer를 사용하고, Modality별 Q(Query) embedding을 cross-stream 방식으로 교환 및 교체하는 방식이다.
- 각 Modality의 최종 Embedding을 산출할 때 다른 Modality를 반영하면서도 계산 복잡도는 증가되지 않는다는 장점을 가진다.
- 하지만 각 Modality가 각각의 Transformer에 입력되기 전 cross-modal attention을 수행하지 못하여 전체 context를 놓칠 수 있다는 단점이 있다.
- 이 방법론은 VilBERT에서 처음 제안되었다. 해당 논문에서는  two-stream cross attention 은 modality 간의 interaction을 수행하긴 하지만 각 modality 내 자체 context에 대한 self-attention은 수행하지 않는다고 밝혔다.

<center><img width="300" src="https://github.com/finddme/finddme.github.io/assets/53667002/61ebbb75-eacc-4e66-82c5-f18b4970e4e1"></center>
<center><em style="color:gray;">Multimodal Learning with Transformers:A Survey</em></center><br>

### 3.2.6 cross-attention to concatenation

- Cross-attention의 단점을 보완하기 위해 나온 방법으로, Cross-attention에 Hierarchical 구조를 추가하여 global context를 반영할 수 있도록 만든 방법이다.
- 이는 Cross-attention을 통해 산출된 Embedding을 concat한 이후 또다른 Transformer layer에 입력한다.

<center><img width="300" src="https://github.com/finddme/finddme.github.io/assets/53667002/b5313a57-3878-4cea-be44-b4424318f036"></center>
<center><em style="color:gray;">Multimodal Learning with Transformers:A Survey</em></center><br>


### + Network Architectures

지금까지 알아본 multimodal Transformer는 Network Architecture와 interaction timing을 기준으로 아래 그림과 같이 분류할 수 있다.

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/dd7cc526-d8f2-499a-9751-a4fa16ee5759"></center>
<center><em style="color:gray;">Multimodal Learning with Transformers:A Survey(edited by author)</em></center><br>


# 4. Application Scenarios




# Reference

> Multimodal Learning with Transformers:A Survey

> https://www.pinecone.io/learn/series/image-search/vision-transformers/
