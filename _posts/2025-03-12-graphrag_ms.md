---
title: "GraphRAG (Microsoft)"
category: LLM / Multimodal
tag: LLM
---


 




* 목차
{:toc}













# Knowledge Graph?
Knowledge Graph란, NebulaGraph(https://www.nebula-graph.io/posts/graph-RAG)에서 제안된 방식이다.

## Knowledge Graph 구성요소

- Node

# Graph RAG
GraphRAG 프로세스는 크게 인덱싱(Indexing) 단계와 쿼리(Querying) 단계로 구성된다. 

## Indexing
Indexing 단계에서는 아래와 같은 작업이 수행된다:

### 1. Text Units: 
Naive RAG에서 chunking이라고 부르는 부분과 유사하다. 입력 텍스트를 TextUnit이라고 불리는 관리 가능한 chunk로 분절하는 것이다.

### 2. Knowledge graph 구성: 
1) LLM으로 TextUnit으로부터 Entity와 Relation을 추출한다.<br>
   - Entity: 텍스트에 등장하는 주요 개체나 개념
   - Relationship: Entity들 간의 관계
2)추출된 Entity와 Relationship으로 Knowledge graph를 구축한다.
  - Entity는 graph의 node가 되고, Relationship은 방향성 있는 edge가 된다.
    
+ graph 저장
  > graph 저장을 위 일반적으로 Neo4j나 Amazon Neptune과 같은 그래프 데이터베이스가 사용되지만
GraphRAG 구현, 특히 proof-of-concept (POC) 단계에서는 더 접근하기 쉬운 대안으로 parquet 파일을 사용할 수 있다.
parquet 파일은 graph data를 효율적으로 저장할 수 있는 컬럼형 저장 형식을 제공한다. 

### 3. Community detection: 
관련된 entity들의 클러스터를 식별하는 과정
Knowledge graph를 구축한 후 Community detection을 수행한다.
Community는 서로 밀접하게 연결된 node와 edge의 클러스터이다.
GraphRAG는 계층적 클러스터링을 위해 Leiden 알고리즘을 사용한다.
Leiden 알고리즘은 graph를 내의 community 구조를 발견하는 데 특히 효과적이다.
이 알고리즘은 연결성을 기반으로 개체들을 서로 다른 커뮤니티에 할당시킨다.
이러한 계층적 접근 방식은 다수준 커뮤니티 탐지를 가능하게 한다.

데이터에 대한 community를 구성함으로써 아래와 같은 이점을 취할 수 있다:
- 복잡한 정보를 논리적 그룹으로 조직화할 수 있다.
- 전체 데이터셋에 대한 상위 수준의 개요를 만들 수 있다. 
- 후속 query 응답의 관련성과 정확성을 향상시킬 수 있다.
- 대규모 knowledge graph에서 정보를 검색하고 활용하기 쉽게 만emsek.

### 4. Summarization: 
데이터셋 내 다양한 주제에 대한 개요를 데이터에 담아 놓기 위해 각 community에 대한 요약을 생성한다.

요약은 bottom-up 방식으로 진행된다.

1) community 내의 개별 개체에 대한 요약
2) 개체간의 관계 설명
3) 종합적인 community 수준의 요약

요약에는 다은과 같은 내용이 포함된다:
- community 내의 주요 개체
- 개체 간의 핵심 관계
- community와 관련된 중요한 주장/사실
- community의 중요성에 대한 맥락적 정보


<center><img width="800" src="https://github.com/user-attachments/assets/97a65968-e305-44ab-b805-b13de5722c76"></center>
<center><em style="color:gray;">https://blog.gopenai.com/microsoft-graphrag-and-ollama-code-your-way-to-smarter-question-answering-45a57cc5c38b</em></center><br>

## Querying

### 1. Query Processing
  graph에서 가장 관련성 높은 정보를 검색할 수 있도록 사용자 query의 의도, 주요 개체, 관계성 등을 파악한다.

### 2. Graph-Based Retrieval
저장된 knowledge graph에서 query와 일치하는 node와 edge를 검색한다. 이 단계는 knowledge graph의 구조화된 특성을 활용하여 가장 적절한 정보를 효율적으로 찾아낸다.
- 그래프를 순회하며 query parameter를 기반으로 관련 entity와 relationship을 식별한다.
- 특정 entity에서 시작하여 관련 relationship을 따라가는 방식으로 정보를 탐색합니다
- community 구조를 활용하여 검색 범위를 효율적으로 좁힐 수 있다

