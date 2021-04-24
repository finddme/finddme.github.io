---
title: Coreference Resolution
category: Coreference Resolution / Zero-Anaphora Resolution
tag: Coreference Resolution / Zero-Anaphora Resolution
---

## 1. Architectures for Coreference Algorithms

coreference에 대한 세 가지 일반적인 아키텍쳐는 mention-pair, mention-rank, 그리고 entity-based로 각각 feature-based 혹은 neural classifier를 사용할 수 있다. 이번 장에서는 우선 feature-based 알고리즘에 대해서 설명하겠다.

따라서 이번 장에서는 categorization을 사용한 시스템의 다양한 architecture를 개괄적으로 살펴본다. 알고리즘은 크게 entity-based(담화모델에서 각 개체를 나타내는 방식으로 coreference를 결정)인지, mention-based(각 mention을 독립적으로 고려하는 방식으로 coreference를 결정)인지 혹은 잠재적 선행사를 직접적으로 비교하기 위해서 ranking model을 사용하는지의 여부에 따라 구분된다. 

## 1.1 The Mention-Pair Architecture

먼저 mention-based algorithm인 mention-pair architecture에 대해서 살펴보겠다. mention-pair architecture는 이름에서도 알 수 있듯이 한 쌍의 mention, candidate anaphor그리고 candidate antecedent(후보선행사)가 주어지는 classifier를 기반으로 하며, binary classification(이항분류; corefering하는지 안 하는지)를 통해 결론을 도출한다. 

<ceter><strong>Victoria Chen</strong>, CFO of <strong>Megabucks Banking</strong>, saw <strong>her pay</strong> jump to $2.3 million, as <strong>the 38-year-old</strong> also became the company’s president. It is widely known that <strong>she</strong> came to Megabucks from rival Lotsabucks.</center>

위 예문에 이 classifier의 task를 대입해보면 그림 22.2와 같이 된다. 이것은 예문에 있는 대명사 she와 그에 대한 잠재적 선행사 mention이 이루는 쌍에 대해 coreference link의 확률을 할당하는 것을 보여주는 그림이다. 

<center><img width="772" alt="2021-04-24" src="https://user-images.githubusercontent.com/53667002/115947851-79b11500-a505-11eb-9c90-740061cfe251.png"></center>

여기에서 각각의 *Victoria Chen*, *Megabucks Banking*, *her*과 같은 prior mention에 대해 binary classifier는 *she*의 선행사가 그 mention인지 아닌지 확률을 계산한다. 여기에서 우리는 이 확률을 실제 선행사(*Victoria Chen*, *her*, *the 38-year-old*)에 대해서는 높이고 선행사가 아닌 것(*Megabucks Banking*, *her pay*)에 대해서는 낮춰야 한다. 

### 1.1.1 Training

훈련을 위해서는 training samples를 선택해야 하는데 이때 문서의 대부분 mention쌍은 corefernent가 아닌데 이것을 다 훈련 샘플로 선택하면 너무 많은 negative sample이 생기기 때문에 heuristic method가 필요하다. 가장 일반적인 heuristic은 positive example로 가장 가까운 선행사를 택하고, 그 사이에 있는 모든 쌍들은 negative example로 선택하는 것이다. 이것을 조금 formal하게 표현하자면, anaphor mention $m_i$에 대해서

- $m_j$는 $m_i$의 가장 가까운 선행사인 positive instance($m_i$, $m_j$)를 만들고,
- $m_j$와 $m_i$사이에 있는 $m_k$에 대한 negative instance ($m_i$, $m_k$)를 만든다.

### 1.1.2 Clustering

Classifier가 훈련되고 나면 clustering단계에서 test sentence에 적용된다. clustering에는 두 가지 과정이 있다:  closest-first clustering과 best-first clustering.

**- closest-first clustering**  
closest-first clustering에서 classifier는 오른쪽에서 왼쪽으로, 즉 mention $i-1$에서 mention 1까지로 실행된다. 그리고 확률 0.5가 넘는 first antecedent는 $i$와 연결된다. 선행사가 확률 0.5를 넘지 못하는 경우에는 $i$에 대한 선행사가 선택되지 않는다. 

**- best-first clustering**  
best-first clustering에서 classifier는 모든 선행사들에 대해서 실행되는데, 가장 유력한 antecedent mention이 $i$의 선행사로 선택된다.

### 1.1.3 Problems

mention-pair model은 단순하다는 장점이 있지만 두 가지 주요한 문제가 있다.

1) classifier가 직접적으로 후보 선행사들을 비교하지 못한다. 따라서 두 선행사 사이에서 실제로 더 나은 것이 무엇인지 결정하는 훈련이 이루어지지 못한다.

