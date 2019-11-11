---
title: Attention in sequence to sequence
category: Natural Language Processing
tag: NLP
---

[이전 게시물](https://finddme.github.io/natural%20language%20processing/2019/11/11/Seq2Seq/)에서는 seq2seq모델에 대해 살펴보았다. 이제 seq2seq모델의 한계점 중 하나인 장기 기억력 문제를 해결하기 위해 고안된 Attention Mechanism을 seq2seq에 추가한 방식을 다룬 논문 '[NEURAL MACHINE TRANSLATION BY JOINTLY LEARNING TO ALIGN AND TRANSLATE](https://arxiv.org/abs/1409.0473)'에 대해 설명하도록 하겠다. Attention Mechanism은 현재 다양한 deep learning model에 활용되고 있지만 기계번역을 위한 seq2seq에 가장 처음 도입되어 소개되었다. 

기존 seq2seq모델에서는 Encoder에서 나온 모든 state값을 활용하지 않고 단순히 마지막에 나온 hidden vector를 하나의 고정된 context vector로 사용하였다. 이는 seq2seq model이 장기 기억 한계에 부딪힌 가장 큰 원인으로 볼 수 있다. 왜냐하면 context vector는 Encoder부분의 정보를 압축하고 있는 것인데 문장이 길어질 수록 정보 압축 시 정보 손실이 발생하기 때문이다. 이러한 문제를 해결하기 위해 고안된 Attention Mechanism에서는 Encoder에서 나온 각각의 state값을 모두 활용하여 Decoder부분에서 dynamic하게 context vector를 만들어 하나의 고정된 context vector의 사용으로 인해 발생한 seq2seq model의 문제를 해결하였다. 즉, 각각의 state 별로 context vector를 새롭게 만들어내 seq2seq model의 한계를 개선한 것이다. 

Attention Mechanism에 대한 이해를 돕기 위해 간단한 비유로 해당 Mechanism의 목적을 짚고 넘어가도록 하겠다. 인간이 대화를 하거나 문서를 읽는 것을 생각해보면 입력 정보 전체를 기억하지 않고 중요한 문장이나 단어에 집중하여 기억하고 이해한다. 이 처럼 어떤 것이 중요한지, “Attention”이라는 의미 그대로 중요한 것을 기억하며 학습하는 구조가 Attention Mechanism이다. 

## Architecture of Attention

<center><img width="875" alt="2019-11-12 (1)" src="https://user-images.githubusercontent.com/53667002/68604933-e04b9a00-04ee-11ea-8210-09872e86b178.png"></center>

이제 위 그림을 보며 Attention Mechanism의 진행 방식을 천천히 살펴보겠다.  

1\. 우선 Encoder는 Input $x_i$받아 그에 해당하는 hidden state vector $h_j$를 만든다. $h_j$는 정방향, 역방향 hidden state vector들을 concatenate하여 구한다.

2\. 구해진 $h_j$는 다시 attention score를 구하는 데에 사용된다. 수식을 살펴보면 $s_{i-1}$ 이 있는 것을 확인 할 수 있다. 이는 Decoder부분에서 나온 hidden state vector이다. 이전 step의 decoder hidden state vector와 현재 step의 encoder hidden vector를 linear function에 넣어 attention score를 구하는데 이는 이후 더 자세히 언급하도록 하겠다.

3\. 이제 구해진 attention score에 softmax를 적용하여 확률값을 도출해낸다. 여기에서 나온 확률 값이 attention weight이다. Attention weight는 현재 스텝에서 가장 중요하게 영향을 미친 부분에 가중치를 준 값이다. 이를 통해 Decoder가 어느 입력 부분에 집중해야 할지를 알려주는 것이다.

4\. 이제 지금까지 준비해온 정보들을 하나로 합치는 단계다. 어텐션의 최종 결과값을 얻기 위해 각 인코더의 hidden state와 방금 구한 attention weight값들을 각각 모두 곱하고, 최종적으로 모두 더한다. 즉, Weighted Sum을 한다. 

3번과 4번을 정리하자면, step별로 확률 값(이 값들의 총 합은 1이다)이 나오는데 이를 attention weight라 부른다. attention weight들이 나오면 각 step에 해당하는 encoder hidden vector을 곱한다. 예를 들어 h1x0.9라면 첫 번째 step에 90% focus한 값이 context vector로 나오게 된다. 이렇게 구해진 값이 바로 context vector(attention value)이다. 따라서 context vector가 각 step별로 decoding할 때마다 새롭게 나오게 되는 것이다.

5\. context vector를 구한 후에는 $s_{i−1}$  과 context vector를 우선 concatenate하고 Decoder연산을 한다(seq2seq decoder와 같다).

지금까지 Attention Mechanism을 진행 순서에 따라 살펴보았는데 이전에 언급한 바와 같이 Encoder의 각 step을 전부 활용하여 context vector에 적용되는 것을 볼 수 있다. 이는 seq2seq모델만 사용할 때 보다 더 방대한 양의 information을 함축하는 데에 있어 더 효율적이다. 

아래 수식은 

<center><img width="883" alt="2019-11-12 (3)" src="https://user-images.githubusercontent.com/53667002/68607454-fe67c900-04f3-11ea-8aa2-3a30ec087246.png"></center>

**<center>미완성 게시물. 너무 졸림.</center>**
