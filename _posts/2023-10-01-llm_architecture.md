---
title: "LLM Architecture"
category: LLM / Multimodal
tag: NLP
---







* 목차
{:toc}











Decoder architecture는 최근 각광 받고 있는 LLM의 backbone으로 사용되고 있다. 본 포스트에서는 LLM의 기반 모델로 Decoder model이 많이 사용되는 이유를 간략하게 설명하고, 해당 설명을 위해 Transformers와 Transformers로부터 파생된 Model 구조에 대해 소개한다.

# [Transformers 요약](https://finddme.github.io/natural%20language%20processing/2022/11/30/LMsummary/)

관련 포스트: [Transformer \| Attention Is All You Need](https://finddme.github.io/natural%20language%20processing/2022/11/30/LMsummary/)

Transformers모델은 크게 Encoder와 Decoder로 구성되어 있다. 

## Encoder and Decoder

- Encoder
  - input를 Context Vector/Encoded Representation로 변환하는 부분. 자연어의 의미를 vector space의 representation으로 변환하는 부분이다. 즉, contextualized embedding으로 input을 변환시킨다. 
  - input으로 들어온 token은 Multi-Head Self-Attention layer를 통과하는데 이는 input token encoding 시 token들의 관계를 파악하도록 돕는다.
  - 요약: 문맥을 이해하고 단어 관계를 파악하도록 한다.
  - Attention
    - 모델이 입력 sequence의 모든 token들이 서로의 관계를 학습할 수 있도록 Multi-Head Self-Attention을 사용한다. 이는 모델이 각 token의 context를 이해하는데 도움을 준다.

- Decoder
  - encoding 된 representation을 받아 모델의 출력을 생성하는 부분.
  - input
    - 학습 시에는 정답 sequence(shifted right)가 입력되고, 추론 시에는 이전에 예측된 token이 입력된다.
  - Attention
    - Masked Multi-Head Self-Attention
      - 현재 시점 이후의 token들에 대해 masking 처리를 하여 Masked Multi-Head Self-Attention을 사용한다.
      - 이와 같은 처리는 현재 시점 이전 정보만을 가지고 현재 시점의 token을 예측하도록 한다.
    - Multi-Head Attention with Encoder Output (encoder-decoder attention)
      - Encoder의 출력(input에 대한 representation)을 받아서 input sequnece와 decoder의 input으로 입력 받은 target sequnece 간의 관계를 매핑하며 학습하도록 돕는다.
      - 즉, Encoder의의 출력(key-value)과 Decoder의 현재 상태(query)를 통해 현재 time step의 token과 전체 sequnece와의 관계에 집중할 수 있도록 한다.
  - output
    - token별로 softmax 함수를 거쳐 (현재 시점을 기준으로 다음 token으로) 예측된 단어의 확률 분포를 산출하고 가장 높은 확률의 token을 출력한다.
     > 마지막 layer에서 출력된 logits 값을 softmax에 통과시키는 것이다. logits은 모델이 어휘 내 각 토큰에 대해 출력하는 정규화되지 않은 값이다. 

## Attention

Attention은 입력 sequence의 중요한 부분에 대해 모델이 집중할 수 있도록 하여 sequence 내부에서의 token 간의 거리와는 무관하게 token 간의 관련성을 파악하도록 하는 알고리즘이다.

상세 내용: [https://finddme.github.io/llm%20/%20multimodal/2024/12/24/llm_attention/](https://finddme.github.io/llm%20/%20multimodal/2024/12/24/llm_attention/)

## layer별 역할 요약

1. Embedding Layer: input token을 vector로 변환한다.<br>
2. Self-Attention Layers: 모델이 input의 중요한 부분들에 대한 중요도를 가중할 수 있게 한다.<br>
3. Feed-Forward Layers: attention output을 처리한다.<br>
4. Layer Normalization: 학습 과정을 안정화한다.<br>

# Transformers 기반 Model 요약

## Encoder-Only Models

- 대표 모델: BERT
- encoder 기반 모델은 트랜스포머의 인코더 부분만 사용한다. 주로 입력 시퀀스의 이해와 표현 Representation Learning에 중점을 둔다. 
- Pretraining Approach/Task: 기본적으로 Masked Language Modelling (MLM)을 통해 학습하며, 모델에 따라 이외에 추가적인 task를 함께 수행한다. BERT는 MLM 외에 NSP를 학습한다.
- Use Case: 일반적으로 classification task에 많이 활용된다.

### 구조
- 여러 개의 인코더 레이어가 쌓여 있는 형태로 구성
- 양방향 attention: 모든 토큰이 시퀀스의 모든 다른 토큰과 상호작용 가능
- 병렬 처리: 모든 토큰을 동시에 처리 가능
- flow:
  1. tokenization: 입력 텍스트를 토큰으로 분할
  2. embedding: 입력 시퀀스의 각 토큰은 embedding되고 positional encoding이 더해진다. (BERT와 같은 모델에서는 Segment Embedding과 class 토큰([CLS]), seperate 토큰([SEP]) 같은 special 토큰이 추가되어 여러 문장 간의 관계를 학습하거나 분류 작업을 수행할 수 있다.
  3. Self-Attention: 각 토큰이 문맥 내 모든 토큰과 attention 계산
  4. normalization 및 ffnn: Layer normalization과 FFN 통과
  5. 스택 반복: N개의 encoder layer 반복
  6. 마지막 encoder layer: 각 토큰의 문맥화된 표현 생성
  7. 마지막 encoder layer의 output은 특정 태스크를 위한 헤드(Head)로 전달되어 최종 예측을 수행 (분류 등)
  
<center><img width="300" src="https://github.com/user-attachments/assets/9a7806af-ef6c-4c8e-b941-ee5b40699949"></center>
<center><em style="color:gray;">illustrated by author</em></center><br>

### 학습
1. Pre-training
- Input: 대규모의 레이블이 없는 텍스트 데이터 (예: 위키피디아).
- Output: 사전 학습 태스크의 결과.
- Training: BERT의 경우 두 가지 주요 사전 학습 태스크를 사용
  - Masked Language Model(MLM): 입력 시퀀스의 일부 토큰(예: 15%)을 [MASK] 토큰으로 가리고, 모델이 가려진 토큰을 예측하도록 학습
    - Input: "나는 [MASK]을(를) [MASK]한다."
    - Output: 각 마스크 토큰에 대한 실제 단어 예측 확률 분포.
  - Next Sentence Prediction(NSP): 두 개의 문장이 주어졌을 때, 두 번째 문장이 첫 번째 문장 다음에 실제로 이어지는 문장인지 아닌지를 예측하도록 학습
    - Input: "[CLS] 첫 번째 문장 [SEP] 두 번째 문장 [SEP]"
    - Output: 이진 분류 결과 (IsNext 또는 NotNext).

2. Fine-tuning
- pre-trained 모델에 classification layer를 추가하여 fine-tuning을 통해 특정 task를 수행한다. 이렇게 학습된 BERT의 parameter는 똑같이 사용고 task에 맞는 output layer만 추가하면 다양한 task를 하나의 모델을 통해 수행할 수 있다.
- Input: 특정 다운스트림 태스크에 맞는 레이블이 있는 데이터 (예: 감성 분석을 위한 문장과 감성 레이블).
- Output: 특정 태스크의 예측 결과.
- Training:
  - 텍스트 분류: [CLS] 토큰의 최종 임베딩을 사용하여 분류를 수행
    - Input: "[CLS] 이 영화 정말 재밌어요! [SEP]"
    - Output: 긍정/부정 등 클래스 확률.
- 개체명 인식 (Named Entity Recognition, NER): 각 토큰의 임베딩을 사용하여 해당 토큰이 특정 개체명에 속하는지 예측
  - Input: "스티브 [SEP] 잡스"
  - Output: 각 토큰에 대한 개체명 (예: 스티브: PER, 잡스: PER).


## Decoder-Only Models

최근 많이 사용되는 GPT계열 모델들(decoder 기반 모델)은 autoregressive 모델이라고도 불린다. autoregressive 모델이라고 불리는 이유는 이전 time step의 출력이 다음 time step의 입력으로 들어가는 점이 자기 회기적이기 때문이다. 해당 모델은 이런 방식으로 이전 time step의 결과를 다음 time step의 입력으로 받아 다음 token을 예측하는 task를 수행한다. 

이전 time step의 출력이 다음 time step의 입력으로 들어가는 점이 자기 회기적이기 때문에 Auto-regressive model이라고도 불린다. 최근 LLM은 대부분 Decoder-Only 구조를 가진다.

- 대표 모델: GPT
- decoder 기반 모델은 transformer의 decoder 부분만 사용합니다. 주로 Text Generation에 특화되어 있다.
- Pretraining Approach/Task: Next Token Prediction. Original Language Modeling이라고도 많이 불린다.
- Use Case: 일반적으로 Generative task에 많이 사용된다. (e.g. generating text, completing sentences, answering questions based on context, etc. )

```
GPT 계열의 모델들은 모두 Transformers의 Decoder 구조를 기반으로 하지남 layer normalization 수행 시점이 Decoder 구조와는 다르게 attention block 앞에 위치해 있다. 이는 GPT3부터 변경된 구조로 GPT3 이후에 나온 대부분의 decoder base 모델들이 이 구조를 따르고 있다.
```

### 구조
- 여러개의 decoder layer가 쌓여 있는 형태로 구성
- 단방향 attention이다. masking 되어 있으니까. 
- transforemer decoder에 있던 encoder-decoder attention layer은 없음. encoder에서 받는 것이 없으니까 필요 없어서 없음.
- flow:
  1. tokenization: 입력 시퀀스를 토큰으로 변환 (현재까지 생성된 시퀀스)
  2. embedding: 토큰 + 위치 임베딩
  3. Masked Self-Attention: 현재 위치 이전 토큰들만 참조
  4. normalization 및 ffnn: Layer norm + FFNN
  5. 스택 반복: N개의 decoder layer 통과
  6. language modeling head: 다음 토큰 확률 분포 계산
  7. sampling: 확률 분포에서 다음 토큰 선택

<center><img width="300" src="https://github.com/user-attachments/assets/8747ef06-ebb4-49eb-a955-af7c23a87aca"></center>
<center><em style="color:gray;">illustrated by author</em></center><br>

### 학습
디코더 기반 모델은 주로 자기 회귀적 언어 모델링(Autoregressive Language Modeling) 방식으로 사전 학습된다.

- Input: 대규모의 레이블이 없는 텍스트 데이터. 모델은 주어진 시퀀스의 다음 토큰을 예측하도록 학습된다.
- Output: 입력 시퀀스의 각 토큰에 대한 다음 토큰 예측 확률 분포.


## Encoder-Decoder Models

- 대표 모델: T5, BART
- Pretraining Approach/Task: Task에 따라 다르다.
- encoder-decoder 기반 모델은 주로 언어 번역과 같이 한 언어로 된 문장을 입력받아 다른 언어로 된 문장을 출력해야 하는 작업에 사용된다.
- encoder는 입력 문장을 받아 고정된 크기의 벡터 표현을 생성하고, 이 벡터는 decoder로 전달되어 출력 문장을 생성한다.

### 학습
1. Pre-training
- Input: 대규모의 레이블이 없는 텍스트 데이터 (예: Colossal Clean Crawled Corpus (C4) ).
- Output: 사전 학습 태스크의 결과.
- Training:
  - T5의 Pre-training task는 span corruption이다. 이는 입력 텍스트의 무작위 스팬을 마스킹하고 모델이 마스킹된 스팬을 예측하도록 학습하는 방식이다.
  - 일반적으로 supervised learning을 통해 대규모 일반 데이터셋에서 사전 학습됩니다.   

2. Fine-tuning
- Input: 특정 downstream task에 맞는 레이블이 있는 데이터 (예: 기계 번역을 위한 원문-번역문 쌍, 질문 응답을 위한 질문-답변 쌍).   
- Output: 특정 태스크의 예측 결과.
- Training:
  - 사전 학습된 모델에 특정 태스크를 위한 레이어를 추가하여 fine-tuning
  - T5와 같은 모델은 모든 NLP 작업을 텍스트-투-텍스트(text-to-text) 문제로 재구성하여, 특별한 head나 아키텍처 변경 없이 동일한 모델로 다양한 태스크를 수행할 수 있다. 

## common concept of training and inference

### Training Phase

학습 단계는 트랜스포머 모델이 대규모 데이터셋(예: 방대한 텍스트 코퍼스)을 통해 지식과 패턴을 습득하는 과정이다. 이 단계에서 모델은 다음을 학습한다:

1.  Base Token Embeddings: 모델은 vocabulary에 있는 모든 단어(또는 하위 단어)에 대한 고유한 숫자 벡터 표현, 즉 '기본 임베딩'을 학습한다. 이 임베딩은 단어의 일반적인 의미를 포착하며, 학습이 완료되면 그 값은 고정된다. 
  - 기본 개념: 텍스트는 모델이 처리할 수 있는 'token'(단어 또는 하위 단어)으로 분할됩니다. 'Base Token Embedding'은 모델의 vocabulary에 있는 각 고유 token에 할당된 고정된 숫자 vector이다. 이 벡터는 단어의 일반적인 의미론적(semantic) 의미를 포착한다.
  - 학습 과정:
      - transformer 모델은 훈련을 시작할 때, vocabulary에 있는 모든 token에 대해 임의의 값으로 초기화된 거대한 Embedding Matrix를 가지게 되는데. 이게 모델이 학습하는 파라미터 중 하나다.
      - 모델이 pre-training될 때 이 Embedding Matrix 값들이 점차 조정된다.
      - 학습 목표(ex. masked language modeling, next token prediction )를 달성하기 위해 모델은 단어의 의미를 가장 잘 표현하는 vector를 학습한다. 예를 들어, '왕'과 '여왕'처럼 의미적으로 유사한 단어들은 벡터 공간에서 서로 가까운 위치에 놓이도록 학습됩니다.
      - 이 과정은 수많은 반복(epoch)과 역전파(backpropagation)를 통해 이루어지며, 모델은 손실(loss)을 최소화하는 방향으로 임베딩 행렬의 각 차원(dimension) 값을 업데이트한다.


2.  Positional Encodings: 트랜스포머는 순환 구조가 없기 때문에 단어의 순서 정보를 직접적으로 처리하지 못한다. 그래서 모델은 각 단어의 상대적 또는 절대적 위치 정보를 나타내는 Positional Encoding을 학습하거나 미리 정의된 방식을 사용한다. Positional Encoding은 Base Token Embedding에 더해져 최종 입력 임베딩을 형성한다.
  - 개념: 트랜스포머 모델은 RNN이나 lstm과는 달리 순차적으로 단어를 처리하지 않고 모든 단어를 동시에 처리한다. 그래서 문장 내에서 단어의 순서나 위치 정보를 직접적으로 파악할 수 없다. Positional Encoding은 이러한 순서 정보를 모델에 제공하기 위해 토큰 임베딩에 더해지는 숫자 벡터다.
  - 학습 과정:
    - 학습 가능한 위치 인코딩: 일부 모델(예: GPT-2)은 Base Token Embedding과 유사하게 Positional Encoding Matrix를 처음부터 학습한다. 이 Matrix는 각 가능한 위치(예: 문장 내 첫 번째 단어, 두 번째 단어 등)에 대한 고유한 벡터를 포함하며, 학습 과정에서 최적화된다.
    - 고정된 위치 인코딩: 일반적으로 sine, cosine 함수와 같이 미리 정의된 수학적 함수를 사용하여 위치 인코딩을 생성하기도 한다. 이 경우, 위치 인코딩은 학습되는 것이 아니라 고정된 패턴을 따르게 된다. 

3.  Query, Key, Value Matrix(W_Q, W_K, W_V): Self-Attention mechanism의 핵심은 입력 embedding을 Query, Key, Value로 변환하는 것이다. 이 변환에 사용되는 가중치 Matrix(W_Q, W_K, W_V)들은 학습 단계에서 최적화된다. 이 Matrix들이 학습됨으로써 모델은 어떤 단어가 다른 단어에 얼마나 주의를 기울여야 하는지, 그리고 어떤 정보를 추출해야 하는지를 결정하는 방법을 배우게 된다.

4.  Feed-Forward Network Weights & Biases: transformers 블록 내의 ffnn(MLP)은 각 token의 representation을 독립적으로 정제하는 역할을 한다. 이 신경망의 모든 가중치와 편향 또한 학습 단계에서 최적화된다.
5.  Layer Normalization 및 기타 구성 요소의 파라미터: 모델의 안정성과 성능 향상을 위한 Layer Normalization 등 다른 모든 구성 요소의 내부 파라미터들도 학습 단계에서 함께 최적화다.

요약하자면, 학습 단계에서는 입력 텍스트를 Contextual representation으로 변환하고, 이 representation을 바탕으로 특정 task를 수행하는 데 필요한 모든 내부 파라미터(weight와 bias)를 학습한다. 이는 단어의 의미를 이해하고, 단어 간의 복잡한 관계를 파악하며, 궁극적으로 주어진 task를 잘 수행하는 방법을 배우는 과정이다.

### Inference Phase

추론 단계에서는 학습 단계에서 얻은 모든 학습된 파라미터(가중치와 편향)를 활용한다.

1.  Base Token Embeddings: 
 - 학습이 완료되면 이 Base Token Embeddings Matrix의 값은 고정됨. 추론 시 새로운 문장이 입력되면, 모델은 이 학습된 행렬에서 해당 토큰에 해당하는 임베딩 벡터를 lookup(조회)해서 가져옴
 - Base Token Embedding과 Positional Encoding는 합쳐진다.  이렇게 합쳐진 벡터가 트랜스포머 블록의 첫 번째 입력으로 사용되어, 모델이 단어의 의미와 함께 그 위치 정보까지 고려할 수 있게 된다.
2.  Contextualized Embedding 생성: 초기 Embedding은 학습된 W_Q, W_K, W_V 행렬을 사용하여 Query, Key, Value vector로 변환된다. 이후 self-attention mechanism이 작동하여 입력 sequence 내의 다른 모든 단어들과의 관계를 고려하여 각 단어의 '문맥화된 Embedding'을 동적으로 생성한다. 이 과정에서 attention score와 attention weight가 실시간으로 계산된다.
3.  FFNN: 생성된 Contextualized Embedding은 학습된 ffnn 신경망을 통과하며 추가적으로 정제된다.
4.  최종 예측: 여러 트랜스포머 레이어를 거치면서 각 토큰의 표현은 점점 더 풍부하고 문맥에 맞는 형태로 발전한다. 최종 layer의 출력은 선형 레이어와 소프트맥스 레이어를 통해 다음 토큰에 대한 확률 분포로 변환되거나, 특정 작업(ex. classification)에 맞는 최종 결과로 변환된다.

모델은 특정 단어의 의미를 미리 저장해두는 것이 아니라 추론 단계에서 학습된 self-attention mechanism을 통해 주어진 문맥 속에서 단어의 의미를 실시간으로 파악하고 적절한 representation을 생성하는 능력을 활용한다.


# Reasons Why Causal Decoders Are Often Used for Generative Tasks

## In-Context Learning

관련 포스트: [Language Models Summary - GPT2 : Language Models are Unsupervised Multitask Learners](https://finddme.github.io/natural%20language%20processing/2022/11/30/LMsummary/#gpt2--language-models-are-unsupervised-multitask-learners)

GPT-2에서 제안된 In-Context Learning은 Decoder 기반 모델의 생성 과제 수행 능력을 높인다. in-context learning은 문맥 내에서 풀고자 하는 task를 학습하는 것을 의미한다. LLM은 이 능력을 통해 문맥이나 task에 대한 이해를 높이는 prompt를 활용하여 다양한 생성 과제들을 잘 수행할 수 있다.

## Efficiency Optimization

Decoder 모델은 이전 token의 key, value matrix를 다음 token 예측에 재사용할 수 있다. 현재 시점에서 token 예측에 이전 token들만 참조는데, 이때 이미 처리된 key, value matrix에 대해서는 추가적으로 계산할 필요가 없어 계산 비용 측면에서 효율적이다. 

## Autoregressive 

Decoder Model에서는 Masked Multi-Head Self-Attention을 사용한다. 여기에서 집중해야 하는 것은 "Masked"와 "Multi-Head"이다. 

"Masked"가 의미하는 것은 현재 시점을 기준으로 다음 token들은 참조하지 못하도록 막아 놓는 다는 것이다. 다음 token은 참조하지 않고 이전 token을 현재 시점의 입력으로 받아 예측을 수행한다. 이를 autoregressive하다고 표현한다.

아래 그림과 같이 Casual Decoder Model은 "am"을 예측할 때 이전 token인 "I"만 보고 "a"를 예측할 때는 "I"와 "am"을 본다. 

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/7daf9db0-5680-4b4c-8629-9543323f20df"></center>
<center><em style="color:gray;">DocLLM: A layout-aware generative language model for multimodal document understanding</em></center><br>

Autoregressive라는 특징이 생성 과제에 도움을 주는 이유는 attention matrix가 full rank status를 유지하기 때문이다. 즉, 양방향이 아닌 선형적이다. 입력된 representation들이 독립적으로 처리되기 때문에 이전 시점의 정보가 손실 없이 다음 시점으로 전달된다. 이는 다음 token 예측에 긍정적인 영향을 미친다. 

> full rank status: matrix의 rank가 그 matrix의 차원과 동일하다는 의미.
>> $m×n$ matrix에서 $m≤nm$일 때, rank가 $m$인 경우, $m≥n$일 때, rank가 $n$인 경우
>
> rank: matrix에서 서로 선형적으로 독립적인 행과 열의 최대 개수.

"Multi-Head"는 여러 attention head들이 있을 때 각 head가 각각 고유한 Query, Key, Value set을 가지고 있어 입력 문장의 다양한 측면을 동시에 집중하여 sequence 내 token 간의 복잡한 관계를 잘 파악하도록 한다. 

각 헤드는 고유한 Query, Key, Value 벡터 세트를 가지고 있어 입력 문장의 다른 측면에 동시에 집중할 수 있습니다.



# Reference

> What Language Model Architecture and Pretraining Objective Work Best for Zero-Shot Generalization?
