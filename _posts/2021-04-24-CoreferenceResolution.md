---
title: Coreference Resolution | Speech and Language Processing(Daniel Jurafsky and James H. Martin, 2019)
category: Coreference Resolution / Zero-Anaphora Resolution
tag: Coreference Resolution / Zero-Anaphora Resolution
---






* 목차
{:toc}









## 1. Architectures for Coreference Algorithms

coreference에 대한 세 가지 일반적인 아키텍쳐는 mention-pair, mention-rank, 그리고 entity-based로 각각 feature-based 혹은 neural classifier를 사용할 수 있다. 이번 장에서는 우선 feature-based 알고리즘에 대해서 설명하겠다.

따라서 이번 장에서는 categorization을 사용한 시스템의 다양한 architecture를 개괄적으로 살펴본다. 알고리즘은 크게 entity-based(담화모델에서 각 개체를 나타내는 방식으로 coreference를 결정)인지, mention-based(각 mention을 독립적으로 고려하는 방식으로 coreference를 결정)인지 혹은 잠재적 선행사를 직접적으로 비교하기 위해서 ranking model을 사용하는지의 여부에 따라 구분된다. 

## 1.1 The Mention-Pair Architecture

먼저 mention-based algorithm인 mention-pair architecture에 대해서 살펴보겠다. mention-pair architecture는 이름에서도 알 수 있듯이 한 쌍의 mention, candidate anaphor그리고 candidate antecedent(후보선행사)가 주어지는 classifier를 기반으로 하며, binary classification(이항분류; corefering하는지 안 하는지)를 통해 결론을 도출한다. 

<center><strong>Victoria Chen</strong>, CFO of <strong>Megabucks Banking</strong>, saw <strong>her pay</strong> jump to $2.3 million, as <strong>the 38-year-old</strong> also became the company’s president. It is widely known that <strong>she</strong> came to Megabucks from rival Lotsabucks.</center>
<br>
위 예문에 이 classifier의 task를 대입해보면 그림 22.2와 같이 된다. 이것은 예문에 있는 대명사 she와 그에 대한 잠재적 선행사 mention이 이루는 쌍에 대해 coreference link의 확률을 할당하는 것을 보여주는 그림이다. 

<center><img width="700" alt="2021-04-24" src="https://user-images.githubusercontent.com/53667002/115947851-79b11500-a505-11eb-9c90-740061cfe251.png"></center>

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

## 2. Classifiers using hand-built features

이번 장에서는 coreference resolution을 위해 logistic regression, SVM 또는 random forest classifier에서 일반적으로 사용되는 feature들에 대해 기술한다. 

anaphor mention과 potential antecedent mention이 있을 때 대부분의 feature based classifier는 세 가지 유형의 feature를 사용한다:

1) anaphor에 대한 feature,  
2) 선행사 후보에 대한 feature,  
3) 쌍 사이의 관계에 대한 feature.

Entity-based model은 추가적으로 두 개의 클레스를 더 사용할 수 있다:

4) 선행사의 개체 클러스터로부터 온 모든 mention들에 대한 feature,  
5) 선행사 entity cluster의 mention과 anaphor간의 관계에 대한 feature.


그림 22.4는 일반적으로 사용되는 feature들을 보여준다. 앞서 사용한 예문에서 잠재적 anaphor *she*와 잠재적 선행사 *Victoria Chen*에 대한 것이다. 노란색 박스로 표시된 것은 이전 연구에서 특히 유용하다고 밝혀진 feature이고 파란색 박스로 표시된 것은 neural model에 사용했을 때 도움이 될 수 있는 feature이다. 

<center><strong>Victoria Chen</strong>, CFO of <strong>Megabucks Banking</strong>, saw <strong>her pay</strong> jump to $2.3 million, as <strong>the 38-year-old</strong> also became the company’s president. It is widely known that <strong>she</strong> came to Megabucks from rival Lotsabucks.</center>
<br>

<center><img width="700" alt="2021-04-24 (2)" src="https://user-images.githubusercontent.com/53667002/115949916-15954d80-a513-11eb-9d57-061d07c9413f.png"></center>

