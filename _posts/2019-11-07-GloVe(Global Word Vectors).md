---
title: GloVe(Global Word Vectors)
category: Natural Language Processing
tag: word2vec
---

GloVe는 기존의 단어 embedding 방법의 한계를 개선하고자 제안된 방법이다. 기존의 단어 embedding방법은 크게 Matirx Factorization Method와 Shallow Window-Based Method가 있다. 우선 전자에 해당하는 것에는 대표적으로 LSA가 있는데 이 방법은 카운트 기반으로, corpus의 전체 통계 정보도 고려하고 학습도 빠르지만, 단어 간의 관계를 통해 의미를 유추하거나 단어간의 유사도를 구하기 어렵다는 한계를 지니고 있다. 그리고 후자에 해당하는 방법에는 NNLM과 Word2Vec(CBOW, Skip-gram)이 있는데 이 방법은 단어 간의 유사도도 구할 수 있고 성능도 좋지만 window를 이용해 주변 단어들만 살피기 때문에 전체 corpus의 통계정보를 반영하지 못한다는 문제가 있다. GloVe는 위와 같이 이전에 제안된 word embedding 방법들의 한계점들을 단어간의 동시 등장 확률(co-occurrence probapility)를 사용하여 개선하였다. 

## Co-occurrence Matrix

우선 단어 간의 등장 확률을 구하기 위해 같은 문맥에서 함께 등장한 단어들의 등장 횟수를 기록한 동시 등장 행렬(Co-occurrence matrix) $X(V \times V)$를 만든다:

|        |  Ich  |  Keks  |  liebe |  fliegen  |  Haribo  |  geniessen  |  Leben  |
| :----: | :----: | :----: | :----: | :------: | :-----: | :--------: | :------: |
|  Ich  |    0    |    2    |    1    |    0    |    0    |    0    |    0    |
|  Keks  |    2    |    0    |    0    |    1    |    0    |    1    |    0    |
|  liebe  |    1    |    0    |    0    |    0    |    0    |    0    |    1    |
|  fliegen |    0    |    1    |    0    |    0    |    1    |    0    |    0    |
|  Haribo  |    0    |    0    |    0    |    1    |    0    |    0    |    0    |
|  geniessen |    0    |    1    |    0    |    0    |    0    |    0    |    0    |
|  Leben  |    0    |    0    |    1    |    0    |    0    |    0    |    0    |


아래는 center word $i$가 속한 context에 등장하는 전체 단어의 등장 횟수를 표현한 수식이다:

$$X_i=\sum_k X_{ik}$$

## Objective function

### - Co-occurrence probability

위 행렬$(X)$을 기반으로 동시 등장 확률(co-occurrence probability)을 구한다. 

$$P_{ij}=P(j|i)=\frac{X_{ij}}{X_j}$$


### - Ratios of co-occurrence probabilities
위 수식은 center word $i$에 대해 context word $j$가 등장할 확률을 표현한 것이다. 해당 수식에서 $X_{ij}$는 context word $j$가 center word $i$가 속한 context에 등장한 횟수를 가리킨다. 이렇게 정의한 확률을 사용하여 두 단어(각각 독립적인 단어 $i$와 $j$) 간의 상관관계를 파악하기 위해 임의의 단어 $k$에 대한 동시 등장 확률 비율(ratios of co-occurrence probabilities)을 정의해보도록 하겠다. $i$와 $j$에 대해 그들 간의 동시 등장 확률이 아닌 동시 등장 확률의 비율이 필요한 이유를 설명하기 위해 $i$를 ice로, $j$를 steam으로 가정하여 간단한 예시를 들도록 하겠다. 

<center><img width="272" alt="2019-10-28 (9)" src="https://user-images.githubusercontent.com/53667002/68542575-5cf84e80-03f1-11ea-92ab-b5dc0c610455.png"></center>

