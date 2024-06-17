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

Tranformers 계열의 모델은 label이 없는 데이터에 대해서도 supervised learning을 한다. 이는 un-labeled data를 입력 받아 모델 내부에서 각 모델마다 설정된 task에 맞게 데이터를 처리하여 학습에 사용하기 때문이다. 예를 들어 BERT는 입력 문장의 일부를 masking 처리하여 자체적으로 masking한 부분을 예측하며 학습을 수행하고, GPT의 경우에는 현재 시점 이후의 token들을 보지 않고 다음 token들을 예측해 나가며 학습을 수행한다. 이와 같이 알고리즘이 자체적으로 스스로 통제/감독하며 학습하는 방식을 self-supervised learning이라고 한다. 

학습은 기본적으로 loss function을 최적화 하는 model weight를 찾는 것을 목표로 한다. Pre-training 과정을 예를 들어 설명하겠다. GPT계열(decoder based model)은 학습 시 일반적으로 Causal Language Modeling(CLM)을 사용하는데, CLM 수행 시 모델은 vocabulary의 모든 token에 대한 예측 확률을 ground truth값과 비교하여 loss를 계산한다.(이때 prediction값은 1.0의 확률을 가진 sparse vector이다.) loss function은 모델의 세부 architecture에 따라 다를 수 있지만 일반적으로 cross-entropy 혹은 perplexity loss를 많이 사용한다. 모델이 loss function을 최적화하는 방식은 loss를 최소화 하는 방향으로 weight를 조정해나가는 것이다. loss를 계속 최소화하기 위해 매 iteration마다 backpropagation 과정에서 경사 하강(gradient descent)을 수행한다.

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/d9babebd-88a4-4367-bc58-f6b1b1e71314"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

> **Backpropagation, Gradient Descent**
>> neural network의 weight를 학습시킬 때 사용되는 알고리즘으로, 역으로(출력에서 입력 방향으로) 오류를 전파하여 가중치를 업데이트하는 방법이다. Backpropagation 과정은 간략하게 아래와 같다:<br>
>> 1. **Forward Pass (순전파)**: Backpropagation을 위해서는 예측값이 있어야 하니까 우선 순전파로 모델의 예측값을 구한다.
>> 2. **Loss 계산**: loss function을 통해 예측값과 실제값 간의 오를 계산한다. (cross-entropy, perplexity loss 등을 사용)<br>
>>                (오차함수(error function) = 손실함수(loss function) = 비용함수(cost function))
>> 3. **Backward Pass (역전파)**: 손실함수를 통해 산출된 전체 에러값($E$)을 출력층->입력층으로 전파하며 각 layer마다의 weight가 전체 에러값 $E$에 얼마나 영향을 미쳤는지 그 기여도를 구하하고 그걸 경사하강법에 대입하여 가중치를 업데이트 한다.
>>    1) 산출된 오차값을 출력층->입력층으로 전파하여 각 layer의 weight가 전체 오차에 얼마나 영향을 주었는지 그 기여도 Chain Rule을 통해 구한다. 이 값은 해당 layer의 weight에 대한 기울기이다.<br>
>>    2) 가중치 업데이트 공식에 산출된 기울기와 Learning Rate를 넣어 가중치를 업데이트한다. 이때 사용되는 가중치 업데이트 공식이 경사하강법이다.<br>
>>       Learning Rate는 얼마나 빨리 학습시킬지 정하는 것인데 일반적으로 0.1보다 낮은 값으로 직접 설정한다.<br>

## 2.1 Supervised Fine-Tuning (SFT)

Pre-training 과정에서는 앞서 언급한 CLM과 같이 단순히 다음 token을 예측하는 task를 수행하며 학습이 진행된다. 하지만 보다 task/domain specific한 모델을 만들기 위해서는 supervised fine-tuning(SFT) 접근 방식 필요하다. SFT는 일반적으로 pre-trained Model에 대해 labeled data를 학습시키는 과정으로 진행된다. 예를 들어 CLM으로 학습된 모델로 conversation 혹은 instruction following 과제를 잘 수행하는 모델을 만들기 위해 이와 같은 target application을 잘 나타내는 dataset을 학습시킨다. 이렇게 학습한 모델은 특수한 요구사항 혹은 과제에 더 적합한 답변을 생성할 수 있다. 

## 2.2 Fine-tuning variations : RLHF/PPO, DPO, ORPO

Fine-tuning을 더욱 효과적으로 수행하기 위해 Reinforcement Learning(강화학습) 아이디어를 SFT에 적용한 방법론들이 있다. 강화학습은 Agent가 주어진 환경에서 어떠한 행동을 취하고 그에 대한 보상을 얻으며 학습이 진행되는 방법론이다. 이를 SFT에 적용하여 LLM은 Agent, 환경은 LLM의 vocabulary에서 가능한 모든 token 조합, action space는 모델의 vocabulary, Agent의 행동은 token-prediction으로 설정한 후 학습을 진행할 수 있다. 

