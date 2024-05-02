---
title: LLM Tuning / Merge
category: Dev Log
tag: Development
---







* 목차
{:toc}












# 1\. Dev summary

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
     <table style="border-collapse:collapse">
       <tr>
         <th class="line4" bgcolor="#F8F7F9">Project</th>
         <th class="line2">Summary of the project</th><th class="line2">Related Pages</th>
       </tr>
       <tr>
         <td class="line3"><strong>Model Merge</strong></td>
         <td class="line">
           <strong>[mergekit]</strong>
           <li>base model:
             <ul>
               <li>7.24B급 모델</li>
             </ul>
           </li>
           <li>merge method:
             <ul>
               <li>MOE : 각 모델이 학습한 데이터 분야가 상이할 경우에 사용했음</li>
               <li>dare_ties</li>
               <li>slerp</li>
             </ul>
           </li>
         </td>
         <td class="line">
           <li><a href="https://finddme.github.io/natural%20language%20processing/2023/12/04/Mistral/">Related Paper Review (Mistral)</a></li>
         </td>
       </tr>
       <tr>
         <td class="line3"><strong>LLM DPO tuning</strong></td>
         <td class="line">
           <strong>[DPO + QLora]</strong>
           <li>base model:
             <ul>
               <li>Mistral 7b → qlora + dpo</li>
               <li>SOLAR-10.7B → qlora + dpo</li>
               <li>Mixtral-8x7B → qlora + dpo</li>
             </ul>
           </li>
           <strong>[Lora/ QLora / Full Fine tune]</strong>
           <li>base model:
             <ul>
               <li>LLaMa 2 13b → qlora</li>
               <li>LLaMa 13b → lora</li>
               <li>polyglot 12.8b → full fine tune / lora</li>
               <li>polyglot 5.8b → lora</li>
               <li>polyglot 3.8b → full fine tune</li>
               <li>polyglot 1.3b → full fine tune</li>
             </ul>
           </li>
         </td>
         <td class="line">
           <li><a href="https://finddme.github.io/natural%20language%20processing/2023/12/04/Mistral/">Related Paper Review (Mistral)</a></li>
<!--            <li><a href="https://github.com/finddme/LLM-Tuning/tree/main/DPO_QLora">DPO + QLora Tune Code</a></li>
           <li><a href="https://github.com/finddme/LLM-Tuning/tree/main/Full_Fine-Tune">Full Fine Tune Code</a></li>
           <li><a href="https://github.com/finddme/LLM-Tuning/tree/main/Lora_QLora">Lora/QLora instruction Tune Code</a></li> -->
           <li><a href="https://finddme.github.io/natural%20language%20processing/2023/10/10/LLMA2/">Related Paper Review (LLaMa 2)</a></li>
<!--            <li><a href="https://github.com/finddme/RAG/blob/main/make_instruction_Data_from_pdf.ipynb">Make Instruction Data from PDF Code</a></li> -->
<!--            <li><a href="https://finddme.github.io/development/2023/03/31/LLM_instruction_tuning/">Dev Log(data collenction + result)</a></li> -->
         </td>
       </tr>
       <tr>
         <td class="line3"><strong>LLM instruction tuning</strong></td>
         <td class="line">
           <strong>[vLLM RAG + DPO + Qlora]</strong>
           <li>base model:
             <ul>
               <li>Mistral 7B</li>
               <li>SOLAR-10.7B</li>
               <li>Mixtral-8x7B</li>
             </ul>
           </li>
           <strong>[Qlora]</strong>
           <li>base model:
             <ul>
               <li>LLaMa 2 13B</li>
             </ul>
           </li>
         </td>
         <td class="line">
           <li><a href="https://finddme.github.io/natural%20language%20processing/2023/12/04/Mistral/">Related Paper Review (Mistral)</a></li>
           <li><a href="https://finddme.github.io/natural%20language%20processing/2023/10/10/LLMA2/">Related Paper Review (LLaMa 2)</a></li>
