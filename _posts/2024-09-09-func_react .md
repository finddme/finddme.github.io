---
title: "Function calling based ReAct Agents : Streaming search system"
category: Dev Log
tag: Development
---







* 목차
{:toc}











# Git Repository

[https://github.com/finddme/Function_calling_ReAct](https://github.com/finddme/Function_calling_ReAct)

- Function calling을 적용하여 [#ReACT #HITL #Multi-Agent post](https://finddme.github.io/dev%20log/2024/08/08/react_agent/)를 구현한 프로젝트.
- **Model** openai, Claude, Groq, Together ai 선택 가능 (현 blog search box는 Together ai LLaMa 3.1 70B 적용)
- Finance action 추가 (해당 기능 개선 중)

# Pipeline 

<center><img width="1000" src="https://github.com/user-attachments/assets/336fe90a-a8d4-4244-a213-7f74558f5100"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>


# Improvements

<center><img width="1000" src="https://github.com/user-attachments/assets/3afc2bd6-b264-47f7-a556-85b9135d8a15"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

- Function calling을 도입함으로써 query routing, qeury transform/rewrite 단계를 fuction calling 한 단계로 치환 -> 속도 개선

