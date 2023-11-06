---
title: Language Models Summary(unfinished post)
category: Natural Language Processing
tag: NLP
---







* 목차
{:toc}









최근 자연어처리 분야에서는 대용량의 corpus를 학습한 LM 뒤에 downstream task를 위한 layer를 붙여 특정 task를 풀 수 있도록 하는 방법론이 많이 사용된다. Language Model(LM)은 대용량의 unlabeled data를 학습하여 언어 자체에 대한 feature를 학습한 모델이다. 

최근 LM의 학습에 사용되는 task는 크게 **masked language modeling**과 **language modeling**이 있다. 전자의 경우는 입력된 text의 일부 token에 대해 masking처리를 한 후, 앞뒤 문맥을 통해 masking token의 original token을 예측하는 task로, bert계열의 model들이 이러한 방식으로 학습된다. 후자는 token들을 하나씩 집어넣어서 첫 번째 token을 기반으로 다음 token을 예측하고 그 token을 가지고 다음 token을 예측하는 것을 sequence가 끝날 때까지 반복하는 방식으로 학습하는 task이다. 이 방법론은 gpt계열의 model에서 주로 사용된다.

그리고 bert와 gpt 계열 모델의 구조는 대부분 각각 transformer의 encoder와 decoder 기반으로 형성되어 있다. 따라서 bert 계열에서는 self-attention을, gpt 계열에서는 masked-self-attention을 사용한다.

# Unidirectional Language Model(Auto-regressive model)

다음 token이 뭔지 쭉쭉 맞추는 방식으로 학습하니까 일방향적 LM. 보통 Auto-regressive model이라고 한다. 이전 time step의 출력이 다음 time step의 입력으로 들어가는 점이 자기 회기적이기 때문에 이렇게 부른다.

여기에 속하는 모델들은 transformer의 decoder 구조를 기반으로 하기 때문에 masked-self-attention을 사용한다. masked-self-attentiondms 해당 time step의 오른쪽에 있는 단어들은 masking해 놓은 상태에서 attention을 계산하여 다음 단어를 예측하기 때문에 생성 과제에 강점을 보인다. 

## GPT : Improving Language Understanding by Generative Pre-Training

transformer의 decoder 구조를 기반으로 한 모델.

language modeling task로 학습. 이 task는 sequence를 이루는 token들을 차례로 하나씩 예측하기 때문에 이 학습 방식을 autoregressive하다고 표현함.


## GPT2 : Language Models are Unsupervised Multitask Learners
GPT2에서는 in-context learning을 처음으로 제안하였다. in-context learning은 문맥 내에서 풀고자 하는 task를 학습하는 것을 의미하는데, language modeling task의 trainset으로 Table 1과 같은 data를 사용하면 translation이 가능한 LM을 만들 수 있다는 개념이다. 이는 앞선 sequence를 기반으로 다음 sequence를 예측하는 language modeling objective의 특성을 통해 프랑스어로 번역하라는 task description 추가하여 번역과제를 수행하는 mechanism으로 이해할 수 있다.

<center><img width="400" src="https://user-images.githubusercontent.com/53667002/204688283-77797c84-c4f1-49fa-9ae2-3d577735d9fd.png"></center>

이 방법론을 통해 fine-tuning과정으로 downstream data에 대한 parameter를 따로 update하지 않고도 task에 대한 정답을 추론할 수 있는 zero-shot inference가 가능하다는 것을 밝혔다. zero-shot inference는 task description을 준 이후 prompt를 던져주고 정답을 맞추라고 하는 것이다.

## Scaling Laws for Neural Language Models

OpenAI는 Jared et al. 2020(Scaling Laws for Neural Language Models)를 통해 model size, data size 그리고 연산량을 증가시키면 LM의 performance는 계속 향상한다는 것을 실험적으로 밝혀냈다. 하지만 이 각각은 모두 bottleneck이 되지 않는 적정 정도 안에서 증량하는 것이 중요하다. Model size나 연산량만 커지면 overfitting, data size만 커지면 underfitting이 발생하기 때문이다.

<center><img width="900" src="https://user-images.githubusercontent.com/53667002/204688445-6359dd49-a8ce-4a96-b7a5-a3cd48b69a38.png"></center>

<center><img width="600" src="https://user-images.githubusercontent.com/53667002/205824058-617f8a9c-ed23-4fe2-b1d3-55b205c02fd0.png"></center>

## GPT3 : Language Models are Few-Shot Learners

GPT3는 기존의 GPT모델 사이즈를 엄청 키운 것이다. layer수는 GPT2보다 2배 더 많고 총 parameter 수는 175B이다.

