---
title: "Similarity search method: Keyword Search, Semantic Search, Hybrid Search"
category: Dev Log
tag: Development
---







* 목차
{:toc}










최근 생성형 모델과 함께 사용되는 RAG의 retrieval 단계에서는 qeury와 유사한 chunk를 찾는 것이 매우 중요하다. 검색된 chunk가 모델에 참고 문서로 입력되기 때문에 유사도 검색 결과가 최종 결과에 큰 영향을 미친다. 이에 따라 RAG 최종 답변 품질 향상을 위해 LLM 성능 개선뿐만 아니라 유사도 검색 성능 개선도 중요하다.

# Keyword Search

BM25는 TF-IDF 알고리즘을 기반으로 한 키워드 검색 알고리즘이다. 매우 오래된 알고리즘이고, 이를 기반으로 한 여러 variation들이 제안되었지만 keyword search에 있어서 아직까지는 클래식이 베스트이다.

langchain에서 제공하는 keyword search 라이브러리도 BM25를 사용하고 [langchain_community.retrievers.bm25](https://api.python.langchain.com/en/latest/_modules/langchain_community/retrievers/bm25.html), ElasticSearch 5.0 이상부터도 기본 유사도 알고리즘으로 BM25을 사용하고 있다.

```python
from rank_bm25 import BM25Okapi

query = "키워드 검색 방법에 대해 알려줘"

corpus = [
    "최근 생성형 모델과 함께 사용되는 RAG의 retrieval 단계에서는 qeury와 유사한 chunk를 찾는 것이 매우 중요하다. 검색된 chunk가 모델에 참고 문서로 입력되기 때문에 유사도 검색 결과가 최종 결과에 큰 영향을 미친다.",
    "Semantic Search는 text를 모델을 통해 embedding시킨 후 embedding vector들의 거리를 통해 유사도를 검색하는 방법이다.",
    "BM25는 TF-IDF 알고리즘을 기반으로 한 키워드 검색 알고리즘이다. 매우 오래된 알고리즘이고, 이를 기반으로 한 여러 variation들이 제안되었지만 keyword search에 있어서 아직까지는 클래식이 베스트이다.",
    "사용자의 질문이 명확하지 않은 경우, similarity search 과정에서 오류가 발생할 수 있다."
]

def bm25_keyword_search(corpus,query):
    tokenized_corpus = [doc.split(" ") for doc in corpus]
    tokenized_query = query.split(" ")
    
    bm25 = BM25Okapi(tokenized_corpus)
    doc_scores = list(bm25.get_scores(tokenized_query)) # score
    doc_top_n=bm25.get_top_n(tokenized_query, corpus, n=1) # top_n

    # map_res= map(lambda score, c: {"score": score, "sentence": c}, doc_scores, corpus)
    res=result = list(map(lambda score, sentence: {"score": score, "sentence": sentence}, doc_scores, corpus))
    
    return res
    
bm25_keyword_search(corpus,query)

```

```
output:
[{'score': 0.0,
  'sentence': '최근 생성형 모델과 함께 사용되는 RAG의 retrieval 단계에서는 qeury와 유사한 chunk를 찾는 것이 매우 중요하다. 검색된 chunk가 모델에 참고 문서로 입력되기 때문에 유사도 검색 결과가 최종 결과에 큰 영향을 미친다.'},
 {'score': 0.0,
  'sentence': 'Semantic Search는 text를 모델을 통해 embedding시킨 후 embedding vector들의 거리를 통해 유사도를 검색하는 방법이다.'},
 {'score': 0.7888807421401189,
  'sentence': 'BM25는 TF-IDF 알고리즘을 기반으로 한 키워드 검색 알고리즘이다. 매우 오래된 알고리즘이고, 이를 기반으로 한 여러 variation들이 제안되었지만 keyword search에 있어서 아직까지는 클래식이 베스트이다.'},
 {'score': 0.0,
  'sentence': '사용자의 질문이 명확하지 않은 경우, similarity search 과정에서 오류가 발생할 수 있다.'}]
```

# Semantic Search

Semantic Search는 text를 모델을 통해 embedding시킨 후 embedding vector들의 거리로 cosine similarity를 구하여 유사도를 검색하는 방법이다. 

> cosine similarity score -1에서 +1 사이의 값을 갖는다.
> cosine similarity scor는 두 vector의 각도가 90도 이상일 때 음수가된다. 하지만 embdeeing vector들은 모두 양수이기 때문에 두 vecor의 각도의 최대치가 90도이다.
> 이에 따라 cosine similarity score는 본질적으로 -1과 1 사이의 값을 지니지만
> embedding vector에 대한 유사도 산출에서는 0과 1사이의 값만 나온다.

```python
from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim

embedd_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

corpus = [
    "최근 생성형 모델과 함께 사용되는 RAG의 retrieval 단계에서는 qeury와 유사한 chunk를 찾는 것이 매우 중요하다. 검색된 chunk가 모델에 참고 문서로 입력되기 때문에 유사도 검색 결과가 최종 결과에 큰 영향을 미친다.",
    "Semantic Search는 text를 모델을 통해 embedding시킨 후 embedding vector들의 거리를 통해 유사도를 검색하는 방법이다.",
    "BM25는 TF-IDF 알고리즘을 기반으로 한 키워드 검색 알고리즘이다. 매우 오래된 알고리즘이고, 이를 기반으로 한 여러 variation들이 제안되었지만 keyword search에 있어서 아직까지는 클래식이 베스트이다.",
    "사용자의 질문이 명확하지 않은 경우, similarity search 과정에서 오류가 발생할 수 있다."
]
query = "Semantic Search 방법에 대해 알려줘"

def bm25_keyword_search(corpus,query):
    document_embeddings = embedd_model.encode(corpus)
    embedding_shape=document_embeddings.shape
    
    query_embedding = embedd_model.encode(query)
    
    scores = cos_sim(document_embeddings, query_embedding)
    scores=sum(scores.tolist(),[])
    
    res=result = list(map(lambda score, sentence: {"score": score, "sentence": sentence}, scores, corpus))
    
    return res
    
bm25_keyword_search(corpus,query)
```

```
output:
[{'score': 0.3132789731025696,
  'sentence': '최근 생성형 모델과 함께 사용되는 RAG의 retrieval 단계에서는 qeury와 유사한 chunk를 찾는 것이 매우 중요하다. 검색된 chunk가 모델에 참고 문서로 입력되기 때문에 유사도 검색 결과가 최종 결과에 큰 영향을 미친다.'},
 {'score': 0.7019628882408142,
  'sentence': 'Semantic Search는 text를 모델을 통해 embedding시킨 후 embedding vector들의 거리를 통해 유사도를 검색하는 방법이다.'},
 {'score': 0.5864437222480774,
  'sentence': 'BM25는 TF-IDF 알고리즘을 기반으로 한 키워드 검색 알고리즘이다. 매우 오래된 알고리즘이고, 이를 기반으로 한 여러 variation들이 제안되었지만 keyword search에 있어서 아직까지는 클래식이 베스트이다.'},
 {'score': 0.588509738445282,
  'sentence': '사용자의 질문이 명확하지 않은 경우, similarity search 과정에서 오류가 발생할 수 있다.'}]
```

# Hybrid Search

Hybrid Search는 keyword search와 semantic search를 결합한 방법이다.
