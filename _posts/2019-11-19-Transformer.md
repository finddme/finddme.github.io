---
title: Transformer:Attention Is All You Need
category: Natural Language Processing
tag: NLP
---

Transformer는 [이전 게시물](https://finddme.github.io/natural%20language%20processing/2019/11/12/Attention/)에서 소개한 기존 Attention기법을 발전시킨 모델로 Attention Is All You Need(2017)에서 처음 소개되었다. Transformer network의 가장 큰 특징은 자연어 처리과제에 보편적으로 사용되는 RNN계열의 모델을 전혀 사용하지 않고 Attention만으로 작업을 수행한다는 것이다.

기존 기계번역에서 사용되던 RNN기반의 encoder-decoder는 RNN을 사용하기 때문에 순차적으로 연산이 진행되어 문장내 단어의 순서나 위치는 잘 반영하나 연쇄적인 연산으로 인해 첫 입력 값과 마지막 입력 값의 거리가 멀어질수록 초반에 입력된 정보에 대한 손실이 생기며 학습이 느리다는 문제가 있었다. 

그리고 Transformer가 나오기 이전에 사용된 Attention mechanism은 기존 RNN based encoder-decoder에 Attention을 추가한 것이기 때문에 여전히 연산 속도는 느리다는 문제가 있었다.

반면 Transformer는 RNN을 완전히 제거하고 각 단어에 대한 중요 정보 인코딩을 행렬곱을 통해 한번에 연산함으로써 학습 속도를 올렸다. 또한 추가적으로 다양한 기술들을 적용하여 성능을 높여 큰 주목을 받았다. 

## Architecture of Transformer

아래 그림은 Transformer의 전체 구조이다. 해당 그림을 보면 encoder에 input(source language)이, decoder에는 right shifted된(start token이 있는) output(target language)이 들어가 이를 통해 최종적으로 output probability(다음에 오게 될 단어에 대한 예측 확률)가 도출되는 것을 볼 수 있다:

<center><img width="680" alt="2019-11-20 (3)" src="https://user-images.githubusercontent.com/53667002/69211133-5eb7d400-0ba0-11ea-8d50-40ae5b838a1a.png"></center>

### - Hyperparameter of Transformer

구조에 대한 이해를 돕기 위해 논문에서 설정한 Transformer의 주요 hyperparameter들에 대해 먼저 짚어보겠다. 

* transformer encoder-decoder의 입,출력 크기는 항상 같은 차원을 지니며 내부적으로도 항상 같은 차원의 벡터가 흐르는데 이를 $d_{model}$라 부르며 논문에서는 512로 설정하였다.

* encoer-decoder를 여러번 수행하는데 이들의 layer 수는 6개로 설정하였다.

* attention연산도 병렬적으로 여러번 수행되는데 논문에서는 8개의 attention을 사용하였다.

* feedforward의 hidden state 크기($d_{ff}$)는 feedforward의 입출력 크기와 다르다. Feedforward의 입출력 크기는 $d_{model}$크기이지만 $d_{ff}$ 는 해당 논문에서 2048로 설정하였다.

Transformer는 Attention을 발전시킨 모델이기 때문에 기존 encoder-decoder모델처럼 encoder와 decoder역할을 하는 부분이 존재한다. 하지만 기존 모델과는 달리 encoder-decoder layer N개를 연속으로 붙여서 사용하는데 해당 논문에서는 encoder와 decoder layer를 각각 6개를 사용하였다. 그리고 Transformer 내부에서는 Encoder와 Decoder layer 전반에 걸쳐 입력부터 출력까지 계속 같은 차원의 벡터($d_{model}$)가 흐른다.

Attention에 사용되는 weight는 attention head마다 다르고, fully-connected feed forward neural network에 사용되는 weight는 encoder나 decoder layer 내부적으로는 같은 weight을 사용하지만 layer간에는 다른 weight 로 학습이 이루어진다. 

### - Encoder

<center><img width="563" alt="2019-11-19 (8)" src="https://user-images.githubusercontent.com/53667002/69123896-e68cd800-0ae5-11ea-8033-fd99dd2af856.png"></center>

Encoder layer는 위 그림에서 볼 수 있듯이 self-attention과 feed forward 이렇게 두 sub-layer로 이루어져 있다. 위에서 언급했듯이 N개의 encoder layer가 사용될 수 있는데 해당 논문에서는 6개의 layer를 사용했다. 그리고 self-attention이 Multi-Head Attention이라고 표현되어 있고, feed forward neural network는 position wise feed forward neural network라고 표현되어 있다. 이를 통해 attention과 feed forward layer가 여러 번 사용되었다는 것을 알 수 있다. Encoder 내부의 흐름은 다음과 같이 진행된다:

<center><img width="800" alt="2019-11-20 (1)" src="https://user-images.githubusercontent.com/53667002/69210276-878a9a00-0b9d-11ea-8fff-c568c3349473.png"></center>

위 그림과 같이 여러 layer를 거친 후 마지막 layer의 출력 값이 encoder의 최종 출력 값이 되어 decoder로 넘어간다:

<center><img width="580" alt="2019-11-19 (12)" src="https://user-images.githubusercontent.com/53667002/69124158-85193900-0ae6-11ea-9477-a33a974bfce3.png"></center>

### - Decoder

<center><img width="600" alt="2019-11-19 (14)" src="https://user-images.githubusercontent.com/53667002/69124253-bf82d600-0ae6-11ea-98f9-a38e04537671.png"></center>

Decoder는 self-attention, encoder-decoder attention 그리고 feed Forward, 이렇게 총 3개의 sub-layer로 구성되어 있다. Decoder의 self-attention은 현재 단어 이후에 나올 단어들에 attention이 적용되지 않도록 masking을 한 masked multi-head attention을 사용한다. 그리고 이후 seq2seq에서 사용된 attention과 유사한 encoder-decoder attention도 사용된다. Decoder도 encoder와 마찬가지로 N개의 layer가 사용될 수 있으며 해당 논문에서 encoder와 같이 6개의 layer를 사용하였다. 그리고 attention과 feedforward layer 또한 encoder처럼 여러 번 사용되었다.

## 1\. Embedding

Embedding부터 차례대로 살펴보겠다. 위에서 언급했 듯이 encoder에는 input이, decoder에는 right shifted된 output이 입력된다. Embedding은 일반적으로 자연어처리 과제 수행에 사용되는 Embedding Algorithm이 사용된다. 문장이 입력된 후에는 token별로 분리한 후 embedding과정을 거치는데 embedding시 중요한 것은 embedding vector의 차원이 $d_{model}$차원과 같아야 한다는 것이다. embedding vector의 차원이자 모델 내부에서 흐르는 행렬의 크기는 항상 (${seq}_{len}$, $d_{model}$)인데, seq_len의 크기는 사용자가 설정할 수 있는 hyperparameter로, 일반적으로 train dataset에서 가장 긴 문장의 길이를 크기로 설정한다.

## 2\. Positional Encoding

RNN모델이 자연어처리 과제에서 보편적으로 활용될 수 있었던 이유는 해당 모델이 단어의 위치 및 순서 정보를 반영한다는 특징 때문이었다. 하지만 RNN을 전혀 사용하지 않는 Transformer는 따로 위치 정보를 반영해주어야 한다. Positional Encoding은 위와 같은 이유로 Embedding된 encoder와 decoder의 입력 값에 sinusoid function을 사용하여 positional encoding값을 더해 위치정보를 주는 과정이다. 단어별(벡터별) positional encoding수행 과정을 그림으로 표현하면 다음과 같다:

<center><img width="680" alt="2019-11-20 (5)" src="https://user-images.githubusercontent.com/53667002/69217070-11902e00-0bb1-11ea-92f9-c5f0752c61f6.png">
</center>

위 그림은 이해를 용이하게 하기위해 embedding벡터와 positional encoding값이 더해지는 과정을 단어 하나하나 더해지는 것처럼 나타냈지만, 실제 문장을 처리할 때에는 embedding된 단어들은 각각 모두 벡터이고, 문장은 행렬이기 때문에 다음과 같이 embedding벡터가 모여서 만들어진 행렬과 positional encoding행렬이 더해지게 된다.

<center><img width="386" alt="2019-11-19 (18)" src="https://user-images.githubusercontent.com/53667002/69125399-17224100-0ae9-11ea-92d0-ed13c64018eb.png"></center>

위에서 언급했듯이 positional encoding은 sine과 cosine함수를 통해 위치정보를 가진 encoding값을 만들어 embedding 벡터와 더하는 과정이다. 이를 위한 sinusoid function은 다음과 같이 정의된다:

$$
\begin{matrix}
PE_{(pos,2i)}=\sin(pos/10000^{2i/d_{\text{model}}})\\
PE_{(pos,2i+1)}=\cos(pos/10000^{2i/d_{\text{model}}})
\end{matrix}
$$

sinusoid function을 사용하여 positional encoding을 해주는 이유는 인코딩 값이 -1부터 1사이의 값이 나오게 되고, 학습데이터보다 긴 문장이 입력돼도 오류 없이 상대적인 encoding 값을 줄 수 있다는 장점이 있기 때문이다.

## 3\. Multi-Head Attention

Embedding과 positional encoding과정을 거친 후에는 본격적으로 encoder와 decoder에 입력이 되어 attention layer에 들어간다. 해당 모델에서는  Multi-head attention을 사용했는데 말 그대로 head가 여러개인 attention을 쓴다는 것이다. Transformer에서는 기존 seq2seq 모델에서 사용되던 source-target attention과는 다른 종류의 attention을 사용한다. 

두 Attention의 차이를 설명하기 전, 이해를 돕기 위해 Query($Q$), Key($K$) 그리고 Value($V$)에 대해 먼저 언급하겠다. 우선 $Q$, $K$, $V$가 모두 벡터라는 것을 염두에 두어야한다.  $Q$는 현재의 단어를 표현하는 벡터이다. 그리고 $K$와 $V$는 해당 단어와 다른 단어 간의 상관관계를 파악하기 위해 필요한 벡터이다. $K$는 $Q$에 대한 상대 단어이기 때문에 $K$와 $Q$의 곱(행렬곱)은 attention weight가 되며 $V$는 hidden vector역할을 한다.

## 3\.1 Self-Attention

### - Source-target attention : 

Source-target attention은 attention input인 $Q$, $K$, $V$에 대해 $Q$는 target에서, $K$와 $V$는 source에서 받는 것이다. 즉 $Q$는 decoder의 hidden vector(s)이고, $K$와 $V$는 encoder의 hidden vector(h)이다.

### - Self-attention : 

Source-target attention과 달리 $Q$, $K$, $V$는 모두 동일한 곳으로부터 입력 받는다. 그리고 기존 attention의 $K$, $V$와 달리 해당 두 벡터의 쓰임을 구분한다. $K$는 attention weight를 도출하는데 사용되고, $V$는 기존 attention의 hidden state vector와 같은 역할을 한다. 이렇게 동일한 곳에서 온 벡터를 $Q$, $K$, $V$로 나누는 이유는 단순히 나눠서 성능이 좋아졌기 때문이다.

이제 self-attention연산에 필요한 $Q$, $K$, $V$를 나누는 과정을 설명하겠다. 우선 embedding과 encoding이 완료된 벡터가 입력으로 들어오면 각 단어 벡터마다 각각 다른 가중치인 $W^{Q}$,  $W^{K}$,  $W^{V}$를 곱하여 각각의 $Q$, $K$, $V$를 얻는다($W^{Q}$,  $W^{K}$,  $W^{V}$는 훈련 과정 속에서 훈련되는 가중치 행렬이다). 

$$W_i_Q \text{with dimensions} d_{model} \times d_q$$
$$W_i_K \text{with dimensions} d_{model} \times d_k$$
$$W_i_V \text{with dimensions} d_{model} \times d_v$$


각 단어 벡터는 $d_{model}$의 크기를 가지며, $Q$, $K$, $V$는 $d_{model}$을 attention layer 수로 나눈 만큼의 차원을 갖는다. 해당 논문에서 $d_{model}$은 512이고 attention layer 수는 8이었기 때문에 $Q$, $K$, $V$는 각각 64차원의 크기를 갖는다.

<center><img width="413" alt="2019-11-19 (20)" src="https://user-images.githubusercontent.com/53667002/69126381-6ec1ac00-0aeb-11ea-97f0-1e4ce86f8f78.png"></center>

위 그림은 단어 벡터 하나에 대한 $Q$, $K$, $V$벡터를 구하는 과정을 표현한 것이다. 하지만 이전에도 언급했 듯이 문장은 단어벡터들을 합친 행렬이기 때문에 실제 연산은 다음과 같이 행렬곱으로 진행된다:

$$xW_i_Q=q_i \text{with dimensions} {seq}_{len} \times d_q$$
$$xW_i_K=K_i \text{with dimensions} {seq}_{len} \times d_k$$
$$xW_i_v=V_i \text{with dimensions} {seq}_{len} \times d_v$$

<center><img width="458" alt="2019-11-19 (22)" src="https://user-images.githubusercontent.com/53667002/69126494-ae889380-0aeb-11ea-8648-cf6c70edad92.png"></center>

## 3\.2 Scaled dot-product attention

이제 위와 같은 과정(self-attention 방식)을 거쳐 $Q$, $K$, $V$벡터를 얻은 후 attention score function을통해 attention연산을 해야 한다. [이전 게시물](https://finddme.github.io/natural%20language%20processing/2019/11/12/Attention/)에서 attention score를 산출하는 attention score function의 방식이 많이 제시되어 있다고 언급했다. Self-attention에서는 제시된 function중 scaled dot-product attention 함수를 사용하는데 해당 함수를 언급하기 전에 dot product attention에 대해 간단히 설명하겠다. Dot-product attention 연산은 매우 간단하다. 이름 그대로 곱해주면 된다. scaled dot-product attention도 말 그대로 dot product attention에 scaling작업을 추가한 것이다. dot product attention으로 도출된 attention score를 $k$벡터 차원 크기의 루트값으로 나눠 scaling을 해주는데 이렇게 하는 이유는 $k$벡터의 차원이 커질수록 dot product계산시 값이 너무 커지는 문제를 보완하기 위함이다. 아래 수식은 scaled dot-product attention score를 표현한 것이다:

$$\text{Score}(Q, K) =\frac{QK^T}{\sqrt{d_k}}$$

<center><img width="754" alt="2019-11-19 (24)" src="https://user-images.githubusercontent.com/53667002/69126919-9d8c5200-0aec-11ea-8278-396fe554b2c7.png"></center>

이제 attention weight를 구해야 한다. 기존 seq2seq에 사용되던 attention에서 사용된 함수에서도 attention score를 구하여 softmax를 적용하여 attention distribution을 구한 후 hidden state vector와 weighted sum을 하여 attention score를 구했다. scaled dot-product attention도 마찬가지이다. 위에서 구한 attention score에 softmax를 적용하여 attention distribution을 구한 후 hidden vector역할을 하는 $V$를 곱하면 attention weight를 구할 수 있다. 이를 수식으로 표현하면 다음과 같다:

$$\text{Attention}(Q, K, V) =\text{softmax}(\frac{QK^T}{\sqrt{d_k}})V$$

<center><img width="773" alt="2019-11-19 (26)" src="https://user-images.githubusercontent.com/53667002/69127098-f4922700-0aec-11ea-9fe1-424d0e948115.png"></center>

## 3\.3 Masked Multi head attention

Decoder layer에는 특이하게 Masked Multi head attention이 있는데 이는 output probability를 도출하기 위해서는 아직 출력되지 않은 단어에 attention이 적용되는 것을 막기 위해 현재 step까지 나온 단어를 제외한 다른 단어들을 masking하여 attention과정을 하는 것이다. 그리고 decoder의 Multi-head attention은 encoder의 multi-head attention과 조금 다른데, 현재 decoder의 입력 값을 Query로 사용하고 encoder의 최종 출력 값을 Key 와 Value로 사용한다. 즉, encoder의 최종 출력 값에서 중요 정보를 도출하고 decoder에서는 다음 단어에 적합한 단어가 무엇인지 encoder의 출력 값을 통해 추론해내는 것이다. 

## 3\.4 Why Multi-head attention? - Parallelization

Multi-head attention은 이름에서도 알 수 있듯이 Attention을 병렬적으로 여러 번 수행하는 것을 뜻한다. 

<center><img width="640" alt="2019-11-19 (28)" src="https://user-images.githubusercontent.com/53667002/69127360-7a15d700-0aed-11ea-8cab-52763ed5ac5a.png"></center>

여러 번 수행한 attention의 결과들(attention weight들)은 concatenate한 후 가중치 행렬 $W^{o}$와 내적하면 Multi-head attention의 최종 결과 값이 나온다.  $W^{o}$도 다른 가중치들과 같이 모델과 함께 학습된다.

$$\text{Attention}(Q, K, V) =\text{Concat}({head}_{1}, \dots, {head}_{h}){W}^{o} \ where \ {head}_{i}=\text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

<center><img width="624" alt="2019-11-19 (30)" src="https://user-images.githubusercontent.com/53667002/69127790-45eee600-0aee-11ea-8d5c-8e1d3b9977ef.png"></center>

Multi-head attention의 경우 여러 layer에 대해 행렬 연산들이 모두 병렬적으로 동시에 수행되는데 이러한 병렬화는 하나의 문장을 여러 관점에서 바라볼 수 있다는 장점을 지닌다. 자연어 문장에는 대용어가 빈번히 사용되며, 모호성과 중의성 또한 존재하는데 이러한 자연어의 특징을 기계가 이해하는 데에 병렬화가 중요한 역할을 한 것이다. 

병렬적 연산이 어떤 결과를 주는지 예시와 함께 살펴보면 도움이 될 것이다. 예를 들어 “The animal didn’t cross the street because it was too tired.”라는 문장에서 “it”이 지시하는 것이 무엇인지 쉽게 알아낼 수 있지만 기계의 경우에는 그렇지 않다. 따라서 기계는 해당 문장을 다각에서 바라본 후 확률적으로 “it”과 가장 연관성이 가장 높은 단어를 알아내는 과정을 거쳐야한다. 다음 그림은 해당 과정을 시각화한 것이다:

<center><img width="600" alt="2019-11-19 (1)" src="https://user-images.githubusercontent.com/53667002/69127966-ac740400-0aee-11ea-9070-e830ce486598.png"></center>

위 그림은 5번째 encoder의 첫 번째 attention layer에서 “it”을 encoding하는 것을 나타낸 그림이다. 그리고 아래 그림은 attention을 병렬적을 처리했을 때 하나의 문장을 다양한 관점으로 볼 수 있다는 것을 증명하는 그림이다:

<center><img width="480" alt="2019-11-19" src="https://user-images.githubusercontent.com/53667002/69128032-cdd4f000-0aee-11ea-8f86-83776109280a.png"></center>

위 그림을 보면 첫 번째 attention에서는 “it”이 “the animal”과 관련 있다는 결론이 도출되었지만 또 다른 attention layer에는 ”it”이 “tired”와 연관성이 높다는 결론이 도출되었다.

이렇게 다양한 관점에서 정보를 수집하게 되면 더 수준 높은 encoding 결과를 얻을 수 있다. 위 시각화는 [Tensor2Tensor Colab](https://colab.research.google.com/github/tensorflow/tensor2tensor/blob/master/tensor2tensor/notebooks/hello_t2t.ipynb)에서 구현해볼 수 있다.

## 4\. Residual connection(Add) & Normalization(Norm)

Transformer 전체 구조를 표현한 그림을 보면 attention과 feed-forward neural network이후 residual connection과 layer normalization작업을 수행하는 것을 확인할 수 있다. residual connection을 해주는 이유는 word embedding 이후에 positional encoding을 해주었는데 학습을 진행하다 보면 backpropagation(역전파)에 의해 positional encoding 값이 손실될 가능성이 있기 때문이다. 간단히 말하자면 해당 정보에 대한 손실을 줄이기 위해 입력 값을 다시 더해준 것이다. 

<center><img width="1000" alt="2019-11-19 (32)" src="https://user-images.githubusercontent.com/53667002/69128600-0c1edf00-0af0-11ea-9549-134c5d7eb12b.png"></center>

그리고 해당 모델 내부에서 Residual 연산이 계속되기 때문에 모델 전반에 흐르는 차원을 $d_{model}$(=512)로 고정하여 연산을 간편하게 하였다. Residual connection이후에는 layer normalization을 통해 학습의 효율을 높였다.

## 5\. Position-wise Feed forward neural network(fully connected layer)

이 과정은 point wise로 진행되는 일반적인 feed forward network이다. 수식은 다음과 같다:

$$\text{FFNN}(x)=\text{MAX}(0, xW_1+b_1)W_2+b_2$$

위 식을 보면 0보다 작으면 0을 내보내고 0보다 크면 weight bias 값을 내보낸다. 이 부분이 흡사 relu activation과 닮아 있는 것을 알 수 있다. 아래는 수식 이해를 돕기 위한 그림이다: 

<center><img width="270" alt="2019-11-19 (34)" src="https://user-images.githubusercontent.com/53667002/69128945-b1d24e00-0af0-11ea-8252-ccb7b364d95a.png"></center>

따라서 해당 과정은 relu activation function을 사용하여 feed forward해주는 것으로 생각하면 된다.

## 6\. Linear Function

이렇게 attention score를 구하고 난 후에는 나온 값들을 모두 concatenate하여 linear function을 통과시킨다. Linear function을 적용한 이유는 $d_{model}$ size와 word size가 다르기 때문에 이 크기를 linear mapping해주기 위함이다. 

## 7\. Softmax

Linear를 거치고 softmax를 적용해 확률 값으로 변환하게 된다. Softmax를 적용한 확률 값은 모델이 알고 있는 모든 단어들에 대한 확률 값이며 키에 해당하는 단어가 현재 단어에 대한 연관성을 나타낸다. 따라서 가장 높은 확률이 나온 단어가 다음 단어가 되는 것이다. 예를 들어 softmax의 결과가 0.96이 나왔다면 그 단어가 현재 단어와 96퍼센트 연관성이 있다는 것이기 때문에 해당 단어가 다음 단어가 되는 것이다.

## 8\. Train/Test

softmax이후의 작업은 train과정과 test과정으로 진행 방식이 나뉜다.

### - Train

Train과정에서는 이전에 encoder와 decoder의 각 layer를 거칠 때 output으로 나온 것이 다음 단계에 다시 입력되지 않고 label이 또다시 입력된다. 그리고 최종적으로 나온 output들을 모두 concatenate한 후 벡터로 전환된 label과 비교하여 그들의 차이를 줄이는 방향으로 학습을 진행한다. 

해당 논문에서 학습 시 사용된 optimizer는 adam이고, 정규화를 위해 residual과 attention에 대해 dropout(0.1)을 해주었다. 그리고 추가적으로 성능향상을 위해 label smoothing(0.1)작업도 수행하였다. 

Label smoothing이란, 일반적으로 label은 one-hot-vector로 표현되는데 label smoothing을 통해 정답은 1에 가까운 값으로, 오답은 0에 가까운 값으로 표현하도록 하는 것이다. 이는 label의 noise현상을 방지해주는 기술이다. 해당 작업이 필요한 이유는 자연어 번역 시 번역의 결과가 다양할 수 있기 때문이다. 예를 들어 ‘sleepy’라는 단어를 한국어로 ‘잠이 온다’와 ‘졸리다’로 번역이 가능한데 상이한 결과가 one-hot-vector로 표현될 경우 전혀 다른 one-hot-vector가 정답 값으로 동시에 존재하기 때문에 학습에 혼동을 줄 수 있다. 따라서 label smoothing을 통해 학습의 혼돈을 막고 효율성을 높이는 효과를 볼 수 있다.

### - Test

반면 test과정에서는 output이 나오면 그 output을 다시 입력하여 또 다른 output을 도출시킨다.

따라서 최종적으로 도출된 벡터는 문장 속에서 존재하는 단어벡터가 되어 문맥을 고려한 하나의 벡터가 된다. 즉 같은 단어여도 문맥에 따라 달리 embedding된다.

## Reference

> Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin."Attention Is All You Need,"Cornell(2017)

> http://jalammar.github.io/illustrated-transformer/

> http://nlp.seas.harvard.edu/2018/04/03/attention.html

> https://mchromiak.github.io/articles/2017/Sep/12/Transformer-Attention-is-all-you-need/#.XdO8r1czY2x
