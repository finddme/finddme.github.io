---
title: Handling Chat history(RAG)
category: LLM / Multimodal
tag: NLP
---







* 목차
{:toc}







Chat Engine에서 이전 대화 내용을 반영하여 답변을 반환한는 것은 중요한 과제이다. LLM이 이전 대화를 참조할 수 있도록 chat history와 현재 query를 적절하게 LLM에 입력하여 사용자가 chatbot이 자신과의 대화를 기억하는 것처럼 보이게 해야 한다. chat history를 다루는 방법은 크게 두 가지가 있다.

## 1. Chat Engine Context

가장 간단하게 chat history를 다루는 방법이다. retrieval 결과+query와 함께 chat history를 LLM에 입력하는 방식이다.

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/976ccece-43e4-45af-89bb-e0cf4c40d5f1"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>


## 2. Chat Engine condense plus context

chat history와 query를 LLM에 입력하여 새로운 query를 생성한 후 RAG을 수행하는 방법이다.

<center><img width="700" src="https://github.com/finddme/finddme.github.io/assets/53667002/207505b5-e07e-42eb-bebd-8107fffaf8b5"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>



