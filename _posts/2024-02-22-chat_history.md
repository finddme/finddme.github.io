---
title: Handling Chat history(RAG)
category: Natural Language Processing
tag: NLP
---







* 목차
{:toc}







Chat Engine에서 이전 대화 내용을 반영하여 답변을 반환한는 것은 중요한 과제이다. LLM이 이전 대화를 참조할 수 있도록 chat history와 현재 query를 적절하게 LLM에 입력하여 사용자가 chatbot이 자신과의 대화를 기억하는 것처럼 보이게 해야 한다. chat history를 다루는 방법은 크게 두 가지가 있다.

## 1. Chat Engine Context

가장 간단하게 chat history를 다루는 방법이다. 

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/976ccece-43e4-45af-89bb-e0cf4c40d5f1"></center>





다음으로 좋은 RAG 시스템을 구축하는 데 있어 중요한 요소는 한 번의 쿼리만을 처리하는 것이 아니라 여러 번 작동할 수 있는 **채팅 로직**입니다. 이는 이전 LLM 시대의 고전적인 챗봇처럼 대화 컨텍스트를 고려하는 것을 말합니다.  
후속 질문, 대명사(anaphora), 또는 이전 대화 컨텍스트와 관련된 임의의 사용자 명령을 지원하려면 이러한 채팅 로직이 필요합니다. 이는 사용자 쿼리와 함께 대화 컨텍스트를 고려하는 쿼리 압축 기술로 해결됩니다.

언제나 그렇듯이 이러한 컨텍스트 압축에는 여러 접근 방식이 있습니다.

- **ContextChatEngine**: 비교적 간단하고 인기 있는 접근 방식으로, 먼저 사용자 쿼리와 관련된 컨텍스트를 검색한 다음 이를 메모리 버퍼의 채팅 기록과 함께 LLM에 전달하여 LLM이 다음 답변을 생성하는 동안 이전 컨텍스트를 인지할 수 있도록 합니다.

- **CondensePlusContextMode**: 조금 더 정교한 경우로, 각 상호작용에서 채팅 기록과 마지막 메시지가 새로운 쿼리로 압축됩니다. 그런 다음 이 쿼리가 인덱스로 전달되어 검색된 컨텍스트가 원래 사용자 메시지와 함께 LLM에 전달되어 답변을 생성합니다.

LlamaIndex에서는 더 유연한 채팅 모드를 제공하는 OpenAI 에이전트 기반 채팅 엔진을 지원하며, LangChain도 OpenAI 기능 API를 지원한다는 점을 주목해야 합니다.

ReAct Agent와 같은 다른 유형의 채팅 엔진도 있지만, 7장에서 에이전트 자체로 넘어가겠습니다.

더 나은 번역을 위해 [HIX Translate](https://hix.ai/translate)를 추천해 드립니다. ChatGPT 3.5/4 기술을 기반으로 정확하고 유려한 번역을 제공합니다.
