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
    "Transformer 계열의 모델은 고정된 입력 길이를 input으로 받는다. 모델의 context window가 커도 문서 전체를 입력으로 넣는 것보다 질문과 의미 유사도가 높은 몇몇 chunk만 입력으로 넣는 것이 정확한 답변을 생성하는 데에 도움이 된다.",
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
  'sentence': 'Transformer 계열의 모델은 고정된 입력 길이를 input으로 받는다. 모델의 context window가 커도 문서 전체를 입력으로 넣는 것보다 질문과 의미 유사도가 높은 몇몇 chunk만 입력으로 넣는 것이 정확한 답변을 생성하는 데에 도움이 된다.'},
 {'score': 0.8674183900533906,
  'sentence': 'BM25는 TF-IDF 알고리즘을 기반으로 한 키워드 검색 알고리즘이다. 매우 오래된 알고리즘이고, 이를 기반으로 한 여러 variation들이 제안되었지만 keyword search에 있어서 아직까지는 클래식이 베스트이다.'},
 {'score': 0.0,
  'sentence': '사용자의 질문이 명확하지 않은 경우, similarity search 과정에서 오류가 발생할 수 있다.'}]
```

# Semantic Search

Semantic Search는 text를 모델을 통해 embedding시킨 후 embedding vector들의 거리를 통해 유사도를 검색하는 방법이다. 

# Hybrid Search

Hybrid Search는 keyword search와 semantic search를 결합한 방법이다.
