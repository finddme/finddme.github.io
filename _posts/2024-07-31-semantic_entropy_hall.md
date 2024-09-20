---
title: "Semantic Entropy Probes: Robust and Cheap Hallucination Detection in LLMs"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}











# 1. Introduction

본 논문에서는 모델의 불확실성을 통해 hallucination을 detect하는 방법을 제안한다. 하지만 서로 다른 token sequence도 동일한 의미를 갖는 경우가 있기 때문에 출력된 token 수준에서 불확실성을 계산하는 것은 정확한 불확실설 계산에 적합하지 않다. 예를 들어 "Paris", "It's Paris", "The capital of France is Paris"라는 답변은 모두 동일한 의미를 내포하는데 이를 고려하지 않는다면 이 세 문장을 출력한 모델의 불확실성은 높게 측정될 것이기 때문이다. 따라서 Farquhar et al.에서는 generation들을 의미적으로 clustering한 이후 의미적 공간에서 불확실성을 추정하는 semantic entropy (SE)를 제안했다.

하지만 Farquhar et al.이 제안한 방법은 input query에 대해 여러번의 model generation 결과를 요구하는데 일반적으로 5-10번 사이의 generation 결과가 필요하다. 이는 5-10배의 계산 비용이 추가로 발생함을 의미하기 때문에 실용적이지 않다. 따라서 본 논문에서는 보다 실용적인 LLM hallucination detection 방식을 제안한다.

본 논문에서 제안하는 방법론의 핵심은 다음과 같다:

- hidden state에서 semantic entropy를 포착하도록 학습된 linear probe Semantic Entropy Probes (SEPs)를 제안한다.
- semantic entropy가 single model generation의 hidden sate 상태에 encoding되어 있으며, 이를 linear probe를 통해 추출 가능함을 입증한다.
- ablation study를 통해 다양한 model, task, layer, token position에 대해 SEP 선능을 실험한다. 결과적으로, 모델 내부 state들이 token을 생성하기 전에도 의미적 불확실성을 암묵적으로 포착하는 것을 확인하였다고 한다.
- SEP가 hallucination을 예측하는데 사용될 수 있으며, 이전 연구(Farquhar et al.)에서 제안된 probe보다 더 정확하고 실용적인 방법이다.

# 2. Semantic Entropy

본 논문에서는 Semantic Entropy를 활용하여 LLM이 생성하는 텍스트에서 발생하는 의미적 불확실성을 측정한다.



SEPs가 환각을 예측하는 데 사용될 수 있으며, 이전 연구에서 제안된 정확도 예측을 위한 프로브보다 더 잘 일반화된다는 것을 보여주며, 비용 효율적인 환각 감지에서 새로운 최첨단 성능을 설정합니다(7절, Fig. 1).

# Sampling Parameters

Sampling Parameter로는 대표적으로 Temperature가, Top-K, Top-P가가 있는데 이들은 LLM의 출력을 제어하는 parameter이다. 해당 parameter를 통해 모델 출력의 일관성<->다양상 정도를 조절할 수 있다.

## Temperature

Temperature는 log probability를 조정하여 예측 신뢰도를 조절하는 parameter이다. 즉, log probability scaling을 통해 model prediction에 대한 무작위성<->신뢰성의 정도를 조절할 수 있는 parameter이다. Temperature의 값이 낮을수록 더 집중적이고 예측 가능한 답변을 한다.

- 1 이하의 Temperature
  - 모델이 특정 token을 더 확신 있게 예측하여 확률 분포가 매우 극명하게 나타나게 된다.
  - temperature가 낮을수록 next token으로 예측한 token의 probability mass가 집중된다.
  - 이 경우, 더 일관성 있는 output 생성은 가능하지만 다양성과 창의성이 떨어질 수 있다.

- 1 이상의 Temperature
  - 모델의 확신이 감소한다. 따라서 next token으로 예측한 token들에 대한 확률 질량이 고르게 퍼져 확률 분포가 평탄해진다.
  - 이 경우, 모델이 다양한 token을 sampling하기 때문에 다양한 output 생성이 가능하다.
  - 하지만 temperature가 너무 높으면 문맥에 맞지 않는 문장을 생성할 수도 있다. 

