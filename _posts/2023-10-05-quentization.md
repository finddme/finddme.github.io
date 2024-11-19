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

<center><img width="700" src="https://github.com/user-attachments/assets/e776e778-9e0a-4b97-996b-f5d85f72108e"></center>

# Simple Integer Quantization (정수 양자화)

$-W$에서 $+W$ 사이의 floating point number(부동 소수점)을 입력 받아 -> -$2^(N-1)$ 에서 $+2^(N-1)$ 사이의 정수로 변환. 즉, 부동소수점(floating point) 숫자를 N-bit 정수로 변환하는 양자화 방법.

scaling factor $s$ 계산 방법:
``` python
def quantize(x, W, N):
    s = 2**(N-1) / W
    return round(x * s)
```

예를 들어 floating point range($W$)가 2이고, integer representation을 위한 bits가 8일 때

``` python
test_values = [-2.0, -1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5, 2.0]
for val in test_values:
    q_val = quantize(val,W=2.0, N=8)
    print(f"Original: {val:5.2f} -> Quantized: {q_val:4d}")
```
```
output:

Original: -2.00 -> Quantized: -128
Original: -1.50 -> Quantized:  -96
Original: -1.00 -> Quantized:  -64
Original: -0.50 -> Quantized:  -32
Original:  0.00 -> Quantized:    0
Original:  0.50 -> Quantized:   32
Original:  1.00 -> Quantized:   64
Original:  1.50 -> Quantized:   96
Original:  2.00 -> Quantized:  128
```
<center><img width="700" src="https://github.com/user-attachments/assets/a8d6ed6c-57f2-48c6-91fb-477fdb92fde7"></center>

이 양자화 방식의 특징:

- 대칭적 범위 매핑(Symmetric Range Mapping)
  - 0을 중심으로 대칭적인 값들이 동일한 스케일로 매핑됨
  - 입력값의 부호가 보존됨

- 정밀도 손실
  - 연속적인 부동소수점 값들이 이산적인 정수값으로 매핑됨
  - 근사치로 인한 오차 발생

- 주의 사항
  - 실제 구현에서는 zero-point offset을 고려해야 함
  - 범위를 벗어나는 값들은 클리핑(clipping)될 수 있음


# Zero Point Quantization

$-2^(N-1)$에서 $+2^(N-1)-1$ 사이 값으로 정수 변환. 예를 들어 8-bit의 경우, -128 ~ +127. 이 범위는 0을 중심으로 비대칭적이다. 따라서 zero point offset을 사용하여 효과적으로 대칭 만듦.

여기서 zero point는 부동소수점 0이 매핑되는 정수값이다. 

```python
class ZeroPointQuantizer:
    def __init__(self, num_bits, w_min, w_max):
        self.num_bits = num_bits
        self.w_min = w_min # 원본 범위의 최소값
        self.w_max = w_max # 원본 범위의 최대값
        
        # scaling factor 계산
        self.qmin = -2**(num_bits-1)
        self.qmax = 2**(num_bits-1) - 1
        self.scale = (self.qmax - self.qmin) / (w_max - w_min)
        
        # Zero Point Offset 계산
        self.zero_point = round(-w_min * self.scale)
        
    def quantize(self, x):
        # input 양자화 (zero point 양자화 공식)
        q = np.round(x * self.scale + self.zero_point)
        # valid range clip
        q = np.clip(q, self.qmin, self.qmax)
        return q

test_values = [-1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0, 2.5]
for val in test_values:
    q_val = quantizer.quantize(val)
    print(f"Original: {val:5.2f} -> Quantized: {q_val:4.0f}")
```

```
output:

Original: -1.50 -> Quantized:    0 
Original: -1.00 -> Quantized:   32 
Original: -0.50 -> Quantized:   64 
Original:  0.00 -> Quantized:   96 
Original:  0.50 -> Quantized:  127 
Original:  1.00 -> Quantized:  127
Original:  1.50 -> Quantized:  127 
Original:  2.00 -> Quantized:  127 
Original:  2.50 -> Quantized:  127 
```

이 양자화 방식의 특징:

- 장점:
  - 비대칭적인 가중치 분포 처리 가능
  - 더 정확한 양자화 가능
  - 0값의 정확한 표현 가능
