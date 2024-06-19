---
title: "Fine-tuning variations : RLHF/PPO, DPO, ORPO"
category: LLM / Multimodal
tag: NLP
---







* 목차
{:toc}







SFT는 학습 데이터와 일치하는 텍스트 생성 가능성 극대화에 집중하여 인간의 선호도에 반하는 답변을 반환할 확률이 비교적 높다는 한계점이 있다. 이와 같은 한계를 완화하고 Fine-tuning을 더욱 효과적으로 수행하기 위해 Reinforcement Learning(강화학습) 아이디어를 SFT에 적용한 방법론들이 있다. 강화학습은 Agent가 주어진 환경에서 어떠한 행동을 취하고 그에 대한 보상을 얻으며 학습이 진행되는 방법론이다. 이를 SFT에 적용하여 LLM은 Agent, 환경은 LLM의 vocabulary에서 가능한 모든 token 조합, action space는 모델의 vocabulary, Agent의 행동은 token-prediction으로 설정한 후 학습을 진행할 수 있다. 

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
>> **학습과정(아래 과정을 반복하며 최적의 Policy를 얻는다.)<br>**
>> 1) 초기화: Agent를 초기화 시킨 후 Agent의 초기 Policy를 가지고 Environment와 상호작용한다.<br>
>> 2) Action 선택: 현재 State를 기반으로 Policy에 따라 Action을 선택한다.<br>
>> 3) Environment와의 상호작용: Agent가 선택한 행동을 실행한 후 그 결과로 새로운 State와 Reward를 받는다.<br>
>> 4) Policy update: Agent는 받은 State와 Reward를 기반으로 더 나은 보상을 얻기 위한 Policy를 개선한다.<br>


# 1. RLHF/PPO

GPT-3.5와 같이 LLM 유행 초기에 많이 사용된 방법이다. 이는 크게 두 단계로 작동된다.

1. Step 1. Reward Model 구축
   - prompt dataset(instruction, context, output pair)으로 모델을 fine-tuning 시킨다. 이때 두 개 이상의 추론 결과를 반환하도록 한다.<br>
   - human labeler에게 추론 결과에 대한 점수/순위를 매기게 한다.(“Anthropic/hh-rlhf”와 같이 honesty와 harmlessness를 검증하는 open-sourced preference ranking dataset도 있다.)<br>
   - 매겨진 점수의 normalization 과정을 거친 후 이것을 single sample-reward pair로 만들어 reward model을 학습시킨다. <br>

2. Step 2. SFT
   - Reward Model을 진짜로 구축하고자 하는 모델 학습에 사용한다.<br>
   - Tuning할 모델에 prompt dataset을을 넣어 모델의 추론 결과를 생성하고 이걸 Reward Model에 입력해서 Reward를 도출시킨다.<br>
   - Proximal Policy Optimization (PPO)라는 policy기반의 RL algorithm을 통해 모델의 가중치를 점진적으로 조정하며 모델의 응답에 할당된 reward를 최대화시킨다.<br>
     (경사 하강법(gradient descent)을 사용하는 일반적인 학습 방식과 달리 경사 상승(gradient ascent)법을 사용한다. (reward에 대해서는 경사 하강.))<br>
   - Reinforcement Learning 기반 접근 방식으로 인해 모델의 행동이 과도하게 변형되는 것을 방지하기 위해 prediction shift penalty를 보상에 추가하여 동일한 입력 prompt에 대한 초기 모델의 예측 확률 분포에서 너무 벗어나는 답변에 대해서는 penalty를 부여한다.


# 2. Direct Policy Optimization (DPO)

DPO는 RLHF의 대안으로 제안된 방법론이다. DPO는 RLHF와 동일하게 모델을 인간의 선호에 맞게 조정하는 것을 목적으로 한다. 그러나 DPO는 Reward Model이 필요하지 않기 때문에 RLHF보다 비용 측면에서 효율적이다.

RLHF에는 아래와 같은 단점이 있다:

1. Reward Model을 위한 학습에 자원이 필요하고, 이 자원도 Reward Model의 크기에 따라 매우 많은 자원이 요구될 수 있다.
2. initial LM, tuned LM, reward model이 한번에 돌아가야 하기 때문에 최소 세 개의 모델을 구동시킬 대규모 컴퓨터 자원이 필요하다.

위와 같은 단점을 완화하기 위해 나온 것이 DPO이다. DPO의 핵심 아이디어는 Reward Model 훈련을 건너뛰고 LLM을 직접적으로 preference data에 맞추는 것이다. Reward Model의 역할은 손실함수를 조작하여 대체한다. 자세한 수식은 "Direct Preference Optimization: Your Language Model is Secretly a Reward Model"에서 확인 가능하다.

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/004d3411-f533-47c0-be08-5deaa716a8a9"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