위 표는 지금부터 설명할 예시의 결과이다. 해당 표를 보면, ‘ice’와는 관련 있지만 ‘steam’과는 무관한 ‘solid’를 $k$로 정의한 경우, ‘ice’가 주어졌을 때 ‘solid’가 등장할 확률이 ‘steam’이 주어졌을 때 ‘solid’가 등장할 확률보다 높은 것을 확인할 수 있다. 이에 따라 확률들의 비율인 $P(solid\|ice)/P(solid\|steam)$의 값이 8.9로 굉장히 높게 나오게 된다. 다음으로, ‘steam’과 관련 있는 단어 ’gas’를 $k$로 정의한 경우에는 확률 비율이 이전보다 확연히 작아진 것을 볼 수 있다. 마지막으로, 세 번째 결과와 네 번째 결과는 비율이 모두 1에 가깝게 도출되었는데 이는 ‘ice’와 ‘steam’ 모두 관련 있는 단어 ‘water’와 두 단어 모두와 관련 없는 단어 ‘fashion’에 대한 결과이다. 이렇게 간단한 예시를 통해 동시 등장 확률이 아닌 동시 등장 확률 비율이 독립적인 두 단어의 관계를 더 잘 파악할 수 있게 해준다는 것을 알 수 있다. 

이제 위에서 설명한 바와 같이 세개의 단어($i$, $j$, $k$)간의 상호 비율 정보를 도출하기 위한 목적함수를 정의해 보겠다. 우선 $k$에 대한 $i$와 $j$의 등장 확률 비율 $F$는 다음과 같이 정의될 수 있다:

$$F({ w }_{ i },{ w }_{ j },\tilde { { w }_{ k } } )=\frac{ { P }_{ ik } }{ { P }_{ jk } }$$

위 수식에서 $w\in\mathbb{R}^d$은 word vector($i$, $j$)이고 $\tilde{w}\in\mathbb{R}^d$는 separate context vector($k$)이다. 그리고 $F$는 확률에 대한 비율(ratio $\frac { P_{ ik } }{ P_{ jk } }$)정보를 담고 있어야 하고, 해당 비율 정보는 단어 벡터 공간 안에 표현되어야 한다. 벡터 공간은 본질적으로 선형 구조이기에 비율 정보를 벡터 공간 안에 표현하는 것은 벡터 간의 차이로 이루어 낼 수 있다. 이러한 목적을 위해 위 수식을 아래와 같이 변형한다:

$$F({ w }_{ i }-{ w }_{ j },\tilde{ { w }_{ k } })=\frac{ { P }_{ ik } }{ { P }_{ jk } }$$

하지만 F의 인자 값은 vector인데 우변의 결과는 scalar값이다. 이 경우 F는 신경망을 혼란스럽게 만들기 때문에 아래 와 같이 좌변의 인자 값을 내적한 것으로 수식을 또 다시 수정한다:

$$F(({ w }_{ i }-{ w }_{ j })^T\tilde{ { w }_{ k } })=\frac{ { P }_{ ik } }{ { P }_{ jk } }$$

여기에서 주의할 점은 word-word co-occurrence matrices에서 center word($w_i$, $w_j$)와 context word($\tilde{ w }_{ k }$)는 임의로 결정되기 때문에 두 단어의 역할은 자유롭게 상호 교차($w\leftrightarrow\tilde{w}$)가 이루어질 수 있어야 하고, co-occurrence matrix $X$는 $X\leftrightarrow X^T$관계여야 한다는 것이다.

최종 모델은 재라벨링(relabeling)을 해도 변하지 않아야 한다. 하지만 위에 정의된 마지막 수식은 그렇지 않다. 라벨링에 따라 변하지 않기 위해 우선 함수 $F$는 Homomorphism(준동형)해야 한다. 이 조건을 만족시키기 위해 식은 다시 다음과 같이 변형된다:

$$F((w_i-w_j)^T\tilde{w}_k)=\frac{F(w_i^T\tilde{w}_k)}{F(w_j^T\tilde{w}_k)}$$

위 식은 아래 식을 만족한다:

$$F(w_i^T\tilde{w}_k)=P_{ik}=\frac{X_{ik}}{X_i}$$

이제 마지막 단계로 함수 $F$를 정의해야 하는데 함수 $F$는 위에서 말했 듯이 Homomorphism이기 때문에 이 조건을 만족시키는 exponential function(지수함수)를 사용하여 $F=exp$로 정의할 수 있다. 이에 따라 함수 $F$를 $exp$로 치환하면 다음과 같이 정의될 수 있다:

$$F(w_i^T\tilde{w}_k)=P_{ik}$$

$$exp(w_i^T\tilde{w}_k)=P_{ik}$$

