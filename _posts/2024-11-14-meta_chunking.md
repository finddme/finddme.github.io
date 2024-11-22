---
title: "Meta-Chunking: Learning Efficient Text Segmentation via Logical Perception"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}












최근 LLM이 답변할 때 외부 지식을 참고하여 더 정확한 답변을 생성하도록 하는 RAG 기법이 많이 사용되고 있다. 쉽게 말하자면 RAG은 챗봇이 사용자의 질문에 답할 때 관련 문서들을 찾아보고 답하는 것이다. 이때 참조할 문서는 일정 길이의 chunk로 나뉘어 있는데 이 chunk를 나눌 때 서로 연관된 내용이 분리되거나 불필요한 내용이 포함될 경우, RAG의 결과가 좋지 않은 문제가 있다. 이와 같은 문제를 해결하고자 제안된 방법이 Meta-Chunking이다. Meta-Chunking은 문장들 간의 논리적 연결성을 고려하여 더 의미있는 단위로 문서를 분할하는 방법론이다. Meta-Chunking의 전략은 크게 두 가지이다. 

1) Margin Sampling Chunking
   - LLM이 연속된 문장들을 분리할지 말지 binary classification을 수행
   - 작은 규모의 LLM으로도 충분히 수행 가능
   - LLM을 쓰니까 데이터 처리 시간이 많이 걸림. 자원도 많이 들어감.
     
2) Perplexity Chunking
   - 텍스트의 복잡도(perplexity) 분포를 분석하여 문서가 나뉠 적절한 경계를 찾아내는 것이다.
   - 처리 효율성 향상
   - 자원과 시간 절약

> Perplexity는 LLM 평가 지표로 많이 사용된다. LLM은 sample text로부터 경험적 분포 P를 근사하는 분포 Q를 학습하도록 설계되어 있다. 추론 결과와 정답 text의 분포 차이를 정량화하여 모델을 평가한다. 두 분포 간의 유사성을 정량화하기 위해 cross-entropy가 사용된다.

본 논문은 기존의 chunking 방식들보다 RAG의 성능을 크게 향상시키고, 실제 적용 가능한 실용적은 방법을 제시한다.

<center><img width="800" src="https://github.com/user-attachments/assets/a0a7f2ee-8f86-4582-a495-0f615707aff7"></center>
<center><em style="color:gray;">https://arxiv.org/pdf/2410.12788</em></center><br>

Meta-Chunking의 핵심 목표는 아래와 같다:

- chunk 크기의 가변성을 허용하여 chunk 내용의 논리적 완전성을 효과적으로 유지한다.
- 각 chunk가 완전하고 독립적인 내용을 포함하도록 한다.
- 단순한 의미적 유사성을 넘어 인과관계, 문맥 진행 등 언어의 논리적 연결을 포함한다. 

위와 같은 목표를 달성하기 위해 Margin Sampling Chunking, Perplexity Chunking 이렇게 두 가지 전략을 구현했다. 

<center><img width="800" src="https://github.com/user-attachments/assets/9931e486-ecec-4782-9b4d-d8daf4b86d8d"></center>
<center><em style="color:gray;">https://arxiv.org/pdf/2404.12457</em></center><br>

# 1. Margin Sampling Chunking

1. 문서 내 문장들을 $(x_1, x_2, ..., x_n)$으로 분할한다.
2. 연속된 문장들이 분할되어야 하는지 이진 분류한다.(LLM으로)
3. 분류 결과의 확률차이를 구한다.<br>
   $Margin_M(x_i) = P_M(y = k_1\|Prompt(x_i, X')) - P_M(y = k_2\|Prompt(x_i, X'))$<br>
-> $k_1$과 $k_2$의 분리 여부가 결정된다.<br>