### 3. Information Aggregation
- 관련 정보가 검색되면 knowledge graph의 다양한 부분에서 이 정보를 통합한다. 
- 포괄적인 응답을 생성하기 위해 여러 community나 node의 데이터를 결합할 수 있다
- 정보 간의 연관성을 고려하여 논리적으로 일관된 형태로 조직화한다.
- 중복되거나 모순되는 정보를 필터링하고 조정한다. 

### 4. Response Generation
- 마지막으로, 통합된 정보를 기반으로 응답을 생성한다.
- LLM을 활용하여 구조화된 정보를 자연스러운 텍스트로 변환한다

### Search 종류
사용자가 Query를 보내면 knowledge graph를 통해 관련 정보를 검색한다. 커뮤니티 구조를 활용하여 검색 범위를 조절할 수 있는데, 범위에 따른 검색 방식으로 아래 두 가지가 있다.

1. Local Search
   - 특정 entity에 관한 질문에 중점을 둔다
   - 해당 entity의 관계, 관련 내용, 관련 claims, 관련 text snippets을 탐색한다
   - 특정 개체나 개념에 대한 구체적인 정보를 찾는데 효과적이다.
   - 
  <center><img width="800" src="https://github.com/user-attachments/assets/f5120c6f-6274-4509-a4d9-eb755d8930b6"></center>
  <center><em style="color:gray;">https://blog.gopenai.com/microsoft-graphrag-and-ollama-code-your-way-to-smarter-question-answering-45a57cc5c38b</em></center><br>

2. Global Search
   - 데이터셋 전체에 대한 이해가 필요한 질문에 적합
   - community summary를 분석하여 전체적인 주제와 패턴을 식별
   - 데이터셋 전반에서 정보를 종합하여 보다 포괄적인 답변을 제공

  <center><img width="800" src="https://github.com/user-attachments/assets/333e7a51-ace2-425d-9fbf-99b9f51f65ec"></center>
  <center><em style="color:gray;">https://blog.gopenai.com/microsoft-graphrag-and-ollama-code-your-way-to-smarter-question-answering-45a57cc5c38b</em></center><br>


# Graph RAG의 이점
- 단순 키워드 매칭보다 더 의미론적인 검색이 가능하다
- 특정 세부 정보와 전체적인 맥락 모두를 고려한 답변 생성이 가능하다.
- 연구 분야:
  - 대규모 과학 논문 데이터셋에서 정보를 종합하여 복잡한 질문에 답변할 수 있다.
  - 연구 문헌 검토를 자동화하고 새로운 관계를 발견하는 데 도움을 준다.
- 기업 환경:
  - 특정 도메인에 대해 추론할 수 있는 대화형 AI 시스템을 구축할 수 있다.
  - 고객 지원이나 내부 지식 베이스와 같은 분야에서 활용된다.
  - 기업 문서와 데이터를 더 효과적으로 탐색하고 활용할 수 있게 한다.
- 지식 탐색 도구:
  - 대용량 데이터셋에 대한 깊은 이해를 촉진하는 도구를 만들 수 있다.
  - 사용자가 다양한 개념 간의 관계를 대화식으로 탐색할 수 있게 한다.
   -새로운 통찰력을 발견하는 데 도움을 준다.


> MS Graphrag 라이브러리 없이 Graph RAG 만들기
>> 1. Chunking<br>
   문서를 chunk로 나눈다. 각 청크에 chunk_id를 할당한다.<br>
   
>> 2. Entity-Relationship Extraction<br>
   모든 chunk 대해 LLM을 통해 entity와 relationship을 추출한다.<br>
   이 관계에 W1이라는 가중치를 할당한다.<br>
   동일한 개념 쌍 사이에 여러 relationship이 있을 수 있다.<br>
   
>> 3. Contextual Proximity<br>
   동일한 chunk에 나타나는 entity들 문맥적으로 가까이 위치하기 때문에 이들 사이에도 어떠한 관계가 있다고 본다.<br>
   이 관계에는 W2라는 가중치를 할당한다. 동일한 concept 쌍이 여러 chunk에 나타날 수 있다는 것을 유의해야 한다.<br>

>> 4. 유사한 쌍들을 그룹화하고, 가중치를 합산하며, 관계를 연결한다. 이제 구별되는 concept 쌍 사이에는 하나의 edge만 존재하게 된다.<br>
   이 edge는 특정 가중치와 관계 목록을 이름으로 가진다.<br>

[https://medium.com/data-science/how-to-convert-any-text-into-a-graph-of-concepts-110844f22a1a](https://medium.com/data-science/how-to-convert-any-text-into-a-graph-of-concepts-110844f22a1a)
