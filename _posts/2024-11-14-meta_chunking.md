---
title: "Meta-Chunking: Learning Efficient Text Segmentation via Logical Perception (작성 중)"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}












최근 LLM이 답변할 때 외부 지식을 참고하여 더 정확한 답변을 생성하도록 하는 RAG 기법이 많이 사용되고 있다. 쉽게 말하자면 RAG은 챗봇이 사용자의 질문에 답할 때 관련 문서들을 찾아보고 답하는 것이다. 이때 참조할 문서는 일정 길이의 chunk로 나뉘어 있는데 이 chunk를 나눌 때 서로 연관된 내용이 분리되거나 불필요한 내용이 포함될 경우, RAG의 결과가 좋지 않은 문제가 있다. 이와 같은 문제를 해결하고자 제안된 방법이 Meta-Chunking이다. Meta-Chunking은 문장들 간의 논리적 연결성을 고려하여 더 의미있는 단위로 문서를 분할하는 방법론이다. Meta-Chunking의 전략은 크게 두 가지이다. 1) Margin Sampling Chunking 2) Perplexity Chunking. Margin Sampling Chunking은 LLM이 연속된 문장들을 분리할지 말지 binary classification을 수행하는 것이고, Perplexity Chunking은 텍스트의 복잡도(perplexity) 분포를 분석하여 문서가 나뉠 적절한 경계를 찾아내는 것이다.

# Reference

> https://github.com/IAAR-Shanghai/Meta-Chunking <br>
> [META-CHUNKING: LEARNING EFFICIENT TEXT SEGMENTATION VIA LOGICAL PERCEPTION](https://arxiv.org/pdf/2410.12788)