> 위는 Aanphor나 선행 mention에 대한 feature들이다. 

<center><img width="700" alt="2021-04-24 (3)" src="https://user-images.githubusercontent.com/53667002/115950101-35794100-a514-11eb-82a5-9571f8bd3f04.png"></center>

> 위는 선행사 entity에 대한 feature(여기에서는 *she*에 대한 선행사니까 *Victoria Chen*, *her*, *the 38-year-old*에 대한 것; 그래서 Antecedent cluster size가 3)이다. 

<center><img width="700" alt="2021-04-24 (4)" src="https://user-images.githubusercontent.com/53667002/115950286-470f1880-a515-11eb-9ad5-d86172e1c480.png"></center>

> 위는 mention쌍에 대한 feature이다.   
Longer anaphor는 anaphor가 선행사보다 기냐  
Paris of any features는 선행사 + anaphor 유형쌍에 대한 각 feature. 어떤 feature든 선행사 + anaphor쌍으로.  
Sentence distance는 선행사와 anaphor 사이에 있는 문장 수  
Mention distance는 선행사와 anaphor 사이에 있는 mention 수  
i-within-i는 어떠한 mention이 다른 mention에 포함되어 있으며 두 mention의 reference가 같은 것.  
Appositive 동격(앞의 내용을 명사구나 다른 명사를 사용해 정의하거나 설명하는 것). anaphor가 선행사와 동격관계에 있는 경우. 이것은 mention들이 동격어가 아닌 경우에도 유용하다. 동격어를 선행 헤드와 연결하는 것을 알기 위해.  

<center><img width="700" alt="2021-04-24 (5)" src="https://user-images.githubusercontent.com/53667002/115950332-8e95a480-a515-11eb-8a40-fe3b74cb1015.png"></center>

> 위는 entity쌍에 대한 feature이다.
Exact String Match는 determiner와 modifier를 모두 포함하여 정확히 동일한 텍스트를 포함하는 경우에만 두 mention을 연관시키는 것이다. 즉 선행사와 anaphor cluster에 있는 아무 두 mention의 string(문자열)이 같으냐  
Head Word Match는 선행사 cluster에 있는 mention과 anaphor cluster의 mention이 같은 headword를 가지냐  
Word Inclusion는 선행사 cluster에 있는 단어가 anaphor cluster에 있는 모든 단어를 포함하냐

> 그 아래에 문서에 대한 feature는 장르가 뭔지에 대한 것이다. 

feature-based system에서 feature들의 결합을 사용하는 것은 중요하다고 한다. 한 실험에서는 classifier의 개별 feature들을 사용한 것과 다중 feature의 결합을 사용했을 때를 비교해 봤을 때 결합한 것의 F1 score가 4점 높았다고 한다.

## 3. A neural mention-ranking algorithm

초기 classifier들은 2장에서 소개한 hand-built feature를 사용했고, 보다 최근의 classifier들은 지금 소개할 neural representation learning을 사용한다.

