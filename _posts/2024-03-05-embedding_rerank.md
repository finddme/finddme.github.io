---
title: "RAG : Embedding Model, Reranking Model"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}











# Embedding Model

Embedding Model은 bi-encoder model이다. 

## bi-encoder model architecture

- 두 개의 독립적인 encoder로 구성됨. 그래서 "bi" encoder인 것이다.
  - encoder 1은 입력 query를 encoding
  - encoder 2는 관련/무관 문장을 encoding
  - 두 encoder는 각각 독립적으로 embedding을 생성
- 학습
  - 학습 과정에서는 query와 관련된 documnet들 간의 유사도를 최대화하는 방향으로 학습.
  - query와 관련 없는 documnet들 간의 유사도는 최소화하는 방향으로 학습.
  - 아래와 같은 문장 쌍 데이터를 활용하여 문장 임베딩을 생성하고, 유사한 문장은 벡터 공간에서 가깝게, 다른 문장은 멀게 위치하도록 학습
  - 데이터 예시
    ```json
    [
    {
      "sentence1": "강아지가 공원에서 뛰어놀고 있다.",
      "sentence2": "개가 야외에서 운동하고 있습니다.", 
      "label": 1  # 유사
    },
    {
      "sentence1": "오늘 날씨가 좋습니다.",
      "sentence2": "내일은 비가 올 예정입니다.",
      "label": 0  # 비유사
    }
    ]
    ```
