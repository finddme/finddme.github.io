---
title: Attention in sequence to sequence
category: Natural Language Processing
tag: NLP
---

[이전 게시물](https://finddme.github.io/natural%20language%20processing/2019/11/11/Seq2Seq/)에서는 seq2seq모델에 대해 살펴보았다. 이제 seq2seq모델의 한계점 중 하나인 장기 기억력 문제를 해결하기 위해 고안된 Attention Mechanism을 seq2seq에 추가한 방식을 다룬 논문 '[NEURAL MACHINE TRANSLATION BY JOINTLY LEARNING TO ALIGN AND TRANSLATE](https://arxiv.org/abs/1409.0473)'에 대해 설명하도록 하겠다. Attention Mechanism은 현재 다양한 deep learning model에 활용되고 있지만 기계번역을 위한 seq2seq에 가장 처음 도입되어 소개되었다. 

기존 seq2seq모델에서는 Encoder에서 나온 모든 state값을 활용하지 않고 단순히 마지막에 나온 hidden vector를 하나의 고정된 context vector로 사용하였다. 이는 seq2seq model이 장기 기억 한계에 부딪힌 가장 큰 원인으로 볼 수 있다. 왜냐하면 context vector는 Encoder부분의 정보를 압축하고 있는 것인데 문장이 길어질 수록 정보 압축 시 정보 손실이 발생하기 때문이다. 이러한 문제를 해결하기 위해 고안된 Attention Mechanism에서는 Encoder에서 나온 각각의 state값을 모두 활용하여 Decoder부분에서 dynamic하게 context vector를 만들어 하나의 고정된 context vector의 사용으로 인해 발생한 seq2seq model의 문제를 해결하였다. 즉, 각각의 state 별로 context vector를 새롭게 만들어내 seq2seq model의 한계를 개선한 것이다. 

Attention Mechanism에 대한 이해를 돕기 위해 간단한 비유로 해당 Mechanism의 목적을 짚고 넘어가도록 하겠다. 인간이 대화를 하거나 문서를 읽는 것을 생각해보면 입력 정보 전체를 기억하지 않고 중요한 문장이나 단어에 집중하여 기억하고 이해한다. 이 처럼 어떤 것이 중요한지, “Attention”이라는 의미 그대로 중요한 것을 기억하며 학습하는 구조가 Attention Mechanism이다. 

## Architecture of Attention

<center><img width="1600" alt="2019-11-12 (1)" src="https://user-images.githubusercontent.com/53667002/68604933-e04b9a00-04ee-11ea-8210-09872e86b178.png"></center>

이제 위 그림을 보며 Attention Mechanism의 진행 방식을 천천히 살펴보겠다.  

1\. 우선 Encoder는 Input $x_i$받아 그에 해당하는 hidden state vector $h_j$를 만든다. $h_j$는 정방향, 역방향 hidden state vector들을 concatenate하여 구한다.

2\. 구해진 $h_j$는 다시 attention score를 구하는 데에 사용된다. 수식을 살펴보면 $s_{i-1}$ 이 있는 것을 확인 할 수 있다. 이는 Decoder부분에서 나온 hidden state vector이다. 이전 step의 decoder hidden state vector와 현재 step의 encoder hidden vector를 linear function에 넣어 attention score를 구하는데 이는 이후 더 자세히 언급하도록 하겠다.

3\. 이제 구해진 attention score에 softmax를 적용하여 확률값을 도출해낸다. 여기에서 나온 확률 값이 attention weight이다. Attention weight는 현재 스텝에서 가장 중요하게 영향을 미친 부분에 가중치를 준 값이다. 이를 통해 Decoder가 어느 입력 부분에 집중해야 할지를 알려주는 것이다.

4\. 이제 지금까지 준비해온 정보들을 하나로 합치는 단계다. 어텐션의 최종 결과값을 얻기 위해 각 인코더의 hidden state와 방금 구한 attention weight값들을 각각 모두 곱하고, 최종적으로 모두 더한다. 즉, Weighted Sum을 한다. 

3번과 4번을 정리하자면, step별로 확률 값(이 값들의 총 합은 1이다)이 나오는데 이를 attention weight라 부른다. attention weight들이 나오면 각 step에 해당하는 encoder hidden vector을 곱한다. 예를 들어 h1x0.9라면 첫 번째 step에 90% focus한 값이 context vector로 나오게 된다. 이렇게 구해진 값이 바로 context vector(attention value)이다. 따라서 context vector가 각 step별로 decoding할 때마다 새롭게 나오게 되는 것이다.

5\. context vector를 구한 후에는 $s_{i−1}$  과 context vector를 우선 concatenate하고 Decoder연산을 한다(seq2seq decoder와 같다).

지금까지 Attention Mechanism을 진행 순서에 따라 살펴보았는데 이전에 언급한 바와 같이 Encoder의 각 step을 전부 활용하여 context vector에 적용되는 것을 볼 수 있다. 이는 seq2seq모델만 사용할 때 보다 더 방대한 양의 information을 함축하는 데에 있어 더 효율적이다. 

아래는 두 번째 단어 예측 시 적용되는 수식을 풀어 놓은 것이다:

<center><img width="800" alt="2019-11-12 (3)" src="https://user-images.githubusercontent.com/53667002/68607454-fe67c900-04f3-11ea-8aa2-3a30ec087246.png"></center>

### - Attention score

<img width="280" alt="2019-11-12 (5)" src="https://user-images.githubusercontent.com/53667002/68649276-9d78d900-0565-11ea-915b-38d4a06cf85f.png">

Attention score는 어떤 입력 step에 집중할 것인가에 대한 정보를 담고 있는 점수이다. Attention score에 관련된 식을 이해하기 위해 우선 해당 수식의 첨자를 이해해야한다. 위 수식을 보면 $i$와 $j$, 두 첨자가 존재하는 것을 확인할 수 있다. 먼저 첨자 $i$는 context vecore, decoder hidden state, output을 순차적으로 구할 때 해당 step에 대한 위치 정보가 반영된 첨자이다. 쉽게 말해 예측하려는 것에 대한 위치 정보이다. 그리고 첨자 $j$는 hidden state와 x에 대한 정보를 담고 있는 첨자이다.

그리고 함수$a$는 이전 step의 decoder hidden state vector와 현재 step의 encoder hidden vector가 들어가는 linear function이다. 이는 아래와 같이 굉장히 다양한 방식이 제시된 상태이다:

<center><img width="800" alt="2019-09-18 (1)" src="https://user-images.githubusercontent.com/53667002/68649711-b209a100-0566-11ea-90b1-727557a79c64.png"></center>

### - Decoder hidden state

<img width="280" alt="2019-11-12 (7)" src="https://user-images.githubusercontent.com/53667002/68650805-3d843180-0569-11ea-99e2-2c51226d5c4b.png">

이 부분이 Attention을 적용한 seq2seq의 가장 핵심 부분으로 볼 수 있다. Decoder의 hidden state값은 이전 Decoder hidden state와 직전 step의 output 그리고 Attention output vector를 이용하여 출력하는데 위에 제시된 두 수식을 보면 fixed-length vector가 attention mechanism 적용 후 각 index마다 다르게 반영된다는 것을 알 수 있다.

## Experiment

### - Dataset

해당 모델의 성능 평가를 위해 시행한 실험에 대해 간단히 언급하겠다. 성능 평가를 위한 실험으로 영어-프랑스어 번역을 과제로 삼았으며 dataset은 WMT’14 English-French corpora(totaling 850M words)이다. 그리고 데이터 크기를 줄이기 위해 [data selection method (by Axelrod et al. (2011))](http://www-lium.univ-lemans.fr/˜schwenk/cslm_joint_paper/)를 이용했으며, 이전에 언급한 parallel corpora이외에 monolingual data는 사용하지 않았다.

### - Result

<center><img width="712" alt="2019-09-18 (2)" src="https://user-images.githubusercontent.com/53667002/68652653-4a0a8900-056d-11ea-8a58-df3078f20670.png"></center>

## Reference

> Dzmitry Bahdanau, KyungHyun Cho."NEURAL MACHINE TRANSLATION BY JOINTLY LEARNING TO ALIGN AND TRANSLATE,"ICLR(2015)