이번 장에서는 Lee et al. (2017b)의 neural mention-ranking system에 대해 기술하겠다. 이 [end-to-end system](https://finddme.github.io/machine%20learning,%20deep%20learning/2020/10/01/TransferLearning/)은 별도의 mention-detection단계를 가지고 있지 않다. 대신 가능한 모든 텍스트 범위를 설정된 length(예를 들어 길이 1, 2, 3, ... N의 모든 n-gram)까지를 가능한 mention으로 간주한다(Lee의 논문에서는 length를 10으로 설정했다).

<center><img width="900" alt="2021-04-24 (6)" src="https://user-images.githubusercontent.com/53667002/115956461-b8f85980-a537-11eb-82cf-ca86671672bd.png"></center>

그림 22.5는 span representation과 mention score에 대한 계산을 보여준다. 

<center><img width="900" alt="2021-04-24 (12)" src="https://user-images.githubusercontent.com/53667002/115960032-28774480-a54a-11eb-885b-d2b2ff475ff9.png"></center>

그림 22.6은 그림 22.5의 예시 문장에서 *the company*의 가능한 세 가지 선행사에 대한 score $s$를 계산하는 것을 보여준다. 

<center><img width="900" alt="2021-04-24 (8)" src="https://user-images.githubusercontent.com/53667002/115956541-505dac80-a538-11eb-91df-7071aa51cbda.png"></center>

위 부분을 살펴보기 위해 나중에 계산될 span representations $g_i$에 대해서 잠시 얘기하도록 하겠다. span representations $g_i$는 스팬에서의 첫 번째 단어와 마지막 단어의 contextual representation 그리고 스팬에 있는 headword에 대한 representation 그리고 feature 하나로 구성된다.

여기에서 스팬의 첫 번째 단어와 마지막 단어의 contextual representation이 standard biLSTM으로 계산된다.

그리고 biLSTM은 ELMo와 같은 contextual word embedding을 기반으로 해서 각 단어에 대한 representation $w_t$를 input으로 받는다 (ELMo대신 BERT를 사용하면 성능이 훨씬 향상된다).

그러니까 biLSTM은 $w_t$를 input으로 받아서 output으로 $h_t$를 내는 것이다. 

<center><img width="900" alt="2021-04-24 (11)" src="https://user-images.githubusercontent.com/53667002/115956759-98c99a00-a539-11eb-8a3c-bc24cc2a4c8c.png"></center>

위 부분은 스팬의 head를 나타내기 위한 부분이다. 시스템은 스팬의 head를 나타내기 위해 스팬의 단어들에 대해 [attention](https://finddme.github.io/natural%20language%20processing/2019/11/12/Attention/)을 사용하였다.

1. attention에서와 마찬가지로 시스템은 가중치 벡터 $w_{\alpha}$를 학습하고 FFNN(Feed Forward Neural Networks)에 의해 변화된 hidden state $h_t$를 내적(dot product)해서 attention score를 구한다.  
2. 그리고 그 다음에 어텐션 과정에서 attention score를 softmax에 통과시켜서 attention weight을 구한 것 처럼 여기에서도 attention score를 softmax에 통과시켜 분포를 정규화한다.  
3. attention distribution은 스팬 $i$에 있는 단어들을 attention-weighted sum(attention weight값들을 각각 모두 곱하고 최종적으로 모두 더한 값)을 한 vector $h_{ATT(i)}$를 생성하는데 사용된다.

<center><img width="900" alt="2021-04-25" src="https://user-images.githubusercontent.com/53667002/115965583-e8718b00-a564-11eb-95b0-830900d0084e.png"></center>

span representation $g_i$는 이전에 말한 것처럼 스팬의 시작과 끝의 hidden representation(hidden state 값), head 그리고 스팬의 $i$의 length같은 feature vector(이전 장에서 neural model에서 유용할 수 있는 feature 중 하나)를 모두 concatenate한 것이다.

<center><img width="900" alt="2021-04-25 (1)" src="https://user-images.githubusercontent.com/53667002/115965717-633aa600-a565-11eb-9fb5-911d93e1783c.png"></center>

위 그림은 *the company*의 가능한 세 가지 선행사에 대한 score $s$를 계싼하는 것을 보여주는 그림이다. antecedent score부분을 보면 *the company*에 대해서 *General Electric*이 선행사인 경우와 *the Postal Service*가 선행사인 경우 각각이 들어가는 것을 볼 수 있고, 이들의 요소별 곱도 들어가며, 추가적으로 다른 feature들도 들어간다. 

$m(i)$와 $c(i,j)$는 scoring 함수로, 각각 mention score, antecedent score를 나타내며 둘 다 스팬 $i$를 나타내는 백테 $g_i$를 기반으로 한다.

> FFNN(Feed Forward Neural Network). 가중치의 반복적인 업데이트.   
1) 인풋 $x$를 받아서  
2) 이것의 $y=Wx+b$를 계산하고  
3) 여기에 activation function(sigmoid, tanh, ReLU, etc.)를 적용

선행사 score $c(i, j)$는 input으로 스팬 $i$와 $j$의 representation을 취하며, $g_i \circ g_j$($g_i$와 $g_j$의 요소별 곱)은 두 스팬의 요소별 유사도이다. 그리고 마지막에는 mention distances 그리고 화자와 장르에 대한 정보와 같은 유용한 feature들을 인코딩한 feature vector $\varphi(i, j)$가 들어간다.

