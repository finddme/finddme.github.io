---
title: "Self-Reflective RAG : three Grader (작성 중)"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}












# 개발 환경별 사용 가능 기술

<html>
  <head>
    <style type="text/css">
      .line{border-bottom: 1px solid #BDB8C1;}
      .line2{border-bottom: 2px solid #BDB8C1;}
      .line3{border-bottom: 1px solid #BDB8C1; background-color: #F7F7F7;}
      .line4{border-bottom: 2px solid #BDB8C1; background-color: #F7F7F7;}
      table, th, td {
         border:1px solid #BDB8C1;
         background-color: #FFFFFF;
       }
    </style>
   </head>
   <body>
     <table style="border-collapse:collapse" align=center>
       <tr>
         <th class="line2" bgcolor="#F8F7F9"> </th>
         <th class="line4" bgcolor="#F8F7F9">Internet-Accessible</th><th class="line4" bgcolor="#F8F7F9">Private / Local </th>
       </tr>
       <tr>
         <td class="line3"><strong>RAG Framework</strong></td>
         <td class="line" colspan="2" valign=middle>
           <li>langchain</li>
           <li>langGraph</li>
         </td>
       </tr>
       <tr>
         <td class="line3"><strong>LLM</strong></td>
         <td class="line">
           <li>openai</li>
           <li>claude</li>
           <li>...</li>
         </td>
         <td class="line">
           <li>huggingface model</li>
           <li>local model</li>
         </td>
       </tr>
       <tr>
         <td class="line3"><strong>Inference accelerate</strong></td>
         <td class="line">
           <li>GROQ</li>
         </td>
         <td class="line">
           <li>vllm</li>
         </td>
       </tr>
       <tr>
         <td class="line3"><strong>text embedding</strong></td>
         <td class="line">
           <li>openai</li>
         </td>
         <td class="line">
           <li>Sentencetransformers</li>
           <li>Google Vertex embedding</li>
           <li>...</li>
         </td>
       </tr>
       <tr>
         <td class="line3"><strong>vector DB</strong></td>
         <td class="line" colspan="2" valign=middle>
           <li>Wevieate</li>
           <li>Faiss</li>
           <li>...</li>
         </td>
       </tr>
       <tr>
         <td class="line3"><strong>web search</strong></td>
         <td class="line">
           <li>Tavily</li>
         </td>
         <td class="line">
           <li>langchain_community.utilities .oooWrapper</li>
         </td>
       </tr>
       <tr>
         <td class="line3"><strong>Reranker</strong></td>
         <td class="line">
           <li>cohere</li>
         </td>
         <td class="line">
           <li>llama_index -> FlagEmbeddingReranker(?)</li>
           <li>huggingface rerank model</li>
           <li>langchain_community -> JinaRerank</li>
           <li>langchain_cohere -> CohereRerank</li>
         </td>
       </tr>
       <tr>
         <td class="line3"><strong>Application Interface</strong></td>
         <td class="line" colspan="2" valign=middle>
           <li>FastAPI (graphic interface o)</li>
           <li>Flask</li>
           <li>Gradio (graphic interface o)</li>
           <li>Streamlit (graphic interface o)</li>
           <li>cherrypy</li>
           <li>Django</li>
           <li>Chainlit</li>
           <li>...</li>
         </td>
       </tr>
   </table>
 </body>
</html>

# RAG 개발 예시 (인터넷 접속 가능 환경)
## 기능별 구성 요약 

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/8488df8b-14b3-4ecc-8ece-be2e140a8221"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

- RAG Framework : Langchain
- Workflow control : LangGraph
- LLM : Mixtral-8x7b
- Inference accelerate : GROQ
- text embedding : Openai
- vector DB : Wevieate
- web search : Tavily
- Application Interface : Streamlit

## 단계별 설명 및 코드

## Vector DB 준비 : Weaviate

<center><img width="500" src="https://github.com/finddme/finddme.github.io/assets/53667002/888744e8-2bac-4e06-a875-d594142e9cef"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>


### Weaviate setting

1. weaviate docker setting

weaviate docker-compose file: (https://weaviate.io/developers/academy/py/starter_multimodal_data/setup_weaviate/create_docker)[https://weaviate.io/developers/academy/py/starter_multimodal_data/setup_weaviate/create_docker]

```command
docker-compose -f wevieate.yml up -d
```

-> weaviate client url 생성

2. create weaviate class

```python

client = weaviate.Client("weaviate client url")

class_obj = {
    "class": "Test",
    "vectorizer": "none",
}

client.schema.create_class(class_obj)
```

### prepare Documents for Retrieval

1. split / chunking

```python
urls = [
    "https://finddme.github.io/llm%20/%20multimodal/2023/10/01/llm_architecture/",
    "https://finddme.github.io/llm%20/%20multimodal/2024/02/21/RAG/",
    "https://finddme.github.io/llm%20/%20multimodal/2024/05/01/llama3/",
]

docs = [WebBaseLoader(url).load() for url in urls]
docs_list = [item for sublist in docs for item in sublist]

text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=1000, chunk_overlap=0
)
doc_splits = text_splitter.split_documents(docs_list)
```

```python
space_check=re.compile("\s{1,}")
chunks=[]
pass_first=["finddme ","⊹  Portfolio","© 2024 viein_serenity_singularity_simplicity_savage. This work is liscensed under CC BY-NC 4.0."]
for i in doc_splits:
    c={'text':i.page_content, 'title':i.metadata["source"].split("/")[-2]}
    if c["text"].split("\n")[0] in pass_first:pass
    else:
        save_c={'text':re.sub(space_check," ",c['text']),'title':c['title']}
        chunks.append(save_c)
```

2. chunks save

```python
client = weaviate.Client("weaviate client url")

client.batch.configure(batch_size=100)

with client.batch as batch:
    for i, chunk in enumerate(chunks):
        vector = get_embedding(chunk["text"])
        batch.add_data_object(data_object=chunk, class_name="Test", vector=vector)

```

## Query Router : Groq

```json
{'input': query, 'output':"websearch/vectorstore"}
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
"""
pydantic_v1
- https://python.langchain.com/v0.1/docs/modules/model_io/output_parsers/types/pydantic/
- 특정 schema에 맞게 output을 구성하도록 LLM에 quary할 수 있게하는 parser.
"""

class RouteQuery(BaseModel):
    """Route a user query to the most relevant datasource."""

    datasource: Literal["vectorstore", "websearch"] = Field(
        ...,
        description="Given a user question choose to route it to web search or a vectorstore.",
    )

"""
ref.
https://python.langchain.com/v0.2/docs/integrations/chat/groq/
Supported Models: https://console.groq.com/docs/models
"""
llm = ChatGroq(temperature=0, groq_api_key=GROQ_API_KEY)
structured_llm_router = llm.with_structured_output(RouteQuery)

system = """You are an expert at routing a user question to a vectorstore or web search.
The vectorstore contains documents related to language processing, and artificial intelligence.
Use the vectorstore for questions on these topics. For all else, use web-search."""
route_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)

question_router = route_prompt | structured_llm_router

def route_question(state):
    print("---ROUTE QUESTION---")
    question = state["question"]
    source = question_router.invoke({"question": question}) # output: datasource='websearch/vectorstore'
    if source.datasource == 'websearch':
        print("---ROUTE QUESTION TO WEB SEARCH---")
        return "websearch"
    elif source.datasource == 'vectorstore':
        print("---ROUTE QUESTION TO RAG---")
        return "vectorstore"

```

## Retrieve : Weaviate

<center><img width="500" src="https://github.com/finddme/finddme.github.io/assets/53667002/7f2966e5-3cd3-4d6b-b6e9-2c91e38fabae"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

```json
{'input': query, 'output':{"documents": documents, "question": query}}
```

```python
def retrieve(state):
    print("---RETRIEVE from Vector Store DB---")
    question = state["question"]

    # Retrieval
    query_vector = get_embedding(question)
    documents = client.query.get("Test", ["text","title"]).with_hybrid(question, vector=query_vector).with_limit(6).do()
    return {"documents": documents, "question": question}
```

## Relevant Grader : langchain

<center><img width="500" src="https://github.com/finddme/finddme.github.io/assets/53667002/c09ef5b1-d706-4157-b0d8-c85af9c282e3"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

```json
{'input': {"documents": documents, "question": query}, 'output':"yes/no"}
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
"""
pydantic_v1
- https://python.langchain.com/v0.1/docs/modules/model_io/output_parsers/types/pydantic/
- 특정 schema에 맞게 output을 구성하도록 LLM에 quary할 수 있게하는 parser.
"""
```

```python
class GradeDocuments(BaseModel):
    """Binary score for relevance check on retrieved documents."""

    binary_score: str = Field(description="Documents are relevant to the question, 'yes' or 'no'")

# LLM with function call 
structured_llm_grader_docs = llm.with_structured_output(GradeDocuments)

# Prompt 
system = """You are a grader assessing relevance of a retrieved document to a user question. \n 
    If the document contains keyword(s) or semantic meaning related to the question, grade it as relevant. \n
    Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question."""

grade_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "Retrieved document: \n\n {document} \n\n User question: {question}"),
    ]
)

retrieval_grader_relevance = grade_prompt | structured_llm_grader_docs

def grade_documents(state):
    print("---CHECK DOCUMENT RELEVANCE TO QUESTION---")
    question = state["question"]
    documents = state["documents"]
    
    # Score each doc
    filtered_docs = []
    web_search = "No"
    for d in documents["data"]["Get"]["Test"]:
        score = retrieval_grader_relevance.invoke({"question": question, "document": d["text"]}) # output: GradeDocuments(binary_score='yes/no')
        grade = score.binary_score
        # Document relevant
        if grade.lower() == "yes":
            print("---GRADE: DOCUMENT RELEVANT---")
            filtered_docs.append(d)
        # Document not relevant
        else:
            print("---GRADE: DOCUMENT NOT RELEVANT---")
            # We do not include the document in filtered_docs
            # We set a flag to indicate that we want to run web search
            web_search = "Yes"
            continue
    return {"documents": filtered_docs, "question": question, "web_search": web_search}
```


## Generate : GROQ

<center><img width="500" src="https://github.com/finddme/finddme.github.io/assets/53667002/c09ef5b1-d706-4157-b0d8-c85af9c282e3"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>











