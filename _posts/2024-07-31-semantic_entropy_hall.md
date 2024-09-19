---
title: "Semantic Entropy Probes: Robust and Cheap Hallucination Detection in LLMs"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}










# Top-K, Top-P, Temperature

Top-K, Top-P, Temperature은 LLM의 출력을 제어하는 parameter이다. 해당 parameter를 통해 모델 출력의 일관성<->다양상 정도를 조절할 수 있다.

이 parameter를 잘 조정하기 위해 Greedy Sampling과 Random Sampling 개념을 복기하는 것이 도움된다.


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

## Greedy Sampling

가장 높은 확률의 것을 선택하는 방법이다. 이 경우는 `Top-K=1, Temperature=1.0`이다. 이는 모델이 다음 token으로 예측한 것 중 가장 높은 확률인 것을 선택한다. 이와 같은 방법은 모델 출력의 일관성은 유지할 수 있지만 창의성 혹은 다양성을 기대하기 어렵다. 

## Random Sampling

말 그대로 무작위 선택이다. 이 경우는 `Top-K=50~100, Temperature=1.5~2.0`이다. 이는 모델이 예측한 token 중 확률 값을 기준으로 top 50~100 사이의 token을 무작위로 선택하는 방법이다.
