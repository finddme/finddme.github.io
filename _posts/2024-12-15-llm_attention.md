---
title: "2024 LLM Attention (작성 중)"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}













Transformer는 2017년 발표된 "Attention Is All You Need" 논문에서 발표되었다. 최근 GPT 계열의 LLM들은 대부분 Transformer의 decoder 구조를 기반으로 하고 있다. 

# Transformer and Self-Attention

최근 많이 사용되는 GPT계열 모델들(decoder 기반 모델)은 autoregressive 모델이라고도 불린다. autoregressive 모델이라고 불리는 이유는 이전 time step의 출력이 다음 time step의 입력으로 들어가는 점이 자기 회기적이기 때문이다. 해당 모델은 이런 방식으로 이전 time step의 결과를 다음 time step의 입력으로 받아 다음 token을 예측하는 task를 수행한다. 

## Transformer 기본 구성 요소

- Tokenizer: 입력 text를 token 단위로 나눔
- Embedding Layer: token을 vector로 변환
- dropout, layer normalization, feed-forward: 기본 신경망 layer들
- self attention layer

## Basic Self-Attention

self-attnetion은 모델이 다음 toekn을 생성할 때 입력 sequence의 특정 부분에 주의를 기울일 수 있도록 하는 것이다. 

```
She poured the coffee into the cup
```

위 문장의 경우, 모델이 "into"라는 단어를 예측할 때, "poured"와 "coffee"와 같이 다음 단어를 예측하기에 더 도움이 되는 중요한 문맥을 제공하는 token에 주의를 기울여 다음 단어를 예측하도록 하는 것이 self-attention이다.

이를 위해 self-attnetion은 각 embedding token을 context vector라는 것으로 변환시킨다. 이는 주어진 text의 모든 input으로부터 정보를 결합하는 방식으로 계산된다.

### Context Vector 생성 과정 예시

```
The cat sat on the mat
```

1. 각 단어마다 하나의 context vector가 생성된다. (위 예문의 경우 3개)
2. "cat"이라는 단어의 컨텍스트 벡터를 만들 때 아래와 같은 가중치 행렬들이 필요하
3. Query: "cat"이 다른 단어들과 얼마나 관련있는지 계산
4. Key: 입력 시퀀스 내 모든 token들 특징
5. Value: 입력 시퀀스 내 각 단어의 실제 의미


```python
class Basic_SelfAttention(torch.nn.Module):

    def __init__(self, d_in, d_out, qkv_bias=False):
        super().__init__()
        self.W_query = torch.nn.Linear(d_in, d_out, bias=qkv_bias) # 현재 time step의 toeken이 다른 token들과 얼마나 관련 있는지 나타내는 가중치 행렬
        self.W_key   = torch.nn.Linear(d_in, d_out, bias=qkv_bias) # 입력 시퀀스 내 모든 token들을 나타내는 가중치 행렬 
        self.W_value = torch.nn.Linear(d_in, d_out, bias=qkv_bias) # 입력 시퀀스 내 각 단어의 실제 의미가 담긴 가중치 행렬

    def forward(self, x):
        # 현재 처리 중인 token x에 대한 가중치 행렬 계산
        keys = self.W_key(x)
        queries = self.W_query(x)
        values = self.W_value(x)
        
        attn_scores = torch.matmul(queries, keys.T) # 현재 time step token과 다른 token들 간의 관련성 scoring 
        attn_weights = torch.softmax(
          attn_scores / keys.shape[-1]**0.5, dim=-1
        ) # attention 가중치 정규화

        context_vec = torch.matmul(attn_weights, values)  # context vector 생
        return context_vec
```

## Basic self-attention + Advanced modules

Decoder based 모델에 사용되는 self-attention은 masked self-attention으로, 위와 같은 기본 self-attention에 몇 가지 기법/기술을 추가하여 사용하는 것이 일반적이다.