<center><img width="900" alt="2021-04-25 (2)" src="https://user-images.githubusercontent.com/53667002/115966073-08a24980-a567-11eb-88e2-2e54d05c858c.png"></center>

이제 coreference score $s$를 보겠다. score $s(i, j)$는 세 가지 요소를 포함한다:

- $m(i)$: span $i$가 mention인지에 대한 여부;  
- $m(j)$: span $j$가 mention인지에 대한 여부;  
- $c(i, j): $j$가 $i$의 선행사인지에 대한 여부를 포함한다.

dummy 선행사의 경우에, score $s(i, \epsilon )$은 0으로 고정된다. 이 방법은 nondummy score가 양수면 모델이 가장 높은 점수의 선행사를 예측하지만 만약 모든 점수가 다 음수라면 제외하는 방법이다.

<center><img width="900" alt="2021-04-25 (4)" src="https://user-images.githubusercontent.com/53667002/115966293-d7764900-a567-11eb-8d42-fbbecadb7fdc.png"></center>

task는 각 스팬 $i$에 선행사 $y_i$를 할당하고, 이전 스팬 그리고 special dummy token $\epsilon$에 랜덤 변수, 즉 확률 변수를 할당하는 것이다.

여기 식을 보면 exponential score $i$, $y_i$의 summation 분의 exponential score $i$, $y_i$해서 선행사에 대한 확률값 $P(y_i)$가 나오는 것을 볼 수 있다.

만약 dummy token의 확률이 제일 높게 나온다면 $i$가 discourse-new이고 새로운 coreference chain을 시작하거나 nonanaphoric이기 때문에 선행사를 갖지 않는다는 것을 의미한다.

\begin{matrix}
\sum_{\hat{y}\in Y(i)\cap GOLD(i)}P(\hat{y})
\end{matrix}

학습 시에 legal antecedent 의 coreference 확률의합을 최대화하는 손실함수를 사용한다.

가능한 선행사 $Y(i)$를 가진 특정 mention $i$에 대해, $GOLD(i)$는 $i$를 포함하는 gold cluster의 mention 집합이라고 가정한다. 

$i$이전에 발생한 mention 집합은 $Y(i)$이기 때문에 $i$이전에 발생하는 gold cluster의 mention의 집합은 $Y(i)$와 $GOLD(i)$의 교집합이다. 따라서 이 확률을 최대화하는 방향으로 학습되어야 한다. mention $i$가 gold cluster에 없을 경우 $GOLD(i) = \epsilon$이다.

\begin{matrix}
L=\sum_{i-2}^{N} - log \sum_{\hat{y} \in Y(i) \cap GOLD(i)}P(\hat{y})
\end{matrix}

방금 언급한 그 확률을 손실함수로 바꾸기 위해 위 수식처럼 확률에 $-log$를 취하고 그 값을 모두 더해서 corss-entropy loss function을 사용한다. 이 손실함수 값을 최소화 하는 방향으로 학습이 진행되어야 한다.

> 손실함수: 모델의 출력값과 사용자가 원하는 출력값의 차이, 즉 오차를 말한다. 이 손실함수 값이 최소화 되도록 하는 가중치와 편향을 찾는 것이 학습이다.


## 4. Evaluation of Coreference Resolution

우리는 시스템이 생산한 일련의 체인이나 클러스터를 human labeling이나 gold나 reference chain 혹은 클러스터 집합과 비교하고, precisiton과 recall을 보고하며 이론적으로 evaluate coreference algorithm을 평가한다.

이 비교를 수행하기 위한 다양한 방법이 있다. coreference algorithm을 평가하는데 사용되는 5가지 일반적인 metric(측정방법)은 다음과 같다:

1) MUC metric(link based)  
2) BLANC metric(link based)  
3) $B^3$ metric (mention based)  
4) CEAF metric (entity based)  
5) LEA metric (link based entity aware)  

## 5. Entity Linking