- Temperature scaling 작동 과정:
  1. model은 model이 사용하는 tokenizer의 vocab에 있는 token을 현재 time step에 대한 next token으로 예측한다. 이때 각 token들에게는 정규화 되지 않은 log probability score가 부여된다.
  2. 이 log probability score를 설정된 Temperature 값으로 나눈다. $log_prob_scaled = log_prob / temperature$
  3. 위 결과, Temperature가 1 이하일 경우에는 log probability가 극단적으로 변한다. 즉, 예측값이 높았던 애들은 더 높아지고 낮았던 애들은 더 낮아진다. 이와 같이 높은 확률과 낮은 확률 값의 차이를 증폭시켜 가능성 높은 몇몇 token에 확률을 더 집중시킨다.
  4. Temperature가 1 이상일 경우에는 반대로 log probability가 평탄하게 변하여 대부분 0에 가까워진다. 이를 통 token간의 log probability를 줄여 비교적 낮은 확률을 가진 token들에게도 기회를 주게 된다.
  5. Temperature scaling 이후 softmax 함수를 통과시켜 scaling된 log probability의 합이 1이 되도록 한다.


## Top-K

token을 예측하는 각 step마다 모델이 예측한 결과에 대해 확률을 기준으로 상위 k개의 token 안에서 출력한 token을 선택하도록 제한하는 것이다. 이와 같이 모델의 vocab을 제한함으로써 비논리적이거나 무의미한 출력을 제어할 수 있다. 

K=5인 경우:
- 모델 예측 token의 확률 분포에서 상위 5개의 token으로 vocab을 제한
- 5개의 token에 대해 확률을 re-normalize하여 각 token에 대한 확률값의 합이 1이 되도록 한다.
- 재정규화된 분포에서 다음 단어를 sampling한다.

## Top-P

간단하기 말하자면 sampling된 token들이 지닌 확률값의 합에 대해 threshold를 거는 것이다. 예를 들어 아래와 같은 token이 있을 때 Top-P가 0.8이면 (갈비찜, 통태전, 잡채) 중에 다음 단어를 sampling하는 것이다. 

```
갈비찜: 0.4
잡채: 0.1
통태전: 0.3
떡갈비: 0.05
```

## Sampling Parameter 작동 방식

> 이 parameter를 잘 조정하기 위해 Greedy Sampling과 Random Sampling 개념을 복기하는 것이 도움된다.<br>
> - Greedy Sampling<br>
> <br>
> 가장 높은 확률의 것을 선택하는 방법이다. 이 경우는 `Top-K=1, Temperature=1.0`이다. 이는 모델이 다음 token으로 예측한 것 중 가장 높은 확률인 것을 선택한다. 이와 같은 방법은 모델 출력의 일관성은 유지할 수 있지만 창의성 혹은 다양성을 기대하기 어렵다. <br>
> <br>
> - Random Sampling<br>
> <br>
> 말 그대로 무작위 선택이다. 이 경우는 `Top-K=50~100, Temperature=1.5~2.0`이다. 이는 모델이 예측한 token 중 확률 값을 기준으로 top 50~100 사이의 token을 무작위로 선택하는 방법이다.<br>

```
Temperature=0.8, Top-K=40, Top-P=0.8
```

1. model이 전체 vocab에 대해 정규화되지 않은 log probability를 계산한다. (vocab 전체에 대해 확률값이 할당됨.)
2. Temperature 적용
   - 모든 token들의 log probability를 0.8로 나누어 scaling한다.
   - 1보다 작은 값으로 나누었기 때문에 극단적인 확률 분포가 된다.
3. Top-K 적용
   - temperatuer scaling 적용된 확률중 상위 40개의 token을 선택한다.
4. Top-P 적용
   - 선택된 40개의 token에 대해 상위 확률 token부터 합산하여 확률 질량이 80%이 되는 token까지만 sample token에 포함시킨다.
5. 위 scaling 과정을 모두 거친 후 남은 tokend 20개라고 가정한다면, 20개의 token들에 대한 log probability를 renormalize하여 확률이 1이 되도록 만든다.
6. 이 확률분포에서 next token을 sampling한다.
  




