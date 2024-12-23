---
title: "Key-Value caching"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}












LLM이 널리 사용되며 빠른 응답에 대한 필요성도 커져 LLM의 생성 속도를 향상시키기 위한 다양한 시도가 이루어지고 있다. Key-Value(KV) Caching은 그런한 방법론들 중 하나이다. 

Key-Value(KV) Caching을 간략이 설명하면 transformers모델이 attention연산을 수행할 때 사용하는 key와 value값들을 저장해 주는 기법이다. 이전에 계산했던 결과를 재사용하여 불필요한 연산을 줄이는 것이다. 예를 들어 LLM 기반 채팅에서 사용자가 "안녕"이라고 입력했을 때 모델이 이 입력을 처리할 때 생성한 key-value값을 cache에 저장하여 사용자가 추가 메세지를 보낼 때 이전에 저장해 둔 key-value값을 재활용하여 생성 소요 시간을 줄이는 것이다.

"She poured coffee" 예문으로 caching 있/없 과정을 아래와 같이 나타낼 수 있다

※ 추론 시에는 가중치 업데이트가 없기 때문에 가중치 행렬 $W_q$, $W_k$, $W_v$는 모두 상수 <br>
※q1 = $token 1 embedding$ * $W_q$<br>
※k1 = $token 1 embedding$ * $W_k$<br>
※v1 = $token 1 embedding$ * $W_v$<br>

- **caching 없는 처리 과정**
  ```
  첫 번째 단계:
  입력: "She"
  - q1k1 계산 (첫 단어의 쿼리와 키의 곱)
  
  두 번째 단계:
  입력: "She poured"
  - q1k1 다시 계산 (불필요한 재계산!)
  - q1k2 계산 (masking)
  - q2k1 계산
  - q2k2 계산
  
  세 번째 단계:
  입력: "She poured coffee"
  - q1k1 다시 계산 (불필요!)
  - q1k2 다시 계산 (불필요!) (masking)
  - q1k3 계산 (masking)
  - q2k1 다시 계산 (불필요!)
  - q2k2 다시 계산 (불필요!)
  - q2k3 계산 (masking)
  - q3k1 계산
  - q3k2 계산
  - q3k3 계산
  ```
<center><img width="800" src="https://github.com/user-attachments/assets/683916a7-f7eb-41f4-bbf5-e97b88c27f8b"></center>

!!! 문제점: 이미 계산했던 것들 계속 다시 계산. 불필요한 연산들. 문장이 길어질수록 재연산의 양이 엄청 많아짐.

- **caching 없는 처리 과정**
  - 이전에 계산한 key와 value tensor를 cache에 저장
  - 새 token에 대해 연산할 때
    - 이전 token에서 계산한 cache들 가져옴
    - 새로운 token에 대해서만 계산
```
첫 번째 단계:
입력: "She"
- q1k1 계산
- k1, v1을 캐시에 저장

두 번째 단계:
입력: "She poured"
- k1, v1은 캐시에서 가져옴
- 새로운 계산: q2k2만 계산
- k2, v2를 캐시에 저장

세 번째 단계:
입력: "She poured coffee"
- k1, v1, k2, v2는 캐시에서 가져옴
- 새로운 계산: q3k3만 계산
- k3, v3를 캐시에 저장
```