품질 좋은 데이터를 선별하여 데이터의 양은 줄이되 학습되었으면 하는 데이터 종류의 분포를 조절하는 것이 좋다고 한다.

## 2.1 Preference Dataset

DPO data는 pormpt(instruction), preferred response 그리고 dispreferred response가 기본적으로 포함되어야 한다. 

DPO data의 형식은 아래와 같다:

```json
{"instruction":instruction, "context": context, "response":response, "category": category, "rejected", rejected}
```

## 2.2 DPO Fine-tuning

1. DPO에서는 따로 강화학습을 진행하지 않는다. DPO를 활용한 fine-tuning 과정에서는 우선 모델의 사본이 생성된다.
2. 생성된 사본의 parameter는 frozen 시킨다.
3. 각 datapoint에 대해 preferred response, rejected response가 두 모델에 모두 입력되어 각각 점수가 매겨진다. 
4. preferred response score의 확률이 rejected response score보다 높은 경우 모델은 보상을 받는다.
5. 학습이 이루어지는 모델의 점수가 frozen 모델의 점수와 가까울 수록 모델은 보상을 받는다. 이는 DPO 학습 중 pre-trained model이 지닌 지식에서 벗어나 fine-tuning data에 과적합되는 것을 방지하기 위한 장치이다.

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/d2319a65-95b8-4bbb-aa52-a3cc99e41a04"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

### 2.2.1 DPO loss equation 요약

\begin{matrix}
Loss= Winner(W)-Loser(L)
\end{matrix}

\begin{matrix}
\downarrow \text{minimizing} \downarrow 
\end{matrix}

\begin{matrix}
Loss = - \{Winner(W)-Loser(L)\}
\end{matrix}

- $\pi_\theta$ : parameter update가 이루어지는 model, 즉 학습되고 있는 model
- $\pi_{ref}$ : forzen model
- $y_w$ : preferred response score
- $y_l$ : rejected response score
  