아래 나오는 코드들의 출처는 모두 [https://github.com/meta-llama/llama3/blob/main/llama/model.py](https://github.com/meta-llama/llama3/blob/main/llama/model.py)이다.

1. Causal Masking
   미래 token들을 못 보게 막는 

   ```python
   # mask 생성
   # -inf나 매우 큰 음수값을 더해서 softmax 후에 해당 위치의 attention 가중치가 0이 되도록 함
    mask = torch.full((seq_len, seq_len), float("-inf"))
    mask = torch.triu(mask, diagonal=1)  # 상삼각 행렬만 -inf로 채움
   """
   저렇게 하면 아래와 같은 모양이 됨. 0 부분은 나중에 score랑 합해지고 softmax를 거쳐도 살아남고, -inf 부분은 0이됨. 
   [[0, -inf, -inf, -inf],
   [0,    0, -inf, -inf],
   [0,    0,    0, -inf],
   [0,    0,    0,    0]]
    """
   
    # attention 계산 부분에서
    scores = torch.matmul(xq, keys.transpose(2, 3)) / math.sqrt(self.head_dim)
    if mask is not None:
        scores = scores + mask  # mask 적용
    scores = F.softmax(scores.float(), dim=-1).type_as(xq)
   ```

2. Multi-head
  - 여러 세트의 가중치 행렬(Wk, Wq, Wv) 사용
  - 각 헤드가 서로 다른 관점에서 입력을 분석할 수 있음음
  - **헤드 수 설정**
  ```python
  self.n_kv_heads = args.n_heads if args.n_kv_heads is None else args.n_kv_heads # 4. (key, value attention 헤드 수 -> GQA를 위해 query보다 적은 헤드 수 사용)
# model_parallel_size=2, n_kv_heads=32
  self.n_local_heads = args.n_heads // model_parallel_size # 16. local query 헤드 수. 각 gpu에서 처리하는 query 헤드 수 (model_parallel_size는 병렬처리 할 gpu 수.)
  self.n_local_kv_heads = self.n_kv_heads // model_parallel_size # 2. local key,value 헤드 수. 각 gpu에서 처리하는 key,value 헤드 수
  self.head_dim = args.dim // args.n_heads # 128. 전체 모델 차원을 헤드 수로 나눈 값
  ```
  - **입력 tensor Linear 변환**
    병렬처리를 위한 Linear 변환
      - 장점:
        - 각 GPU가 더 작은 가중치 행렬을 저장
        - 행렬 곱셈을 병렬로 처리
        - GPU 간 통신 비용 감소 (gather_output=False)
      - 단점:
        - 입력은 모든 GPU에 복제 필요
        - GPU 수에 따라 모델 구조 조정 필요<br>
  ```python
  # 입력 tensor 예시
  # x shape: (batch_size=2, seq_len=1024, dim=4096)
  """
    예시 데이터:
    [
      [token1: [4096개의 값], 
       token2: [4096개의 값],
       ...
       token1024: [4096개의 값]],
      [다음 배치...]
    ]
  """
  self.wq = ColumnParallelLinear(
      args.dim, # 입력 차원. 4096
      args.n_heads * self.head_dim, # 출력 차원 (32 * 128 = 4096)
      bias=False, # 편향 사용하지 않음
      gather_output=False, # 출력 모으지 않음
      init_method=lambda x: x,
  )
  self.wk = ColumnParallelLinear(
      args.dim,
      self.n_kv_heads * self.head_dim, # 출력 차원 (4 * 128 = 512)
      bias=False,
      gather_output=False,
      init_method=lambda x: x,
  )
  self.wv = ColumnParallelLinear(
      args.dim,
      self.n_kv_heads * self.head_dim, # 출력 차원 (4 * 128 = 512)
      bias=False,
      gather_output=False,
      init_method=lambda x: x,
  )

  xq = self.wq(x)  # (2, 1024, 4096) -> (2, 1024, 32*128)
  xk = self.wk(x)  # (2, 1024, 4096) -> (2, 1024, 4*128)
  xv = self.wv(x)  # (2, 1024, 4096) -> (2, 1024, 4*128)

  """
  [(wk/wv) 일반적인 Linear와 ColumnParallelLinear 비교. 입력 크기가 (2, 1024, 4096)일 때]
  일반 Linear 결과: (2, 1024, 4096) -> (2, 1024, 512)
  ColumnParallelLinear: GPU별로 출력 차원을 분할
  
  GPU 2개 사용 시
  - GPU 1: (2, 1024, 4096) -> (2, 1024, 256)
  - GPU 2: (2, 1024, 4096) -> (2, 1024, 256)

  -------------------------------------------------------------------------------------
  
  - gather_output=True일 경우:
    -> 각 GPU의 결과를 모아서 전체 출력 생성
    -> (2, 1024, 512)
  
  - gather_output=False일 경우 (GPU 간 통신 비용 감소):
    -> 각 GPU가 자신의 결과만 유지
    -> GPU1: (2, 1024, 256)
    -> GPU2: (2, 1024, 256)
  """
  ```
  - **view로 입력을 여러 헤드로 분할**
  ```python
  xq = xq.view(bsz, seqlen, self.n_local_heads, self.head_dim)
  xk = xk.view(bsz, seqlen, self.n_local_kv_heads, self.head_dim)
  xv = xv.view(bsz, seqlen, self.n_local_kv_heads, self.head_dim)

  """
  - Query: (2, 1024, 4096) -> (2, 1024, 32, 128)
  xq = xq.view(bsz, seqlen, self.n_local_heads, self.head_dim)
  예시:
  [
    [token1: [[head1: 128값], [head2: 128값], ..., [head32: 128값]],
     token2: [32개의 헤드],
     ...
     token1024: [32개의 헤드]],
    [다음 배치...]
  ]
  
  - Key/Value: (2, 1024, 512) -> (2, 1024, 4, 128)
  xk = xk.view(bsz, seqlen, self.n_local_kv_heads, self.head_dim)
  예시:
  [
    [token1: [[head1: 128값], [head2: 128값], [head3: 128값], [head4: 128값]],
     ...],
    [다음 배치...]
  ]
  """

  ```

## Modified self-attention

최근 LLM들은 처리 속도 향상, 메모리 효율성 개선, 더 나은 문맥 이해, 긴 문서 처리 능력 향상 등을 위해 기본 attention을 변형시킨 attention을 주로 사용한다.

### 1. Grouped Query Attention

관련 토큰들을 그룹으로 처리하는 attention.

### 2. Paged Attention

긴 sequence를 page 단위로 나누어 처리. (예를 들어 1000 token을 100 token씩 10page로 나누어 처리)

### 3. Sliding-window Attention

현재 token 주변의 일정 범위만 참조 

### 4. Flash Attention

Tiling 기법을 사용하여 GPU의 고속 SRAM을 효율적으로 활용하여 메모리 효율성과 attention 연산 속도를 크게 개선한 방법론 
