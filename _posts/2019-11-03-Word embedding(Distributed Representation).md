---
title: Word embedding(Distributed Representation)
category: Natural Language Processing
tag: NLP
---







* 목차
{:toc}









Word embedding은 단어의 유사도를 표현하지 못하는 one-hot-encoding이 지닌 몇 가지 문제점를 해결하기 위해 고안된 방법이다. one-hot-encoding은 해당 단어를 제외한 모든 단어를 0으로 표현하는 binary한 구조를 가져 데이터가 많아질 수록 차원이 매우 커지며 벡터가 굉장히 sparse해진다는 문제와 두 벡터의 내적이 0이 되어 단어들 간의 유사도 표현이 불가능 하다는 문제가 있다.

이러한 문제를 해결하기 위해 등장한 개념이 Word embedding인데 이는 분산 표상(distributed representation/Distributional similarity based representations)이라고도 불린다. 분산표상은 Distributional Hypothesis라는 언어학 개념으로부터 비롯되었다. 이 개념은 비슷한 분포를 가진 단어들은 의미 또한 비슷하다는 가정이다. 이러한 가정으로부터 착안된 분산 표상은 말 그대로 단어들의 유사도(similarity)를 기반으로 그들의 분포(Distributional)를 벡터 공간 안에 표현(representation)한 것이다. 간단히 말하자면 분산표상은 단어를 연속형의 실수값으로 표현함으로써 위에서 언급한 one-hot-encoding의 여러 문제점를 해결하였다. 앞서 언급했 듯이 분산표상은 단어 간의 유사도 정보를 포함하고 있기 때문에 다음 그림과 같이 유사한 의미를 지닌 단어들은 가깝게, 그렇지 않은 경우에는 멀게 배치 된다.

<center><img width="640" alt="2019-10-24 (1)" src="https://user-images.githubusercontent.com/53667002/68084458-177bd480-fe79-11e9-8b2a-413b2497d06a.png"></center>

## Embedding Vector

<center><img width="640" alt="2019-10-08 (1)" src="https://user-images.githubusercontent.com/53667002/68084504-d20bd700-fe79-11e9-81dd-ce2b93f789f9.png"></center>

word embedding의 결과는 위 그림과 같이 similarity를 기반으로 embedded된 값이 나온다. embedding된 벡터는 해당 단어와 함께 사용된 주변 단어들(context words)를 기반으로 나오기 때문에 해당 단어는 문법적, 개념적 의미(semantics of word meaning) 정보를 지닌 하나의 벡터가 된다. 예를 들어 “나는 카페에서 커피를 마시고 있다.”라는 문장에서 “커피”자리에는 예를 들어 “주스”나 “스무디”와 같이 그와 비슷한 품사와 의미를 지닌 단어가 들어갈 수 있을 것이다. 

<center><img width="240" alt="2019-11-03 (10)" src="https://user-images.githubusercontent.com/53667002/68084587-d4226580-fe7a-11e9-8d62-a1d342aafdcc.png"></center>

## Word embedding 학습 논리

Word embedding 학습 논리는 다음 수식을 통해 설명될 수 있다:


\begin{matrix}
p(context | w_t)=…
\end{matrix}


\begin{matrix}
J = 1- p({ { w }_ { -t } } | w_t)
\end{matrix}

이는 아래 수식과 같이 곧 Loss값으로, J가 0에 가까울수록 잘 예측한 것이고 1에 가까울수록 잘못 예측한 것이다. 따라서 loss값이 클수록 system내의 parameter값을 크게 조정하여 이후에 더 좋은 예측 결과를 내도록 하는 방식으로 진행된다.

## Reference

> Francois Chaubard, Michael Fang, Guillaume Genthial, Rohit Mundra, Richard Socher."CS224n: Natural Language Processing with Deep Learning: Part1,"(winter 2017)
