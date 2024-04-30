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
       <tr>
         <td class="line3"><strong>RAG + Chatbot</strong></td>
         <td class="line">
           <li>base model:
             <ul>
               <li>openai gpt-4</li>
               <li>LLaMa 2 13B</li>
             </ul>
           </li>
         </td>
         <td class="line">
           <li><a href="https://finddme.github.io/natural%20language%20processing/2023/10/10/LLMA2/">Related Paper Review (LLaMa 2)</a></li>
<!--            <li><a href="https://github.com/finddme/RAG">RAG with langchain Code</a></li> -->
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
      <br>'output': '치푸아츠(Fort Chippewyan)는 캐나다 알버타주의 따뜻한 해안에 위치한 미국 원주민 지역에 근접한 유일한 유럽인 거주지입니다. 캐나다 프랑스 식민지로 건설되었으며, 나스강을 따라 서부 지역으로 확장된 유일한 유럽인 거주지입니다. 1778 년 새로 지어진 건물에 현재는 휴게소가 있습니다. 시티오브 에드먼튼에서 선퍼드 언덕스를 향해 북쪽으로 4.5시간 떨어진 곳에 있습니다.'}
    </pre>
                

- **Korquad 2.0**
  - Korquad 2.0 data to Dolly data:
    - Q → instruction
    - A → response
    - context → context
    - category → open_qa
    
  - Korquad 2.0 data 예시(1세트) → Q, A, context
  - Korquad 2.0 data sample:
    <pre>
       {'version': 'KorQuAD_2.0_train',
                'data': {'title': '예고범',
               'url': 'https://ko.wikipedia.org/wiki/예고범',
               'context': WIKIPEDIA CONTEXT
                 'qas': [{'answer': {'text': '나카무라 요시히로, 히라바야시 카츠토시, 사와다 메구미',
                  'html_answer_start': 21842,
                  'html_answer_text': '나카무라 요시히로, 히라바야시 카츠토시, 사와다 메구미',
                  'answer_start': 6302},
                 'question': '드라마 예고범의 감독은 누구일까?',
                 'id': '8089'}]}}
    </pre>
      
- **Korquad 1.0**
  
  - Korquad 1.0 data to Dolly data:
    - Q → instruction
    - A → response
    - context → context
    - category → open_qa
    
  - Korquad1.0 데이터  예시(1세트) → Q, A, context
  - Korquad 1.0 data sample:
    <pre>
          {'qas': [{'question': '다테 기미코가 최초로 은퇴 선언을 한게 언제지',
             'answers': [{'answer_start': 260, 'text': '1996년 9월 24일'}],
             'id': '9_f2_wiki_2822-1'}],
           'context': "재팬 오픈에서 4회 우승하였으며, 통산 단식 200승 이상을 거두었다. 1994년 생애 최초로 세계 랭킹 10위권에 진입하였다. 1992년에는 WTA로부터 '올해 가장 많은 향상을 보여준 선수상'(Most Improved Player Of The Year)을 수여받았으며, 일본 남자 패션 협회(Japan Men's Fashion Association)는 그녀를 '가장 패셔너블한 선수'(Most Fashionable)로 칭했다. 생애 두 번째 올림픽 참가 직후인 1996년 9월 24일 최초로 은퇴를 선언하였다. 이후 12년만인 2008년 4월에 예상치 못한 복귀 선언을 하고 투어에 되돌아왔다. 2008년 6월 15일 도쿄 아리아케 인터내셔널 여자 오픈에서 복귀 후 첫 우승을 기록했으며, 2009년 9월 27일에는 한국에서 열린 한솔 코리아 오픈 대회에서 우승하면서 복귀 후 첫 WTA 투어급 대회 우승을 기록했다. 한숨 좀 작작 쉬어!"}
    </pre>


## 2.2 DPO train data

### 2.2.1 형식

<pre>
{"instruction":instruction, "context": context, "response":response, "category": category, "rejected", rejected}
</pre>

### 2.2.2 DPO traindata generate
  - openai api 사용
  - LLM 학습 데이터의 영어 비율이 높아 한국어 데이터를 통한 tuning 이후에도 추론 시 영어를 반환하는 경우가 있어 rejected에 response의 영어 번역 결과를 입력했음
  - dataset 출처는 instruction data와 동일



# 3\. Model

## 3.1 Model Architecture
  - LLaMa 1,2
  - Mistral
  - Solar
  - Kopolyglot

## 3.2 Instruction/DPO tuning Hyperparameter

## 3.2.1 Lora
```
    r=16,
    lora_alpha=16,
    lora_dropout=0.05,
    bias="none"
```

## 3.2.2 Quantization
```
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=False
```
## 3.2.3 Training
```
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    gradient_checkpointing=True,
    learning_rate=5e-5,
    lr_scheduler_type="cosine",
    num_train_epochs=6,
    save_steps=5,
    logging_steps=1,
     optim="paged_adamw_32bit",
    optim="adamw_torch",
    warmup_steps=100,
    bf16=True,
    bf16=False,
    report_to="wandb",
    save_total_limit=8
```

## 3.2.4 DPO trainer
```
    beta=0.1,
    max_prompt_length=1024,
    max_length=1536,
```

# 4\. Train

## 4.1 Training server environment
  - A100 x2
  - Ubuntu 22.04

# 5\. Problems and Solutions
  - LLM 추론 시 한국어 입력에 대한 영어 답변 반환 현상 -> DPO trainset rejected에 영어 답변 입력


