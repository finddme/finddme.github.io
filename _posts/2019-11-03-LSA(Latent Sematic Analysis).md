---
title: LSA(Latent Sematic Analysis)
category: Natural Language Processing
tag: NLP
---

자연어처리 시 단어-문서 행렬(Word-Document Matrix), TF-IDF(Term Frequency-Inverse Document Frequency) 행렬, 그리고 단어-문맥(window based con-occurrence matrix) 행렬과 같이 문서를 벡터화하여 행렬로 표현한 데이터가 사용된다. **잠재 의미 분석(Latent Semantic Analysis)** 은 이러한 행렬의 차원을 줄여 계산의 복잡성을 낮추고 학습량을 줄임과 동시에 행간에 숨어있는(latent)의미를 이끌어내기 위한 방법론이다. 

해당 방법론에서는 입력으로 사용되는 행렬 데이터에 특이 값 분해(Singular Value Decomposition, SVD)를 수행하여 데이터의 차원을 축소한다. 따라서 잠시 SVD에 대해 설명하도록 하겠다. SVD는 다량의 전체 데이터(massive data)를 한 바퀴 탐색하며 여러 번 등장하는 단어(co-occurrence)들의 등장 빈도를 계산하여 이를 기반으로 matrix $A​$ 형태로 표현한 후 SVD를 수행하여  $U\Sigma { V }^{ T }​$ decomposition을 얻는다. 간단히 말하자면 빈도를 계산하여 표현된 matrix $A​$를 $U\Sigma { V }^{ T }​$로 분해하는 것이다. 특이 값 분해는 다음과 같이 정의된다:


\begin{matrix}
A=U\Sigma { V }^{ T }\\ 
\end{matrix}


$U$는 $A { A }^{ T }$를 고유값 분해(eigenvalue decomposition)하여 얻은 직교행렬(orthogonal matrix)이고,  $V$는 ${ A }^{ T } A$를 고유값 분해해서 얻어진 직교행렬(orthogonal matrix)이다. 그리고 $\Sigma$는 $A { A }^{ T }$, ${ A }^{ T } A$를 고유 값 분해하여 얻은 고유값들의 제곱근을 대각원소로 갖는 행렬인데 해당 행렬의 대각 원소들이 바로 $A$의 특이값(singular value)들을 제곱한 값이다.

다시 LSA로 돌아와서, LSA기법에서는 위에서 설명한 SVD가 수행되는데 일반 SVD대신 절단된 SVD(truncated SVD)가 사용된다. 절단된 SVD를 그림으로 나타내면 다음과 같다:

<center><img width="640" alt="2019-11-03 (7)" src="https://user-images.githubusercontent.com/53667002/68084253-a0ddd780-fe76-11e9-9a7c-2cd45bf3795e.png">
</center>

절단된 SVD(truncated SVD)수행을 위해 우선 $A$의 고유 값 개수($r$)보다 작은 임의의 $k$를 설정한 후, 대각 행렬 $\Sigma$에서 가장 큰 $k$개의 값을 제외한 나머지를 제거하여  $Σ_k$를 만든다. 그리고 행렬$U$와 $V$에서 이와 대응하는 부분만 남겨 $U_k $ 와 $V_k​$를 만들어 모두 곱하면 행렬$A$와 근사하지만 차원이 줄어든 $A_k$가 만들어진다. 아래 그림을 참고하면 이해가 빠를 것이다.

<center><img width="640" alt="2019-11-03 (6)" src="https://user-images.githubusercontent.com/53667002/68083825-f31bfa00-fe70-11e9-81b9-6d299ccc5b7e.png"></center>

truncated SVD 결과가 갖는 의미에 대해 살펴보도록 하겠다. $U_kΣ_k{ V_k }^{ T }$로 도출된 행렬은 단어와 문서 간의 유사도를 나타내고, $U_kΣ_k{ V_k }^{ T }$에 ${ U_k }^{ T }$를 곱해 $Σ_k{ V_k }^{ T }$를 구하면 결과로 도출된 행렬의 행(colunm)은 문서 간의 유사도를 의미하게 된다. 

<center><img width="320" alt="2019-11-06 (10)" src="https://user-images.githubusercontent.com/53667002/68293746-f661f080-00d1-11ea-92ce-514a8323981f.png"></center>

그리고  $U_kΣ_k{ V_k }^{ T }$에 $V_k$를 곱하여 $U_kΣ_k$의 결과를 구하게 되면 도출된 행렬의 열(row)는 단어 간의 유사도를 의미한다. 

<center><img width="280" alt="2019-11-06 (11)" src="https://user-images.githubusercontent.com/53667002/68293788-08439380-00d2-11ea-84b8-08cff462a63b.png"></center>

지금까지 설명한 LSA기법은 데이터의 차원을 축소하여 학습량을 줄여 성능을 높일 수 있다는 장점도 있지만 SVD의 특성상 새로운 데이터가 추가될 경우 계산을 모두 다시 해야 해 정보 업데이트에 대해 취약하다는 단점도 존재한다. 따라서 이러한 문제점으로 인해 새로운 데이터 업데이트가 용이한 인공 신경망 기반의 word embedding방법이 연구되어 계속 발전되고 있다.