$\pi_\theta$와 $\pi_{ref}$에 대한 preferred response, rejected response에 대한 각 token별 예측 확률(정답 token을 예측할 확률)의 곱을 각각 구하여 $\pi_\theta$와 $\pi_{ref}$ 간의 비율을 구한다. 이때 prompt에 해당하는 token들은 점수에 반영되지 않는다. 산출된 비율은 아래 수식에서 확인할 수 있듯 loss 산출에 사용되고, 이 loss는 gradient descent update과정에서 model weight를 update하는데에 사용된다. 수식에서 $\beta$는 hyperparameter로, 논문 저자는 0.1로 지정하였고, $\sigma$ sigmoid(logistic) 함수이다.

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/c2e32166-11a4-442c-a446-a80e0cf59d0a"></center>
<center><em style="color:gray;">Cross-entropy loss function used in DPO pipeline(https://medium.com/@pakhapoomsarapat/forget-rlhf-because-dpo-is-what-you-actually-need-f10ce82c9b95)</em></center><br>

DPO 논문에서는 classification loss를 활용하여 Reinforcement Learning(RL)를 대체하는 방법을 제안한다. loss는 모델이 어떠한 데이터에 대하여 잘 학습되고 있는지 측정하는 지표로, 모델은 loss를 최소화 하는 방향으로 학습을 진행한다. DPO data에는 preferred response, rejected response가 포함되어 있는데, 이 두 답변에 대한 점수를 구한 후 


# 3. Odds Ration Preference Optimization (ORPO)

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/bff933cc-4d07-4b47-bfeb-fd8bbbfbe027"></center>
<center><em style="color:gray;">ORPO: Monolithic Preference Optimization without Reference Model</em></center><br>

Instruction tuning(SFT)과 preference alignment는 최근 LLM tuning 시 많이 사용되는 방법이다. 이는 일반적으로 아래와 같이 두 단계를 통해 수행된다:

  1 단계. Supervised Fine-Tuning (SFT) : 일단 instruction dataset에 대한 tuning을 수행한다.
  2 단계. preference alignment : RLHF 혹은 DPO를 통해 rejected response보다 preferred response를 반환할 확률을 높인다.

SFT가 학습 데이터와 일치하는 텍스트 생성 가능성 극대화에 집중하여 학습이 진행되기 때문에 특정 domain 혹은 task에 대해서는 효과적으로 tuning되지만 인간이 선호하지 않는 답변 반환률이 비교적 높다는 문제점이 있다. 이에 따라 preference alignment단계에서는 선호되는 답변과 그렇지 않는 답변 사이의 확률 격차를 확실히 넓혀야 하는 것이 핵심 과제가 된다.

ORPO는 SFT와 preference alignment algorithm를 single process로 결합하였다. ORPO가 두 단계를 결합할 수 있던 요인에는 목표 함수 수정에 있다. ORPO는 CLM의 목표 함수를 수정하여 negative log-likelihood(NLL) loss와 odds ratio (OR)를 결합하였다. 이것을 OR loss라고 부르는데 이는 rejected response에 대해서는 약한 패널티를 주고, preferred response에 대해서는 강한 보상을 주어 모델이 학습 과정에서 자연스럽게 인간의 선호도도 학습할 수 있도록 한다.

## 3.1 Preference Pairs

  ORPO 학습 시, data에는 Preference Pairs가 포함되어야 한다. Preference Pairs는 주어진 입력에 대한 선호 및 비선호 예시가 구체적으로 작성된 요소이다. 
  
  - Preference Pairs example
    
    ```
    input: 쭈꾸미 볶음 레시피 알려줘.
    
    preferred output: 쭈꾸미 볶음은 매콤하고 달콤한 양념이 매력적인 한국 인기 요리입니다.
                      재료는 쭈꾸미 500g을 기준으로 양파 1개, 대파 1개, ...(중략)..., 양념장 재료로는 고추장 3큰술, 설탕 2큰술, ...(중략).
                      + 준비 및 요리 과정 상세 설명
                      + 요리 팁
                      맛있는 쭈꾸미 볶음 즐기시기 바랍니다!
    
    dispreferred output: 쭈꾸미를 잘 씻고 고추장 등 적당한 양념들을 배합하여 볶아줍니다.
    ```
      
## 3.2 Odds Ratio Calculation
  ORPO는 주어진 입력에 대해 선호 출력과 비선호 출력을 생성할 확률 간의 odds ratio를 계산한다. odds ratio는 모델의 출력에서 선호 / 비선호 답변 반환률을 정량화한다. 

아래 식에서 $\mathcal{L}OR$는 preferred response와 dispreferred response 간의 odds ratio이다. odds ratio는 한 사건이 다른 사건의 존재 하에 발생할 확률을 나타낸다. 즉, LLM에 대한 입력 시퀀스 $x$가 주어졌을 때 모델이 $yw$ preferred response 혹은 $yl$ dispreferred response을 선택할 확률을 나타낸다. 아래 식을 보면 $yw$에 대한 확률이 높을수록 odds ratio가 높아진다. 

따라서 odds ratio가 높으면 선호 답변 출력 가능성이 높은 모델이고, odds ratio가 낮으면 비선호 답변 출력 가능성이 높은 것이다.

<center><img width="500" src="https://github.com/finddme/finddme.github.io/assets/53667002/dc5c150c-f3a6-4260-a9a3-15a9cf805ba8"></center>
<center><em style="color:gray;">ORPO: Monolithic Preference Optimization without Reference Model</em></center><br>


## 3.3 Model Update
   모델은 계산된 승산비를 기반으로 weight 업데이트를 진행한다. 모델이 비선호 출력을 많이 반환하면 선호 출력을 생성하도록 조정된다. 이와 같은 방식으로 ORPO는 모델의 의사 결정 과정을 지속적으로 통제 및 조정하여 preference pairs를 통해 입력 받은 인간의 선호도에 맞는 텍스트를 생성하도록 유도된다.


## 3.4 Benefits of ORPO

- Efficiency<br>
  SFT와 preference alignment 개념을 간단하게 결합하여 SFT 수행 이후 별도의 preference alignment 과정을 거칠 필요가 없어 학습 시간과 계산 자원이 줄어들었다.

- Improved Alignment<br>
  preference pairs를 통해 fine-tuning을 진행하면서 인간의 선호도를 학습하기 때문에 반환된 답변과 선호도 간의 align이 더 잘 된다.

- Reduced Bias<br>
  preference pairs는 데이터 내에 존재하는 bias를 완화하는데 도움을 준다. preference pairs 구축에는 인간이 개입되기 때문에 모델이 편향된 텍스트를 생성하기보다는 더욱 객관적이고 윤리적인 답변을 반환하는 것에 도움을 줄 수 있다.

- Flexibility<br>
  ORPO는 preference pairs를 생성할 수 있다는 조건만 충족된다면 매우 다양한 도메인에 간단히 적용될 수 있다.

ORPO의 objective function은 SFT loss와 relative ratio loss (LOR)로 구성된다. LOR항은 favored response와 disfavored response간의 likelihood를 최대화함으로써 rejected response를 반환한 모델에 패널티를 적용한다.


# Reference

> Training language models to follow instructions with human feedback
>
> Direct Preference Optimization: Your Language Model is Secretly a Reward Model
>
> ORPO: Monolithic Preference Optimization without Reference Model
