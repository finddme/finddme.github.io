---
title: "Meta-Chunking: Learning Efficient Text Segmentation via Logical Perception (작성 중)"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}












최근 LLM이 답변할 때 외부 지식을 참고하여 더 정확한 답변을 생성하도록 하는 RAG 기법이 많이 사용되고 있다. 쉽게 말하자면 RAG은 챗봇이 사용자의 질문에 답할 때 관련 문서들을 찾아보고 답하는 것이다. 이때 참조할 문서는 일정 길이의 chunk로 나뉘어 있는데 이 chunk를 나눌 때 서로 연관된 내용이 분리되거나 불필요한 내용이 포함될 경우, RAG의 결과가 좋지 않은 문제가 있다. 이와 같은 문제를 해결하고자 제안된 방법이 Meta-Chunking이다. Meta-Chunking은 문장들 간의 논리적 연결성을 고려하여 더 의미있는 단위로 문서를 분할하는 방법론이다. Meta-Chunking의 전략은 크게 두 가지이다. 

1) Margin Sampling Chunking
   - LLM이 연속된 문장들을 분리할지 말지 binary classification을 수행
   - 작은 규모의 LLM으로도 충분히 수행 가능
     
2) Perplexity Chunking.
   - 텍스트의 복잡도(perplexity) 분포를 분석하여 문서가 나뉠 적절한 경계를 찾아내는 것이다.
   - 처리 효율성 향상
   - 자원과 시간 절약

> Perplexity는 LLM 평가 지표로 많이 사용된다. 추론 결과와 정답 text의 분포 차이를 정량화하여 모델을 평가한다. 

본 논문은 기존의 chunking 방식들보다 RAG의 성능을 크게 향상시키고, 실제 적용 가능한 실용적은 방법을 제시한다.

# 2. METHODOLOGY
Meta-Chunking의 핵심 목표는 아래와 같다:

- chunk 크기의 가변성을 허용하여 chunk 내용의 논리적 완전성을 효과적으로 유지한다.
- 각 chunk가 완전하고 독립적인 내용을 포함하도록 한다.
- 단순한 의미적 유사성을 넘어 인과관계, 문맥 진행 등 언어의 논리적 연결을 포함한다. 

위와 같은 목표를 달성하기 위해 두 가지 전략을 적용했다.

## 2.1 Margin Sampling Chunking

1. 문서 내 문장들을 $(x_1, x_2, ..., x_n)$으로 분할한다.
2. 연속된 문장들이 분할되어야 하는지 이진 분류한다.(LLM으로)
3. 분류 결과의 확률차이를 구한다. $Margin_M(x_i) = P_M(y = k_1|Prompt(x_i, X')) - P_M(y = k_2|Prompt(x_i, X'))$

-> $k_1$과 $k_2$의 분리 여부가 결정된다.

## 2.2 Margin Sampling Chunking

1. 문서를 문장 단위로 분리한다.
2. 각 문장 $x_i$의 PPL을 이전 문장들을 기반으로 계산한다.<br>
  <img width="200" src="https://github.com/user-attachments/assets/03008fdb-3dae-4d7a-b6f3-016cc887640e"><br>
  ($K$는 $x_i$의 총 token 수, $t_i^k$는 $x_i$의 $k$번째 토큰, $t<i$는 $x_i$ 이전의 모든 토큰)<br>
3. PPL 분포를 분석하여 chunk 경계를 결정한다.
   
# 3. EXPERIMENT
## 3.1 DATASETS AND METRICS
4 개의 benchmark에서 11개의 QAset을 사용하여 평가. 데이터셋들은 모두 중국어와 영어 포함한다.








# Reference

> https://github.com/IAAR-Shanghai/Meta-Chunking <br>
> [META-CHUNKING: LEARNING EFFICIENT TEXT SEGMENTATION VIA LOGICAL PERCEPTION](https://arxiv.org/pdf/2410.12788)
