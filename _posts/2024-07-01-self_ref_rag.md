---
title: "Self-Reflective RAG (작성 중)"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}












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
         </td>
       </tr>
   </table>
 </body>
</html>

- RAG Framework : LangGraph
- LLM : Mixtral-8x7b
- Inference accelerate : GROQ
- text embedding : Openai
- vector DB : Wevieate
- web search : Tavily
