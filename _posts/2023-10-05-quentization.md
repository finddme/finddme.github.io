---
title: "Quentization(양자화) 기본 개념"
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
 
# Scaling Number Range

앞서 말했듯이 양자화의 기본 개념은 넓은 범위의 숫자를 작은 범위로 mapping시키는 것이다. 이를 위해 scaling 과정을 거친다. 

- scaling 목적:
  - -1000에서 +1000 범위의 data
  - -10에서 +10 범위의 data로 변환
- scaling factore 계산
  ```python
  def scale_number(x, original_range=2000, target_range=20):
      scaling_factor = target_range / original_range
      return round(x * scaling_factor)
  
  # 예시
  print(scale_number(500))   # 출력: 5
  print(scale_number(510))   # 출력: 5
  print(scale_number(550))   # 출력: 6
  ```
  ```
  스케일링 팩터 = (목표 범위의 크기) / (원본 범위의 크기)
                 = (10 - (-10)) / (1000 - (-1000))
                 = 20 / 2000
                 = 1/100
  ```
  - 숫자 500을 변환 예시
    ```
    500 * (1/100) = 5
    ```
  - 숫자 510을 변환 예시
    ```
    510 * (1/100) = 5.1
    반올림(5.1) = 5
    ```
  - 500에서 550 사이의 값들이 5로 mapping됨. (반올림하니까)
  - 이런식으로 scaling하면 아래와 같은 계단 형식의 그래프가 만들어짐.
  - 여러 값들이 하나의 값으로 mapping되니까 정보 손실이 발생함
  - 반올림하는 것 때문에 오차가 발생함 

<center><img width="500" src="https://github.com/user-attachments/assets/e776e778-9e0a-4b97-996b-f5d85f72108e"></center>
