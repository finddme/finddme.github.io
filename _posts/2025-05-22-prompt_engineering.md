---
title: "Prompt Engineering"
category: LLM / Multimodal
tag: LLM
---


 




* 목차
{:toc}












LLM은 입력된 token sequence에서 다음 token의 확률 분포를 계산하여 다음 token을 생성하는 모델이다. LLM에게 prompt는 전체가 하나의 token sequence일 뿐이라는 점을 인지하여 prompt engineering을 해야 한다. 

간혹 LLM을 생각하는 존재로 취급하고 Prompting을 하는 경우를 볼 수 있는데, LLM은 기본적으로 next token prediction으로 작동한다는 점을 인지하고 prompt를 작성해야 한다. 



> **LLM 작동 방식**
> 1. 사용자 입력 -> tokenize
> 2. tokens -> embedding
> 3. transformer decoder 기반의 각 모델 architecture를 통해 순차적으로 처리 (모델에 따라 순차적이지 않을 수 있다. [Multi-Token Prediction](https://finddme.github.io/llm%20/%20multimodal/2025/01/14/deepseek_v3/#multi-token-prediction-mtp))
> 4. 다음 token의 확률 분포 계산
> 5. 설정된 [Sampling Parameter](https://finddme.github.io/llm%20/%20multimodal/2024/08/06/hallucination_detect/#additional-information-sampling-parameters)를 기반으로 token 선택
> 6. 종료까지 반복


(작성 중...)
