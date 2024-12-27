---
title: "`RAG` : Embedding Model, Reranking Model"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}











# Embedding Model

Embedding Model은 Bi-encoder model이다. 

- Bi-encoder model은 두 개의 독립적인 encoder로 구성됨. 그래서 "bi" encoder.
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
- 유사도 점수 산정 방식(추론)
  - query와 각 문장 간의 유사도를 독립적으로 계산.
-  응용 분야
  - 일반적으로 검색 엔진이나 추천 시스템과 같이 문서 검색이나 순위 지정이 주요 목표인 작업에서 사용
  - 대규모 데이터셋과 컴퓨팅 리소스가 있을 때 bi-encoder를 사용한다. 유사도 점수를 독립적으로 계산할 수 있어 추론 시 더 빠른 경우가 많음.
  - 쿼리와 문서 간의 복잡한 상호작용을 포착하는 것이 덜 중요한 작업에 적합하다.

# Rerank Model

Rerank Model은 Cross-encoder model이다. 

- Cross-encoder model은 query와 문장이 단일 encoder에서 함께 처리된다. 즉, 두 문장에 대한 결합된 representation을 생성한다.
- 학습
  - bi-encoder와 비슷하게 관련된 query-문장 쌍 간의 유사도를 최대화하도록 학습된다. 하지만 쿼리와 문서를 함께 처리하기 때문에 둘 사이의 상호작용을 포착한다.
  - 데이터 예시
    - 두 문장에 대한 label에 따라 유사도 측정 모델이 되기도하고, 분류 모델이 되기도 한다. 유사도 측정 모델도 사실 label이 매우 많은 분류 과제이기도 하다.
    - (유사도 측정 모델 데이터 예시: 두 문장쌍 + 유사도 점수 (예: 0-1 사이의 연속적인 값))
      ```python
      train_samples = [
          InputExample(texts=["sentence1", "sentence2"], label=0.3),
          InputExample(texts=["Another", "pair"], label=0.8)
      ]
      ```
    - (분류 과제 모델 데이터 예시: 두 문장쌍 + 각 문장 관계를 지시하는 라벨(일반적으로 int 형식의 class index))
      ```python
      train_samples = [
          InputExample(texts=["A man is eating pizza", "A man eats something"], label=1),
          InputExample(texts=["A black race car starts up in front of a crowd of people.", "A man is driving down a lonely road."], label=0)
      ]
      ```
- 유사도 점수 산정 방식(추론)
  - query와 각 문장 쌍에 대해 두 문장 embeding 간의 상호작용을 고려하여 단일 유사도 점수 생성
-  응용 분야
  - 일반적으로 query와 문장 사이의 맥락이나 관계를 이해하는 것이 중요한 작업에 사용
  - query와 문장 간의 상호작용을 포착하는 것이 중요할 때 유용


# Summary

대규모 검색에서는 Bi-encoder로 후보군을 추린 후 Cross-encoder로 재순위화하는 방식을 사용하는 것이 일반적이다.이를 통해 속도와 정확도의 균형을 맞출 수 있다. 따라서 Embedding Model로는 Bi-encoder를 사용하고, Rerank Model로는 Cross-encoder를 사용한다.

|             | Bi-encoder                                                             | Cross-encoder                                                 |
| ----------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| encoding 방식 | \- 두 문장을 독립적으로 encoding<br>\- 각 문장에 대해 별도의 임베딩 벡터를 생성                  | \- 두 문장을 동시에 입력으로 받아 함께 encoding<br>\- 두 문장의 관계를 직접적으로 모델링    |
| 성능 및 정확도    | \- 일반적으로 Cross-encoder보다 정확도가 낮음<br>\- 정보 손실이 발생할 수 있어 성능이 다소 떨어질 수 있음 | \- 비교적 높은 정확도<br>\- 두 문장 간의 관계를 더 잘 파악                        |
| 속도 및 확장성    | \- 빠른 처리 속도와 높은 확장성<br>\- 대규모 데이터셋에 적합                                 | \- 처리 속도가 상대적으로 느리고 확장성이 제한적<br>\- 소규모 데이터셋이나 정확도가 중요한 작업에 적합 |
| 응용 분야       | \- 정보 검색, 의미론적 검색, 클러스터링에 적합<br>\- 실시간 처리가 필요한 작업에 유용                  | \- 분류 작업이나 정확한 순위 매기기에 적합<br>\- 소수의 문장 쌍을 비교하는 작업에 효과적        |