```python
def get_prob_subtract(model, tokenizer, sentence1, sentence2):
    # 실제 공개된 코드에는 중국어 버전 있음. 중국어 몰라서 뺌  
    query = '''This is a text chunking task. You are a text analysis expert. Please choose one of the following two options based on the logical structure and semantic content of the provided sentence:
    1. Split "{}" into "{}" and "{}" two parts;
    2. Keep "{}" unsplit in its original form;
    Please answer 1 or 2.'''.format(
        sentence1 + ' ' + sentence2,
        sentence1,
        sentence2,
        sentence1 + ' ' + sentence2
    )
    
    prompt = "<|im_start|>system\nYou are a helpful assistant.<|im_end|>\n<|im_start|>user\n{}<|im_end|>\n<|im_start|>assistant\n".format(query)
    prompt_ids = tokenizer.encode(prompt, return_tensors='pt').to(model.device)
    input_ids = prompt_ids
    
    # 출력 토큰 ('1'과 '2') 인코딩
    output_ids = tokenizer.encode(['1', '2'], return_tensors='pt').to(model.device)
    
    # # 모델 추론 버전으로 실행 (gradient 계산 없이 모델 예측 수행)
    with torch.no_grad():
        outputs = model(input_ids)
        # 마지막 토큰의 로짓 추출
        next_token_logits = outputs.logits[:, -1, :]
        # softmax를 통한 확률 변환
        token_probs = F.softmax(next_token_logits, dim=-1)
    
    # 각 선택지('1'과 '2')에 대한 확률 계산
    # PM(y = k1|Prompt(xi, X′)) 계산
    next_token_id_0 = output_ids[:, 0].unsqueeze(0)
    next_token_prob_0 = token_probs[:, next_token_id_0].item()
    
    # PM(y = k2|Prompt(xi, X′)) 계산      
    next_token_id_1 = output_ids[:, 1].unsqueeze(0)
    next_token_prob_1 = token_probs[:, next_token_id_1].item()
    
    # MarginM(xi) 계산: 두 확률의 차이
    prob_subtract = next_token_prob_1 - next_token_prob_0
    
    return prob_subtract
```

# 2. Perplexity Chunking

1. 문서를 문장 단위로 분리한다.
2. 각 문장 $x_i$의 PPL을 이전 문장들을 기반으로 계산한다.<br>
  <img width="300" src="https://github.com/user-attachments/assets/03008fdb-3dae-4d7a-b6f3-016cc887640e">
   
   - $K$는 $x_i$의 총 token 수
   - $t_i^k$는 $x_i$의 $k$번째 토큰
   - $t<i$는 $x_i$ 이전의 모든 토큰)<br>
3. PPL 분포를 분석하여 chunk 경계를 결정한다.