> **Reinforcement Learning(RL)**
>> **주요 구성요소<br>**
>> 1) Agent: 학습을 수행하는 주체. 주어진 환경 내에서 행동을 선택하고 그 결과로 보상을 받는 주체.<br>
>> 2) Environment: Agent가 상호작용하는 세계. Agent의 행동에 대한 보상(feedback)을 제공한다.<br>
>> 3) State: Environment의 상태<br>
>> 4) Action(Action Space): Agent가 취할 수 있는 선택지<br>
>> 5) Reward: Agent가 특정 행동을 취했을 때 환경으로부터 받는 feedback. 이것을 기준으로 학습이 진행된다.<br>
>> 6) Policy: Agent가 특정 State에서 어떤 행동을 취할지 결정하는 전략<br>
>> 7) Value Function: 특정 State에서 시작하여 장기적으로 얻을 것으로 기대되는 보상들의 누적 총합.<br>
>> 8) Q-Function: 특정 State에서 특정 행동을 취했을 때 장기적으로 얻을 것으로 기대되는 보상들의 누적 총합.<br>
>>
>> **학습과정(아래 과정을 반복하며 최적의 Policy를 얻는다.)**
>> 1) 초기화: Agent를 초기화 시킨 후 Agent의 초기 Policy를 가지고 Environment와 상호작용한다.<br>
>> 2) Action 선택: 현재 State를 기반으로 Policy에 따라 Action을 선택한다.<br>
>> 3) Environment와의 상호작용: Agent가 선택한 행동을 실행한 후 그 결과로 새로운 State와 Reward를 받는다.<br>
>> 4) Policy update: Agent는 받은 State와 Reward를 기반으로 더 나은 보상을 얻기 위한 Policy를 개선한다.<br>


### 2.2.1 RLHF/PPO

GPT-3.5와 같이 LLM 유행 초기에 많이 사용된 방법이다. 이는 크게 두 단계로 작동된다.

1. Step 1. Reward Model 구축
   - prompt dataset(instruction, context, output pair)으로 모델을 fine-tuning 시킨다. 이때 두 개 이상의 추론 결과를 반환하도록 한다.<br>
   - human labeler에게 추론 결과에 대한 점수/순위를 매기게 한다.(“Anthropic/hh-rlhf”와 같이 honesty와 harmlessness를 검증하는 open-sourced preference ranking dataset도 있다.)<br>
   - 매겨진 점수의 normalization 과정을 거친 후 이것을 single sample-reward pair로 만들어 reward model을 학습시킨다. <br>

2. Step 2.
   - Reward Model을 진짜로 구축하고자 하는 모델 학습에 사용한다.<br>
   - Tuning할 모델에 prompt dataset을을 넣어 모델의 추론 결과를 생성하고 이걸 Reward Model에 입력해서 Reward를 도출시킨다.<br>
   - Proximal Policy Optimization (PPO)라는 policy기반의 RL algorithm을 통해 모델의 가중치를 점진적으로 조정하며 모델의 응답에 할당된 reward를 최대화시킨다.<br>
     (경사 하강법(gradient descent)을 사용하는 일반적인 학습 방식과 달리 경사 상승(gradient ascent)법을 사용한다. (reward에 대해서는 경사 하강.))<br>
   - Reinforcement Learning 기반 접근 방식으로 인해 모델의 행동이 과도하게 변형되는 것을 방지하기 위해 prediction shift penalty를 보상에 추가하여 동일한 입력 prompt에 대한 초기 모델의 예측 확률 분포에서 너무 벗어나는 답변에 대해서는 penalty를 부여한다.

### 2.2.2 Direct Policy Optimization (DPO)

RLHF에는 아래와 같은 단점이 있다:

1. Reward Model을 위한 학습에 자원이 필요하고, 이 자원도 Reward Model의 크기에 따라 매우 많은 자원이 요구될 수 있다.
2. initial LM, tuned LM, reward model이 한번에 돌아가야 하기 때문에 최소 세 개의 모델을 구동시킬 대규모 컴퓨터 자원이 필요하다.

위와 같은 단점을 완화하기 위해 나온 것이 DPO이다. DPO의 핵심 아이디어는 Reward Model 훈련을 건너뛰고 LLM을 직접적으로 preference data에 맞추는 것이다. Reward Model의 역할은 손실함수를 조작하여 대체한다. 자세한 수식은 "Direct Preference Optimization: Your Language Model is Secretly a Reward Model"에서 확인 가

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/004d3411-f533-47c0-be08-5deaa716a8a9"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

품질 좋은 데이터를 선별하여 데이터의 양은 줄이되 학습되었으면 하는 데이터 종류의 분포를 조절하는 것이 좋다고 한다.

## 2.2.3 Odds Ration Preference Optimization (ORPO)

ORPO는 CLM에 새로운 preference alignment algorithm를 도입한 것이다. ORPO의 objective function은 SFT loss와 relative ratio loss (LOR)로 구성된다. LOR항은 favored response와 disfavored response간의 likelihood를 최대화함으로써 rejected response를 반환한 모델에 패널티를 적용한다.


# Reference
> https://levelup.gitconnected.com/the-5-prompt-engineering-techniques-ai-engineers-need-to-know-a208af13d8e4
>
> https://towardsdatascience.com/different-ways-of-training-llms-c57885f388ed
>
> https://medium.com/@animeshchaturvedi007/fine-tuning-large-language-models-a-comprehensive-guide-0446975dc40e
> 
> https://towardsdatascience.com/stepping-out-of-the-comfort-zone-through-domain-adaptation-a-deep-dive-into-dynamic-prompting-4860c6d16224
