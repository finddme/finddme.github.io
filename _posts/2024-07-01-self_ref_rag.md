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

```
client = weaviate.Client("weaviate client url")

client.batch.configure(batch_size=100)

with client.batch as batch:
    for i, chunk in enumerate(chunks):
        vector = get_embedding(chunk["text"])
        batch.add_data_object(data_object=chunk, class_name="Test", vector=vector)

```

## Retrieve : Weaviate

<center><img width="500" src="https://github.com/finddme/finddme.github.io/assets/53667002/7f2966e5-3cd3-4d6b-b6e9-2c91e38fabae"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>