<!--            <li><a href="https://github.com/finddme/LLM-Tuning/tree/main/DPO_QLora">DPO + QLora Tune Code</a></li>
           <li><a href="https://github.com/finddme/LLM-Tuning/tree/main/Lora_QLora">Lora/QLora instruction Tune Code</a></li>
           <li><a href="https://github.com/finddme/RAG">RAG with langchain Code</a></li> -->
         </td>
       </tr>
   </table>
 </body>
</html>


# 2. DATA

(**총 923,590개** 한국어 dolly 데이터)

## 2.1 instruction tuning data

### 2.1.1 형식

<pre>
{"instruction":instruction, "context": context, "response":response, "category": category}
</pre>

### 2.1.2 instruction tuning data로 변환한 데이터 목록

- **KoVicuna data**
    - 구성 : ko_dataset_chatgpt(2개), ko_alpaca_style_dataset
    - KoVicuna data to Dolly data:
      - gpt → instruction
      - human→ response
      - category → open_qa
      
    - KoVicuna Data 예시(1세트) → gpt와 human 대화
    - KoVicuna Data sample:
      <pre>
      {'id': 'QWJhYvA_0',
                   'conversations': [{'from': 'human',
                     'value': '고객을 위해 이러한 전략과 전술을 구현하는 성장 마케팅 대행사와 관련하여 Jeff Walker의 제품 출시 공식의 주요 아이디어를 글머리 기호로 요약하세요...'},
                    {'from': 'gpt',
                     'value': '다음은 성장 마케팅 대행사가 고객을 위해 적용할 수 있는 제프 워커의 제품 출시 공식의 주요 아이디어입니다:\r\n\r\n1. 타겟 고객과 그들의 니즈를 파악합니다: 제품이나 서비스의 이상적인 고객을 파악하고 이들에게 공감을 불러일으킬 수 있는 메시지를 작성합니다.\r\n2. 사전 출시: 입소문을 만들고, 사용 후기 및 사례 연구를 수집하고, 소셜 미디어를 사용하여 인지도를 높여 출시에 대한 기대감과 흥미를 조성합니다.\r\n3. 출시: 잘 짜여진 출시 시퀀스를 사용하여 판매와 전환을 극대화하세요. 여기에는 보너스 제공, 희소성 창출, 마감일을 사용하여 긴박감을 조성하는 것이 포함될 수 있습니다.\r\n4. 출시 후: 고객과 후속 조치를 취하고, 피드백을 수집하고, 지속적으로 가치를 제공하여 고객의 참여와 충성도를 유지하세요.\r\n5. 제품군을 만듭니다: 초기 제품이 성공하면 동일한 고객의 다른 요구 사항을 해결하는 추가 제품 또는 서비스를 만들어 제품을 확장합니다.\r\n6. 지속적인 최적화: 출시 프로세스와 제품군을 지속적으로 모니터링하고 최적화하여 결과를 개선합니다.\r\n7. 커뮤니티 구축: 출시 프로세스를 사용하여 제품에 대한 열정이 있고 널리 알리는 데 도움을 줄 수 있는 고객 커뮤니티를 구축하세요.\r\n8. 자동화를 활용하세요: 기술 및 자동화를 사용하여 출시 프로세스를 간소화하고 효율성을 개선하세요.'}, ...
      </pre>


- **Alpaca data**

  - Alpaca data to Dolly data:
    - instruction → instruction
    - output→ response
    - input → context
    - category → open_qa
    
  - Alpaca data 예시(1세트) → instruction, input, output
  - Alpaca data sample:
    <pre>
      {'instruction': '다음 국가와 관련된 역사적 사건 3가지를 나열하십시오.',
      <br>'input': '캐나다',
      <br>'output': '치푸아츠(Fort Chippewyan)는 캐나다 알버타주의 따뜻한 해안에 위치한 미국 원주민 지역에 근접한 유일한 유럽인 거주지입니다. 캐나다 프랑스 식성


