---
title: Word2vec:CBOW(Continuous Bag Of Words Model)
category: Natural Language Processing
tag: word2vec
---

Word2vec은 [T. Mikolov,et al.,2013](https://code.google.com/archive/p/word2vec/)가 제안한 word embedding방법이다. [NPLM](https://finddme.github.io/natural%20language%20processing/2019/11/04/NPLM(Neural-Probabilistic-Language-Model)/)에 비해 계산량이 확연히 줄어 빠른 학습이 가능해져 더 좋은 성능을 보인다. Word2vec에는 CBOW(Continuous Bag-of-Words)와 Skip-gram 이렇게 두 가지 모델이 있다.

<center><img width="606" alt="2019-10-26 (2)" src="https://user-images.githubusercontent.com/53667002/68114413-49ed0680-ff39-11e9-8dc4-fd8ca5b7cebe.png"></center>

Word2Vec에서 embedding공간 내에서 단어가 유사도를 나타내는 기준은 cosine similarity이다. 이는 두 vector사이의 각도를 이용하여 유사도를 구하는 방식이며 cosine similarity값이 1에 가까울 수록 유사도가 높은 것이다.

## CBOW(Continuous Bag Of Words Model)

CBOW는 context word(주변 단어)를 통해 center word를 예측하는 모델이다. CBOW에서는 우선 하나의 center word를 두고 몇 개의 context word를 볼 것인지 window size를 정한다. 따라서 window의 크기가 $m$이라면 center word 예측을 위해 참고하는 주변 단어의 개수는 $2m$개가 되는 것이다. 그리고 window를 sliding하며 train dataset을 만든다:

<center><img width="914" alt="2019-11-04 (3)" src="https://user-images.githubusercontent.com/53667002/68117000-8ae81980-ff3f-11e9-9b8b-3ad29e7b915d.png"></center>

해당 모델의 input(${ x }^{ (c) }$)은 one-hot-encoding된 context words이고 output($y$)은 one-hot-encoding된 center word이다:

<center><img width="649" alt="2019-11-04 (5)" src="https://user-images.githubusercontent.com/53667002/68119532-4dd35580-ff46-11e9-9262-2f571ace2297.png"></center>

## Architecture of CBOW

모델의 전체적인 구조가 진행되는 과정을 살펴보겠다.

<center><img width="586" alt="2019-11-04 (7)" src="https://user-images.githubusercontent.com/53667002/68124084-d0addd80-ff51-11e9-860e-6b040167f3cf.png"></center>

우선 하나의 center word에 대한 context words의 one-hot-vectors를 만든다:

$$(x^{ (c-m) },x^{ (c-m+1) },...,x^{ (c-1) },x^{ (c+1) },...x^{ (c+m-1) },x^{ (c+m) })\in\mathbb{R}^{|V|}$$

해당 모델의 파라미터는 input layer에서 hidden layer로 넘어가는 matrix $W$와 hidden layer에서 output layer로 넘어가는 matrix $W'$가 있다:

$$\mathbf{W}\in\mathbb{R}^{|V|\times N},~\mathbf{W}^{\prime}\in\mathbb{R}^{N\times |V|}$$

위에서 만든 one-hot-vectors와 파라미터를 내적하여 context에 대한 embedded word vectors를 얻는다($W$는 input words에 대한 $n$차원의 embedding된 단어 vector들의 집합이다.):

$$(v_{ (c-m) }=\mathbf{W}x^{ (c-m) },v_{ (c-m+1) }=\mathbf{W}x^{ (c-m+1) }...,v_{ (c+m) }=\mathbf{W}x^{ (c+m) })\in\mathbb{R}^n$$

Input의 형태가 one-hot-vector이니 input과 파라미터의 내적은 아래 그림과 같이 파라미터에서 각 단어에 대한 행(column)을 look up해 오는 것이다. 즉, 파라미터와 내적하여 embedding된 vector를 불러오는 것이다.

<center><img width="481" alt="2019-10-23 (5)" src="https://user-images.githubusercontent.com/53667002/68124829-96454000-ff53-11e9-9f77-ed17b74d8f72.png"></center>

앞서 얻은 Embedded vector들의 평균을 구하여 Hidden layer값을 구한다:

$$\hat{v}=\frac{v_{c-m}+v_{c-m+1}+\dotsm+v_{c+m}}{2m}\in\mathbb{R}^n$$

Hidden layer값에 $W'$를 내적하여 score값을 구한다: 

$$z=\mathbf{W'}\hat{v}\in\mathbb{R}^{|V|}$$

마지막으로 score값을 확률값으로 변환하기 위해 softmax를 적용시킨다:

$$\hat{y}=softmax(z)\in\mathbb{R}^{|V|}$$

##  Model Training

이제 $\hat{y}$(예측값)과 $y$(정답값)이 일치하는 방향으로 학습을 진행한다. 이는 파라미터들($W$, $W'$)의 학습을 통해 가능한데 학습을 위한 목적함수(objective function)는 loss fuction으로 cross entropy를 사용하여 다음과 같이 정의된다:

$$H(\hat{y},y)=-\sum^{|V|}_{j=1}y_j\log(\hat{y_j})$$

위에서 언급했 듯이 $y$는 하나의 one-hot-vector이다. 위 목적함수에서 $y_j$를 발견할 수 있는데 이 또한 하나의 one-hot-vector이기 때문에 위 수식을 더 간단히 하면 다음과 같이 표현될 수 있다:

$$H(\hat{y},y)=-y_i\log(\hat{y}_i)$$

학습은 위 식의 결과를 최소화하는 방향으로 진행되는데 $H$($loss$)가 0에 가까울수록 예측이 잘 된 것이다(위 수식에서 $i$가 예측하고자 하는 단어이다). 목적함수를 최소화 시키는 것을 표현한 수식은 다음과 같다:

$$
\begin{align*}
minimize J &=-\log P(w_c|w_{c-m},...,w_{c+m})\\
&=-\log P(u_c|v^)\\
&=-\log \frac{exp(u_c^{\intercal}\hat{v})}{\sum^{|V|}_{j=1}exp(u_j^{\intercal}\hat{v})}\\
&=-u_c^{intercal}\hat{v}+\log\sum^{|V|}_{j=1}exp(u_j^{\intercal}\hat{v})
\end{align*}
$$

$u_c$와 $v$를 최적화(optimization)시키는 방법으로 SGD(stochastic gradient descent)가 사용된다.

지금까지 학습 진행과정을 살펴보았다. 학습이 완료된 후에는 지금까지 학습시킨 파라미터 중 W를 embedded vector matrix로 사용한다.

## Reference

> Francois Chaubard, Michael Fang, Guillaume Genthial, Rohit Mundra, Richard Socher."CS224n: Natural Language Processing with Deep Learning: Part1,"(winter 2017)

> Tomas Mikolov, Kai Chen, Greg Corrado, Jeffrey Dean."Efficient Estimation of Word Representations in Vector Space,"(2013)

> Tomas Mikolov, Ilya Sutskever, Kai Chen, Greg Corrado, Jeffrey Dean."Distributed Representations of Words and Phrases and their Compositionality,"(2013)