coreference와 밀접한 관련이 있는 entity linking task는 텍스트의 mention을 world에 있는 entity의 목록인 ontology에서 어떤 real-world entity의 representation과 연관시키는 것이다.

이 task에 사용되는 가장 일반적인 온톨로지는 위키피디아이다. 위키피디아의 각 페이지는 특정 entity에 대한 고유한 id역할을 한다. 따라서 wikification의 entity linking task는 어떤 한 individual에 해당하는 Wikipedia page가 mention에 의해 지시되는지를 결정하는 작업이다.

<center><img width="490" alt="2021-04-25 (5)" src="https://user-images.githubusercontent.com/53667002/115976769-4bd2db80-a5ac-11eb-8a12-d28ab4f3f9e7.png"></center>

entity linking은 두 단계로 이루어진다: mention detection과 mention disambiguation.

Coreference가 올바른 위키피디아 페이지에 연결하기 위해 더 많은 간으한 surface form들을 제공하여 entity linking에 도움을 주기도 하지만 entity linking이 coreference resolution을 개선하기 위해 다른 방향으로도 사용될 수 있다. entity linking을 coreference에 통합하면 백과사전적 지식(*Donald Tsang*이 대통령이라는 사실처럼)을 이끌어내서 *President*에 대한 언급을 명확하게 하는 데에 도움이 될 수 있다.

## 6. Winograd Schema problems

<center><img width="420" alt="2021-04-25 (6)" src="https://user-images.githubusercontent.com/53667002/115976841-fcd97600-a5ac-11eb-93bd-21cebd1cd641.png"></center>

Winograd는 위 예시를 제시하며 coreference의 일부 사례가 상당히 어려운 것으로 나타나 세계 지식이나 복잡한 추론을 요구하는 것으로 보인다고 지적했다. Winogard는 대부분의 독자들이 대명사 뒤에 이어지는 것에 대해서 선호하는 선행사는 (a)에서는 *the city council*이지만 (b)에서는 *the demonstrators*라는 것을 알아챘다. 그는 이것이 두 번째 절은 첫 번째 절의 설명으로 의도된 것임을 이해해야 하고, 또한 우리의 문화 프레임은 시의회가 아마도 시위대보다 폭력을 두려워할 가능성이 있고, 시위대는 폭력을 옹호할 가능성이 더 높다는 것을 시사한다. 이와 관련된 challenge task도 있고 Winograd와 coreference resolution problem이 있는 dataset들도 있다고 한다.

## 7. Gender Bias in Coreference

Language processing의 다른 측면과 마찬가지로 coreference model도 성별과 기타 다른 편향들을 나타낸다. embedding은 그들의 training test에서 사회적 편향을 복제한다. 남성들은 의사와 같이 역사적으로 전형적인 남성 직업과 연관시키고, 여성은 비서와 같이 전형적인 여성 직업과 연관시킨다.

> 전형적인 남성직업 여성직업...? 

WinoBias dataset은 Winograd Schema 패러다임의 변형을 사용하며 coreference algorithn이 문화적 고정 관념과 일치하는 선행사와 성별 대명사를 연결하는 방향으로 편향된 정도를 테스트하는데, 이 데이터셋은 전형적인 남성 그리고 전형적인 여성 직업에 해당하는 두 mention과 그 중 하나에 연결되어야 하는 성별 대명사를 포함한다. 

<center><img width="510" alt="2021-04-25 (8)" src="https://user-images.githubusercontent.com/53667002/115977155-48415380-a5b0-11eb-8ad4-9469b3bb15cc.png"></center>

위 예시에서 22.66은 pro-stereotypical이고 22.67은 anti-stereotypical하다. 이런 편향의 원인 중 하나는 데이터셋에 female entity가 매우 적다는 것인데, 이것을 해소하기 위해 남성과 여성 entity를 바꿔서 데이터셋을 바꾸고 기존 데이터셋과 합쳐서 비율을 맞추는 등의 시도가 있었다고 한다.

## Reference

> Daniel Jurafsky and James H. Martin. 2019. Speech and Language Processing, 3rd Edition.  

> https://web.stanford.edu/~jurafsky/slp3/
