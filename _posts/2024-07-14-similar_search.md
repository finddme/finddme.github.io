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
langchain에서 제공하는 keyword search 라이브러리도 BM25를 사용한다. [langchain_community.retrievers.bm25](https://api.python.langchain.com/en/latest/_modules/langchain_community/retrievers/bm25.html)

# Semantic Search

# Hybrid Search

Hybrid Search는 keyword search와 semantic search를 결합한 방법이다.
