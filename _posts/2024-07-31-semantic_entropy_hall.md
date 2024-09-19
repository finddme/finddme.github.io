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

## Greedy Sampling

가장 높은 확률의 것을 선택하는 방법이다. 이 경우는 `Top-K=1, Temperature=1.0`이다. 이는 모델이 다음 token으로 예측한 것 중 가장 높은 확률인 것을 선택한다. 이와 같은 방법은 모델 출력의 일관성은 유지할 수 있지만 창의성 혹은 다양성을 기대하기 어렵다. 

## Random Sampling

말 그대로 무작위 선택이다. 이 경우는 `Top-K=50~100, Temperature=1.5~2.0`이다. 이는 모델이 예측한 token 중 확률 값을 기준으로 top 50~100 사이의 token을 무작위로 선택하는 방법이다.
