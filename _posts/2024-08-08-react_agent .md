---
title: "#ReACT #HITL #Multi-Agent"
category: Dev Log
tag: Development
---







* 목차
{:toc}











# Git Repository

[https://github.com/finddme/Multi_Agent_Chat_System/blob/main/README.md](https://github.com/finddme/Multi_Agent_Chat_System/blob/main/README.md)

# Pipeline 

<center><img width="1000" src="https://github.com/user-attachments/assets/e6becc32-d802-4cde-ba28-e704edbb8ec4"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

- 본 개발물은 law, ai(blog post), realtime, websearch, image generation 분야에 대한 답변 생성 기능을 가진다.

# 문제점
- ~~realtime의 경우, 현재 naver news(지면 기사, 관련도순) 기준 3개의 기사를 참조하여 답변을 하는데, retrieval 결과에 따라 답변 품질의 격차가 심해 개선 중이다.~~ <br>
  -> prompting으로 해결
- law의 경우, 대한민국 현행 법률을 수집하여 검색된 법률이 해당하는 '조'를 참조하여 답변을 하는데, 일반인이 법률 상담을 위해 구사하는 단어와 법률에 기재된 단어 간의 격차가 커 검색이 제대로 되지 않아 원하는 상담 결과가 나오지 않는다는 문제점이 있다. 해결 중.

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