$$w_i^T\tilde{w}_k=\log(P_{ik})=\log(X_{ik})-\log(X_i)$$

하지만 위에서 언급했 듯이 center word($w_i$ ,$w_j$)와 context word($\tilde{w}\_k$)간의 상호 교차는 자유롭게 이루어질 수 있어야 하는데 위 수식의 $log(P_{ik})$는 $log(P_{ki})$과 상호 교차될 수 없다. 즉 전자와 후자는 각각$log(X_{ik})-log(X_i)$와  $log(X_{ki}) - log(X_k)$인데 두 수식이 서로 다르기 때문에 상호 교차가 불가능하다. 이를 해결하기 위해 $log(X_i)$에 대해 $w_i$는 bias $b_i$로, $\tilde{ w }\_{ k }$는 bias $\tilde{ b }\_{ k }$로 처리한 후 각 변에 해당 상수항을 다시 더한다:

$${ w }_{ i }^{ T }\tilde { { w }_{ k } } =\log { X_{ ik }-{ b }_{ i }-\tilde { { b }_{ k } }  }$$

$${ w }_{ i }^{ T }\tilde { { w }_{ k } } +{ b }_{ i }+\tilde { { b }_{ k } } =\log { X_{ ik }}$$

이제 $d$차원 벡터 공간에 우변과의 차이를 최소화한 좌변의 값이 embedding된다. 즉 $d$차원 벡터 공간 안에 동시 등장 확률이 높은 단어 vector간의 거리는 가깝게, 낮은 단어 vector간의 거리는 멀게 배치된다. 이를 수식으로 정의하면 다음과 같다:

$$J=\sum _{ i,j=1 }^{ V }{ { ({ w }_{ i }^{ T }\tilde { { w }_{ j } } +{ b }_{ i }+\tilde { { b }_{ j } } -\log { X_{ ij } } ) }^{ 2 } }$$

하지만 위 수식의 $log{X}_{ik}$부분에서 문제가 발생한다. 

$log{X}_{ik}$은 co-occurrence matrix에 로그를 취한 것인데, 행렬 값이 0이 될 경우에는 $log0$이 되어 무한 발산을 하게 된다. 그리고 적게 등장하는 단어와 너무 자주 등장하는 단어에 대한 값을 안정시키기 위해 weighting function $f(x)$를 추가하여 최종 목적함수(objective function)을 만든다:

$$J=\sum _{ i,j=1 }^{ V }{ { f\left( { X }_{ ij } \right) ({ w }_{ i }^{ T }\tilde { { w }_{ j } } +{ b }_{ i }+\tilde { { b }_{ j } } -\log { X_{ ij } } ) }^{ 2 } } where\quad f(x)=\begin{cases} { (\frac { x }{ { x }_{ max } } ) }^{ \alpha  } \\ 1\quad otherwise \end{cases}if\quad x<{ x }_{ max }$$

## Model Training

마지막으로 이제 학습을 진행할 것인데 우선 행렬 $w_{i}^{T}$와 $\tilde{ w }\_{j}$를 랜덤 초기화시킨 후 gradient descent를 사용해 최종 목적함수를 최소화시키는 방향으로 ${w}\_{i}^{T}$와 $\tilde{ w }\_{j}$를 업데이트하며 학습을 진행한다.즉 행렬분해를 통해 최종 목적함수를 최소화하며 학습을 진행한다. 학습 후 나온 vector $w$를 embedding vector로 사용하면 된다.

<center><img width="910" alt="2019-11-10 (1)" src="https://user-images.githubusercontent.com/53667002/68543574-19571200-03fc-11ea-9239-118791a34a1c.png"></center>

<center><img width="569" alt="2019-10-28 (10)" src="https://user-images.githubusercontent.com/53667002/68543645-350ee800-03fd-11ea-8067-af9d255d604c.png"></center>

## Reference

> Francois Chaubard, Michael Fang, Guillaume Genthial, Rohit Mundra, Richard Socher."CS224n: Natural Language Processing with Deep Learning: Part1,"(winter 2017)

> Jeffrey Pennington, Richard Socher, Christopher D. Manning."GloVe: Global Vectors for Word Representation,"(2014)

> Lee,Gichang.Sentence embeddings using korean corpora.seoul:acornpub,2019

