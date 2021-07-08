---
title: Long-Distance Dependency(LDD)
category: Linguistics | English
tag: Linguistics
---







* 목차
{:toc}








Long-Distance Dependency(장거리 의존)란 한 문장에서 어떤 성분과 그 성분이 원래 있던 자리, 즉 Filler와 Gap의 관계를 확인하는 것이다. 장거리 의존은 여러 종류가 있는데 아래 4가지가 영어에서 자주 나타나는 장거리 의존 구문이다.

## 1. *WH*-questions

(1) <U>What</U> did Jimmy say **(GAP)**?

&#10145; 동사 say 뒤에 뭐가 있어야 하는데 없다. 그게 GAP이고 사라진 것을 채워주는 Filler는 What이다.

> 자세히 말하자면 *say*에 해당하는 목적어가 맨 앞으로 나간 것이다. 즉, 문장 맨 앞의 *What*과 *say*는 각각 문장 양 끝에 있지만 서로 syntactic dependency를 가지고 있는 것이다.

## 2. Relative Clauses

(2) James knows the woman <U>who</U> lives next door **(GAP)**.

(3) They wondered <U>which</U> lawyers I think you said **(GAP)** were upset.

&#10145; Relative Clauses는 장거리 의존 구문 중 복잡한 유형에 속한다. (2)에서 *James*가 아는 여자와 옆집에 사는 여자가 같다는 것을 Filler *who*를 통해 확인할 수 있다. (3)은 조금 더 복잡하다. 이 문장에서는 *which*와 GAP의 관계 뿐만 아니라 *which*와 *lawyers*의 관계도 파악해야 문장의 전체 의미를 알 수 있다.

<center><img width="450" alt="2021-04-04" src="https://user-images.githubusercontent.com/53667002/113497900-07bb6080-9543-11eb-8ff4-40e8c1715da8.png"></center>


> *The book that my teacher recommended must to read*에서 *the book*과 *to read*는 syntactic dependency 관계에 있다. 이런 것이 관계절 구문이다.

> Filler와 Gap은 가까울 수도 있고 멀 수도 있다. 예를 들어<br>  
- The captain \[who the sailor predicted \[that the weather would frighten (GAP)]].  
- The captain \[who people said \[the sailor predicted \[that the weather would frighten (GAP)]]].  
- The captain \[who Mary heard \[people said \[the sailor predicted \[that the weather would frighten (GAP)]]]].\  
<br>위와 같이 문장 중간에 다른 clause들이 끼워질 수 있다. 중간에 삽입된 절이 많을수록 GAP의 자리가 어디인지 파악하기 어렵다. 위 문장에서 삽입된 절이 많아질수록 *who*와 GAP의 관계, *who*와 *the captain*의 관계, *the captain*과 GAP의 관계를 파악하는 것이 어려워진다.

이렇게 복잡한 구조를 가진 문장을 잘 파악하지 못하면 아래와 같은 오류를 낼 수 있기 때문에 자연어처리 분야에서의 장거리 의존 구문 처리는 매우 중요하다.

It was the lawyer(s) who I think you said (GAP) was/were upset.  
-> It was the lawyer who I think you said (GAP) was/*were upset.  
-> It was the lawyer(s) who I think you said (GAP) *was/were upset.  

## 3. Topicalization

(4) <U>Such examples</U> I thought you said that Tom believes the explanation needs **(GAP)**. (I thought you said that Tom believes the explanation needs such examples)

(5) Sometimes <U>at school</U>, Fred would tease the girl **(GAP)**.

&#10145; Topicalization은 문장에서 어떤 성분을 강조하기 위해 해당 성분을 문장 맨 앞에 위치시키는 것이다. 위 예시에서 동사 needs 뒤에 있어야 할 *Such examples*가 강조되기 위해 문장 맨 앞으로 이동하여 GAP이 생겼다. 그리고 영어에서는 argument NP가 Topicalize되는 경우는 비교적 적고, 두 번째 예문처럼 adjunct prepositional phrases가 Topicalize되는 경우가 많다.

## 4. *Tough*-movement

(6) This sonata is tough to play (GAP). (It is tough to play this sonata.)

&#10145; Tough-movement는 특정 어휘(tough, easy, available, dangerous, difficult 등)에 의해서 이루어진다.


## Reference

> Emily M. Bender(2013). Linguistic Fundamentals for Natural Language Processing I. Morgan & Claypool, 116-119

> James D. Mccawley. (1998). The Syntactic Phenomena of English (2nd). The University of Chicago Press, Chicago and London, 427-487

> Maria M. Piñango, Emily Finn, Cheryl Lacadie, and R. Todd Constable (2016). The Localization of Long-Distance Dependency Components: Integrating the Focal-lesion and Neuroimaging Record. Front Psychol. 2016; 7: 1434

> Timothy Osborne (2019). A Dependency Grammar of English: An introduction and beyond. John Benjamins Publishing Company, 243-267
