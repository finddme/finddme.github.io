---
title: Language Model Summary(unfinished post)
category: Natural Language Processing
tag: NLP
---







* 목차
{:toc}









최근 자연어처리 분야에서는 대용량의 corpus를 학습한 LM 뒤에 downstream task를 붙여 특정 task를 풀 수 있도록 하는 방법론이 많이 사용된다. Language Model(LM)은 대용량의 unlabeled data를 학습하여 언어 자체에 대한 feature를 학습한 모델이다. 최근 LM의 학습에 사용되는 task는 크게 **masked language modeling**과 **language modeling**이 있다. 전자의 경우는 입력된 text의 일부 token에 대해 masking처리를 한 후, 앞뒤 문맥을 통해 masking token의 original token을 예측하는 task로, bert계열의 model들이 이러한 방식으로 학습된다. 후자는 token들을 하나씩 집어넣어서 첫 번째 token을 기반으로 다음 token을 예측하고 그 token을 가지고 다음 token을 예측하는 것을 sequence가 끝날 때까지 반복하는 방식으로 학습하는 task이다. 이 방법론은 gpt계열의 model에서 주로 사용된다.

# GPT2 : Language Models are Unsupervised Multitask Learners
GPT2에서는 in-context learning을 처음으로 제안하였다. in-context learning은 문맥 내에서 풀고자 하는 task를 학습하는 것을 의미하는데, language modeling task의 trainset으로 Table 1과 같은 data를 사용하면 translation이 가능한 LM을 만들 수 있다는 개념이다. 

<center><img width="400" src="https://user-images.githubusercontent.com/53667002/204688283-77797c84-c4f1-49fa-9ae2-3d577735d9fd.png"></center>


# GPT3 : Language Models are Few-Shot Learners

GPT3는 기존의 GPT모델 사이즈를 엄청 키운 것이다. 

OpenAI는 Jared et al. 2020(Scaling Laws for Neural Language Models)를 통해 model size, data size 그리고 연산량을 증가시키면 LM의 performance는 계속 향상한다는 것을 실험적으로 밝혀냈다. 하지만 이 각각은 모두 bottleneck이 되지 않는 적정 정도 안에서 증량하는 것이 중요하다. Figure 1과 같이 model size나 연산량만 커지면 overfitting, data size만 커지면 underfitting이 발생하기 때문이다.

<center><img width="900" src="https://user-images.githubusercontent.com/53667002/204688445-6359dd49-a8ce-4a96-b7a5-a3cd48b69a38.png"></center>

모델의 구조는 기존 GPT에서 layer normalization이 각 블록 뒤에 있던 게 앞에 위치한 것 외에는 모두 동일한데 size를 많이 키웠다. 

$\text{n}_\text{params}$ = $175B$
$\text{n}_\text{layers}$ = $96$
$\text{d}_\text{model}$ = $12288$
$\text{n}_\text{heads}$ = $96$
$\text{d}_\text{head}$ = $128$

> 전체 파라미터 수가 175B이기 때문에 이걸 사용하려면 billion을 대략 gigabyte로 보고 4byte(32 bit) 이상의  tensor를 사용한다고 가정하면 gpu 700GB 이상이 필요하다
모델이 커서 fine-tuning은 힘들지만 GPT3 논문에서는 zero shot, one shot, few shot learning을 소개하며 fine-tuning이 필요 없다는 것을 보여줬다. 

<center><img width="800" src="https://user-images.githubusercontent.com/53667002/204688564-592daf36-427a-4989-850f-c3a1f2e160f4.png"></center>

zero shot, one shot, few shot 모두 task description만 주고 prompt의 정답 값을 예측하는 것인데 zero shot은 예시를 안 주는 거고 one shot은 예시를 하나 주는 거, few shot은 예시를 k개 주는 거다. 

이게 가능한 이유는 [in-context learning](https://finddme.github.io/natural%20language%20processing/2022/11/30/LMsummary/#gpt2--language-models-are-unsupervised-multitask-learners)에 있다고 한다. 즉, in-context learning을 통해 LM이  task를 풀 능력을 학습했다는 전제 하에 위와 같은 zero, one, few shot이 가능한 것이라고 한다.
