---
title: "Speculative Decoding🚀 (작성 중)"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}











최근 일반적으로 사용되는 LLM들은 Auto-regressive model로, Transformers Decoder 구조를 기반으로 한다. Auto-regressive model은 새로운 token을 순차적으로 생성한다. 즉, 여러 token이 병렬적으로 예측되지 않는다. 현재 time step의 token이 있어야 그 다음 token을 예측하니까 당연한 이야기이다. 이러한 이유로 output token이 길 수록 생성 속도가 매우 느려진다는 문제가 있다. 이러한 문제를 해결하고자 Speculative Decoding이 제안되었다. 