- 주의사항:
  - 스케일과 zero point를 모두 저장해야 함
  - 연산 복잡도가 약간 증가
  - 메모리 사용량이 소폭 증가

# De-quantization

양자화된 정수값을 다시 원래의 부동소수점 값으로 변환하는 것이다. 이건 양자화된 가중치를 사용하여 연산을 수행한 후, 필요한 경우 결과를 다시 원래의 범위로 변환하는 데 사용된다. 근데 역양자화를 해보면 손실된 값들이 보인다.

```python
class QuantizationDemo:
    def __init__(self, num_bits=8, value_range=(-1, 1)):
        self.num_bits = num_bits
        self.value_min, self.value_max = value_range
        
        # scaling factor 계산
        self.qmin = -2**(num_bits-1)
        self.qmax = 2**(num_bits-1) - 1
        self.scale = (self.qmax - self.qmin) / (self.value_max - self.value_min)

        # Zero Point Offset 계산
        self.zero_point = round(-self.value_min * self.scale)
        
    def quantize(self, x):
        # zero point 양자화
        return np.clip(round(x * self.scale + self.zero_point),
                      self.qmin, self.qmax)
    
    def dequantize(self, q):
        # 역양자화
        return (q - self.zero_point) / self.scale
    
    def demonstrate(self, value):
        # 손실 확인인
        quantized = self.quantize(value)
        dequantized = self.dequantize(quantized)
        error = dequantized - value
        
        print(f"Original: {value:8.4f} -> Quantized: {quantized:4d} -> Dequantized: {dequantized:8.4f}  [Quantization error: {error:8.4f}]")

demo = QuantizationDemo(num_bits=8, value_range=(-1.5, 2.5))

test_values = [-1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0, 2.5]
for value in test_values:
    demo.demonstrate(value)
```

```
output:

Original:  -1.5000 -> Quantized:    0 -> Dequantized:  -1.5059  [Quantization error:  -0.0059]
Original:  -1.0000 -> Quantized:   32 -> Dequantized:  -1.0039  [Quantization error:  -0.0039]
Original:  -0.5000 -> Quantized:   64 -> Dequantized:  -0.5020  [Quantization error:  -0.0020]
Original:   0.0000 -> Quantized:   96 -> Dequantized:   0.0000  [Quantization error:   0.0000]
Original:   0.5000 -> Quantized:  127 -> Dequantized:   0.4863  [Quantization error:  -0.0137]
Original:   1.0000 -> Quantized:  127 -> Dequantized:   0.4863  [Quantization error:  -0.5137]
Original:   1.5000 -> Quantized:  127 -> Dequantized:   0.4863  [Quantization error:  -1.0137]
Original:   2.0000 -> Quantized:  127 -> Dequantized:   0.4863  [Quantization error:  -1.5137]
Original:   2.5000 -> Quantized:  127 -> Dequantized:   0.4863  [Quantization error:  -2.0137]
```

- 정보 손실의 원인:

  - 반올림 연산으로 인한 손실
  - 정수로의 변환 과정에서 발생하는 정밀도(Precision) 손실
  - 유한한 비트 수로 인한 표현 범위 제한

# Quantization의 Precision(정밀도) 문제

양자화는 정밀도 손실이 큰 방법론이다. 특히 gradient descent와 같은 최적화 과정에서 문제가 많이 발생한다. 이에 따라 가중치의 미세한 변화를 포착하지 못할 수 있는 문제가 있다. 이와 같은 문제를 해결하기 위해 시도되는 몇 가지 방법들이 있다.

## Range Clipping

- 부동소수점 범위를 제한하는 기법
- 가중치 분포의 주요 구간만 사용
- 극단값(outlier)들은 최대/최소값으로 제한

- 장점:
  - 더 높은 정밀도 달성 가능
  - 중요한 가중치 범위에 더 많은 비트 할당
  - 작은 가중치 변화도 포착 가능 
  - 주요 가중치 범위의 정밀도 향상
  - 양자화 오차 감소
- 단점:
  - 극단값 정보 손실
  - 지나친 클리핑시 모델 정확도 저하


















