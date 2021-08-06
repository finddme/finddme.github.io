---
title: CODE = TRUE | Linear Regression
category: Machine Learning, Deep Learning
tag: Machine Learning, Deep Learning
---
**K-Means 실습 코드1: [https://github.com/finddme/Python/blob/master/ML_Tensorflow1.ipynb](https://github.com/finddme/Python/blob/master/ML_Tensorflow1.ipynb)**  








* 목차
{:toc}











## Linear Regression(선형 회귀)

선형회귀는 머신러닝의 기본 이론으로, 변수 사이의 선형적인 관계를 모델링한 것이다. 변수 간의 관계가 선형적이라는 것은 데이터를 기반으로 그래프를 그렸을 때 데이터의 분포를 바탕으로 직선이 형성된다는 것이다.

이렇게 선형적인 관계에 있는 데이터에 적용할 수 있는 대표적인 기계학습 이론이 선형회귀이다. 선형회귀 모델로 데이터를 학습하여 해당 데이터에 대한 가장 합리적인 식을 찾아내는 것이 모델의 목표이다. 즉, 가장 합리적인 선을 찾아내는 것을 목표로 한다.

따라서 선형회귀 모델에 적용할 데이터는 적어도 세개 이상일 때 사용 가능하다. 데이터가 두개일 때에도 사용할 수는 있지만 의미가 없다. 그냥 두 데이터를 연결한 직선이 가장 합리적인 직선일 것이기 때문이다. 

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128500558-4ec219cc-f577-4a73-809b-36f5446baa58.jpeg"></center>

위와 같은 데이터가 있을 때 이 데이터들의 구조를 가장 잘 나타내는 선은

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128500654-369b09c3-8fa0-4c9f-870d-1c0c131188ce.jpeg"></center>

위 세 선 중 대충 직관적으로 봐도 데이터들과 가장 근접해있는 가운데 선이다.

선형회귀를 통해 이렇게 데이터를 잘 표현하는 가장 합리적인 선(식)을 찾을 수 있다. 합리적인 식을 찾기 위해서는 우선 가설식이 필요하다:

H(x) = Wx + b

- H는 Hypothesis로, 가설식을 의미하고
- W는 weight로, 가중치를 의미한다. (기울기)
- b는 bias로, 편향이다. (y절편)

선형회귀는 주어진 데이터를 기반으로 위 일차방정식의 W와 b값을 계속 수정하면서 가장 합리적인 식에 근사한 식을 찾아내는 것이다. 계속 수정하는 과정을 머신러닝을 학습시킨다고 표현한다. 

## 선형회귀 | 학습

선형회귀 모델이 식을 수정하는 과정을 살펴보겠다. 처음에 아래 그림처럼 데이터와 멀리 떨어진 지점에 직선이 그려졌을 경우, 

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128500754-30bbbd63-ac45-4c91-b926-3f5a0b11351e.jpeg"></center>

모델은 이 직선과 각 데이터 간의 거리를 분석하여 데이터와 조금 더 근접한 직선을 찾아 한번 점프를 알 것이다. 

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128500848-2cbdf738-5065-4f12-92ad-d33d0ca186e6.jpeg"></center>

이 과정을 아래와 같이 반복하여 합리적인 직선을 찾는다

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128500946-10e70551-6e87-405e-8d4a-b9f5bc41271d.jpeg"></center>

이렇게 점프하는 과정을 통해 학습이 진행된다. 그리고 위 그림처럼 처음에는 점프 폭이 크지만 찾고자 하는 지점에 근접하기 위해 점점 더 세밀하게 점프 폭을 줄여나간다.

## Cost(비용)

Cost는 가설의 정확성을 판단하는 기준이다. 실제 데이터가 있을 때

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128501249-7f4bbc4e-bd6d-47cc-a013-331b1c479955.jpeg"></center>

가설식으로 1차 함수 하나를 만든다

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128501214-bef292dd-2a33-4287-8909-6522c09428b8.jpeg"></center>

이때 데이터에 대한 가설식의 비용은 데이터과 그래프의 거리를 통해 구할 수 있다.

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128501350-f407a8ca-60bb-4807-b695-1eea88adcd10.jpeg"></center>

위와 같은 원리로 비용함수(Cost Function)을 만든다:

(예측값 - 실제값)^2의 평균

위 식에서 '예측값 - 실제값' 부분은 음수가 안올 수 있다. 예를 들어 실제값이 예측값보다 크면 음수값이 나올 것이다. 하지만 비용은 직선과 점 사이의 '거리'이기 때문에 음수여서는 안된다. 그래서 제곱을 하여 양수를 만든다. 그래서 제곱을 해준 값의 평균을 구하여 비용함수를 계산하는 것이다. 비용이 적을수록 더 합리적인 가설식이라고 할 수 있다.

## Gradient Descent(경사하강법)

머신러닝 모델이 비용함수로 가장 합리적인 식을 도출하는 방법을 경사하강법이라고 한다. 

H(x) = Wx + b

위 식을 간단하게 

H(x) = Wx

로 표현해서 생각해보자. 여기에서 필요한 것은 기울기이기 때문이다. 이때 비용함수는 아래 식을 따르게 된다.

(Wx - y)^2

이것을 그래프로 표현하면 

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128501420-a6671c61-57f3-498a-909f-2632777e0176.jpeg"></center>

이것과 같고, x축을 W라고 생각하고 임의의 W값을 정해준 다음에 그래프의 경사를 점프하면서 내려간다.

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128501473-fd70a69c-2770-493b-95b5-a33365653649.jpeg"></center>

이런 식으로 계속 내려가서 기울기가 0에 가장 근접할 때까지(수평에 가장 가까울 때까지) 간다.

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128502714-e717aefb-4ccd-4bdd-aef5-dbeb9c4ee988.jpeg"></center>

경사를 타고 내려가는 지점의 기울기를 미분을 통해 구한다. (미분은 2차함수에서 특정한 위치의 기울기를 구할 때 사용하는 개념 중 하나이다.) 기울기를 구하는 이유는 경사하강법으로 그래프를 타고 내려왔을 때 우리가 찾고자 하는 그래프의 가장 깊은 부분의 기울기가 0이기 때문이다:

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128502665-8c0f1345-3fa5-4fba-9255-6efa1a4f0bb4.jpeg"></center>

이제 정리를 해보겠다.

선형회귀를 학습하는 과정은 

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128500946-10e70551-6e87-405e-8d4a-b9f5bc41271d.jpeg"></center>
<center>[1]</center>

위와 같이 계속 함리적인 식을 찾을 때 까지 가설 식을 바꾸면서 cost를 줄여나가는 것이다. cost를 줄여나가는 것을 그래프로 표현한 것이

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128502714-e717aefb-4ccd-4bdd-aef5-dbeb9c4ee988.jpeg"></center>
<center>[2]</center>

이거다. \[2\] 그래프에서 기울기 0을 찾아 서서히 내려가는 과정이 \[1\] 그래프에서 합리적인 선을 찾아가는 과정인 것이다. 위 두 그림에서 보면 학습 초반에는 점프의 폭이 크고 점점 점프 간격을 줄여 세밀하게 조정하는 것을 볼 수 있는데, 이는 \[2\] 그래프가 곡선 구조를 가지고 있기 때문이다.

점프의 폭은 항상 적당한 것이 좋다. 너무 크기 점프하게 되면 곡선 안에서 공이 튀기는 것처럼 점프 폭이 너무 많이 변화하게 된다. 그래서 학습 결과가 부정확할 수 있다.

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128506382-9db6adbe-eb30-4dad-9588-5b3057c30be5.jpeg"></center>

그리고 점프 폭이 너무 작으면 엄청 오래 학습해야 한다. 

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128506427-cf282063-d237-4ca3-87dc-d600f997a3ca.jpeg"></center>

그래서 적당한 점프 폭을 잘 선택해야 한다.

## 선형회귀 | 예제


```python
'''
예시 데이터를 기계학습에 적용한 후 특정 입력값에 대한 출력값을 예측하는 프로그램을 작성해보자.

x시간 등산으로 태워지는 칼로리를 y라고 하자
가볍게 아차산 정도 등산했다고 가정하자
중간중간 쉬기도 하고 정상 가서는 멍때리고 하니까 칼로리 소모량이 일정하게 증가하지는 않을 것이다.
실제로 등산 7시간 하면 내일이 없을 수 있지만 그냥 만들어보자
'''

import tensorflow.compat.v1 as tf # 텐서플로우를 불러온다.
tf.disable_v2_behavior()

xData = [1, 2, 3, 4, 5, 6, 7] # x축 데이터에는 등산 시간
yData = [450, 700, 850, 1000, 1300, 1500, 1700] # y축 데이터에는 칼로리 소모량

# 가설의 기울기(W)값을 넣어준다. W는 weight(가중치)의 줄임말이다.
# W에는 하나의 초기 값으로서 랜덤한 값으로 100에서 100사이의 값이 들어가도록 한다.
# (random_uniform은 하나의 랜덤값을 넣어준다.)
W = tf.Variable(tf.random_uniform([], -100, 100))
# 가설의 y절편(b)값을 넣어준다. b는 bias(편향)의 줄임말이다.
b = tf.Variable(tf.random_uniform([], -100, 100))

# X와 Y를 placeholder로 정의해준다. placeholder는 하나의 틀이다.
X = tf.placeholder(tf.float32)
Y = tf.placeholder(tf.float32)

H = W * X + b # 가설(식)을 정의한다.

# 비용함수를 정의한다. 
# H(예측 값)에서 Y(실제 값)을 배고, tf.square(제곱)을 하고, tf.reduce_mean(평균)값을 구한다.
cost1 = tf.reduce_mean(tf.square(H - Y))

# 경사하강(Gradient Descent) 알고리즘에서 한번에 얼만큼 점프할 것인지 스탭의 크기를 정해준다.
a = tf.Variable(0.01)

# train.GradientDescentOptimizer는 텐서플로우에서 제공하는 경사하강 라이브러리이다.
# 경사하강을 하는데, 그 스탭은 a만큼(0.01만큼)
optimizer1 = tf.train.GradientDescentOptimizer(a)

# 비용함수를 최소화하는 방향으로 경사하강을 진행한다.
train1 = optimizer1.minimize(cost1)

# 이제 실제로 학습을 수행하기 위해 변수 초기화를 해주고, 세션을 정의하고, 세션을 초기화해준다.
init1 = tf.global_variables_initializer()
sess = tf.Session()
sess.run(init1)

# 1. i가 인덱스 5000까지 반복할 수 있도록 한다.
# 2. xData와 yData를 각각 X와 Y에 매칭키쳐준다
# 3. 500번에 한번씩 학습이 이루어지는 상태를 출력한다.
# 4. i(현재까지 진행된 학습 횟수), 비용함수, 기울기, y절편을 출력한다.
for i in range(5001): # 1
    sess.run(train1, feed_dict = {X: xData, Y: yData}) # 2
    if i % 500 == 0: # 3
        print(i, sess.run(cost1, feed_dict= {X: xData, Y: yData}), 
              sess.run(W), sess.run(b)) # 4
# 모든 학습이 끝난 이후에 특정 입력 값에 대한 결과를 출력할 수 있도록 한다.
# 8시간 등산했을 때의 칼로리 소모량을 구해보자. X에 8을 넣으면 프로그램이 예측값 Y를 반환해준다.
print("Day 8 predict: ", sess.run(H, feed_dict= {X : [8]}))
              
# 학습되는 것을 보면 변화 폭이 크다가 점점 작아지고 이후에는 특정 값에 수렴하는 것을 확인할 수 있다.
# 이는 프로그램이 합리적인 가설식을 발견했기 때문이다.
```

    WARNING:tensorflow:From C:\Users\yein4\Anaconda3\lib\site-packages\tensorflow\python\compat\v2_compat.py:96: disable_resource_variables (from tensorflow.python.ops.variable_scope) is deprecated and will be removed in a future version.
    Instructions for updating:
    non-resource variables are not supported in the long term
    0 263509.47 131.07425 58.008606
    500 1235.1139 211.93494 219.12701
    1000 1124.843 207.84116 239.39923
    1500 1122.5012 207.24461 242.3532
    2000 1122.4493 207.1577 242.78366
    2500 1122.449 207.14502 242.84642
    3000 1122.4496 207.14333 242.85487
    3500 1122.4496 207.14333 242.85487
    4000 1122.4496 207.14333 242.85487
    4500 1122.4496 207.14333 242.85487
    5000 1122.4496 207.14333 242.85487
    Day 8 predict:  [1900.0015]
    


