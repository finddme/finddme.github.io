---
title: "Speculative Decoding🚀 (작성 중)"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}











최근 일반적으로 사용되는 LLM들은 Auto-regressive model로, Transformers Decoder 구조를 기반으로 한다. Auto-regressive model은 새로운 token을 순차적으로 생성한다. 즉, 여러 token이 병렬적으로 예측되지 않는다. 현재 time step의 token이 있어야 그 다음 token을 예측하니까 당연한 이야기이다. 이러한 이유로 output token이 길 수록 생성 속도가 매우 느려진다는 문제가 있다. 이러한 문제를 해결하고자 Speculative Decoding이 제안되었다. 

# 1. Operating Process

Speculative Decoding은 **main model**과 그에 비해 비교적 작은 size의 **assistant model**이 필요하다. 기본 과정은 아래와 같다:

1. assistant model이 n개의 token으로 이루어진 sequence를 생성
2. main model이 single forward pass로  assistant model이 생성한 sequence를 검토
3. main model은 검토 과정에서 sequence를 순방향으로 체크하며 잘못된 token을 찾아낸다.
4. sequence 내 잘못된 token 이후의 token들을 모두 버리고, main model이 auto-regressive하게 나머지 sequence를 다시 채워 나간다.

이러한 과정은 크게 두 개념을 바탕으로 한다:

- 작은 size의 모델은 inference 속도가 빠르다
- 비교적 큰 size의 main model이 zero-base에서 생성하는 것보다 하나씩 읽으며 검토하는 속도가 더 빠르다 (인간도 글을 쓰는 시간보다 읽는 시간이 빠른 것처럼)
- 어차피 main model이 검토하며 자신이 썼을만한 token까지는 수용하고 그렇지 않다고 판단된 token부터는 본인이 직접 생성하니 결과적으로 main model만 사용했을 때와 아주 유사한 결과가 나온다. (생성 모델의 결과는 일정하지 않기 때문에 "아주 유사한 결과"라고 표현)

# 2. Note

Speculative Decoding 적용 시, 유의해야 할 점이 몇 가지 있다.

1. model 선택
   
  적절한 main model과 assistant model 선정이 중요하다. LLM들이 spec-dec에 적용하였을 때 서로 잘 호환되는 것은 아니다. 두 모델 선택 시 중요한 것은 vocab이다. 동일한 vocab을 사용하는 모델만 spec-dec에 적용 가능하다.

  예를 들어, LLaMa 2는 32K의 vocab을 사용하고 LLaMa 3은 128K의 vocab을 사용하기 때문에 두 모델은 spec-dec에 적용할 수 없다.
  
2. assistant model의 크기

# Inference Engine + Speculative Decoding
최근 다양한 LLM Inference Engine들이 나온는데 대부분 Speculative Decoding을 지원한다.


- vllm
  
  ```python
  # vllm==0.5.4
  
  from vllm import SamplingParams
  from vllm.engine.arg_utils import AsyncEngineArgs
  from vllm.engine.async_llm_engine import AsyncLLMEngine
  import uuid
  import asyncio
  
  # === model prepare ================================================
  model_args = AsyncEngineArgs(
              model="meta-llama/Meta-Llama-3.1-70B-Instruct", # main model
              speculative_model="meta-llama/Meta-Llama-3.1-8B-Instruct", # assistant model
              trust_remote_code=True,
              tensor_parallel_size=4, # 짝수개로 넣어야 작동(GPU가 3개면 2로 지정)
              max_num_seqs=8,
              dtype="half", # FP16 bit precision으로 가중치를 load. full FP32보다 메모리 사용량이 절반으로 줄어듦.
              use_v2_block_manager=True, # True 아니면 error 뜸
              enforce_eager=True # True 아니면 error 뜸
          )
  # + 70B 모델은 약 140GB의 VRAM을 차지
  
  llm_engine = AsyncLLMEngine.from_engine_args(model_args)
  
  # === inference basic ================================================
  
  prompt = "바다가 파란색인 이유"
  stream = True
  max_tokens = 1024
  model_input = {"max_tokens": max_tokens}
  sampling_params = SamplingParams(**model_input)
  
  idx = str(uuid.uuid4().hex)
  vllm_generator = llm_engine.generate(prompt, sampling_params, idx)
  
  # === inference stream ================================================
  
  async def stream_tokens():
      full_text = ""
      async for request_output in llm_engine.generate(prompt, sampling_params, idx):
          if len(request_output.outputs) > 0:
              text = request_output.outputs[0].text
              delta = text[len(full_text):]
              full_text = text
              print(delta, end='', flush=True)
      print()
  
  await stream_tokens()
  ```

  - vllm + Speculative Decoding Performance 