[Jared et al. 2020(Scaling Laws for Neural Language Models)](https://finddme.github.io/natural%20language%20processing/2022/11/30/LMsummary/#scaling-laws-for-neural-language-models)를 통해 언어 모델의 scaling law가 실험적으로 입증된 이후 본격적으로 거대 언어 모델들이 등장하는데 그 대표적인 모델이 GPT3이다.

모델의 구조는 기존 GPT에서 layer normalization이 각 블록 뒤에 있던 게 앞에 위치한 것 외에는 모두 동일한데 size를 많이 키웠다. 

$\text{n}_\text{params}$ = $175B$

$\text{n}_\text{layers}$ = $96$

$\text{d}_\text{model}$ = $12288$

$\text{n}_\text{heads}$ = $96$

$\text{d}_\text{head}$ = $128$

> 전체 파라미터 수가 175B이기 때문에 이걸 사용하려면 billion을 대략 gigabyte로 보고 4byte(32 bit) 이상의  tensor를 사용한다고 가정하면 gpu 700GB 이상이 필요하다

모델이 커서 fine-tuning은 힘들지만 GPT3 논문에서는 GPT2에서 소개된 zero shot 외에도 task description과 input 사이에 downstream task에 대한 정보를 예제 형식으로 주는 one shot, few shot learning을 소개하며 fine-tuning이 필요 없다는 것을 보여줬다.  

<center><img width="800" src="https://user-images.githubusercontent.com/53667002/204688564-592daf36-427a-4989-850f-c3a1f2e160f4.png"></center>

zero shot, one shot, few shot 모두 task description만 주고 prompt의 정답 값을 예측하는 것인데 zero shot은 예시를 안 주는 거고 one shot은 예시를 하나 주는 거, few shot은 예시를 k개 주는 거다. 

이게 가능한 이유는 [in-context learning](https://finddme.github.io/natural%20language%20processing/2022/11/30/LMsummary/#gpt2--language-models-are-unsupervised-multitask-learners)에 있다고 한다. 즉, in-context learning을 통해 LM이  task를 풀 능력을 학습했다는 전제 하에 위와 같은 zero, one, few shot이 가능한 것이라고 한다.

## T5 : Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer

Encoder와 Decoder로 구성된 모델. Transformer의 구조에서 약간 변형만 준 모델.

- Layer Mormalization 시 bias는 주지 않고 rescale만 진행
- Transformer는 sinusoidal position encoding 대신 relative positional embedding을 적용(BERT의 경우 Absolute positional embedding을 사용하였는데, 최근 모델들은 NSP를 제거하는 추세이기 때문에 absolute positional embedding으로 chunk strat position에 의존적인 absolute positional embedding은 적합하지 않아 relative positional embedding을 사용하는 모델이 늘어나는 중이라고 함: [Improve Transformer Models with Better Relative Position Embeddings](https://arxiv.org/pdf/2009.13658.pdf))
- Model layer 전체에서 position embedding parameter를 sharing


**Relative positional embedding**

Relative positional embedding : self attention 수행 시 offset boundary 내의 token에 대해 relative position 값을 부여하는 것. 
<center><img width="600" src="https://user-images.githubusercontent.com/53667002/214756079-f48c5c17-b484-4ee9-890a-139d0401e7fe.png"></center>

예를 들어 offset=4, time step=3인 경우 relative position 값이 아래 그림 같이 부여되고
<center><img width="600" src="https://user-images.githubusercontent.com/53667002/214755659-0ff8e1e5-3278-4f82-812f-d0515bbdb712.png"></center>

offset=2,time step=3인 경우에는 아래와 같이 된다. 범위를 넘어갈 경우 가장 바깥쪽 index의 position값을 동일하게 부여한다.
<center><img width="600" src="https://user-images.githubusercontent.com/53667002/214755546-c44b4dbc-e2df-471b-a2ba-7f409e7609ec.png"></center>


Relative positional embedding에 대한 자세한 내용은 [https://medium.com/@_init_/how-self-attention-with-relative-position-representations-works-28173b8c245a](https://medium.com/@_init_/how-self-attention-with-relative-position-representations-works-28173b8c245a) 여기에 잘 정리되어 있다.



```python
def relative_position_bucket(relative_position, bidirectional=True, num_buckets=32, max_distance=128):
    ret = 0
    n = -relative_position
    if bidirectional:
        num_buckets //= 2
        ret += (n < 0).to(torch.long) * num_buckets
        n = torch.abs(n)
    else:
        n = torch.max(n, torch.zeros_like(n))
        
    # now n is in the range (0, inf)
    
    # half of the buckets are for exact increments in positions
    max_exact = num_buckets // 2
    is_small = n < max_exact

    # The other half of the buckets are for logarithmically bigger bins in positions up to max_distance
    val_if_large = max_exact + (
            torch.log(n.float() / max_exact) / math.log(max_distance / max_exact) * (num_buckets - max_exact)
    ).to(torch.long)
    val_if_large = torch.min(val_if_large, torch.full_like(val_if_large, num_buckets - 1))
    ret += torch.where(is_small, n, val_if_large)
    return ret
 ```


T5는 text-to-text framework를 기반으로 pre-training과 fine-tuning을 수행한다.

T5의 text-to-text는 GPT3의 task description-prompt와 유사하다. input sentence 뒤에 task description이 prefix로 붙어 이것이 하나의 input text로 모델에 들어가 task의 정답을 text로 내놓는 것이다.

> input : task description(task 정보) + input sentence
> 
> output : text

<center><img width="600" src="https://user-images.githubusercontent.com/53667002/214738957-b11237ac-6732-4214-b396-cc1196134ee2.gif"></center>

**T5 task 처리 방식**

- Classification task : input으로 분류하고자 하는 문장, output으로는 분류 label. (label은 model vocab내에 있는 토큰 중 하나로 추론되기 때문에 label 목록 외의 것이 나올 경우에는 틀린 것으로 간주)
- Regression task : STS-B(semantic textual similarity : 텍스트 의미적 유사도 예측 과제)와 같은 regression task의 경우 특정 단위로 나누어서 그걸 라벨로 취급하여 classification task처럼 처리 (e.g. 1-5사이 스코어 추론 과제: 0.2 단위로 1, 1.2, 1.4, 1.6, ...으로 나눔)

*T5에 대한 자세한 내용은 논문을 보는 게 좋고 간략한 내용은 [Google Research Blog](https://ai.googleblog.com/2020/02/exploring-transfer-learning-with-t5.html)를 보는 것이 좋다.*

*[Closed-Book Question Answering](https://t5-trivia.glitch.me/) demo applicaion도 체험할 수 있다*

# Bidirectinoal Language Model

mask token에 들어갈 token을 앞뒤 token을 기반으로 예측하는 방식으로 학습하니까 양방향 LM

여기에 속하는 모델들은 transformer의 encoder 구조를 기반으로 하기 때문에 self-attention을 사용한다. self-attentiondms 해당 time step의 양 옆의 단어들을 모두 고려하여 attention을 계산하기 때문에 gpt계열보다 sequence의 맥락 정보를 더 잘 학습한다.

## BERT : Pre-training of Deep Bidirectional Transformers for Language Understanding

transformer의 encoder구조를 기반으로 만들어진 모델.

mlm과 nsp task로 학습됨.

mlm : input문장의 특정 token에 mask를 취하고 mask token에 위치할 실제 token을 예측하는 task

nsp: 문장 두 개를 입력 받아 두 문장이 뒷 문장이 앞 문장과 이어지는 문장인지 아닌지 예측하는 task

bert 계열의 모델들은 위와 같은 task를 통해 사전학습을 충분히 거친 이후 task specific한 head를 붙이는 방식으로 downstream task를 푼다.(e.g. classification task: classification head / qa: span prediction head)


## RoBERTa : A Robustly Optimized BERT Pretraining Approach

Roberta는 BERT계열의 모델이다. BERT와 구조는 거의 같은데 BERT가 under training되었다고 주장하며 이를 해결하기 위한 네 가지 방법을 제안했다.
 
1) 더 많은 데이터를 더 큰 batch로 더 오래 학습시킨다.

2) sequence length를 늘려 학습한다.

3) BERT가 수행하는 task(MLM, NSP) 중 MLM만을 사용하여 학습한다.

4) MLM 수행 시 masking pattern을 매 epoch마다 다르게 준다.

## ELECTRA : Efficiently Learning an Encoder that Classifies Token Replacements Accurately

Transformer의 Encoder를 기반으로 한 모델로, 기존 Language Model에서 많이 사용된 MLM이 아닌 replaced token detection task를 적용하여 연산량을 줄임으로써 효율을 높인 Language Model

기존 LM에 많이 사용된 MLM보다 효율적인 방식인 replaced token detection task를 제안한 모델로, 이 방식은 연산량이 적은 것이 특징이다. 

해당 task는 example당 token의 15%만 학습하는 bert의 mlm과 달리 일부 token을 다른 token으로 교체하여 모든 token에 대해 original token인지 replacement token인지 예측하는 방식으로 학습한다. 

이러한 학습 방식은 모든 input token에 대해 학습을 하기 때문에 연산 효율이 높다. 
모델의 구조는 아래와 같다:

<center><img width="600" src="https://github.com/lm-sys/FastChat/assets/53667002/a7669c68-10ab-4b3f-9af6-0f0e6d1de076"></center>

ELECTRA모델은 generator와 discriminator로 구성되어 있다. 

discriminator에서는 token이 generator에서 다른 token으로 대체되었는지를 예측한다. 

generator와 discriminator의 크기가 동일하다면 weight sharing이 가능하다.


# Hybrid Language Model

## XLNet