2) 담화 모델을 무시하며, entity가 아닌 단지 mention만을 살핀다. 각 classifier decistion은 동일한 entity의 다른 mention들을 고려하지 않고 한 쌍에 대해서만 완전히 국부적으로 이루어진다. 


## 1.2 The Mention-Rank Architecture

Mention-Rank Architecture는 mention-pair model의 결점을 보완한 model이다. mention-pair model의 단점 중 하나는 선행사 후보를 직접적으로 비교하지 않는다는 것이다. mention-ranking model은 이를 보완하여 선행사 후보를 직접적으로 비교하며 각 anaphor에 대해서 높은 점수의 선행사를 선택한다.

mention-ranking systems에서는 mention(anaphor)에 $i-1$에서 1까지, 그리고 여기에 추가적으로 선행사가 없다는 것까지 고려하기 위한 dummy mention $\epsilon$까지의 범위에 걸쳐 관련된 랜덤 변수 $y_1$을 가진다. dummy mention $\epsilon$은 discourse-new나 새로운 coref chain의 시작 혹은 non-anaphoric을 나타낸다.

<center><img width="708" alt="2021-04-24 (1)" src="https://user-images.githubusercontent.com/53667002/115948910-f646f200-a50b-11eb-8cae-c32a364c66c0.png"></center>

그림 22.3은 single candidate anaphor she에 대한 계산 예를 보여준다. mention-ranking system은 후보 anaphoric mention *she*에 대해 이전의 모든 mention들, 그리고 추가적으로 특수한 dummy mention $\epsilon$에 대해 소프트맥스를 계산하여 확률분포를 할당한다(각 후보 선행사들에 대한 확률을 구한다).

이전의 mention-pair model의 훈련은 단순했는데, mention-ranking model의 훈련은 비교적 까다롭다. 왜냐하면 mention-pair model에서는 positive-sample / negative-sample을 만들어서 훈련에 사용되는 sample pair를 다 알았는데, mention-ranking model은 각 anaphor에 대해서 훈련을 위해 사용할 수 있는 모든 gold antecedent들을 알 수 없기 때문이다. 

대신 각 mention에 대한 best antecedent는 잠재되어 있다; 즉 각 mention에 대해서 선택할 수 있는 legal gold antecednet의 전체 클러스터를 가지고 있다.

이런 잠재된 선행사를 모델링하는 다양한 방법들이 존재하는데, 이는 3장에서 상세히 다룰 것이다. 

Mention-ranking model 은 hand-build feature와 neural representation learning 둘 다를 통해 구현될 수 있느데, 전자는 2장에서, 후자는 3장에서 자세히 다룰 것이다.

## 1.3 Entity-based Models

앞서 소개한 mention-pair model과 mention-ranking model 둘 다 mention-based algorithm이었고, 이번에 소개할 모델은 entity-based model이다. 

**- entity-based model**  
entity-based model은 각 mention을 이전 mention이 아닌 이전 담화 개체(mentions들의 cluster)에 연결한다.  

**- entity-ranking model**  
entity-ranking model은 단순히 mention-ranking model에서 classifier가 개별 mention들이 아니라 mention들의 cluster들에 대해 결정을 내리게 한 것이다. 

entity-based model도 mention-ranking model처럼 feature-based model과 neural model 둘 다를 통해 구현될 수 있는데, 이전의 모델들보다 표현력이 더 뛰어나지만 cluster-level 정보를 이용하는 것이 실제로 큰 성능 향상으로 이어지지 않았기 때문에 mention-ranking model이 여전히 더 많이 사용된다. 그래서 entity-based model은 간단하게만 소개하고 넘어가도록 하겠다. 

> feature-based model의 경우 클러스터에서 feature를 추출하여 이를 수행할 수 있다.  
Neural model은 cluster의 representation(cluster를 vector로 표현하는 것)을 자동으로 학습할 수 있다. 예를 들어 cluster representation에 해당하는 상태를 인코딩하기 위해 일련의 cluster mention에 대해 RNN을 이용하거나, mention pair의 학습된 representation에 대해 pooling하여 cluster쌍에 대한 distiributed(dense) representation을 학습한다.  
>> 'Distiributed'라는 말이 붙는 이유는 하나의 정보가 여러 차원에 분산되어 표현되기 때문이다. 하나의 차원이 여러 속성들이 버무려진 정보를 들고 있다. 즉, 하나의 차원이 하나의 속성을 명시적으로 표현하는 것이 아니라 여러 차원들이 조합되어 나타내고자 하는 속성들을 표현하는 것이다.

## 4. Classifiers using hand-built features





## Reference

> Daniel Jurafsky and James H. Martin. 2019. Speech and Language Processing, 3rd Edition.  

> https://web.stanford.edu/~jurafsky/slp3/
