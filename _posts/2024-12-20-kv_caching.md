---
title: "key-value caching (작성 중)"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}












LLM이 널리 사용되며 빠른 응답에 대한 필요성도 커져 LLM의 생성 속도를 향상시키기 위한 다양한 시도가 이루어지고 있다. Key-Value(KV) Caching은 그런한 방법론들 중 하나이다. 

Key-Value(KV) Caching을 간략이 설명하면 transformers모델이 attention연산을 수행할 때 사용하는 key와 value값들을 저장해 주는 기법이다. 이전에 계산했던 결과를 재사용하여 불필요한 연산을 줄이는 것이다. 예를 들어 LLM 기반 채팅에서 사용자가 "안녕"이라고 입력했을 때 모델이 이 입력을 처리할 때 생성한 key-value값을 cache에 저장하여 사용자가 추가 메세지를 보낼 때 이전에 저장해 둔 key-value값을 재활용하여 생성 소요 시간을 줄이는 것이다.
