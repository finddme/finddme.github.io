---
title: NPLM(Neural Probabilistic Language Model)
category: Natural Language Processing
tag: NLP
---







* 목차
{:toc}









NPLM은 신경망을 이용하여 단어를 embedding하는 단어의 분산표상(distributed representation)방식 중 하나로 간단히 만하면 N-gram model이다. 즉 NPLM은 NPLM 모델은 앞서 나온 N개의 단어를 통해 다음 단어를 예측하는 방식으로 학습하는 모델이다. 아래 수식은 모델의 출력에 대한 수식인데 해당 식에 정의된 조건부 확률을 최대화하도록 학습하는 것이 NPLM모델이다.


\begin{matrix}
P({ w }_ { t }|{ w }_ { t-1 },...,{ w }_ { t-n+1 })=\frac { exp({ y }_ { { w }_ { t } }) }{ \sum _ { i }^{  }{ exp({ y }_ { i }) } }
\end{matrix}


위 식에 정의된 조건부 확률을 높이기 위해서는우변의 분자 부분에 해당하는 벡터값은 높이고 분모의 벡터값은 낮춰야 한다. 벡터 $y_{w_t}$는 해당 단어$w_t$에 대한 score vector로, 코퍼스 전체 단어수($V$)에 따라 차원이 결정된다. 따라서 우변은$V$차원의 score vector $y_{w_t}$에 softmax함수를 적용한 확률 벡터이다.

NPLM의 입력벡터($x_t$)는 다음 식을 통해 만들어진다.


\begin{matrix}
x_t=C(w_t)
\end{matrix}


위 식에서 $w_t$는 문장 내 $t$번째 단어에 대한 one-hot-vector이고 $C$는 전체단어 $V$개에 대한 embedding결과이다. 따라서 one-hot-vector와 행렬$C$의 내적은 아래 그림과 같이 행렬$C$에서 해당 단어에 해당하는 행(column)을 **look up**해 오는 것이라 말할 수 있다. 즉, 행렬 $C$는 embedding된 단어 vector들의 집합이며 one-hot-vector($w_t$)는 embedding된 벡터를 불러오는 역할을 하는 것이다.($C$는 초기에 랜덤으로 만든다.)

<center><img width="481" alt="2019-10-23 (5)" src="https://user-images.githubusercontent.com/53667002/68085343-5e6ec780-fe83-11e9-9bbf-d8598f24942f.png"></center>

## Architecture of NPLM

<center><img width="800" alt="2019-11-03 (12)" src="https://user-images.githubusercontent.com/53667002/68085763-c7f0d500-fe87-11e9-8cba-c908678274e1.png">
</center>

NPLM의 구조를 보면 크게 input layer와 hidden layer 그리고 output layer가 있다. 설명을 위해 간단한 예를 들겠다. “퇴근 시간 서울역은 최악이다”라는 문장에서 [퇴근], [시간], [서울역은] 이렇게 세 개의 단어가 주어진 경우에 [최악이다]라는 단어를 예측한다고 가정하겠다. 이때 Input layer에서는 우선 주어진 세 개의 벡터에 대해 행렬$C$와 내적한다. 이후 내적하여 나온 값들을 concatenate하면 입력 벡터 $x$가 만들어진다. 입력 벡터 $x$에 대한 정의는 다음과 같다:


\begin{matrix}
x=\[{ { x }_ { t-1 } },{ { x }_ { t-2 } },… ,{ { x }_ { t-n+1 } }]
\end{matrix}


위 식에서 $n$은 n-gram의 개수이다. 즉 예측 대상 단어를 포함한 단어의 개수이고 $t$는 문장 내에서 해당 단어가 등장한 순서를 나타낸다. 이렇게 구한 $x$를 $H$와 내적한 뒤 bias term ’$d$’를 더한 후 tanh를 적용시켜 hidden layer를 만들고, 거기에 $U$를 내적한 후,  bias term ’$b$’를 더해주면 $y_{w_t}$가 구해진다:


\begin{matrix}
{ y }_ { { w }_ { t } }=b+U\cdot tanh(d+H_x)
\end{matrix}


마지막으로 $y_{w_t}$($N$개의 단어가 나왔을 때 예측한 다음 단어)에 softmax함수를 적용한 뒤 정답 단어의 index와 비교하여 역전파(backpropagation)하는 방식으로 학습이 이루어진다. 여기에서 loss를 줄이는 loss-function으로는 cross-entropy를 사용한다. 최종 목표는 $C$를 학습시키는 것이라고 말할 수 있다.

## Parameter

학습 파라미터를 정리하면 아래와 같다:

<center><img width="505" alt="2019-10-24 (4)" src="https://user-images.githubusercontent.com/53667002/68085609-04233600-fe86-11e9-99aa-32b4c894a374.png"></center>

여기에서 사실 $U$가 뭔지, $H$가 뭔지 $b$가 뭔지 $d$가 뭔지 모르겠지만, 일단 학습 파라미터가 엄청 많다는 것은 확실히 알 수 있다. 학습 파라미터를 보면 행렬C이외에도 $H$, $U$, $b$, $d$등도 학습해야 하기에 계산의 복잡성이 높다. 이는 학습량을 늘려 학습을 느리게하는 원인이 된다. 따라서 이후 제안된 Word2vec같은 단어 임베딩 기법에서는 학습 파라미터를 줄이고 그의 품질은 높이는 방향으로 발전한다.

## Reference

> Yoshua Bengio, Réjean Ducharme, Pascal Vincent, Christian Jauvin."A Neural Probabilistic Language Model,"(2003)

> Lee,Gichang.Sentence embeddings using korean corpora.seoul:acornpub,2019
