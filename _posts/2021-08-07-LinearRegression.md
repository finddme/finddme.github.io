---
title: "__CODE__ Linear Regression"
category: Machine Learning, Deep Learning
tag: Machine Learning, Deep Learning
---
**Linear Regression 실습 코드: [https://github.com/finddme/Finddme_Blog_Code/blob/master/Machine%20Learning/ML_Linear_Regression.ipynb](https://github.com/finddme/Finddme_Blog_Code/blob/master/Machine%20Learning/ML_Linear_Regression.ipynb)**  








* 목차
{:toc}











## Linear Regression(선형 회귀)

선형회귀는 머신러닝의 기본 이론으로, 변수 사이의 선형적인 관계를 모델링한 것이다. 변수 간의 관계가 선형적이라는 것은 데이터를 기반으로 그래프를 그렸을 때 데이터의 분포를 바탕으로 직선이 형성된다는 것이다.이렇게 선형적인 관계에 있는 데이터에 적용할 수 있는 대표적인 기계학습 이론이 선형회귀이다. 선형회귀 모델로 데이터를 학습하여 해당 데이터에 대한 가장 합리적인 식을 찾아내는 것이 모델의 목표이다. 즉, 가장 합리적인 선을 찾아내는 것을 목표로 한다.

따라서 선형회귀 모델에 적용할 데이터는 적어도 세개 이상일 때 사용 가능하다. 데이터가 두개일 때에도 사용할 수는 있지만 의미가 없다. 그냥 두 데이터를 연결한 직선이 가장 합리적인 직선일 것이기 때문이다. 

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128500558-4ec219cc-f577-4a73-809b-36f5446baa58.jpeg"></center>

위와 같은 데이터가 있을 때 이 데이터들의 구조를 가장 잘 나타내는 선은

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128500654-369b09c3-8fa0-4c9f-870d-1c0c131188ce.jpeg"></center>

위 세 선 중 대충 직관적으로 봐도 데이터들과 가장 근접해있는 가운데 선이다.

## 선형회귀 | 가설식

합리적인 선을 찾기 위해서는 합리적인 식이 필요하다. 

예를 들어 아래와 같은 데이터가 있다고 가정해보자.

$x$ = \[1, 2, 3\]  
$y$ = \[5, 7, 9\]

1을 입력하면 5가 출력되고, 2를 입력하면 7가 출력되고, 3을 입력하면 9일 출력되는 데이터이다. 이때 $x$의 값으로 4가 입력될 경우 출력될 $y$의 값을 예측하기 위한 함수를는 $f(x) = 2x + 3$일 것이다. 정의한 식의 x값에 4를 입력하면 y가 11이 되는 것을 알 수 있다. 이런식으로 데이터간의 관계를 찾아 적절한 식을 유추하는 것을 선형회귀하고 하며, 유추한 식을 가지고 새로운 x값에 대한 y값을 예측할 수 있다.

합리적인 식을 찾기 위해서는 우선 가설식이 필요하다:

\begin{matrix}
H(x) = Wx + b
\end{matrix}

- H는 Hypothesis로, 가설식을 의미하고
- W는 weight로, 가중치를 의미한다. (기울기)
- b는 bias로, 편향이다. (y절편)

선형회귀는 주어진 데이터를 기반으로 위 일차방정식의 $W$와 $b$값을 계속 수정하면서 가장 합리적인 식에 근사한 식을 찾아내는 것이다. 계속 수정하는 과정을 머신러닝을 학습시킨다고 표현한다. 

앞서 만든 예시 데이터를 가지고 학습을 할 경우, 모델의 목표는 $W$(기울기)를 2로 만들고 $b$(y절편)를 3으로 만드는 것이다. 우선 처음에 가설을 초기화 할 때에는 임의의 값을 입력한 후에 반복적인 연산을 통해 W는 2에 가깝게, b는 3에 가깝게 학습시킨다.  

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

위와 같은 원리로 비용함수(Cost Function)을 만든다. 이렇게 어느정도 정답 데이터가 주어져있는 문제에 대한 학습은 지도학습에 속한다. 회귀문제를 지도학습으로 풀 때 비용함수로 최소제곱법이 흔히 사용된다. 최소제곱법은 $(예측값 - 실제값)^2$의 평균이다.

\begin{matrix}
Cost(W, b) = {1/m}\sum_{i=0}^m (Wxi + b - yi)^2 
\end{matrix}

- $Wxi + b$는 가설식의 값, 즉 예측값이고  
- $yi$는 실제값이다.

두 값의 오차를 제곱하는 이유는 세 가지가 있다:

1. 위 식에서 '예측값 - 실제값' 부분은 실제값이 예측값보다 클 때 음수값이 나온다. 하지만 비용은 직선과 점 사이의 '거리'이기 때문에 음수여서는 안된다. 그래서 제곱을 하여 양수를 만든다.  
2. 제곱을 하면 오차의 값이 더 커지기 때문에 가설이 잘못됐을 경우 패널티를 더 세게 줄 수 있기 때문에 학습 속도가 더 빨라진다.  
3. 값을 양수로 만들 목적이라면 절댓값을 씌워줘도 되지만 컴퓨터가 절댓값을 처리할 때 조건문을 통해 처리하기 때문에 연산 속도가 느려진다. 그래서 그냥 제곱해주는 것이다.

우리의 예시 데이터로 최소제곱법을 알아보자. 초록색이 예시 데이터 그래프이고, 빨간색이 초기화 가설식의 그래프이다.

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128588910-bf4e2ec8-e255-4426-b977-f6398354d559.jpeg"></center>

그러면 가설식과 목표식이 얼마나 차이나는지 거리를 구한다.

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128588962-6a22348f-4860-41ff-8504-8da6fef03788.jpeg"></center>

거리는 '예측값 - 실제값'이다: $(5 -1), (7 - 2), (9 - 3)$

근데 거리가 음수면 안 되니까 제곱을 해준다: $4^2 + 5^2 + 6^2$

전반적인 차이를 구하는 거니까 데이터 개수만큼 나눠서 평균을 낸다: ${4^2 + 5^2 + 6^2}/3 = 77/3$

그래서 cost가 클 수록 가설식의 W와 b가 크게 잘못됐다는 것이다. 목표식에 근접할수록 cost는 0에 가까워진다. 비용이 적을수록 더 합리적인 가설식이라고 할 수 있다. 따라서 모델은 비용을 최소화하는 방향으로 학습을 진행해야 한다. 이를 식으로 정의하면 아래와 같다:

\begin{matrix}
\min_{w,b}\sum_{i=0}^m (Wxi + yi)^2
\end{matrix}

Cost Function에서 상수는 $x$와 $y$이고 변수는 $W$와 $b$이다. 따라서 고려해야 하는 것은 cost값을 최소화하는 $W$와 $b$이다. 그렇게 때문에 비용을 최소화하는 과정에 데이터의 수는 별로 필요가 없다. 그래서 비용 최소화 수식에서 $1/m$이 빠진 것이다.

일단 cost값을 최소화할 $W$(기울기)를 구해보자. 우리 예시에서의 Global Optimum은 2이다. (W가 2가 되는 지점이 cost가 가장 작아지니까) x축을 $W$, y축을 cost값이라고 하면 아래와 같은 그래프가 그려진다.(W값이 미세하게 달라져도 cost값이 크게 달라지니까 2차함수 형태의 그래프가 그려진다)

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128590829-7734de9a-379e-4a83-a7c0-3c31c3417ede.jpeg"></center>

$W$값을 1로 임의 설정했다면 2로 이동시켜야 한다.

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128591219-d71260e2-38db-4dcb-9f31-9b4fdcb264b7.jpeg"></center>

어디로 이동해야 Global Optimum에 가까워지는지는 기울기를 통해 알 수 있다. Convex한 그래프는 그의 꼭지점(그래프의 최대 혹은 최솟값을 가지는 지점)의 기울기가 0이기 때문에 기울기가 0인 지점을 찾아가면 된다.

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128591445-31c9e389-d2b1-4cc8-b7f6-8316553b4468.jpeg"></center>

그래서 예측 W값이 가지는 기울기가 음수면 $W$값을 늘려주고, 양수면 줄여주면서 Global Optimum을 찾아야 한다.

$W$가 1일 경우의 기울기는 아래와 같다:

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128591689-7d88fa6d-a2b1-41d3-a517-149dfdfd4b22.jpeg"></center>

이 경우에는 기울기가 음수니까 $W$값을 늘려줘야 하는 것이다.

이렇게 기울기를 구해서 Global Optimum을 찾아 계속 아래로 내려가는 것을 경사하강법이라고 한다.

$W$(기울기)값은 고정하고 이제 최적의 $b$(y절편)를 구해보자. $b$를 0이라고 임의 설정했을 때 $b$값을 줄이면 아래와 같이 그래프가 바뀔 것이다. 

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128592428-f2dd6370-0287-472d-8b41-c1aa60db1ca2.jpeg"></center>

데이터로부터 멀어졌다. 최적의 $b$도 $W$와 마찬가지로 기울기를 이용한다.


## Gradient Descent(경사하강법)

머신러닝 모델이 Cost를 줄여 가설의 변수를 변경해 나가며 가장 합리적인 식을 도출하는 방법을 경사하강법이라고 한다. 

\begin{matrix}
H(x) = Wx + b
\end{matrix}

위 식을 간단하게 

\begin{matrix}
H(x) = Wx
\end{matrix}

로 표현해서 생각해보자. 여기에서 필요한 것은 기울기이기 때문이다. 이때 비용함수는 아래 식을 따르게 된다.

\begin{matrix}
(Wx - y)^2
\end{matrix}

이것을 그래프로 표현하면 

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128501420-a6671c61-57f3-498a-909f-2632777e0176.jpeg"></center>

이것과 같고, x축을 $W$라고 생각하고 임의의 $W$값을 정해준 다음에 그래프의 경사를 점프하면서 내려간다.

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

## 선형회귀 | 예제 | Scikit-learn 사용

사이킷런을 활용하여 선형회귀 예제를 만들어 보겠다.

사이킷런은 파이썬이 제공하는 머신러닝 라이브러리 중 하나로, 선형회귀의 간단한 구현을 돕는 여러 기능을 제공한다. 

> sklearn.linear_model.LinearRegression : 선형회귀 모델을 불러온다

> LinearRegression.fit(x, y): (x, y) 데이터셋에 대해 모델을 학습시킨다.
  
> LinearRegression.predict(x): 데이터x에 대해 예측되는 값을 구한다.
  
 [사이킷런 홈페이지 - 선형회귀 관련 함수 및 라이브러리 설명](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html)


```python
import matplotlib.pyplot as plt
import matplotlib as mpl
mpl.use("Agg") # Matplotlib의 Renderer를 AGG로 설정한다.
%matplotlib inline

import numpy as np
# 선형회귀 클래스를 불러온다
from sklearn.linear_model import LinearRegression

# 데이터 x와 y를 생성한다.
x = 5*np.random.rand(100,1) # 100행 1열로 난수를 뽑고 5를 곱한다.
# np.random.rand: 표준정규분포 난수를 행렬배열로 반환한다
y = 3*x + 5*np.random.rand(100,1) # x에 3을 곱하고 100행 1열 난수에 5를 곱한 값을 더한다.

# LinearRegression 클래스를 불러와서 회귀 모델을 만들어 준다.
lr_model = LinearRegression(fit_intercept=True) 
# print(lr)

# 선형회귀 모델을 데이터 x,y에 대해 학습시킨다.
lr_model.fit(x, y)

# 학습된 모델에 데이터x를 기반으로 y를 학습한다.
predicted = lr_model.predict(x)

##그래프를 만들자
# 1열 2행으로 subplot을 만든다. 사이즈는 15*5
fig, ax = plt.subplots(1,2, figsize=(15, 5)) 
print("fig,ax:",fig,ax)

ax[0].scatter(x,y)
ax[1].scatter(x,y)
ax[1].plot(x, predicted, color='b')

ax[0].set_xlabel('X')
ax[0].set_ylabel('Y')
ax[1].set_xlabel('X')
ax[1].set_ylabel('Y')

```

    fig,ax: Figure(1080x360) [<AxesSubplot:> <AxesSubplot:>]
    




    Text(0, 0.5, 'Y')




    
<img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128600420-1c5bdf59-5194-41b1-b7cb-b9e118ec2a7b.png">
    


## 선형회귀 | 예제 | Scikit-learn 사용2 (당뇨 진행 상황 예측)

선형회귀를 이용해 당뇨 진행 상황을 예측해보자.


```python
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.pyplot as plt
import matplotlib as mpl
mpl.use("Agg")
%matplotlib inline

import sklearn.datasets as ds # 사이킷런에서 제공하는 당뇨예측 데이터셋을 바탕으로 진행한다.
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import normalize
# 평균제곱오차를 구해주는 사이킷런에서 제공하는 함수를 불러온다.
from sklearn.metrics import mean_squared_error as mse  

# 당뇨병 관련 데이터셋을 불러옵니다.
train_data = ds.load_diabetes()
print(train_data)
# 출력해보면 data와 target으로 구성되어 있다.
```

    {'data': array([[ 0.03807591,  0.05068012,  0.06169621, ..., -0.00259226,
             0.01990842, -0.01764613],
           [-0.00188202, -0.04464164, -0.05147406, ..., -0.03949338,
            -0.06832974, -0.09220405],
           [ 0.08529891,  0.05068012,  0.04445121, ..., -0.00259226,
             0.00286377, -0.02593034],
           ...,
           [ 0.04170844,  0.05068012, -0.01590626, ..., -0.01107952,
            -0.04687948,  0.01549073],
           [-0.04547248, -0.04464164,  0.03906215, ...,  0.02655962,
             0.04452837, -0.02593034],
           [-0.04547248, -0.04464164, -0.0730303 , ..., -0.03949338,
            -0.00421986,  0.00306441]]), 'target': array([151.,  75., 141., 206., 135.,  97., 138.,  63., 110., 310., 101.,
            69., 179., 185., 118., 171., 166., 144.,  97., 168.,  68.,  49.,
            68., 245., 184., 202., 137.,  85., 131., 283., 129.,  59., 341.,
            87.,  65., 102., 265., 276., 252.,  90., 100.,  55.,  61.,  92.,
           259.,  53., 190., 142.,  75., 142., 155., 225.,  59., 104., 182.,
           128.,  52.,  37., 170., 170.,  61., 144.,  52., 128.,  71., 163.,
           150.,  97., 160., 178.,  48., 270., 202., 111.,  85.,  42., 170.,
           200., 252., 113., 143.,  51.,  52., 210.,  65., 141.,  55., 134.,
            42., 111.,  98., 164.,  48.,  96.,  90., 162., 150., 279.,  92.,
            83., 128., 102., 302., 198.,  95.,  53., 134., 144., 232.,  81.,
           104.,  59., 246., 297., 258., 229., 275., 281., 179., 200., 200.,
           173., 180.,  84., 121., 161.,  99., 109., 115., 268., 274., 158.,
           107.,  83., 103., 272.,  85., 280., 336., 281., 118., 317., 235.,
            60., 174., 259., 178., 128.,  96., 126., 288.,  88., 292.,  71.,
           197., 186.,  25.,  84.,  96., 195.,  53., 217., 172., 131., 214.,
            59.,  70., 220., 268., 152.,  47.,  74., 295., 101., 151., 127.,
           237., 225.,  81., 151., 107.,  64., 138., 185., 265., 101., 137.,
           143., 141.,  79., 292., 178.,  91., 116.,  86., 122.,  72., 129.,
           142.,  90., 158.,  39., 196., 222., 277.,  99., 196., 202., 155.,
            77., 191.,  70.,  73.,  49.,  65., 263., 248., 296., 214., 185.,
            78.,  93., 252., 150.,  77., 208.,  77., 108., 160.,  53., 220.,
           154., 259.,  90., 246., 124.,  67.,  72., 257., 262., 275., 177.,
            71.,  47., 187., 125.,  78.,  51., 258., 215., 303., 243.,  91.,
           150., 310., 153., 346.,  63.,  89.,  50.,  39., 103., 308., 116.,
           145.,  74.,  45., 115., 264.,  87., 202., 127., 182., 241.,  66.,
            94., 283.,  64., 102., 200., 265.,  94., 230., 181., 156., 233.,
            60., 219.,  80.,  68., 332., 248.,  84., 200.,  55.,  85.,  89.,
            31., 129.,  83., 275.,  65., 198., 236., 253., 124.,  44., 172.,
           114., 142., 109., 180., 144., 163., 147.,  97., 220., 190., 109.,
           191., 122., 230., 242., 248., 249., 192., 131., 237.,  78., 135.,
           244., 199., 270., 164.,  72.,  96., 306.,  91., 214.,  95., 216.,
           263., 178., 113., 200., 139., 139.,  88., 148.,  88., 243.,  71.,
            77., 109., 272.,  60.,  54., 221.,  90., 311., 281., 182., 321.,
            58., 262., 206., 233., 242., 123., 167.,  63., 197.,  71., 168.,
           140., 217., 121., 235., 245.,  40.,  52., 104., 132.,  88.,  69.,
           219.,  72., 201., 110.,  51., 277.,  63., 118.,  69., 273., 258.,
            43., 198., 242., 232., 175.,  93., 168., 275., 293., 281.,  72.,
           140., 189., 181., 209., 136., 261., 113., 131., 174., 257.,  55.,
            84.,  42., 146., 212., 233.,  91., 111., 152., 120.,  67., 310.,
            94., 183.,  66., 173.,  72.,  49.,  64.,  48., 178., 104., 132.,
           220.,  57.]), 'frame': None, 'DESCR': '.. _diabetes_dataset:\n\nDiabetes dataset\n----------------\n\nTen baseline variables, age, sex, body mass index, average blood\npressure, and six blood serum measurements were obtained for each of n =\n442 diabetes patients, as well as the response of interest, a\nquantitative measure of disease progression one year after baseline.\n\n**Data Set Characteristics:**\n\n  :Number of Instances: 442\n\n  :Number of Attributes: First 10 columns are numeric predictive values\n\n  :Target: Column 11 is a quantitative measure of disease progression one year after baseline\n\n  :Attribute Information:\n      - age     age in years\n      - sex\n      - bmi     body mass index\n      - bp      average blood pressure\n      - s1      tc, T-Cells (a type of white blood cells)\n      - s2      ldl, low-density lipoproteins\n      - s3      hdl, high-density lipoproteins\n      - s4      tch, thyroid stimulating hormone\n      - s5      ltg, lamotrigine\n      - s6      glu, blood sugar level\n\nNote: Each of these 10 feature variables have been mean centered and scaled by the standard deviation times `n_samples` (i.e. the sum of squares of each column totals 1).\n\nSource URL:\nhttps://www4.stat.ncsu.edu/~boos/var.select/diabetes.html\n\nFor more information see:\nBradley Efron, Trevor Hastie, Iain Johnstone and Robert Tibshirani (2004) "Least Angle Regression," Annals of Statistics (with discussion), 407-499.\n(https://web.stanford.edu/~hastie/Papers/LARS/LeastAngle_2002.pdf)', 'feature_names': ['age', 'sex', 'bmi', 'bp', 's1', 's2', 's3', 's4', 's5', 's6'], 'data_filename': 'C:\\Users\\yein4\\Anaconda3\\lib\\site-packages\\sklearn\\datasets\\data\\diabetes_data.csv.gz', 'target_filename': 'C:\\Users\\yein4\\Anaconda3\\lib\\site-packages\\sklearn\\datasets\\data\\diabetes_target.csv.gz'}
    


```python
# 불러온 데이터에서 'data'는 
# sklearn.preprocessing.normalize를 사용해서 값을 Normalize 하고 input에 할당,
# 'target'은 label에 할당한다.
input1, label1 = [normalize(train_data['data']), train_data['target']]
```


```python
# input1과 label1을 train 데이터와 test 데이터로 나눈다.
# train - 80%, test - 20%
# input1도 train 0.8, test 0.2로 나누고, label1도 train 0.8, test 0.2로 나눈다.
input_train, input_test, label_train, label_test = train_test_split(input1, label1, test_size=0.2)
```


```python
# 선형회귀 모델을 불러준다
linear_model = LinearRegression()
# 선형회귀 모델을 train데이터(input_train, label_train)에 대하여 학습시킨다
linear_model.fit(input_train, label_train)
# test데이터 중 input1에서 나뉜 데이터(input_test)에 대해서 학습 모델의 예측을 실행합니다.
pred = linear_model.predict(input_test)
```


```python
# 아까 불러온 평균제곱오차를 구해주는 함수를 이용하여
# label과 pred를 변수로 입력했을 때
# 실제값(label)과 예측값(pred)의 오차(평균제곱오차)를 반환하는 함수를 정의한다.
def get_mse(label,pred):
    error= mse(label,pred)
    return error 
```


```python
# 실제값과 예측값에 대한 오차를 출력한다
print('MSE: ', get_mse(label_test, pred)) 
```

    MSE:  2807.8416311424967
    

## 선형회귀 | 예제 | Scikit-learn 사용3 (보스턴 주택 가격 예측)

사이킷런에서 제공하는 Boston Data를 가지고 보스턴 집값을 예측해보자. 이 예제는 다항회귀예제이다.


```python
from scipy import stats
import numpy as np, pandas as pd, matplotlib.pyplot as plt, seaborn as sns
import sklearn.datasets as datasets
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
```


```python
# 보스턴 데이터는 이렇게 생겼다
print(datasets.load_boston())
```

    {'data': array([[6.3200e-03, 1.8000e+01, 2.3100e+00, ..., 1.5300e+01, 3.9690e+02,
            4.9800e+00],
           [2.7310e-02, 0.0000e+00, 7.0700e+00, ..., 1.7800e+01, 3.9690e+02,
            9.1400e+00],
           [2.7290e-02, 0.0000e+00, 7.0700e+00, ..., 1.7800e+01, 3.9283e+02,
            4.0300e+00],
           ...,
           [6.0760e-02, 0.0000e+00, 1.1930e+01, ..., 2.1000e+01, 3.9690e+02,
            5.6400e+00],
           [1.0959e-01, 0.0000e+00, 1.1930e+01, ..., 2.1000e+01, 3.9345e+02,
            6.4800e+00],
           [4.7410e-02, 0.0000e+00, 1.1930e+01, ..., 2.1000e+01, 3.9690e+02,
            7.8800e+00]]), 'target': array([24. , 21.6, 34.7, 33.4, 36.2, 28.7, 22.9, 27.1, 16.5, 18.9, 15. ,
           18.9, 21.7, 20.4, 18.2, 19.9, 23.1, 17.5, 20.2, 18.2, 13.6, 19.6,
           15.2, 14.5, 15.6, 13.9, 16.6, 14.8, 18.4, 21. , 12.7, 14.5, 13.2,
           13.1, 13.5, 18.9, 20. , 21. , 24.7, 30.8, 34.9, 26.6, 25.3, 24.7,
           21.2, 19.3, 20. , 16.6, 14.4, 19.4, 19.7, 20.5, 25. , 23.4, 18.9,
           35.4, 24.7, 31.6, 23.3, 19.6, 18.7, 16. , 22.2, 25. , 33. , 23.5,
           19.4, 22. , 17.4, 20.9, 24.2, 21.7, 22.8, 23.4, 24.1, 21.4, 20. ,
           20.8, 21.2, 20.3, 28. , 23.9, 24.8, 22.9, 23.9, 26.6, 22.5, 22.2,
           23.6, 28.7, 22.6, 22. , 22.9, 25. , 20.6, 28.4, 21.4, 38.7, 43.8,
           33.2, 27.5, 26.5, 18.6, 19.3, 20.1, 19.5, 19.5, 20.4, 19.8, 19.4,
           21.7, 22.8, 18.8, 18.7, 18.5, 18.3, 21.2, 19.2, 20.4, 19.3, 22. ,
           20.3, 20.5, 17.3, 18.8, 21.4, 15.7, 16.2, 18. , 14.3, 19.2, 19.6,
           23. , 18.4, 15.6, 18.1, 17.4, 17.1, 13.3, 17.8, 14. , 14.4, 13.4,
           15.6, 11.8, 13.8, 15.6, 14.6, 17.8, 15.4, 21.5, 19.6, 15.3, 19.4,
           17. , 15.6, 13.1, 41.3, 24.3, 23.3, 27. , 50. , 50. , 50. , 22.7,
           25. , 50. , 23.8, 23.8, 22.3, 17.4, 19.1, 23.1, 23.6, 22.6, 29.4,
           23.2, 24.6, 29.9, 37.2, 39.8, 36.2, 37.9, 32.5, 26.4, 29.6, 50. ,
           32. , 29.8, 34.9, 37. , 30.5, 36.4, 31.1, 29.1, 50. , 33.3, 30.3,
           34.6, 34.9, 32.9, 24.1, 42.3, 48.5, 50. , 22.6, 24.4, 22.5, 24.4,
           20. , 21.7, 19.3, 22.4, 28.1, 23.7, 25. , 23.3, 28.7, 21.5, 23. ,
           26.7, 21.7, 27.5, 30.1, 44.8, 50. , 37.6, 31.6, 46.7, 31.5, 24.3,
           31.7, 41.7, 48.3, 29. , 24. , 25.1, 31.5, 23.7, 23.3, 22. , 20.1,
           22.2, 23.7, 17.6, 18.5, 24.3, 20.5, 24.5, 26.2, 24.4, 24.8, 29.6,
           42.8, 21.9, 20.9, 44. , 50. , 36. , 30.1, 33.8, 43.1, 48.8, 31. ,
           36.5, 22.8, 30.7, 50. , 43.5, 20.7, 21.1, 25.2, 24.4, 35.2, 32.4,
           32. , 33.2, 33.1, 29.1, 35.1, 45.4, 35.4, 46. , 50. , 32.2, 22. ,
           20.1, 23.2, 22.3, 24.8, 28.5, 37.3, 27.9, 23.9, 21.7, 28.6, 27.1,
           20.3, 22.5, 29. , 24.8, 22. , 26.4, 33.1, 36.1, 28.4, 33.4, 28.2,
           22.8, 20.3, 16.1, 22.1, 19.4, 21.6, 23.8, 16.2, 17.8, 19.8, 23.1,
           21. , 23.8, 23.1, 20.4, 18.5, 25. , 24.6, 23. , 22.2, 19.3, 22.6,
           19.8, 17.1, 19.4, 22.2, 20.7, 21.1, 19.5, 18.5, 20.6, 19. , 18.7,
           32.7, 16.5, 23.9, 31.2, 17.5, 17.2, 23.1, 24.5, 26.6, 22.9, 24.1,
           18.6, 30.1, 18.2, 20.6, 17.8, 21.7, 22.7, 22.6, 25. , 19.9, 20.8,
           16.8, 21.9, 27.5, 21.9, 23.1, 50. , 50. , 50. , 50. , 50. , 13.8,
           13.8, 15. , 13.9, 13.3, 13.1, 10.2, 10.4, 10.9, 11.3, 12.3,  8.8,
            7.2, 10.5,  7.4, 10.2, 11.5, 15.1, 23.2,  9.7, 13.8, 12.7, 13.1,
           12.5,  8.5,  5. ,  6.3,  5.6,  7.2, 12.1,  8.3,  8.5,  5. , 11.9,
           27.9, 17.2, 27.5, 15. , 17.2, 17.9, 16.3,  7. ,  7.2,  7.5, 10.4,
            8.8,  8.4, 16.7, 14.2, 20.8, 13.4, 11.7,  8.3, 10.2, 10.9, 11. ,
            9.5, 14.5, 14.1, 16.1, 14.3, 11.7, 13.4,  9.6,  8.7,  8.4, 12.8,
           10.5, 17.1, 18.4, 15.4, 10.8, 11.8, 14.9, 12.6, 14.1, 13. , 13.4,
           15.2, 16.1, 17.8, 14.9, 14.1, 12.7, 13.5, 14.9, 20. , 16.4, 17.7,
           19.5, 20.2, 21.4, 19.9, 19. , 19.1, 19.1, 20.1, 19.9, 19.6, 23.2,
           29.8, 13.8, 13.3, 16.7, 12. , 14.6, 21.4, 23. , 23.7, 25. , 21.8,
           20.6, 21.2, 19.1, 20.6, 15.2,  7. ,  8.1, 13.6, 20.1, 21.8, 24.5,
           23.1, 19.7, 18.3, 21.2, 17.5, 16.8, 22.4, 20.6, 23.9, 22. , 11.9]), 'feature_names': array(['CRIM', 'ZN', 'INDUS', 'CHAS', 'NOX', 'RM', 'AGE', 'DIS', 'RAD',
           'TAX', 'PTRATIO', 'B', 'LSTAT'], dtype='<U7'), 'DESCR': ".. _boston_dataset:\n\nBoston house prices dataset\n---------------------------\n\n**Data Set Characteristics:**  \n\n    :Number of Instances: 506 \n\n    :Number of Attributes: 13 numeric/categorical predictive. Median Value (attribute 14) is usually the target.\n\n    :Attribute Information (in order):\n        - CRIM     per capita crime rate by town\n        - ZN       proportion of residential land zoned for lots over 25,000 sq.ft.\n        - INDUS    proportion of non-retail business acres per town\n        - CHAS     Charles River dummy variable (= 1 if tract bounds river; 0 otherwise)\n        - NOX      nitric oxides concentration (parts per 10 million)\n        - RM       average number of rooms per dwelling\n        - AGE      proportion of owner-occupied units built prior to 1940\n        - DIS      weighted distances to five Boston employment centres\n        - RAD      index of accessibility to radial highways\n        - TAX      full-value property-tax rate per $10,000\n        - PTRATIO  pupil-teacher ratio by town\n        - B        1000(Bk - 0.63)^2 where Bk is the proportion of blacks by town\n        - LSTAT    % lower status of the population\n        - MEDV     Median value of owner-occupied homes in $1000's\n\n    :Missing Attribute Values: None\n\n    :Creator: Harrison, D. and Rubinfeld, D.L.\n\nThis is a copy of UCI ML housing dataset.\nhttps://archive.ics.uci.edu/ml/machine-learning-databases/housing/\n\n\nThis dataset was taken from the StatLib library which is maintained at Carnegie Mellon University.\n\nThe Boston house-price data of Harrison, D. and Rubinfeld, D.L. 'Hedonic\nprices and the demand for clean air', J. Environ. Economics & Management,\nvol.5, 81-102, 1978.   Used in Belsley, Kuh & Welsch, 'Regression diagnostics\n...', Wiley, 1980.   N.B. Various transformations are used in the table on\npages 244-261 of the latter.\n\nThe Boston house-price data has been used in many machine learning papers that address regression\nproblems.   \n     \n.. topic:: References\n\n   - Belsley, Kuh & Welsch, 'Regression diagnostics: Identifying Influential Data and Sources of Collinearity', Wiley, 1980. 244-261.\n   - Quinlan,R. (1993). Combining Instance-Based and Model-Based Learning. In Proceedings on the Tenth International Conference of Machine Learning, 236-243, University of Massachusetts, Amherst. Morgan Kaufmann.\n", 'filename': 'C:\\Users\\yein4\\Anaconda3\\lib\\site-packages\\sklearn\\datasets\\data\\boston_house_prices.csv'}
    


```python
# Boston Data 불러오는 함수 생성 
def load_data():
    return datasets.load_boston()


# 데이터셋에 data과 target을 뽑아서 DataFrame으로 만들어 반환하는 함수를 만들자
def load_data_target(dataset):
    # dataset의 'data'를 DataFrame으로 만들어 준다. column은 dataset의 feature_names로.
    bs_df = pd.DataFrame(dataset.data, columns=dataset.feature_names)
    # 방금 만든 DataFrame에 'PRICE'변수를 추가하고, target 데이터를 넣어준다.
    bs_df['PRICE'] = dataset.target
    return bs_df

print(load_data_target(load_data()))
```

            CRIM    ZN  INDUS  CHAS    NOX     RM   AGE     DIS  RAD    TAX  \
    0    0.00632  18.0   2.31   0.0  0.538  6.575  65.2  4.0900  1.0  296.0   
    1    0.02731   0.0   7.07   0.0  0.469  6.421  78.9  4.9671  2.0  242.0   
    2    0.02729   0.0   7.07   0.0  0.469  7.185  61.1  4.9671  2.0  242.0   
    3    0.03237   0.0   2.18   0.0  0.458  6.998  45.8  6.0622  3.0  222.0   
    4    0.06905   0.0   2.18   0.0  0.458  7.147  54.2  6.0622  3.0  222.0   
    ..       ...   ...    ...   ...    ...    ...   ...     ...  ...    ...   
    501  0.06263   0.0  11.93   0.0  0.573  6.593  69.1  2.4786  1.0  273.0   
    502  0.04527   0.0  11.93   0.0  0.573  6.120  76.7  2.2875  1.0  273.0   
    503  0.06076   0.0  11.93   0.0  0.573  6.976  91.0  2.1675  1.0  273.0   
    504  0.10959   0.0  11.93   0.0  0.573  6.794  89.3  2.3889  1.0  273.0   
    505  0.04741   0.0  11.93   0.0  0.573  6.030  80.8  2.5050  1.0  273.0   
    
         PTRATIO       B  LSTAT  PRICE  
    0       15.3  396.90   4.98   24.0  
    1       17.8  396.90   9.14   21.6  
    2       17.8  392.83   4.03   34.7  
    3       18.7  394.63   2.94   33.4  
    4       18.7  396.90   5.33   36.2  
    ..       ...     ...    ...    ...  
    501     21.0  391.99   9.67   22.4  
    502     21.0  396.90   9.08   20.6  
    503     21.0  396.90   5.64   23.9  
    504     21.0  393.45   6.48   22.0  
    505     21.0  396.90   7.88   11.9  
    
    [506 rows x 14 columns]
    


```python
'''
데이터를 시각화해주는 함수를 만들자
'''
def plotting_graph(bs_df):
    # Matplotlib.pyplot의 Subplots를 이용하여 2행 4열 총 8개의 빈 그래프를 만들어 놓는다
    fig, axs = plt.subplots(2,4,figsize=(16,8))
    
    # 그래프 채우자
    # 그래프를 생성할 특징들의 이름을 설정한다
    features = ['RM','ZN','INDUS','NOX','AGE', 'PTRATIO', 'LSTAT', 'RAD']
    # Seaborn으로 특징들과 그 인덱스를 바탕으로 데이터를 시각화 합니다.
    for i, feature in enumerate(features):
        row = int(i/4)
        col = i%4
        ##seaborn.replot을 이용하여 변수와 그에 따른 Regression 그래프를 그려줍니다.
        # features를 하나씩 돌면서 0번 인덱스에 해당하는 'RM'은 x축, 'PRICE'는 y축
        # x축과 y축이 될 특징들은 bs_df라는 데이터에서 오고
        # 인덱스 0이 x축일 경우, 2행 4열 중 해당 그래프는 0행 1열에 그려라
        sns.regplot(x = feature, y = 'PRICE', data = bs_df, ax=axs[row][col])
```


```python
'''
데이터를 train과 validation 데이터로 나누는 함수를 만들자

# 1. bs_df에서 'PRICE'는 label_data에, 'PRICE'를 뺀 나머지는 input_data에 할당한다
# 2. input_data랑 label_data 각각 train 0.7, test 0.3 비율로 나눈다. 
     그리고 random함수의 seed값을 고정시킨다.
     input_data를 split한 거는 각각 input_train이랑 input_eval에 할당하고
     label_data를 split한 거는 각각 label_train이랑 label_eval에 할당한다.
'''
def data2train_eval(bs_df):
    label_data = bs_df['PRICE'] # 1
    input_data = bs_df.drop(['PRICE'], axis=1, inplace=False)
    
    # 2
    input_train, input_eval, label_train, label_eval = train_test_split(input_data, label_data, test_size=0.3, random_state=42)
    
    return input_train, input_eval, label_train, label_eval

```


```python
'''
지금까지 정의한 함수들로 데이터를 끌어오고, 나눠서 학습시키고 시각화하자.
'''
def BOSTON():
    # 아까 만든 load_data()함수로 데이터를 불러온다.
    df1 = load_data()
    # 불러온 데이터를 load_data_target함수에서 정의한 형태의 DataFrame으로 만든다.
    df_data_target = load_data_target(df1)
    # 데이터들에 대해 그래프를 만들어서 변수 별 Regression을 확인한다.
    plotting_graph(df_data_target)
    
    # 데이터를 나눈다.
    input_train, input_eval, label_train, label_eval = data2train_eval(df_data_target)
    
    # 회귀모델을 만든다.
    linear_model = LinearRegression()
    # 학습 데이터로 학습을 진행한다.
    linear_model.fit(input_train,label_train)
    # 검증 데이터로 예측한다.
    pred = linear_model.predict(input_eval)
    # 실제값과 예측값의 평균제곱오차(mean squared error)를 계산한다.
    mse = mean_squared_error(label_eval,pred)
    # 루트 제곱 평균 오차(rooted mean squared error)를 계산한다.
    rmse = np.sqrt(mse)

    # 앞서 만든 mse와 rmse의 값을 소수점 3자리까지 나타낸다. 
    print('MSE: {0:.3f}, RMSE: {1:.3f}'.format(mse, rmse))
    #LinearRegression 모델의 상관계수를 구한다
    # 소수점 1자리까지 반올림한다
    print('회귀 계수값:', np.round(linear_model.coef_, 1))
    # 구한 상관계수를 큰 순서대로 출력한다
    coeff = pd.Series(data = np.round(linear_model.coef_, 1), index=input_train.columns)
    print(coeff.sort_values(ascending=False))
    
BOSTON()
```

    MSE: 21.517, RMSE: 4.639
    회귀 계수값: [ -0.1   0.    0.    3.1 -15.4   4.1  -0.   -1.4   0.2  -0.   -0.9   0.
      -0.5]
    RM          4.1
    CHAS        3.1
    RAD         0.2
    ZN          0.0
    INDUS       0.0
    AGE        -0.0
    TAX        -0.0
    B           0.0
    CRIM       -0.1
    LSTAT      -0.5
    PTRATIO    -0.9
    DIS        -1.4
    NOX       -15.4
    dtype: float64
    


    
<img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/128600449-e19e96b8-a2bb-45f7-a181-ad738c7589f4.png">
    


## 선형회귀 | 예제 | Tensorflow 사용


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
    



