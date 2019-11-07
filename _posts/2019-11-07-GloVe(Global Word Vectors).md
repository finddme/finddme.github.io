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

위 수식은 center word $i$에 대해 context word $j$가 등장할 확률을 표현한 것이다. 해당 수식에서 $X_{ij}$는 context word $j$가 center word $i$가 속한 context에 등장한 횟수를 가리킨다.

**<center>미완성 게시물. 작성하다 맒.졸림...</center>**
