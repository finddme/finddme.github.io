---
title: "Model Quentization"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}








Model Quentization은 모델 성능은 유지하면서 모델의 크기를 줄여 모델을 효율적으로 사용할 수 있도록 하는 것이다.

Model의 가중치는 일반적으로 32-bit floating point number로 저장된다. 이를 8-bit integer, 4-bit integer 등으로 줄이는 것이다. 

Quentization의 기본 개념은 넓은 범위의 숫자를 더 작은 범위로 mapping하는 것이다. 예를 들어 32-bit float 3.14159265359를 8-bit integer 3으로 mapping 시키는 것이다. 간단히 생각하면 고해상도 사진의 용량을 줄이기 위해 저해상도로 변환하는 것과 유사하다. 정보는 유지하면서 데이터 크기를 줄이는 것이 중요한 작업이다. 

- 장점
  - 모델 크기 감소
  - 메모리 사용량 감소
  - 모델 크기가 줄어들었으니 추론 속도 향상

- 단잠
  - 성능 저하 가능성
 

- 
