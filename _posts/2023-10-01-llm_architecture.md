---
title: "LLM architecture"
category: LLM / Multimodal
tag: NLP
---







* 목차
{:toc}











Decoder architecture는 최근 각광 받고 있는 LLM의 backbone으로 사용되고 있다. 본 포스트에서는 LLM의 기반 모델로 Decoder model이 많이 사용되는 이유를 간략하게 설명하고, 해당 설명을 위해 Transformers와 Transformers로부터 파생된 Model 구조에 대해 소개한다.

# [Transformers 요약](https://finddme.github.io/natural%20language%20processing/2022/11/30/LMsummary/)

Transformers모델은 크게 Encoder와 Decoder로 구성되어 있다. 

## Encoder and Decoder

- Encoder
  - input를 representation을 변환하는 부분. 자연어의 의미를 vector space의 representation으로 변환하는 부분이다. 즉, contextualized embedding으로 input을 변환시킨다. 
  - input으로 들어온 token은 self-attention layer를 통과하는데 이는 input token encoding 시 token들의 관계를 파악하도록 돕는다.
  - Attention
    - 모델이 입력 sequence의 모든 token들이 서로의 관계를 학습할 수 있도록 Multi-Head Self-Attention을 사용한다. 이는 모델이 각 token의 context를 이해하는데 도움을 준다.

- Decoder
  - encoding 된 representation을을 받아 모델의 출력을 생성하는 부분.
  - input
    - 학습 시에는 정답 sequence(shifted right)가 입력되고, 추론 시에는 이전에 예측된 token이 입력된다.
  - Attention
    - Masked Multi-Head Self-Attention
      - 현재 시점 이후의 token들에 대해 masking 처리를 하여 Masked Multi-Head Self-Attention을 사용한다.
      - 이와 같은 처리는 현재 시점 이전 정보만을 가지고 현재 시점의 token을 예측하도록 한다.
    - Multi-Head Attention with Encoder Output
      - Encoder의 출력(input에 대한 representation)을 받아서 input sequnece와 decoder의 input으로 입력 받은 target sequnece 간의 관계를 매핑하며 학습하도록 돕는다.
  - output
    - token별로 softmax 함수를 거쳐 (현재 시점을 기준으로 다음 token으로) 예측된 단어의 확률 분포를 산출하고 가장 높은 확률의 token을 출력한다.
 
## Attention

Attention은 입력 sequence의 중요한 부분에 대해 모델이 집중할 수 있도록 하여 sequence 내부에서의 token 간의 거리와는 무관하게 token 간의 관련성을 파악하도록 하는 알고리즘이다.

# Transformers 기반 Model 요약

## Encoder-Only Models

- 대표 모델: BERT
- Pretraining Approach/Task: 기본적으로 Masked Language Modelling (MLM)을 통해 학습하며, 모델에 따라 이외에 추가적인 task를 함께 수행한다. BERT는 MLM 외에 NSP를 학습한다.
- Use Case: 일반적으로 classification task에 많이 활용된다.
  
## Decoder-Only Models
이전 time step의 출력이 다음 time step의 입력으로 들어가는 점이 자기 회기적이기 때문에 Auto-regressive model이라고도 불린다. 최근 LLM은 대부분 Decoder-Only 구조를 가진다.

- 대표 모델: GPT
- Pretraining Approach/Task: Next Token Prediction. Original Language Modeling이라고도 많이 불린다.
- Use Case: 일반적으로 Generative task에 많이 사용된다. (e.g. generating text, completing sentences, answering questions based on context, etc. )
   
## Encoder-Decoder Models

- 대표 모델: T5, BART, Gemini
- Pretraining Approach/Task: Task에 따라 다르다.

# Reasons Why Causal Decoders Are Often Used for Generative Tasks

## [In-Context Learning](https://finddme.github.io/natural%20language%20processing/2022/11/30/LMsummary/#gpt2--language-models-are-unsupervised-multitask-learners)

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
