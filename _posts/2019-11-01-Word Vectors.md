---
title: How to represent words?( Word Vectors)
category: Natural Language Processing
tag: NLP
---







* 목차
{:toc}









컴퓨터는 숫자 연산으로 모든 것들을 이해하기 때문에 인간의 언어를 컴퓨터가 받아들이기 위해서는 컴퓨터가 연산할 수 있도록 숫자로 바꿔 주어야한다. 즉 단어를 벡터(vector)화 시켜야한다.

## One-Hot Vector

One-hot vector는 가장 간단하고 단순한 word vector이다. 전통적인 NLP에서 단어는 각각 개별적, 독립적인 entity으로 다뤄졌다. 따라서 각 단어에 유일한 벡터를 부여했는데 이 방식을 one-hot-encoding이라고 한다. 이는 해당 단어에는 (1)bit를, 나머지에는 모두 (0)bit를 할당하여 ${ R }^{ v×M }$벡터로 표현하는 방식이다($v=$ 해당 언어의 어휘사전 크기). 즉, vector공간 안에 한 단어를 독립적이고 유일한 존재로 하나의 1과 여러 0들로([0 0 0 0 0 0 1 0 0 0 0 0 0]) 표현하는 방식이다. 이는 rule-based/count-based NLP라고도 불린다. 이러한 encoding방식으로 나타낸 word vector는 아래 그림과 같은 형태를 띄게 된다:

<center><img width="600" alt="Word Vectors" src="https://user-images.githubusercontent.com/53667002/68001607-23646c80-fca8-11e9-80d7-0462d8cf2d4e.png"></center>

one-hot-vector로 단어를 표현하게 되면 다음과 같이 여러 문제점들이 발생한다:

1\. 차원(dimension/space)이 단어 활용 상황에 따라 기하급수적으로 늘어난다. 단어 하나를 표현한 벡터의 크기가 크면 연산량이 늘어나기 때문에 문장 하나를 처리하는 것도 어려운 과제가 될 것이다. 

2\. 두인간은 언어를 구사할 때 미세한 뉘앙스도 함께 전달하는데 one-hot-vector로 단어를 표현하면 단어들 간의 미세한 뉘앙스 차이를 놓치게 된다. 

3\. 언어는 매일매일 변화하며 무수히 많은 새로운 단어가 생겨나는데 위와 같이 만들어진 단어 사전에 매번 새로운 단어를 업데이트할 수 없다는 문제가 있다. 지속적으로 업데이트를 하더라도 사람이 직접 기록하는 것이기 때문에 기록자의 주관적인 생각이 개입될 수 있다는 것도 또다른 문제 중 하나이다.

4\. 마지막으로 인간의 언어에서 단어 간의 관계는 중요한 정보 중 하나인데 one-hot-vector는 단어 간 유사성에 대한 정보를 담아내지 못한다. 즉, 단어가 지닌 고유의 개념과 내재적 개념(=의미, inherent notion)를 담아내지 못한다. 

위에서 언급된 마지막 문제점이 one-hot vector가 지닌 가장 큰 한계라 말할 수 있다. 연관 검색어를 생각해 보면 이것이 왜 문제인지 이해될 것이다. 예를 들어 사용자가 ‘신촌 카페’를 검색했을 때 신촌에 있는 카페 뿐만 아니라 찻집까지 함께 검색해 준다면 사용자가 앉아서 쉬며 음료를 마실 수 있는 장소를 더 많이 검색해 볼 수 있게 될 것이다.  하지만 one-hot-vector를 사용한다면 ‘카페’와 ‘찻집’간의 유사도 정보를 담지 못하기 때문에 이것이 불가능하다. 

<center><img width="200" alt="2019-11-01" src="https://user-images.githubusercontent.com/53667002/68002511-8ce67a00-fcac-11e9-82b4-5487bf11d43e.png"></center>

one-hot-encoding은 이렇게 단어 벡터가 굉장히 크며 sparse하고 단어 간의 유사도도 나타낼 수 없다는 단점을 지니고 있다. 따라서 지금까지 설명한 문제점들을 해결하기 위해 우선 차원의 크기를 ${ R }^{ v×M }$보다 작게 만들어야 하고 단어들 간의 연관성을 나타내는 subspace를 찾아서 encode하는 방식을 찾아야한다.

이후 게시물에서 차원문제와 유사도문제를 해결한 방안들을 소개하도록 하겠다.

## Reference

> Francois Chaubard, Michael Fang, Guillaume Genthial, Rohit Mundra, Richard Socher."CS224n: Natural Language Processing with Deep Learning: Part1,"(winter 2017)
