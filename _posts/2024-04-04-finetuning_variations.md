---
title: "Fine-tuning variations : RLHF/PPO, DPO, ORPO (작성 중)"
category: LLM / Multimodal
tag: NLP
---







* 목차
{:toc}







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


# 1. RLHF/PPO

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

# 2. Direct Policy Optimization (DPO)

RLHF에는 아래와 같은 단점이 있다:

1. Reward Model을 위한 학습에 자원이 필요하고, 이 자원도 Reward Model의 크기에 따라 매우 많은 자원이 요구될 수 있다.
2. initial LM, tuned LM, reward model이 한번에 돌아가야 하기 때문에 최소 세 개의 모델을 구동시킬 대규모 컴퓨터 자원이 필요하다.

위와 같은 단점을 완화하기 위해 나온 것이 DPO이다. DPO의 핵심 아이디어는 Reward Model 훈련을 건너뛰고 LLM을 직접적으로 preference data에 맞추는 것이다. Reward Model의 역할은 손실함수를 조작하여 대체한다. 자세한 수식은 "Direct Preference Optimization: Your Language Model is Secretly a Reward Model"에서 확인 가

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/004d3411-f533-47c0-be08-5deaa716a8a9"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

품질 좋은 데이터를 선별하여 데이터의 양은 줄이되 학습되었으면 하는 데이터 종류의 분포를 조절하는 것이 좋다고 한다.

# 3. Odds Ration Preference Optimization (ORPO)

ORPO는 CLM에 새로운 preference alignment algorithm를 도입한 것이다. ORPO의 objective function은 SFT loss와 relative ratio loss (LOR)로 구성된다. LOR항은 favored response와 disfavored response간의 likelihood를 최대화함으로써 rejected response를 반환한 모델에 패널티를 적용한다.


# Reference

> Training language models to follow instructions with human feedback
>
> Direct Preference Optimization: Your Language Model is Secretly a Reward Model
>
> ORPO: Monolithic Preference Optimization without Reference Model
