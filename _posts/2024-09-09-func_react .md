---
title: "Streaming search system : Function calling based ReAct Agents"
category: Dev Log
tag: Development
---







* 목차
{:toc}











# Git Repository

[https://github.com/finddme/Function_calling_ReAct](https://github.com/finddme/Function_calling_ReAct)

- Function calling을 적용하여 [#ReACT #HITL #Multi-Agent post](https://finddme.github.io/dev%20log/2024/08/08/react_agent/)를 구현한 프로젝트.
- **Model** openai, Claude, Groq, Together ai 선택 가능 (현 blog search box는 Together ai LLaMa 3.1 70B 적용)
- Finance action 추가
- token streaming version 추가

# Pipeline 

<center><img width="800" src="https://github.com/user-attachments/assets/336fe90a-a8d4-4244-a213-7f74558f5100"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

# Model

Text Generation model: LLaMA 3.1 70B instruct
Image Generation model: Flux schnell

# Improvements

## 1. Function calling 도입

- Function calling을 도입함으로써 query routing, qeury transform/rewrite 단계를 fuction calling 한 단계로 치환 -> 속도 개선

<center><img width="800" src="https://github.com/user-attachments/assets/3afc2bd6-b264-47f7-a556-85b9135d8a15"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

## 2. Token streaming 도입

- 전체 응답이 완성되기를 기다리지 않고 답변이 생성되는 대로 볼 수 있어 빠르게 답변을 얻은 듯한 느낌을 준다.
- 응답 생성의 진행 상황을 시각적으로 확인할 수 있기 때문에 답답하지 않다. 
- 즉, 긴 대기 시간 없이 즉각적인 반응을 보여줌으로써 전반적인 사용자 경험이 향상된다.
- 한국인은 빨리빨리👍

# Demo

## 1. streaming version

<center><img width="400" src="https://github.com/user-attachments/assets/23070050-0c09-4b5f-88b0-2422ee52a3b9"></center>
<center><em style="color:gray;">Create by author</em></center><br>

## 2. no streaming / img generation agent Demo

### - Image generation

<center><img width="400" src="https://github.com/user-attachments/assets/4b4c5822-d9b2-4a18-ae20-37e4e5b12f1f"></center>
<center><em style="color:gray;">Create by author</em></center><br>

### - Finance

<center><img width="400" src="https://github.com/user-attachments/assets/6c6286ff-d644-4602-9170-d4c037b49ae9"></center>
<center><em style="color:gray;">Create by author</em></center><br>

### - Legal

<center><img width="400" src="https://github.com/user-attachments/assets/f7e6540e-3ffa-4d1f-a36f-aaacda0881c7"></center>
<center><em style="color:gray;">Create by author</em></center><br>

### - AI

<center><img width="400" src="https://github.com/user-attachments/assets/e15b5d79-8715-4816-873c-049e29536ba0"></center>
<center><em style="color:gray;">Create by author</em></center><br>

### - Web search

<center><img width="400" src="https://github.com/user-attachments/assets/5f72ca96-ab0d-4574-8d95-7295f2781f7b"></center>
<center><em style="color:gray;">Create by author</em></center><br>