```python

class Chunking:
    def __init__(self, model, tokenizer) -> None:
        self.model = model
        self.tokenizer = tokenizer
    
    def get_ppl_batch(
                      self,
                      input_ids=None,
                      attention_mask=None,
                      past_key_values=None,
                      return_kv=False,
                      end=None
                  ):
        # batch 단위로 PPL(perplexity) 계산

        past_length = 0
        if end is None:
            end = input_ids.shape[1]
            
        # 모델 추론 버전으로 실행 (gradient 계산 없이 모델 예측 수행)
        with torch.no_grad():
            response = self.model(
                input_ids,
                attention_mask=attention_mask,
                past_key_values=past_key_values,  # 논문에서 설명한 KV 캐싱 사용
                use_cache=True,
            )
            past_key_values = response.past_key_values
            
        # cross entropy loss 계산
        shift_logits = response.logits[..., :-1, :].contiguous()
        shift_labels = input_ids[..., past_length + 1 : end].contiguous()
        
        # attention mask 적용 및 loss 계산
        active = (attention_mask[:, past_length:end] == 1)[..., :-1].view(-1)
        active_logits = shift_logits.view(-1, shift_logits.size(-1))[active]
        active_labels = shift_labels.view(-1)[active]
        loss_fct = torch.nn.CrossEntropyLoss(reduction="none")
        loss = loss_fct(active_logits, active_labels)
        
        return (loss, past_key_values) if return_kv else loss


def extract_by_html2text_db_nolist(sub_text, model, tokenizer, threshold, language='en') -> List[str]:
    temp_para = sub_text
    cleaned_text = temp_para
    
    # 문장부호를 기준으로 초기 세그먼트로 분할
    segments = split_text_by_punctuation(cleaned_text, language)
    segments = [item for item in segments if item.strip()]
    
    # 청킹 초기화
    ch = Chunking(model, tokenizer)
    len_sentences = []
    input_ids = torch.tensor([[]], device=model.device, dtype=torch.long)
    attention_mask = torch.tensor([[]], device=model.device, dtype=torch.long)
    
    # 모든 세그먼트 토큰화
    for context in segments:
        tokenized_text = tokenizer(context, return_tensors="pt", add_special_tokens=False)
        input_id = tokenized_text["input_ids"].to(model.device)
        input_ids = torch.cat([input_ids, input_id], dim=-1)
        len_sentences.append(input_id.shape[1])
        attention_mask_tmp = tokenized_text["attention_mask"].to(model.device)
        attention_mask = torch.cat([attention_mask, attention_mask_tmp], dim=-1)
    
    # PPL 계산
    loss, past_key_values = ch.get_ppl_batch(
                                            input_ids,
                                            attention_mask,
                                            past_key_values=None,
                                            return_kv=True
                                        )
    
    # 각 세그먼트의 PPL 계산
    first_cluster_ppl = []
    index = 0
    for i in range(len(len_sentences)):
        if i == 0:
            first_cluster_ppl.append(loss[0:len_sentences[i]-1].mean().item())
            index += len_sentences[i]-1
        else:
            first_cluster_ppl.append(loss[index:index+len_sentences[i]].mean().item())
            index += len_sentences[i]
    
    # PPL 최소값을 기반으로 청크 경계 찾기
    minima_indices = find_minima(first_cluster_ppl, threshold)
    first_chunk_indices = []
    first_chunk_sentences = []
    
    # 최종 청크 생성
    split_points = [0] + minima_indices + [len(first_cluster_ppl)-1]
    for i in range(len(split_points)-1):
        tmp_index = []
        tmp_sentence = []
        if i == 0:
            tmp_index.append(0)
            tmp_sentence.append(segments[0])
        for sp_index in range(split_points[i]+1, split_points[i+1]+1):
            tmp_index.append(sp_index)
            tmp_sentence.append(segments[sp_index])
        first_chunk_indices.append(tmp_index)
        first_chunk_sentences.append(tmp_sentence)
    
    # 최종 텍스트 세그먼트로 청크 결합
    final_chunks = []
    for sent_list in first_chunk_sentences:
        final_chunks.append(''.join(sent_list))
    
    return final_chunks
```


chunk의 경계는 PPL 값의 local minima 지점이다. Minima는 아래와 같은 수식으로 계산된다:

<img width="700" src="https://github.com/user-attachments/assets/123d31ba-51a8-4c90-91e8-7704818b6535">

위 수식은 두 가지 경우를 고려한다:

1. 현재 문장의 PPL이 이전 문장과 다음 문장의 PPL 보다 $θ$(threshold)이상 낮은 경우
2. 현재 문장의 PPL이 이전 문장보다 $θ$이상 낮고, 다음 문장과는 동일한 경우.

```python
def find_minima(values, threshold):
    minima_indices = []
    for i in range(1, len(values) - 1):
        # 현재 값이 이전 값보다 작고 다음 값보다 작은 경우 (local minima)
        if values[i] < values[i - 1] and values[i] < values[i + 1]:
            if (values[i - 1]-values[i] >= threshold) or (values[i + 1]-values[i] >= threshold):
                minima_indices.append(i)
        # 현재 값이 이전 값보다 작고 다음 값과 같은 경우
        elif values[i] < values[i - 1] and values[i] == values[i + 1]:
            if values[i - 1]-values[i] >= threshold:
                minima_indices.append(i)
    return minima_indices

# https://github.com/IAAR-Shanghai/Meta-Chunking/blob/main/example/chunk_rag.py
# 위 링크에 dynamic minima 찾는 코드도 있음 
```




# Reference

> https://github.com/IAAR-Shanghai/Meta-Chunking <br>
> [META-CHUNKING: LEARNING EFFICIENT TEXT SEGMENTATION VIA LOGICAL PERCEPTION](https://arxiv.org/pdf/2410.12788)
