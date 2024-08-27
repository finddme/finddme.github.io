---
title: "#ReACT #HITL #Multi-Agent 개발 및 작성 중"
category: Dev Log
tag: Development
---







* 목차
{:toc}











# Pipeline 

<center><img width="1000" src="https://github.com/user-attachments/assets/19a4fe70-6769-4d1c-a576-e776e39f74a0"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

# ReACT 

<center><img width="600" src="https://github.com/user-attachments/assets/3d8d145b-b4e2-4397-81cd-fc67eee3b086"></center>
<center><em style="color:gray;">https://react-lm.github.io/</em></center><br>

ReACT는 Reasoning + Acting이다.

- Reasoning:
  - 인간이 문제를 해결하는 방식과 유사한 단계로 추론을 유도한다.
  - chain-of-thought prompting이 대표적인 방법론이다.

- Acting:
  - LLM이 주어진 action list에서 문제 해결에 도움될 action을 선택하여 행하는 것이다.
  - action plan generation, WebGPT, SayCan, ACT-1 등이 대표적인 방법론이다.

ReACT는 위 두 방법을 결합하여 Reasoning 단계에서는 모델이 action plan을 잘 처리할 수 있게 하고, Acting 단계에서는 모델이 외부 소스를 받아 추가 정보를 수집할 수 있게 한다.

이와 같은 방법은 chain-of-thought reasoning만을 사용하였을 때 발생하는 hallucination과 error propagation문제를 완화시켰다. 

+ ReActfh finetuning된 small model이 prompt가 적용된 큰 모델보다 성능이 좋다고 한다.


# Reference

> https://react-lm.github.io/
