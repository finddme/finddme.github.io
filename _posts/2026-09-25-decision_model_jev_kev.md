---
title: "Decision Model: <span style='font-weight:bold; font-family:CMU Serif Roman;'>Jev</span>, Kev"
category: LLM / Multimodal
tag: Multimodal
thumbnail: /public/thumbnails/posts-2026-09-25-decision-model-jev-kev.webp
thumbnail_source: https://github.com/user-attachments/assets/6408c678-9703-4cb7-92e7-7c3e78bc51b8
---

* 목차
{:toc}

# Decision Model: Jev, Kev

Jev는 호스팅 API로 제공되는 decision model이고 Kev는 자체 호스팅과 fine-tuning이 가능한 오픈소스 모델. 두 모델 모두 분류/라우팅처럼 답의 범위가 정해진 작업에 사용한다.

- Jev 기능 설명은 1.13/1.14 기준. 성능 수치는 각 평가에 사용된 버전과 조건에 한정
- Kev 수치는 별도 표기가 없으면 Kev 1.0에 대한 개발팀 자체 평가 [49][52]

---

## 0. 요약

1. Decision model은 상태와 타입이 지정된 질문을 받아 **정해진 답과 확률**을 반환. 생성 디코딩을 생략하는 구현은 지연을 줄일 수 있지만 질문 수/입력 길이/하드웨어에 따라 비용과 속도가 달라진다.
2. Jev는 TypeSafe가 처음 공개한 System One 모델(2026-09-15). backbone/파라미터 수와 세부 구조/학습 방식은 비공개
3. Kev는 Jev 구조에 대한 제3자 가설(Archer Hume)을 Qwen 위에 구현한 오픈소스 재현판. LM head 대신 pointer head로 선택지를 평가. Kev 1.0은 공유 state를 캐시하고 질문별 행을 배치 처리. Jev와 같은 구조라는 보장은 없다
4. Kev 측 평가에서 Kev-27B의 일부 분류 성능은 Jev에 근접했지만 지식형 질문과 자동화율에서는 격차 존재. 세부 수치와 평가 조건은 4.4 참조
5. OpenAI는 Decisions API(`gpt-6-luna`)로 같은 카테고리에 진입. Claude Haiku 5.5는 일반 생성형 모델이며 AI SDK에서는 structured output adapter로 연결
6. 한국어: Jev/Kev 모두 영어 중심이며 한국어 정확도 공식 수치 부재
    - Jev는 고객별 fine-tuning 불가 → 질문/상태 구성과 임계값을 자체 평가셋으로 조정
    - Kev는 오픈소스라 한국어 라벨 fine-tuning + temperature 재보정 가능
7. Jev는 외부 SaaS(미국 호스팅). ZDR은 엔터프라이즈 계약에서만 제공. 외부 전송 불가 데이터 경로는 Kev 등 오픈 가중치 모델의 자체 호스팅이 선택지

---

## 1. Decision model이란

### 1.1 정의와 명칭

- **decision model**: 일반 카테고리 명칭. 비구조 상태를 받아 타입이 지정된 확률적 결정을 반환하는 모델
- **System One model**: TypeSafe의 명칭. Kahneman의 System 1(빠른 직관적 판단)에서 유래하며 LLM을 System 2(느린 숙고)로 규정 [1][2]
    - TypeSafe 표어: "unstructured state in, typed probabilistic decisions out". 소프트웨어가 호출하는 결정 함수로 포지셔닝 [1]
이 글에서는 Jev/Kev와 유사한 제품군을 decision model로 통칭. TypeSafe의 System One은 이 범주에 대한 자체 명칭 [1][49][75].

### 1.2 생성 LLM과의 차이

| 구분 | 생성 LLM | Decision model |
| --- | --- | --- |
| 출력 | 텍스트(토큰열) | 닫힌 집합의 답 + 확률/confidence |
| 실행 | 일반적으로 토큰 생성 루프 반복 | Kev는 생성 루프 없이 prefix와 질문별 행 평가. 다른 서비스의 내부 구현은 비공개 |
| 지연 | 입력/출력 길이와 서빙 조건의 영향 | 입력 길이/질문 수/배치/캐시/서빙 조건의 영향 |
| 과금 | 보통 입력/출력 토큰 과금 | Jev/Decisions는 출력 무료. 자체 호스팅은 인프라 비용 |
| 확률 | 지원 모델의 logprob 또는 프롬프트로 얻은 추정치. 별도 검증 필요 | 선택지별 확률 제공. softmax 출력만으로 calibration이 보장되지는 않는다 |
| 질문 정의 | 프롬프트 | 런타임에 자연어로 질문과 선택지 정의 |
| 대표 용도 | 생성/설명/추론 | 분류/라우팅/이진 판정/점수화 |

- 생성 토큰이 없어도 응답 JSON에는 길이가 있다. Kev의 `usage.output_tokens`는 이 JSON의 토큰 수를 계산 [54]
- "환각 0%"(TypeSafe 주장)는 **타입 안전성(스키마 일치)**에 대한 주장이며 답의 정확성 보장이 아니다 [1][2]

---

## 2. 동작 원리: 생성형 LLM 기반인데 왜 생성하지 않나

- **Jev 내부는 비공개.** 이 장은 소스가 공개된 Kev 코드 기준 설명
- Kev 구조 자체도 Archer Hume의 Jev 구조 가설을 구현한 것이라 Jev와 같다는 보장은 없다 [49][58]
- TypeSafe는 Jev를 비자기회귀 모델로 설명하고 질문을 병렬 평가한다고 명시. 구체적인 head와 실행 경로는 비공개 [1][2]
- TypeSafe 블로그의 구조 표현은 "new model architecture", "parallel sampler", 모든 출력을 한 번에 생성한다는 수준 [1]

### 2.1 decoder LLM은 두 부분으로 나뉜다 (일반론)

<center><img width="1200" src="https://github.com/user-attachments/assets/6408c678-9703-4cb7-92e7-7c3e78bc51b8"></center>
<center><em style="color:gray;">decoder LLM 구조: 트랜스포머 본체가 hidden state를 만들고 LM head와 샘플링 루프가 토큰을 하나씩 덧붙여 재실행</em></center><br>

1. **본체**: 토큰열을 읽어 위치마다 hidden state를 계산하는 함수
    - 각 위치의 hidden state는 그 위치까지의 입력 내용을 담은 벡터 표현
    - 본체 자체는 아무것도 생성하지 않는다
2. **LM head**: 마지막 위치의 hidden state를 어휘 크기의 logit으로 바꾸는 선형층. 다음 토큰 확률은 logit에 softmax를 적용한 값
3. **"생성"**: **반복 루프**(autoregressive decoding)일 뿐
    - LM head 출력에서 토큰 하나를 샘플링
    - 그 토큰을 입력 끝에 붙여 본체를 다시 실행
    - 출력이 100토큰이면 100회 반복
- 텍스트 생성에는 학습된 가중치와 **LM head + 디코딩 루프**가 함께 필요. backbone만으로도 입력의 hidden state를 계산 가능
- 본체는 입력 문맥을 hidden state로 인코딩하는 부분이며 그 능력은 대규모 사전학습에서 획득

본체는 토큰 임베딩에 위치 정보를 반영하고 여러 블록을 거쳐 hidden state를 계산. 표준 decoder Transformer의 causal attention은 각 위치에서 자기 자신과 앞선 토큰만 참조하며 FFN은 위치별로 적용 [110][111].

실제 생성에서는 앞 토큰의 KV 캐시를 재사용하므로 매번 전체 입력을 다시 계산하지 않는다. Kev는 이 문맥 표현 능력을 활용하되 다음 토큰을 생성하는 대신 입력의 선택지를 평가한다.

### 2.2 출력층 교체: pointer head

<center><img width="1200" src="https://github.com/user-attachments/assets/668221cd-c324-4c91-96b1-d8c025514036"></center>
<center><em style="color:gray;">Kev의 질문 한 행 처리: Qwen의 선택지/질문 표현을 pointer head로 비교. 여러 질문은 공유 prefix 캐시와 배치로 처리</em></center><br>

- 입력을 직렬화한 뒤 선택지 끝의 hidden state와 질문 끝의 hidden state를 비교. pointer head의 점수를 temperature로 보정하고 softmax로 확률화 [54]

`DecisionModel`은 backbone의 `last_hidden_state`를 pointer head에 전달. base 로딩 경로에서는 LM head를 로드한 뒤 본체만 사용하고 전체 가중치 체크포인트는 `AutoModel`로 로드 [54].

단계별 흐름 [49][51][54]

1. **입력을 한 줄로 직렬화.** 선택지마다 여는/닫는 마커를 두고 질문 끝에 `<decide>` 마커를 둔다
    
    ```
    <state> …문서… <q> 지시문 <opt> 선택지1 </opt> <opt> 선택지2 </opt> … <decide>
    ```
    
    - 마커는 새 토큰 추가가 아니라 Qwen에 이미 있는 특수 토큰(`<|fim_prefix|>`, `<|box_start|>` 등)의 재활용(Kev-0.5B 카드 기준). 사용자 입력에 같은 문자열이 있으면 이스케이프해 마커 위조 차단 [51][49]
    - 타입별 변환 [54]
        - `noul`: 선택지 2개(`no`, `yes`)로 변환. 응답은 p(yes)
        - `score`: 단계들을 순서대로 선택지로 변환해 같은 틀에 투입. 응답은 단계 확률의 기대값
2. **한 질문 행을 본체로 평가**해 필요한 위치의 hidden state 계산. 다중 질문의 공유 prefix/배치 경로는 2.4에서 설명
3. **두 종류의 위치를 골라 읽기**
    - 각 선택지의 `</opt>` 위치: causal 모델이므로 "문서 + 지시문 + (앞 선택지들) + 이 선택지 내용"까지 반영한 표현. 즉 **선택지 하나의 표현**
    - `<decide>` 위치: 맨 끝이라 문서/지시문/모든 선택지를 모두 반영한 상태. 즉 **선택지 전체를 반영한 질문 표현** [49]
4. **pointer head**로 둘을 비교. 실제 코드 [54]
    
    ```python
    self.q, self.k = nn.Linear(d, 256), nn.Linear(d, 256)
    z = (self.k(h_opts) @ self.q(h_decide)) / sqrt(256)   # 선택지별 점수
    ```
    
    - `<decide>` 벡터를 query로, 각 `</opt>` 벡터를 key로 256차원에 투영한 뒤 내적(scaled dot product). attention 점수 계산과 같은 형태
    - "pointer"라는 이름: 출력이 고정 라벨이 아니라 **입력 안의 위치(선택지) 중 하나를 가리키는 분포**(pointer network 계열 명명, 일반론). 용어 유래는 2.8 끝 참고 박스
5. **temperature로 나누고 softmax** → 선택지별 확률 [49]
    - temperature는 체크포인트마다 하나: 0.8B 2.35 / 4B 2.41 / 9B 2.19 / 27B 1.32
    - 양수 temperature는 한 질문 안의 선택지 순위와 argmax를 유지하며 확률 분포를 조정
6. 확률에서 `choice`/`confidence`/`score`를 계산해 System One 형식 JSON으로 반환
    - Choice confidence = `(p_max − 1/K)/(1 − 1/K)`(TypeSafe 레퍼런스 어댑터와 동일 공식) [49]
- 결과: **생성 루프 없이 선택지별 확률 계산**. 선택지가 늘면 입력 길이와 연산량도 증가하며 질문 배치가 커지면 여러 패스로 처리
    - API의 `usage.output_tokens`는 생성 토큰이 아니라 응답 JSON 길이를 센 값 [49]
- 출력층이 어휘 전체(Kev 1.0 backbone 기준 248,320개)짜리 분류기에서 "주어진 선택지 K개짜리 분류기"로 바뀐 구조 [114]
    - 선택지는 매 요청마다 달라도 된다(최대 255개). 고정 라벨 분류 head와의 핵심 차이

<details class="post-disclosure" markdown="1">
<summary>Qwen backbone의 층 구성과 내부 연산</summary>

Kev 1.0 backbone 내부

- Qwen3.5/3.8 하이브리드 층 스택. config `layer_types`는 `[linear_attention, linear_attention, linear_attention, full_attention]` 반복이고 `full_attention_interval: 4`. 첫 층은 Gated DeltaNet, 마지막 층은 gated attention [114]
- 모델 카드 표기: `N × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))` [114]

| backbone | N | 층 수(DeltaNet + attention) | hidden |
| --- | --- | --- | --- |
| Qwen3.5-0.8B-Base | 6 | 24(18 + 6) | 1,024 |
| Qwen3.5-4B-Base | 8 | 32(24 + 8) | 2,560 |
| Qwen3.5-9B-Base | 8 | 32(24 + 8) | 4,096 |
| Qwen3.8-27B | 16 | 64(48 + 16) | 5,120 |

- 층 하나 = RMSNorm → token mixer(Gated DeltaNet 또는 gated attention) → residual → RMSNorm → FFN → residual. 마지막 층 뒤 최종 RMSNorm. 2.1 일반론의 pre-norm 블록에서 attention 자리만 층마다 다른 구조 [117]
- Gated DeltaNet: 선형 attention 계열의 순환형 층. 고정 크기 행렬 상태 S를 토큰마다 갱신(`S_t = S_{t-1}(α_t(I − β_t k_t k_tᵀ)) + β_t v_t k_tᵀ`)하고 출력은 `o_t = S_t q_t`. 상태 크기가 토큰 수와 무관 [115][119]
- gated attention: softmax attention 출력에 sigmoid gate를 곱한 형태. Qwen3.5 구현은 q_proj 출력을 query와 gate로 나눠 `attn_output × sigmoid(gate)` [116][117]
- Kev가 읽는 `last_hidden_state`는 최종 RMSNorm을 거친 값 [54][117]
- 어휘: Qwen3.5/3.8 backbone의 `vocab_size`는 248,320(padded). Kev-0.5B 프로토타입의 Qwen2.5와 Qwen3 세대는 151,936 [114][121]

</details>

### 2.3 실행 경로 비교: 생성 LLM vs Kev

| 구분 | 생성 LLM | Kev |
| --- | --- | --- |
| 사용하는 부분 | 본체 + LM head | 본체 + pointer head (LM head는 로드 후 버린다) |
| 본체 출력 | 위치별 hidden state | 위치별 hidden state (동일) |
| 최종 출력층 | LM head: 마지막 hidden state → 어휘 전체의 다음 토큰 확률 | pointer head: `<decide>`와 각 `</opt>` hidden state 내적 → 선택지 K개의 확률 |
| 실행 | 일반적으로 생성 토큰마다 디코딩 반복 | prefix 계산 후 질문 행을 배치 처리. 배치 크기에 따라 여러 패스 |
| 출력 | 텍스트 | 선택지별 확률 + confidence |

핵심 차이는 **텍스트 생성 루프를 생략하고 입력의 선택지에 직접 점수를 매긴다는 것**. LoRA와 pointer head를 학습해 문맥 표현을 결정 과제에 맞추며 27B는 전체 가중치를 fine-tuning [49].

이 구조는 생성에 필요한 반복을 줄이지만 입력 길이/질문 수/배치/캐시에 따라 실행 비용이 달라진다. softmax 출력이나 temperature 보정만으로 calibration이 보장되는 것도 아니다(5장).

### 2.4 여러 질문 동시 처리: 세대별 차이

<center><img width="1200" src="https://github.com/user-attachments/assets/2417e7eb-f74e-42e3-9493-d389dd362f29"></center>
<center><em style="color:gray;">Kev-0.5B/Qwen3 세대(attention mask로 한 시퀀스 처리)와 Kev 1.0(질문별 행 + state 캐시 재사용)의 다중 질문 처리 비교</em></center><br>

| 세대 | 방식 | 출처 |
| --- | --- | --- |
| Kev-0.5B, Qwen3 세대(attention-only) | state와 모든 질문을 **한 시퀀스**로 연결. attention mask로 "질문 토큰은 state와 자기 질문만 보고 다른 질문은 못 본다"를 강제. 질문마다 position id를 state 직후부터 다시 시작. 실제로 한 번의 forward pass | [49][51] |
| **Kev 1.0 (Qwen3.5/3.8)** | 공유 state를 계산해 캐시하고 질문마다 별도 행으로 처리. 질문 행을 배치로 묶되 토큰 예산을 넘으면 여러 패스로 분할 | [49][54] |

- "질문 간 attention mask로 한 번의 forward pass에서 여러 질문 평가"는 **현행 Kev(Qwen3.5/3.8)에는 해당하지 않는다.** attention-only인 Qwen3 세대와 프로토타입 방식 [49]
- 격리는 **질문 간**에만 보장 [49]
    - 한 질문 안의 선택지끼리는 서로 영향을 주므로 선택지 순서가 답을 바꿀 수 있다
    - 이를 점검하는 `/v1/systemone/permute`(순서 섞어 n회) 엔드포인트가 별도 존재
- 공유 state를 재사용하면 문서 부분의 재계산을 줄일 수 있다. 실제 지연 측정은 4.4 참조 [49]

질문을 분리하는 이유는 Qwen3.5/3.8의 Gated DeltaNet 층. 이 층은 과거 정보를 순환 상태에 누적하므로 state/Q1/Q2를 한 시퀀스로 이으면 Q2가 Q1의 영향을 받는다. 일반 attention mask만으로 원하는 질문 간 격리를 구현할 수 없어 Kev는 공유 prefix 상태를 질문별 행에 복제 [49][54].

따라서 **한 요청의 모든 질문이 항상 forward 한 번에 끝나는 것은 아니다**. 공유 state 계산 뒤 질문 행들을 배치 처리하며 토큰 예산을 넘으면 여러 패스로 나눈다.

<details class="post-disclosure" markdown="1">
<summary>공유 prefix 캐시와 배치 구현</summary>

state 캐시 내용과 행 배치 [49][54][105]

- `prefix()`: state 토큰만 1회 실행해 `DynamicCache` 반환 [54]
- 캐시 = full attention 층의 state 구간 KV + DeltaNet 층의 state 끝 시점 순환 상태(`recurrent_states`)와 conv 상태(`conv_states`). 층 수는 attention/DeltaNet 기준 0.8B 6/18, 4B와 9B 8/24, 27B 16/48 [54][114]
- 행 실행 시 캐시 복제본을 만들고 `reorder_cache`로 행 수만큼 batch 차원을 복제. 원본 prefix 캐시는 그대로 유지 [54]
- 각 행은 질문 토큰만 입력하고 position은 state 뒤에서 이어짐. attention_mask는 state 길이만큼의 1 + 행별 padding mask [49][54]
- 패스당 행 수: 토큰 예산 `ROW_PASS_TOKENS = 16384` 안에서 `max(1, 16384 // (state 길이 + 가장 긴 행 길이))`. 행마다 캐시된 state 길이를 한 번씩 센다. 질문이 늘면 패스 수가 증가. 배치 작업 메모리는 제한하지만 요청/결과를 보관하는 메모리까지 일정한 것은 아니다 [49][54]
- 서버는 요청 간에도 `PrefixCache`(LRU)로 state 캐시(KV + DeltaNet 상태)를 최대 4개 보관. 상한 `PREFIX_MAX_TOKENS = 65536` [105]
- Jev 쪽: 여러 질문을 한 요청 안에서 서로 독립적으로 평가한다는 것만 공식 [2]. 구현 방식은 비공개

</details>

### 2.5 decoder backbone의 이점과 비교 한계

Kev는 Archer Hume의 구조 가설을 Qwen으로 구현. 개발자가 encoder와 decoder를 통제된 조건에서 비교해 선택했다고 볼 자료는 없다 [49][58].

- Qwen 사용의 이점: 다양한 모델 크기와 사전학습 지식/긴 컨텍스트/LoRA 및 서빙 생태계
- Kev 평가에서는 큰 모델일수록 MMLU-Pro 점수가 높지만 모델 크기와 학습 조건이 함께 달라져 architecture의 효과만 분리할 수 없다 [49][50]
- encoder도 질문과 선택지를 입력받는 분류가 가능. 속도/정확도는 backbone 방향뿐 아니라 크기/학습 데이터/head 설계에 따라 달라진다(2.8)

### 2.6 비생성 기법 계열 비교

생성형 backbone을 분류에 사용하는 방법은 pointer head 외에도 존재.

- **고정 라벨 head**: hidden state를 미리 정한 라벨 수만큼의 점수로 변환
- **후보 토큰 logit**: LM head에서 A/B/C 같은 후보 토큰의 점수만 읽어 정규화 [49]
- **고정 슬롯 head**: AutoTrust JEV-9B는 요청의 선택지 위치를 정해진 슬롯에 대응. 슬롯 수가 고정돼도 라벨의 의미는 요청마다 변경 가능 [70]
- **pointer head**: 입력에 들어온 선택지 표현을 읽어 점수화. head 크기가 선택지 수와 독립적인 Kev의 방식 [54]

encoder도 런타임 라벨을 지원하도록 설계 가능. backbone 방향과 출력층 설계는 별개의 선택(2.8).

### 2.7 출력 크기: 생성 길이 대신 스키마가 결정

Kev의 응답 크기는 질문 수와 Choice 선택지/Score 단계 수에 따라 결정. 텍스트 생성 루프는 없지만 응답 JSON의 크기와 전송 비용은 존재 [49][54].

- `usage.output_tokens`는 직렬화된 answers JSON의 토큰 수이며 생성 횟수가 아니다
- 실제 요청에서는 컨텍스트/선택지 수/바디 크기 제한을 함께 확인(7.1)

### 2.8 인코더 분류 head vs 디코더 pointer head: 무엇이 다른가

- 수학적으로는 둘 다 "후보 집합 위의 softmax"인 분류이며 생성 디코딩이 불필요. BERT 분류도 원래 생성하지 않으므로 "생성하지 않는다"는 생성 LLM 대비 차이일 뿐 decision model 고유의 특징이 아니다 (일반론)
- 실제 차이는 3가지
    1. 라벨 공간이 어디에 있는가: head 가중치 안 vs 입력 텍스트 안
    2. backbone의 attention 방향과 사전학습 규모/데이터
    3. 확률 제공 방식과 calibration 검증 여부

#### 구조 비교

- 라벨 고정 여부는 backbone이 아니라 출력층 설계가 정한다. 디코더 + 고정 라벨 head(D)도 있고 인코더 + 런타임 라벨(B, C)도 있다
- 고정 **슬롯 수**와 고정 **라벨 의미**는 별개. AutoTrust JEV-9B처럼 슬롯을 요청의 선택지 위치에 대응시킬 수도 있다 [70]

| 구성 | 라벨 정의 위치 | 출력층 | 라벨 런타임 변경 | 사례 |
| --- | --- | --- | --- | --- |
| A. 인코더 + `[CLS]` 고정 head | head 가중치 `W ∈ R^{C×d}` | 선형층 1개 | 불가 | BERT 분류 [137] |
| B. 인코더 cross-encoder 다중선택 | 입력 (질문, 선택지) 쌍 | 공유 `Linear(d→1)`, 선택지별 입력을 배치 처리 가능 | 가능 | BertForMultipleChoice [128] |
| C. 인코더 + 입력 내 라벨 토큰 | 입력(`«LABEL»` 마커) | 토큰/라벨 표현 상호작용(내적), forward 1회 | 가능 | GLiClass [129] |
| D. 디코더 + 고정 head | head 가중치 | 마지막 비패딩 토큰 → 선형층 | 불가 | LlamaForSequenceClassification [130] |
| E. 디코더 + pointer head | 입력(`<opt>…</opt>`) | `<decide>`(query) · `</opt>`(key) 내적 | 가능(최대 255개) | Kev [49], AWS Strands Decider [71] |

출력층: 무엇을 학습하는가 (가장 큰 차이)

- 고정 head(A/D): `W`의 각 행이 "스팸", "환불요청" 같은 라벨 의미 자체를 학습. head 크기가 라벨 수 C에 연결. 여러 태스크를 처리하도록 설계할 수도 있다
- pointer head(E): `W_q`, `W_k ∈ R^{d×256}` 두 개뿐 [54]. 라벨 의미는 입력 텍스트(`</opt>` 위치 hidden state)가 가져오고 head는 "질문 표현과 선택지 표현을 비교하는 방법"만 학습. head 크기는 라벨 수와 무관
- fine-tuning 대상도 다르다
    - 고정 head: 특정 태스크
    - Kev: 공개 데이터셋 10개 혼합(`decision-v7`)으로 "질문과 선택지를 읽고 고르는" 메타 태스크 [50]. 못 본 질문으로 일반화하는 근거

attention 방향: 어느 위치를 읽는가

- 인코더(양방향): 모든 토큰이 전체를 본다. `[CLS]` 하나로 전체 요약이 되고 선택지 토큰도 뒤 선택지를 본다 [137]
- 디코더(causal): 위치 i는 자기 자신과 이전 위치만 참조. 그래서 Kev는 읽는 위치를 의도적으로 고른다(2.2)
    - `</opt>`: 문서 + 질문 + 그 선택지까지 반영한 선택지 표현
    - `<decide>`: 맨 끝이라 전부 반영한 질문 표현
    - 부작용: 앞 선택지는 뒤 선택지를 못 본다 → 선택지 순서가 답에 영향(Jev 공식 약점 8번 [5], Kev `/permute` 엔드포인트 [49])
- causal attention의 표현력 제한은 LLM2Vec도 지적하고 mask를 양방향으로 바꿔 우회 [132]

backbone 규모와 지식

- 비교 예시인 ModernBERT-large는 395M/8k이고 Kev는 0.8B~27B. encoder의 구조적 크기 상한을 뜻하지 않는다 [49][134]
- Kev 측 평가에서 MMLU-Pro는 base 크기에 비례(0.8B 0.230 → 27B 0.675) [49][50]
- 비교 연구: Ettin(2025)은 같은 데이터/레시피면 인코더가 분류에 우위(400M 인코더가 MNLI에서 1B 디코더를 이김) [133]
- 이 비교만으로 decoder의 본질적 우위를 주장할 수 없다. Kev의 선택은 사용 가능한 Qwen backbone과 구현 목표를 기준으로 이해하는 것이 적절

이런 모델의 실용적인 차이는 `f(state, 질문, 선택지) → 확률` 형태로 호출한다는 점. 고정 라벨 분류기보다 요청별 질문 변경이 쉽지만 새 태스크의 정확도와 calibration은 별도 평가가 필요하다. 런타임 라벨 분류 자체는 NLI 기반 zero-shot 분류와 GLiClass 등에도 존재 [129][131].

> **"pointer head" 용어의 유래**
>
> 입력 안의 위치를 답으로 선택한다는 개념은 Pointer Networks(Vinyals et al., 2015)로 거슬러 올라간다 [122]. Kev도 입력의 선택지 위치에 확률을 부여하지만 점수 계산은 scaled dot-product 방식 [54]. Jev가 공개한 구조 명칭은 아니며 Jev 내부에 같은 head가 있다는 증거도 없다.

---

## 3. Jev (TypeSafe)

### 3.1 개요

TypeSafe가 공개한 호스팅 decision model. 가중치/backbone/학습 데이터는 비공개이며 고객별 fine-tuning은 미제공. 요청의 state와 질문/criteria로 도메인 정보를 전달한다 [1][4].

### 3.2 입출력 타입

- 질문 타입 [2][3]

| 타입 | 용도 | 응답 |
| --- | --- | --- |
| `noul` | 예/아니오 | 0~1 확률 |
| `choice` | 선택지 중 하나(최대 255개) | 선택값 + 선택지별 확률 + confidence |
| `score` | 2~10단계 척도 | 확률가중 점수 + 단계별 확률 + confidence |

- 여러 질문을 한 요청 안에서 서로 독립적으로 평가 [2]
- 입력은 텍스트/JSON과 이미지. 이미지는 실험 기능이며 별도 헤더 필요 [4][102]
    - 음성/영상은 직접 입력 불가
    - 영어 우선. CJK 포함 타 언어는 지원하나 정확도가 낮다(8.3 참조)
- 컨텍스트: 요청당 64k 토큰, `state` + 가장 긴 질문은 32k [4]
- 레이트리밋 [4]
    - 조직별 설정. 콘솔에서 확인하며 초과 시 `429` 응답

### 3.3 공개 범위와 학습 방식

TypeSafe는 비자기회귀 실행과 질문 병렬 평가를 설명하지만 구체적인 head/파라미터 수/학습 레시피는 공개하지 않았다. 학습 방식 RLCD는 확률 calibration을 목표로 한다는 수준까지 공개(5.2) [1][2].

고객 요청/응답은 모델 학습에 사용하지 않는다고 명시. 데이터 보존과 계약 조건은 별도 확인 필요(8.2) [4].

### 3.4 성능/가격 (TypeSafe 주장)

- 지연 70~500ms. System One 작업에서 frontier LLM 대비 40~200배 빠름 [1]
- 데모 [1][47]

| 항목 | Jev | LLM 기준선 | 배수 |
| --- | --- | --- | --- |
| 지연 | 0.114초 | 8.566초 | 약 75.1배 |
| 비용 | $0.000081 | $0.013880 | 약 171.4배 |

- 위 배수는 표에 제시된 값으로 계산. 해당 데모 조건에 한정되며 일반적인 성능 차이를 뜻하지 않는다 [1]
- 워크플로는 TypeSafe 팀이 구성했으며 회사도 이득이 큰 사례에 해당한다고 설명 [1]
- 가격: 입력 100만 토큰당 $0.042, 출력 무료. 출력 요금은 TypeSafe의 서비스 정책이며 비생성 구조 자체가 무료를 뜻하지는 않는다 [1][4]
- "환각 0%"는 **타입 안전성(스키마 일치)**에 대한 주장이며 답의 정확성 보장이 아니다
    - TypeSafe 설명: "경험적 수치가 아니라 스키마 매칭이 보장된다는 의미" [1]
    - 문서도 개별 답의 정확성은 보장하지 않는다고 명시 [2]
Kev 개발팀이 측정한 Jev 비교 수치는 4.4 참조. 활용 후보는 문의 분류/라우팅/이진 판정이며 실제 agent 적용은 8장에서 다룬다 [2][49].

### 3.5 공식 한계

Jev 1.13의 주요 약점은 계산/날짜 비교/다단계 추론, 불필요하게 긴 state, 지시문과 criteria의 모순, 선택지 순서 민감성. 적대적 콘텐츠를 안전하게 처리하는 전용 방어 모델로도 간주할 수 없다 [5].

계산은 코드로 처리하고 판단을 작은 질문으로 나눠 구성. 구체적인 약점별 회피법은 부록 참조. 이미지/Box는 실험 기능이며 고객별 fine-tuning은 미제공 [4][102].

### 3.6 모델 라인업

- `jev-1.13.0`: Noul/Choice/Score 지원
- `jev-1.14.0`: Box 추가. 두 버전 모두 이미지 입력은 실험 기능 [4][102]
- `jev-latest`/`jev-preview`는 `jev-1.14.0`을 가리키는 alias. 임계값을 평가한 버전 ID로 고정하고 응답의 실제 버전을 기록 [4]

대표 요청/응답과 Jev/Kev의 API 차이는 7.1에 정리.

---

## 4. Kev (Jared Palmer, 오픈소스)

### 4.1 개요

- Jared Palmer가 만든 오픈소스 "Jev-like" 결정 모델군. TypeSafe 제품이 아니다. Apache-2.0 [49]
- 아키텍처 출처 [49][58]
    - README에 따르면 Archer Hume의 글 "Jev's Architecture Unmasked"를 구현. 이 글은 2026-09-17 Jev API를 1만 회 이상 호출해 구조를 역추론
    - 즉 **Kev가 Jev와 같은 구조라는 보장은 없다. Jev 구조에 대한 제3자 가설의 구현**
- 동작 원리(pointer head + 질문별 행/공유 prefix 캐시)는 2장 참조

### 4.2 backbone과 학습 형태

| 모델 | backbone | 학습 형태 |
| --- | --- | --- |
| Kev-0.8B / 4B / 9B | Qwen3.5의 해당 크기 Base 모델 | base 동결 + LoRA와 pointer head 학습 |
| Kev-27B | Qwen3.8-27B post-trained 모델 | 전체 가중치 fine-tuning |

Kev 1.0은 네 모델의 체크포인트를 고정한 릴리스. HF 모델 태그는 `v1.0`, GitHub 릴리스 태그는 `kev-1.0` [49][52].

27B의 base는 이미 post-training을 거쳤고 그 데이터는 Kev 측도 알지 못한다. 모델 간 성능 차이를 파라미터 수나 architecture만의 효과로 해석하기 어려운 이유 [49].

### 4.3 fine-tuning

Kev는 공개 데이터의 정답 라벨/코드로 계산한 정책 결과/오픈 가중치 LLM의 보조 라벨로 학습. **Jev 출력을 학습 라벨로 사용하지 않았다고 명시** [49][50].

사용자 데이터로 학습할 때는 base 모델부터 시작하기보다 공개 체크포인트를 `--init_from`으로 불러오는 방식. JSONL 요청에 질문별 `label`을 추가하고 학습 후 별도 검증 데이터로 temperature를 재보정 [49].

- README의 소규모 지원 문의 사례: 1,050건으로 학습해 정확도 67.7% → 73.6%, 5% 오류예산 자동화율 34% → 48%
- 해당 도메인에서 얻은 개선이며 다른 태스크나 언어의 효과를 보장하지 않는다
- 날짜/장문 등 기존 능력이 저하될 수 있으므로 새 데이터 평가와 회귀 평가 병행
- `kev-finetune` 스킬은 데이터 준비/학습/평가/배포를 지원. 라벨 생성에 외부 LLM을 쓰면 데이터 전송 경로 확인 필요 [49]

<details class="post-disclosure" markdown="1">
<summary>공개 모델의 학습 설정과 데이터 구성</summary>

0.8B / 4B / 9B: 동결 base + LoRA [49][50]

| 항목 | 값 |
| --- | --- |
| 방식 | base 동결, LoRA rank 16 / α 32를 attention/MLP/DeltaNet projection에 부착. LoRA와 pointer head를 함께 학습 |
| 손실 | 각 질문의 선택지에 대한 cross-entropy(정답 선택지 확률 최대화). 선택적 손실 `--perm_kl`(순서 일관성), `--ord_w`(score 순서)는 릴리스 모델에서 **미사용** |
| 증강 | 선택지 순서 섞기 / "none of the above" 삽입 / 방해 선택지 추가 / choice 레코드의 1/4에 정답 유무만 다른 minimal pair |
| 1단계 | `decision-v7` 2 epoch. lr 1e-4(0.8B) / 5e-5(4B/9B), one-cycle. 배치 8(0.8B), 4 x accum 2(4B). bf16 autocast, gradient checkpointing |
| 추가 단계 | `--init_from`으로 이어서 각 1 epoch, lr 2e-5. 이전 데이터 재생(replay) 2,000~4,000건 혼합. 순서: 날짜/증거 제거 → 실제 문서 → 스킬/개발도구 |
| calibration | 마지막에 temperature 하나를 NLL 최소화로 적합. 0.8B/4B는 학습 분포 dev, 9B/27B는 미학습 데이터셋 사용 |
| 시간(4B) | 1단계 약 56분(H100 1장), 날짜 9분, 문서 43분(H200), 스킬 1.4시간(H200) |
| 시간(0.8B) | 1단계 약 20분(H100), 문서/스킬 52분(H200) |

27B: full fine-tuning [49][52][53]

- 모든 가중치를 bf16으로 1 epoch, lr 2e-6, 8xH200에서 16.2시간(약 130 GPU-hours). 블로그 기준 1회 약 $650
- 데이터 145,840 레코드(질문 약 337,000개), state 최대 32,768 토큰
- 그 결과를 이전 LoRA판(v1)과 가중치 0.85:0.15로 평균(weight averaging)
    - v1 대비 미학습 데이터셋 +1.2pp
    - 장문 계약서(CUAD)에서는 정확도 −1.6pp, 과신(ECE 0.053 vs 0.007)으로 악화

학습 데이터 구성과 생성 방법 [50][53]

| 단계 | 건수 | 내용/라벨 출처 |
| --- | --- | --- |
| `decision-v7` | 12,576 | 공개 분류 데이터셋 10개 x 1,000(원래 라벨) / 생성 정책 minimal pair 896(템플릿 9종) / 무작위 규칙 데이터 1,680. 생성분 라벨은 **코드로 계산** |
| 날짜/증거 제거 | 1,425 | 날짜 정책 900 + 결정 근거 문장을 지우고 균등분포를 정답으로 둔 255(+정상 대조 270) |
| 실제 문서 | 5,219 | 미국 CFPB 금융 민원(최대 약 7k 토큰). **오픈 가중치 teacher 모델 2개가 소비자 본인 분류와 일치한 건만** 유지 |
| 스킬(`hard-v1`) | 6,000 | 예외 많은 정책 / 우선순위 트레이드오프 / 기대값 / 다단계 추론 / 날짜와 산술 / 답 채점 / 모르면 기권. 프로그램으로 라벨 |
| 개발도구(`devtools-v1`) | 5,320 | CodeReviewer, CommitPackFT, FlakeFlagger, Aegis(콘텐츠 안전) 원래 라벨 |
| 27B 추가 | 합계 145,840 | 위 + 라이선스 확인된 공개 태스크 + 오픈 가중치 모델이 쓴 합성 결정 + 코드가 생성한 장문서/도구 라우팅/에이전트 로그/가드레일 레코드 |

</details>

### 4.4 라인업/성능/지연/메모리/배포

정확도 [49][52]

| 모델 | 미학습 소스 정확도 dev / test | 학습 소스 dev / test | Brier(README 보고값) dev / test | breadth-v1 index | MMLU-Pro | 5% 오류예산 자동화율 |
| --- | --- | --- | --- | --- | --- | --- |
| Kev-0.8B | 0.648 / 0.697 | 0.827 / 0.838 | 0.481 / 0.416 | 23.3 | 0.230 | 0.14 |
| Kev-4B | 0.817 / 0.838 | 0.873 / 0.865 | 0.269 / 0.242 | 38.0 | 0.565 | 아래 범위 참조 |
| Kev-9B | 0.820 / 0.852 | 0.874 / 0.873 | 0.289 / 0.217 | 41.0 | 0.590 | 아래 범위 참조 |
| Kev-27B | 0.851 / 0.889 | 0.865 / 0.866 | 0.225 / 0.156 | 52.3 | 0.675 | 아래 범위 참조 |
| Jev | 0.857 / – | 0.845 / – | 0.211 / – | 54.0 | 0.840 | 0.70 |

- 5% 오류예산 자동화율 0.52~0.69는 4B/9B/27B 세 모델을 묶어 보고한 범위. 각 모델이 모두 이 범위를 갖는다는 뜻은 아니다 [49]
- 용어 [49]
    - "미학습 소스" = `transfer-v4`(QNLI, SciQ, PAWS, MMLU, Emotion, TweetEval + 미학습 정책/규칙, 764건)
    - breadth-v1 = Kev가 학습하지 않은 공개 데이터셋 14개의 chance 보정 지수
- 단서 [49][52]
    - Kev 측도 "Jev 학습 데이터를 모르므로 통제된 비교가 아니다"라고 명시
    - 27B v2/9B v2는 dev 결과를 본 상태에서 재선택해 **test 마진이 낙관적**이라고 릴리스 노트가 자인
- 독립 비교 (2차)
    - Opper.ai(09-25, Kev-4B): arXiv 분류 96.9 vs 95.0 / Stack Exchange 97.5 vs 98.3 / PAWS 87.0 vs 74.5 등. PAWS 외에는 근소 [60]

지연은 HTTP를 제외한 모델 시간과 실제 요청 시간을 구분해야 한다. Kev 측 H100 측정에서 4B는 약 18~89ms, 27B는 약 75~278ms. 문서 길이/캐시 여부/동시 요청에 따라 차이가 크다 [49].

검증된 문서 길이는 0.8B~9B 8,192토큰 / 27B 65,536토큰. 서버가 입력을 허용한다는 사실이 해당 길이의 정확도를 보장하지는 않는다 [49].

<details class="post-disclosure" markdown="1">
<summary>GPU별 지연/메모리와 배포 측정 조건</summary>

지연/메모리 (모델 시간, HTTP 제외, 중앙값) [49]

| 모델 | GPU($/h) | 짧은 문서 6질문 새로/캐시 | 2,200토큰 5질문 새로/캐시 | req/s(64 동시) | 메모리 |
| --- | --- | --- | --- | --- | --- |
| Kev-0.8B | L4(0.80) | 22.7 / 16.1 ms | 108.6 / 32.3 ms | 62.8 | 4GB GPU로 가능 |
| Kev-4B | L40S(1.95) | 41.5 / 27.7 ms | 145.2 / 43.0 ms | 51.4 | 약 16GB 여유 |
| Kev-4B | H100(3.95) | 18.1 / 12.9 ms | 89.4 / 22.5 ms | 100.8 |  |
| Kev-9B | H100(3.95) | 24.0 / 16.6 ms | 88.5 / 26.4 ms | 79.5 | 약 17GB |
| Kev-27B | H100(3.95) | 75.0 / 52.0 ms | 277.5 / 79.3 ms | 28.9 | 가중치 51GB, 상주 약 66GB |

- 위 표 요약: Kev-4B 18~89ms, Kev-27B 75~278ms(H100)
- Apple M5 32GB(MLX, 270토큰 5질문): 0.8B 149/28ms, 4B 721/136ms. 27B는 96~128GB Mac 예상(미측정) [49]
- Modal 실배포 HTTP(Kev-4B, H100) [49]
    - 단일 클라이언트 p50 36.9ms(direct) / 102.1ms(일반)
    - 64 동시 p50 약 0.6~1초
    - cold start 약 35초
- 블로그: GPU 비용 100만 요청당 Kev-27B $44.09, Kev-0.8B $3.54(Modal) [53]
- 컨텍스트 [49]
    - 서버 허용치: state 65,536 + 질문당 8,192 토큰. 초과 시 422(조용히 자르지 않는다)
    - **검증된 길이**: 0.8B~9B 8,192 / 27B 65,536
- 정밀도: 서빙 bf16, 평가 fp32. 확률 차이 최대 약 0.03(GPU). 최상위 답은 약 300문항 중 1개 변동 [49]
- 라인업 요약: 0.8B(4GB GPU) / 4B(권장 시작점) / 9B / 27B(80GB GPU) [49]

</details>

배포 방법 [49][56]

| 경로 | 내용 |
| --- | --- |
| Hugging Face | `jaredpalmer/kev-0.8b`, `kev-4b`, `kev-9b`, `kev-27b`(+ `@v1.0` 태그 고정), 데모 Space `jaredpalmer/kev`(4B/0.8B) |
| 로컬 | `uv sync --extra serve` 후 `uv run --extra serve python -m kev.serve --run jaredpalmer/kev-4b --port 8009`. CUDA/ROCm/MLX/CPU 자동 선택. **`pip install kev`는 무관한 다른 패키지**(PyPI 이름 충돌) |
| Modal | `kev_serve.py` 하나로 HTTPS 엔드포인트 배포, 유휴 시 0으로 축소 |
| OpenRouter | `jaredpalmer/kev-4b`만 제공. 입력 $0.042/M, 출력 무료, 컨텍스트 8,192. 제공자 Phala, SiliconFlow(fp8). 엔드포인트 이름 `kev-4b-20260924`(OpenRouter 공개 API) [56] |

- **TypeSafe API 호환** [49]
    - `POST /v1/systemone`, 요청 `state`/`model`/`questions`(`noul`/`choice`/`score`, `instructions`, `criteria`) 형식 그대로
    - TypeSafe Python SDK의 `base_url`만 바꾸면 동작. repo 테스트가 TypeSafe 예제 요청과 공식 SDK로 검증
    - `kev.benchmark --remote`로 Jev 포함 임의의 System One 엔드포인트를 같은 문항으로 평가 가능
- 보안 [49][50]
    - 서버는 기본 `127.0.0.1` 바인딩, **기본 무인증**
    - `KEV_API_KEY`를 설정해야 Bearer 인증 적용
    - 외부 노출 시 인증/프록시/접근통제 필수

### 4.5 한계

Jev와의 전체 비교는 6.1 참조. Kev 선택 시에는 아래 약점을 함께 고려.

| 항목 | 내용 | 출처 |
| --- | --- | --- |
| 지식형 질문 | base 크기가 좌우. MMLU-Pro 0.230~0.675 vs Jev 0.840. MMLU는 27B가 Jev와 동률(0.90) | [49][52] |
| confidence 순위 | Kev 평가의 5% 오류예산 자동화율은 Jev보다 낮다. temperature 보정만으로 판별력이 보장되지는 않는다. 대신 0.9 이상 확신 오답 비율은 Kev-9B 2.4% vs Jev 3.7%. 근거 제거 문항의 고확신 응답은 Kev-9B 0% vs Jev 9% | [49] |
| 날짜 계산 | 27B 미만 최약점(deadline 정책 0.35/0.65/0.725 vs Jev 0.95). `KEV_DATE_FACTS=1`로 날짜 간 일수를 문장으로 붙이면 9B 0.80 → 0.90 | [49][52] |
| 선택지 순서 | 순서를 바꾸면 답이 바뀔 수 있다(질문 간 격리와 별개) | [49] |
| 긴 문서 | 0.8B~9B는 16k부터 정확도 하락 가능성을 배제할 수 없다. 27B는 64k까지 유지하나 CUAD에서 과신 | [49][52] |
| 도구 라우팅 | Kev-0.8B는 When2Call에서 chance 이하(0.133) → 도구 호출 라우팅에 쓰지 말 것 | [52] |
| 학습에 의한 능력 저하 | fine-tune이 개별 능력(예: 날짜)을 악화시킨 사례 | [49] |
| 다국어 | **모델카드 4종 모두 "Languages: English", 영어 외 언어는 out-of-scope로 명시.** 한국어/일본어 공식 평가 부재 | [50] |
| 다국어(제3자) | 8.3 참조 | [61][62] |
| 체감 속도 | 싱가포르 정부 AI팀 평가는 Kev가 "눈에 띄게 느렸다"고 정성 평가(인프라 상이) | [62] |
| 평가 데이터 오염 | 27B는 post-training 데이터가 불명인 Qwen 모델에서 출발 → 평가 데이터 오염 가능성을 Kev 측도 배제 못 한다고 명시 | [50] |

### 4.6 라이선스

- 라이선스 [49][63]
    - 코드/어댑터/head: Apache-2.0
    - Qwen3.5-0.8B/4B/9B-Base, Qwen3.8-27B: HF 카드 기준 Apache-2.0(HF API)
    - 상업 이용/수정/재배포 가능. NOTICE와 라이선스 고지 유지 필요(Apache-2.0 일반 조건)
- **학습 데이터셋은 각자 라이선스**라고 README가 명시 [49][50]
    - 일부는 Zenodo 데이터(CodeReviewer, FlakeFlagger), 미국 정부 저작물(CFPB) 등이며 매니페스트에 기록
    - 가중치 사용 자체는 Apache-2.0. 다만 법무 검토 시 데이터 출처 목록을 함께 넘기는 것이 안전(법적 판단 제외)

---

## 5. calibration

### 5.1 calibration 개념 (일반론, Jev 공식 방식과 무관)

<center><img width="1200" src="https://github.com/user-attachments/assets/c52b74ed-14e8-4fb2-beeb-f189c688867d"></center>
<center><em style="color:gray;">reliability diagram 개념도(가상 수치): 과신을 줄인 예시. temperature scaling이 항상 대각선에 맞추는 것은 아니다</em></center><br>

- **Calibration**: 확률 p로 예측한 사례들 중 실제 정답 비율이 p에 가까운 성질. 개별 정답 보장이 아니라 집단 통계(TypeSafe 문서에도 같은 단서 포함 [2])
- **Reliability diagram**: 예측 확률을 구간(bin)으로 나눠 구간별 평균 confidence(x)와 실제 정확도(y)를 그린 그림. 대각선에 가까울수록 잘 맞고 대각선 아래면 과신(overconfident)
- **ECE (Expected Calibration Error)**: 구간별 |정확도 − 평균 confidence|를 표본 비율로 가중 평균
    - 이 top-label ECE는 bin 수/표본 수에 민감. 모든 클래스의 calibration을 설명하지는 않는다
    - Guo et al. 2017 [92]: 현대 신경망은 과신하며 temperature scaling(파라미터 1개)으로 상당 부분 교정된다는 연구
- **Proper scoring rule**: 참 분포를 그대로 보고할 때 기대 점수가 최적이 되는 채점 규칙. 보상/손실로 쓰면 "정직한 확률"을 유도
    - **Brier score**: Σ(p_k − y_k)². 유계(bounded) 손실이며 calibration뿐 아니라 확률 예측의 판별력도 반영. Brier 하나로 calibration 수준을 단정할 수 없다
    - **Log loss (log score)**: −log p(정답). 무계(unbounded), 확신에 찬 오답에 큰 페널티. cross-entropy 학습이 곧 log loss 최소화
    - 순서형(score 타입 같은 척도)에는 RPS(ranked probability score)를 자주 사용. autotrust/JEV-9B가 score 질문에 RPS 사용 [70]
- 정확도와 calibration은 별개
    - 정확도가 높아도 과신 가능
    - 판별력(AUROC)이 낮으면 calibration만 맞춰도 임계값 분기의 효용이 작다

- **Temperature scaling의 범위**: 양수 T는 한 문항 안의 선택지 순위와 argmax를 유지하지만 서로 다른 문항의 최대 확률 순위는 바꿀 수 있다 [92]
- 자동화율은 보정 후의 risk-coverage 곡선으로 평가. confidence와 정답 여부를 구분하는 능력이 함께 필요

### 5.2 Jev: RLCD (Reinforcement Learning for Calibrated Decisions)

#### 공식 공개 범위

**RLCD의 이름과 목표는 공개됐지만 구체적인 학습 알고리즘은 비공개.**

| 항목 | 공개 내용 |
| --- | --- |
| 이름 | Reinforcement Learning for Calibrated Decisions [1] |
| 목표 | 예측 확률이 실제 결과 빈도와 맞도록 학습 [1][2] |
| 생성형 모델과의 비교 | RLHF는 사람의 선호, RLVR은 검증 가능한 보상, RLCD는 결정 확률의 calibration에 초점 [1] |
| 비공개 정보 | backbone/보상 함수/scoring rule/학습 단계/데이터 규모 |

- RLCD가 Brier 보상이나 특정 논문의 알고리즘을 쓴다고 단정할 자료는 없다
- 높은 confidence가 높은 정확도와 연결되도록 학습했다는 주장과 개별 답의 정답 보장은 구분 필요 [2]
- 구조/데이터/학습 방식이 함께 비공개라 RLCD만의 성능 기여를 분리해 평가하기 어렵다

> 참고: 학계의 RLCD(Contrastive Distillation)는 같은 약어를 쓰는 별도 연구. TypeSafe 방식과의 기술적 관계는 확인되지 않았다 [89].

RL 이후 calibration이 악화되거나 별도 보상으로 개선된 연구는 존재하지만 이를 Jev의 학습 방식으로 대입할 수는 없다 [93][97].

### 5.3 모델별 calibration 처리 비교

<center><img width="1200" src="https://github.com/user-attachments/assets/a49928af-7ce9-40fd-8c2f-215a69bbeee9"></center>
<center><em style="color:gray;">confidence 3구간 라우팅: softmax(z / T) → confidence → 자동 처리 / 확인/검토 / 사람 또는 다른 시스템</em></center><br>

| 모델 | 학습 손실 | calibration 처리 | 출처 |
| --- | --- | --- | --- |
| Jev | 비공개 | RLCD로 학습했다고 주장(상세 비공개) | [1][2] |
| Kev (Jared Palmer) | 정답에 대한 cross-entropy(지도학습, RL 미사용) | 체크포인트별 temperature 하나를 저장해 pointer head에 적용(0.8B 2.35 / 4B 2.41 / 9B 2.19 / 27B 1.32). NLL 최소화로 적합. 0.8B/4B는 in-distribution dev셋, 9B/27B는 held-out 데이터셋으로 적합. 평가는 Brier score("whole probability distribution"을 채점) | [49] |
| OpenAI Decisions | 비공개 | 학습/보정 방식 비공개. 자체 라벨 데이터와 오류 비용으로 임계값 설정 권고 | [75] |

Kev는 지도학습과 사후 temperature scaling을 사용. Jev는 RLCD를 내세우지만 공개 평가만으로 RLCD의 추가 기여를 분리하기 어렵다. Brier는 calibration뿐 아니라 확률 예측의 판별력도 반영하므로 하나의 수치만으로 학습 방식의 우열을 단정할 수 없다 [49].

#### 실무 의미: calibrated 확률이 왜 중요한가

예측 확률을 실제 발생 빈도로 해석하려면 적용 데이터에서 calibration 검증이 필요. **Jev/Kev의 Choice `confidence`는 정답 확률 자체가 아니므로 `confidence=0.95`를 오류율 5%로 해석하면 안 된다.**

| 용도 | 방식 | calibration이 깨지면 |
| --- | --- | --- |
| 임계값 기반 라우팅 | confidence가 임계값 τ 이상이면 자동 처리, 아니면 다른 경로(공식 기본은 높음/중간/낮음 3구간, 7.3). 오류 예산(예: 5%)에 맞춰 τ 결정. Choice의 confidence는 p_max 자체가 아니라 `(p_max - 1/n) / (1 - 1/n)` | 과신 모델은 τ를 높여도 실제 오류율이 예산을 초과 |
| 사람 검토로 넘기기(HITL) | 낮은 confidence 구간만 사람에게. 검토량 = 해당 구간 비율 | 검토 대상이 잘못 선정되어 사람 비용 대비 오류 감소 효과가 작다 |
| abstain(답변 보류) | 확신이 낮으면 "판단 불가"/LLM 재질의로 escalation | 보류해야 할 오답을 높은 확신으로 통과 |
| 비용 기반 결정 | 기대 순이익 = p × 이익 − (1−p) × 손실로 행동 선택 | 기대값 계산 자체가 틀어짐 |
| 다단계 파이프라인 결합 | 조건부 확률로 결합. 주변 확률을 단순히 곱하려면 독립성 가정 필요 | 오차 누적/증폭 |

실무 체크리스트 (제안)

1. **벤더 calibration 주장을 그대로 믿지 말 것**
    - TypeSafe도 calibration은 집단 통계이며 개별 정답을 보장하지 않는다고 명시 [2]
    - 자체 도메인(한국어/일본어, 자체 라벨셋)에서 재측정 필요. 특히 Jev는 영어 외 언어 정확도가 낮다고 공식 문서에 명시(3.2)
2. 측정 지표: reliability diagram + ECE + Brier(또는 log loss) + AUROC를 함께 측정. ECE만 보면 판별력 부족을 놓친다
3. 분포가 바뀌면 calibration도 바뀐다. 운영 데이터로 주기적 재측정, 필요하면 자체 temperature/isotonic 사후 보정 레이어를 둔다
4. 임계값은 "confidence τ별 자동 처리율 vs 오류율" 곡선에서 오류 예산으로 결정. OpenAI Decisions 문서도 같은 방식(자체 라벨 데이터로 임계값 설정, FP/FN 비용 고려)을 권장(6.2)
5. 생성형 LLM의 logprob/말로 표현한 confidence도 자체 데이터로 검증하고 필요하면 보정 [93][95]

---

## 6. Jev vs Kev vs OpenAI Decisions

### 6.1 항목별 비교

| 항목 | Jev 1.13/1.14 | Kev 1.0 | OpenAI Decisions | Claude Haiku 5.5 (참고) |
| --- | --- | --- | --- | --- |
| 종류 | 결정 전용 | 결정 전용(오픈 가중치) | 결정 전용 엔드포인트 | 일반 생성형 |
| 공개 | 2026-09-15, early access | 2026-09-20 Qwen3.5 세대(2차), 10-01 Kev 1.0 | GA | 10-07 GA |
| 입력 | 텍스트+이미지(실험) | 텍스트 | 텍스트/JSON+이미지 | 텍스트+이미지 |
| 출력 | noul/choice/score + 확률, 1.14는 Box 추가 | noul/choice/score + 확률(System One 호환) | predicate/choice/score + 확률 | 텍스트(structured outputs 가능), 확률 미제공 |
| 가격(입력/출력, per M) | $0.042 / 무료 | 자체 호스팅(OpenRouter `kev-4b` $0.042 / 무료) | $0.10 / 무료 | $0.10~0.50 / $0.50~2.50 |
| 지연 | 70~500ms(공식) | Kev-4B 18~89ms, Kev-27B 75~278ms(H100, 모델 시간) | 중앙값 179ms(독립 측정 1건) | Jev보다 약 10배 느림(독립 측정 1건) |
| 기반 모델/구조 | 비공개 | Qwen3.5/3.8 + pointer head | `gpt-6-luna` 기반, 결정 모드 구현 방식/파라미터 수 비공개 | 일반 생성형 |
| calibration 공식 주장 | 있다(RLCD로 학습했다고 주장, 상세 비공개) | temperature scaling(체크포인트별 1개) | 학습 방식 비공개, 임계값 실측 권고 | 없다(확률 미제공) |
| 컨텍스트 | 64k | 0.8B~9B 검증 8,192 / 27B 65,536 | 엔드포인트 한도와 기본 모델 한도를 별도로 확인 | 미확인 |
| 요청당 질문 수 상한 | 컨텍스트 제한 내 개수 제한 없이 허용 [4] | 행 배치로 분할 처리 [49] | 400 [75] | 해당 사항 미적용 |
| 출력 크기 결정 방식 | 스키마(질문 수 × 타입별 필드, choice ≤255, score 2~10). 출력 길이 파라미터 미제공 [3][38] | 스키마(choice/score 각 1~255). `output_tokens` = answers JSON 토큰 수 [54] | 미확인 | 생성 토큰 수(출력 길이 한도로 제어, 일반론) |
| 데이터 거버넌스 | 학습 미사용, ZDR은 엔터프라이즈만, 미국 호스팅 | 자체 호스팅이면 외부 전송 불필요 | 적격 고객 ZDR/HIPAA, 미국/유럽 처리 리전 | Anthropic 표준 정책 |
| 출처 | [1][4] | [49][59] | [74][75][77][85] | [83][85] |

- Jev의 Models 문서는 엔터프라이즈 ZDR 안내로 연결. 세부 데이터 처리 조건은 Legal/DPA/Privacy Policy/MCA 참조 [4][33][34][35][36]

### 6.2 OpenAI Decisions API

- `POST /v1/decisions`, 지원 모델은 `gpt-6-luna`. GA로 제공 [75]
- 텍스트/JSON과 이미지 입력. 이미지는 base64 data URL 또는 공개 HTTP/HTTPS URL 지원. `file_id`는 미지원 [75]
- 요청당 1~400개 질문. Predicate/Choice/Score 타입으로 확률과 답 반환. 앞 답에 의존하는 질문은 별도 요청 필요 [75]
- 공유 입력의 prefix caching 지원. 미캐시 입력 $0.10/M, 캐시 읽기 할인/쓰기 과금, 출력 무료. 리전/긴 컨텍스트 할증은 별도 [75]
- 적격 고객에게 ZDR/HIPAA 지원. 데이터 저장 리전과 처리 리전의 범위는 구분 필요 [75]
- 별도 head/학습 방식/파라미터 수/calibration 세부는 비공개. API 동작만으로 Kev와 같은 구조라고 추론할 수 없다
- 임계값은 자체 라벨 데이터와 FP/FN 비용으로 결정. 일반 Luna의 생성 토큰 확률 측정치를 Decisions에 그대로 적용할 수 없다 [75]

### 6.3 Claude Haiku 5.5와 structured output adapter

Claude Haiku 5.5는 대량 분류/요약 등에 쓰는 일반 생성형 모델. 2026-10-07 공개됐으며 가격은 프롬프트 길이에 따라 입력 $0.10~0.50/M, 출력 $0.50~2.50/M [83].

AI SDK의 Anthropic adapter는 structured output으로 결정 형식을 구성 [87].

- Choice/Score의 native 확률 분포는 미제공
- Boolean의 P(true)는 프롬프트로 요청한 추정치
- 모든 질문을 하나의 프롬프트로 평가하므로 질문 간 격리를 보장하지 않는다

분류 정확도가 충분하면 대안이 될 수 있지만 native decision API의 확률 출력과 같은 것으로 취급하면 안 된다.

### 6.4 그 외 decision model

| 모델 | 기반/제공 방식 | 특징 | 출처 |
| --- | --- | --- | --- |
| Clef / Clef-flash | Cloudflare, 27B / 9B. 오픈 가중치와 Workers AI | 멀티모달 decision model | [72] |
| Strands Decider 2B | Qwen3.5-2B 기반 오픈소스 | 로컬 실행과 개발용 소형 decision model | [71] |
| Microsoft-Decision-1 | Qwen3.5-9B 기반. Microsoft Foundry/OpenRouter | 분류/라우팅/평가용 확률 출력 | [73] |

외부 전송이 불가능한 데이터에는 Kev/Clef/Strands처럼 가중치가 공개된 모델의 자체 호스팅 검토.

---

## 7. 사용법 요약

공식 약점 9가지와 회피법은 부록.

### 7.1 API 형식과 주요 차이

요청은 `model` + `state` + 이름별 `questions`. 각 질문은 `type`/`instructions`와 필요한 경우 `criteria`로 정의 [3].

Jev/Kev는 `state`와 이름별 `questions`를 받는 System One 형식을 공유. 독립 질문은 한 요청으로 묶어 공유 state를 재사용한다 [3][49].

- Jev: `POST https://api.typesafe.ai/v1/systemone`, Bearer 인증. TypeSafe 콘솔에서 키 발급 [7]
- Kev: 자체 서버의 `/v1/systemone`. 외부에 노출할 때 `KEV_API_KEY`로 인증 설정 [49]
- Jev는 요청당 64k / state와 질문 하나당 32k. Kev는 state 65,536 + 질문당 8,192 토큰까지 허용하지만 검증된 문서 길이는 모델별로 다르다(4.4) [4][49]
- Jev 이미지/Box는 `TypeSafe-Danger-Zone-Images: true`로 활성화. Box는 1.14 필요 [102]

요청/응답 예시 (README 원문 [49], 로컬 `kev.serve --port 8009`)

```bash
curl -s localhost:8009/v1/systemone -H 'content-type: application/json' -d '{
  "state": "Shoes arrived two weeks late and in the wrong size. Also I see two charges on my card.",
  "model": "kev-latest",
  "questions": {
    "department":  {"type": "choice", "instructions": "Which team should handle this?",
                    "criteria": {"returns": "Exchanges, refunds, wrong or damaged items",
                                 "shipping": "Delivery status, delays, lost packages",
                                 "billing": "Charges, invoices, payment problems"}},
    "escalate":    {"type": "noul",  "instructions": "Does this need urgent human attention?"},
    "frustration": {"type": "score", "instructions": "How frustrated is the customer?",
                    "criteria": ["Calm", "Frustrated", "Very angry"]}
  }}'
```

```json
{
  "model": "kev-latest",
  "answers": {
    "department":  { "type": "choice", "choice": "returns", "confidence": 0.21,
                     "probabilities": { "returns": 0.47, "shipping": 0.28, "billing": 0.25 } },
    "escalate":    { "type": "noul", "noul": 0.93 },
    "frustration": { "type": "score", "score": 1.44, "confidence": 0.34,
                     "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
                     "probabilities": { "0": 0.00, "1": 0.56, "2": 0.44 } }
  },
  "usage": { "input_tokens": 101, "output_tokens": 161 },
  "latency_ms": 495
}
```

- 응답은 README 표기상 "Kev-4B, running in bf16 on an Apple M5" [49]
- Modal 배포도 같은 요청 형식을 사용하며 `Authorization: Bearer <key>`로 인증 [49]


TypeSafe 형식과 다른 점

| 항목 | Kev | Jev |
| --- | --- | --- |
| 응답 `model` | 요청한 이름 그대로(`kev-latest` 등) [105] | 실제 버전 ID [4] |
| 응답 추가 필드 | `latency_ms` 항상. `KEV_TRUNCATE_STATES=1`이면 `truncated`, `usage.state_tokens`/`state_tokens_used` [49][105] | 없다 |
| `usage.output_tokens` | 직렬화된 answers의 토큰 수(`json.dumps(answers)`를 토크나이저로 계산) [54] | 계산 방식 미확인 [38] |
| Score 단계 | **1~255** [49][54] | 2~10 [3] |
| Choice 선택지 | 1~255 [54] | 최대 255 [3] |
| Noul `instructions` | 선택 [54] | 필수 [3] |
| state 길이 초과 | `422` [49][105] | `400` + `max_tokens_exceeded` [3] |
| 바디 압축 | `serve.py`에 압축 해제 처리 미구현 [105] | gzip/zstd [3] |
| 확률 표기 | 소수 4자리 반올림 [54] | 미확인 |

- `usage.output_tokens`는 계산 방식이 달라 Jev와 값 비교가 의미 없다
- 압축 호환 [24][106]
    - Python SDK v0.7.5 / JS v0.7.0부터 1 KiB 이상 바디를 zstd로 기본 압축
    - Kev `uv.lock`은 `typesafe-sdk` 0.6.0 고정
    - 기본 압축을 사용하는 SDK로 Kev를 호출하면 실패할 수 있다(추측, 실행 미검증). `compression=False` 권장 [103]


<details class="post-disclosure" markdown="1">
<summary>Jev 요청 바디와 확장 컨텍스트 한도</summary>

- 요청 바디 최대 32 MiB, UTF-8 JSON과 유한수만 허용. 중첩은 최대 64단계 [3]
- gzip/zstd 압축 1겹 지원. 압축 전후 바디 크기 제한 적용 [3]
- `TypeSafe-Danger-Zone-Long-Context: true`로 요청당/질문당 262k까지 확장. 단가는 같지만 더 느리고 정확도가 낮아질 수 있다 [4]
- 이미지당 16 MiB 등 이미지 전용 한도는 Images 문서 참조 [102]

</details>

### 7.2 질문 작성 요령

- 코드로 할 수 있으면 코드로(날짜 계산/집계/규칙). 모델은 "상식 판단"만 [14]
- 질문은 원자적으로. 공식 문서가 "아마 이 가이드에서 가장 중요한 개념"이라고 강조 [14]
- 한 질문 = 사람이 1초 안에 내릴 판단 [8]
- state는 질문에 필요한 것만(context rot 방지). 객체로 넣고 질문에서 경로로 지칭 [14][15]
- 질문 키(ID)는 모델이 보지 않는다. 의미는 `instructions`/`criteria`에 기술 [3]
- Noul은 긍정형(높은 값 = yes), Choice는 전체 목록 + `other`, Score는 정도가 아니라 상황 기술 [9][10][11]
- Choice 옵션 순서가 답에 영향(앞쪽 편향). 순서를 바꿔 일관성 확인 [5]

### 7.3 confidence 해석과 임계값

| 타입 | confidence 식 [13] |
| --- | --- |
| Noul | 별도 `confidence` 없다. 원하면 `abs(2p - 1)` |
| Choice | `(p_max - 1/n) / (1 - 1/n)` |
| Score | `max(0, 1 - Σ p_i·abs(i-m) / MAD_unif)` |

- 기본 3구간: 높음 = 자동 처리 / 중간 = 확인/검토 / 낮음 = 사람 또는 다른 시스템 [13]
- 위험도별로 오류 예산을 정하고 검증 데이터의 자동 처리율/오류율 곡선에서 임계값 선택. 보편적으로 안전한 임계값은 없다 [13]
- "보수적으로 시작, 자기 데이터로 confidence 대 정확도를 그려서 조정" [13][14]
- confidence 1.0은 분포가 한 선택지에 집중됐다는 뜻. **정답 보장이 아니며 confidence와 p_max도 구분 필요** [10][13]

### 7.4 base_url 교체로 Kev 전환

- SDK는 `base_url` 인자나 `TYPESAFE_BASE_URL`로 다른 서버를 가리킬 수 있다. 대상 서버가 TypeSafe OpenAPI 스펙을 따라야 한다 [17]
- Kev README: "API가 TypeSafe System One과 일치, TypeSafe Python SDK가 Kev 서버에 수정 없이 동작" [49]
- 호출 코드를 Jev와 공유하고 엔드포인트만 바꿔 A/B 가능 [49]

---

## 8. agent 구성 시 Jev 도입

### 8.1 agent 안에서 Jev가 들어갈 자리

LLM 대신 쓸 만한 조건

- 출력이 **닫힌 집합**(라벨, 예/아니오, 척도)이고 호출량이 많으며 지연에 민감한 단계
- 확률/confidence 기반 임계값 분기(자동 처리 vs LLM 재검토)가 필요한 경우
    - 생성형 LLM은 확률 분포를 직접 주지 않거나(Anthropic) 프롬프트 추정치라 calibration이 약하다 [87]
- 부적합 [5]
    - 계산/날짜 비교/다단계 추론이 필요한 판정
    - 근거 문장이 필요한 경우
    - 생성

agent 단계별 적용 후보 (추측 포함)

| 단계 | 활용 가능성 | 주의 | 출처 |
| --- | --- | --- | --- |
| intent 분류 / 시나리오 라우팅 | 높음. `choice` 한 번으로 라벨+확률, 낮은 confidence만 LLM fallback | 한국어/일본어 정확도는 공식적으로 영어보다 낮다 → 골든셋 검증 필수 [4] | 공식 intent routing 패턴 [25] |
| 도구/하위 agent 선택 | 에이전트의 다음 도구 선택은 공식 사용 사례. 질의 라우팅(어느 검색기/하위 agent로 보낼지)은 Choice 1개 + confidence fallback으로 구성 | Kev-0.8B는 When2Call에서 chance 이하(0.133) → 도구 호출 라우팅에 쓰지 말 것 [52] | [2][88] |
| 대화 이력 관련성 판정("이 이력이 관련 있나") | `noul` 다건 병렬 평가에 적합 | 이력 블록이 길면 32k 제한 확인 | [4] |
| RAG 패시지 판정 | retrieval 직후 condenser/generator 앞에 게이트로 배치(추측). `{query, passage}`마다 Noul 4개(관련성/답 근거/전제 충돌/인젝션) 후 코드에서 판정 | 임계값은 코퍼스별 출발점일 뿐. 청크 800~1200자 기준이면 state 하나가 수백 토큰 수준이라 32k 한도보다 훨씬 작다(추측, 실측 필요) | 공식 cookbook [27] |
| 리트리벌 결과 관련도 판정/리랭킹 | `score` 또는 (query, 후보)별 Noul 확률로 리랭킹 보조 | 전용 리랭커 대비 비용/정확도 비교 필요(공식 cookbook은 BM25 대비만 보고) | 공식 Re-ranking cookbook [28] |
| 가드레일(PII/정책/인젝션 탐지) 보조 | 1차 필터로는 가능 | **"적대적 콘텐츠를 적대적으로 취급하지 않음"**이 공식 약점 → 인젝션 방어를 이 모델에만 맡기면 안 된다 [5]. Kev 기본판의 모더레이션 성능은 낮다 [62] | [5][49][62] |
| SQL 생성/집계 등 계산형 | 부적합 | 수학/날짜 약점 [5] | [5] |
| 최종 응답 생성 | 부적합 | 텍스트 생성 불가. generator는 기존 LLM 유지 | [5] |

- 크기 선택 (Kev 자체 호스팅 시, 추측 포함) [49]
    - intent 분류/시나리오 라우팅/대화 이력 판정 같은 다건 `noul`: Kev-4B부터 시작(H100 1장 약 100 req/s 수준)
    - 긴 문서 기반 판정: 0.8B~9B의 검증 범위는 8k. 초과 입력은 자체 평가나 분할 처리 필요

### 8.2 도입 시 고려사항

데이터 외부 전송 [35][36][33][37]

- Jev는 외부 SaaS(미국 스타트업). 고객 문서/개인정보를 `state`로 보내는 순간 외부 전송 → 데이터 처리 계약/리전/보존 정책 확인 필요
- 서비스는 **미국 호스팅**. 리전 선택 옵션은 문서에 없다 [35]
- 학습 미사용 약속은 있으나 **ZDR은 엔터프라이즈 계약에서만** 제공 [33][37]
- 비교: OpenAI Decisions API는 ZDR / US/EEA 리전 옵션 명시 [75]
- 사내 데이터를 외부로 못 보내는 경우 Kev 등 오픈 가중치 모델의 자체 호스팅이 선택지 [49][71]
    - Kev 상용 API 대비 최대 장점: 가중치/코드/평가셋/학습 레시피가 모두 공개돼 재현과 감사가 가능
    - OpenRouter 경유 Kev는 데이터가 제3자 제공자(Phala, SiliconFlow)로 전송 → 자체 호스팅의 이점이 사라지므로 외부 전송이 금지된 데이터에는 부적합 [56]
    - 게이트웨이(OpenRouter/Vercel/Pydantic)로 Jev를 호출해도 게이트웨이 사업자를 추가로 거침 [17]

약관 [36]

- MCA 텔레메트리 조항
    - Customer Data로부터 텔레메트리(기술 로그/해시/요약 통계/**분류**/메트릭 등) 생성 및 사기/남용 모니터링을 **영구적으로** 수행 가능
    - 텔레메트리는 제한 없이 처리 가능 → 분류 결과 자체가 민감한 경우 협상 대상
- MCA 증류 금지
    - Output으로 **모델 증류 / 출력 모방 모델 학습 금지**. 경쟁 제품 개발도 금지
    - Jev 출력을 라벨로 써서 Kev 같은 대체 모델을 학습시키는 것은 위반 소지
    - 공식 AutoResearch cookbook은 Jev 확률을 고전 ML 모델의 feature로 쓰는 예를 보여주므로 경계가 애매 → 법무 확인 필요
- 키 유출 시 TypeSafe에 즉시 통지할 의무, 키로 발생한 행위는 고객 책임

로그/키 [17][23]

- SDK 로그는 인증 헤더/키/쿠키/`token`/`secret` 헤더만 마스킹. **요청/응답 body는 자동 마스킹하지 않는다**
    - `debug` 로그를 켜면 `state`(고객 데이터)가 그대로 찍힌다
    - 운영에서는 `TYPESAFE_LOG_LEVEL`을 `warning` 이상으로. `TypeSafeAPIError.body`도 그대로 로깅 금지
- API 키는 env/Secrets Manager 등으로만 주입. 환경(dev/qa/prd)별 키 분리
- Kev 자체 서빙 시 `KEV_API_KEY` 미설정이면 무인증. 내부망이라도 인증/네트워크 제한 필수 [49]
- Kev `kev-finetune` 스킬의 "라벨을 LLM으로 생성" 경로를 쓰면 내부 데이터가 외부 LLM으로 나갈 수 있다. 사용 시 생성 모델을 허용된 모델로 고정 [49]

프롬프트 인젝션 [5][49]

- Jev는 적대적 콘텐츠를 적대적으로 취급하지 않는다고 공식 명시 → 권한/삭제/공유 같은 부작용 있는 동작의 단독 게이트로 쓰지 말 것(다층 방어)
- Kev의 마커 위조 방지(이스케이프)는 형식 보호이며 의미적 인젝션 탐지가 아니다

비결정성/버전

- 공식 cookbook에서 같은 입력(무관한 `uid`만 변경)을 15회 돌렸을 때 Jev도 8개 Choice 중 2개에서 라벨이 뒤집혔다 [30]
    - 무관 필드의 영향과 동일 요청의 변동을 분리하기 어려운 실험 → **Jev도 완전히 결정적이라고 가정하지 말 것**
    - 경계선 케이스는 임계값 밴드로 사람 검토
- Kev는 결정론적 forward라 반복 편차는 작겠지만(추측) bf16/fp32 경로 차이(최상위 답 약 300문항 중 1개 변동)는 존재 [49]
- alias(`jev-latest`)는 새 릴리스 시 답이 바뀔 수 있다 → 버전 ID 고정 [4]
- 선택지 순서 민감성: 순서 고정 또는 순서를 섞어 다회 평가 후 평균 [5]
- 장애 대비: rate limit이 예고 없이 바뀔 수 있으므로 실패 시 기존 LLM 경로로 fallback [4]

### 8.3 한국어

Jev

- 공식 문서: 영어가 주 학습 언어. **CJK 포함 타 언어도 처리하지만 영어와 같은 정확도를 기대하기 어렵다** [4]
- **고객별 fine-tuning 불가** [4] → state/질문/criteria 구성과 임계값을 자체 데이터로 조정
- 한국어 instructions와 영어 instructions 중 무엇이 나은지는 비교 대상. 공식 문서는 영어가 가장 정확하다고만 명시하고 혼용 효과는 미확인
- 토크나이저와 한국어 토큰 효율, 언어별 정확도 수치는 미확인

Kev

- **모델카드 4종 모두 "Languages: English", 영어 외 언어는 out-of-scope로 명시.** 한국어/일본어 공식 평가 부재 [50]
- 제3자 측정
    - 한 사용자 시험(2,394문항 중 비영어 472): Kev-4B 전체 79.3%, 영어만 85.3% → 비영어 약 55%로 역산(역산값, 언어별 내역 미확인) [61]
    - 싱가포르 정부 AI팀(GovTech) 모더레이션 평가 [62]
        - Kev-0.8B 기본판은 F1 0.12~0.56으로 낮다
        - LionGuard 데이터로 fine-tune 후 0.63~0.98(중국어 0.81, 타밀어 0.63)로 회복
        - Jev는 0.76~1.00
- 오픈소스이므로 한국어 라벨로 `init_from` fine-tune + temperature 재보정 가능 [49]
    - 필요 데이터 수는 태스크에 따라 다르다. README의 한 사례에서는 400건의 개선 폭이 통계적 잡음 범위
    - fine-tune이 개별 능력(예: 날짜)을 악화시킨 사례가 있으므로 기존 평가셋도 함께 재측정 [49]
- **한국어 정확도 공식 수치는 Jev/Kev 모두 없다.** 위 제3자 수치는 한국어 성능의 직접 근거가 아니므로 단정 금지

### 8.4 한국어 범용 agent를 위한 선택지와 권장 단계

조정 범위는 모델별로 다르다. Jev/Decisions는 질문과 임계값을 조정하고 Kev는 자체 데이터로 fine-tuning까지 가능. 외부 전송 제한이 있으면 자체 호스팅 가능한 모델로 후보를 좁힌다(6.1).

권장 단계 (제안)

1. 실제 사용 사례를 반영한 한국어 평가셋을 구성하고 Jev / OpenAI Decisions / Kev-4B 기본판(로컬)을 현재 사용하는 모델과 비교
    - 지표: 정확도 / calibration(Brier, reliability diagram, ECE) / AUROC / 5% 오류예산 자동화율 / 지연 / 비용
    - 외부 전송이 금지된 데이터는 내부 GPU에서 평가
    - 같은 문항을 반복 평가해 모델별 응답 변동도 확인
    - `kev.benchmark --remote`로 Jev 포함 System One 엔드포인트를 같은 문항으로 평가 가능 [49]
2. Kev와 격차가 크면 내부 라벨로 `init_from` fine-tune 1회(README의 소규모 예시는 약 $1/H100)를 시험하고 같은 지표로 재측정
3. confidence 임계값별 "자동 처리율 vs 오류율" 곡선으로 fallback 기준 결정. 임계값은 자체 데이터로 반드시 다시 설정(Kev README도 같은 권고) [49]
4. 외부 전송 불가 데이터 경로는 오픈 가중치 모델만 후보로 한정
5. 결과가 괜찮으면 confidence 임계값 + LLM fallback 구조로 소규모 shadow 운영
6. 운영 후에도 분포 변화에 대비해 주기적으로 재측정하고 필요하면 temperature/isotonic 사후 보정 레이어 추가(5.3)

---

## 부록

### jev 공식 약점 9가지와 회피법 (Jev 1.13)

| # | 약점 | 공식 회피법 | 적용 예 (추측 포함) |
| --- | --- | --- | --- |
| 1 | 문자 그대로 해석 | 정확한 조건을 instructions에, 경계 사례는 criteria에. 해석이 불가피하면 문자 그대로인 질문 2개로 나눠 코드에서 결합 | 틀린 답을 보고 "사실 이런 뜻이었다"고 설명하게 되면 그 설명이 instructions에 빠진 내용 |
| 2 | 수학/숫자 | 산술은 코드. 개수 세기는 항목별 Noul 후 코드에서 합산. hex/RGB 대신 이름/구간으로 변환해 전달 | SQL 생성/집계 같은 계산형 단계에는 미사용 |
| 3 | 날짜/시간 비교 | 날짜 구성요소를 Choice로 추출, 비교는 코드 | 보존기간/만료일 판정은 코드 |
| 4 | 간접 추론(다단계, 이중부정) | 홉 수 줄이기, state 관련 부분을 이름으로 지칭 | 질문을 직접형으로 |
| 5 | 무관한 내용이 많은 큰 state | 코드로 먼저 검색/필터, 필요 필드만. 필터가 어려우면 Noul로 관련성 거르기 | 64k 한도와 별개인 정확도 문제. RAG 전단에서 top-k 축소 |
| 6 | 적대적 콘텐츠(인젝션 등)를 적대적으로 취급하지 않는다 | criteria를 명확히, 배포 전 엣지케이스 충분히 테스트 | 인젝션 방어를 Jev 단독에 맡기지 않는다(다층 방어) |
| 7 | instructions와 criteria 모순 | 둘을 일치시킨다. `true`가 no를 뜻하는 식의 반전 금지 | 긍정형 질문 규칙 |
| 8 | Choice 옵션 순서 영향(앞쪽 편향) | 순서를 바꿔 답 일관성 확인 | 7.2 |
| 9 | 텍스트 생성 불가 | 생성 모델 사용. 추출은 후보를 만들고 Choice로 고르기 | generator는 기존 LLM 유지 |

[5]

공식 "피해야 할 것" 요약 [5]

- 코드로 정확히 계산 가능한 것을 묻기
- 한 질문에 여러 판단 숨기기
- System Two 과제
- 필요 이상의 state

추가로 공식 문서에 명시된 제약 [4]

- 영어가 주 학습 언어. **CJK 포함 타 언어도 처리하지만 영어와 같은 정확도를 기대하기 어렵다**
- → 한국어/일본어는 자체 데이터 검증 필수. confidence는 특히 주의

## Reference

<details class="post-disclosure" data-reference-disclosure markdown="1">
<summary>Reference</summary>

본문의 출처 번호에 대응하는 자료 목록.

TypeSafe 공식 블로그/문서 (docs.typesafe.ai)

- [1] TypeSafe, Introducing System One models and Jev (2026-09-15): https://typesafe.ai/blog/introducing-system-one-models-and-jev
- [2] TypeSafe Docs, System One: https://docs.typesafe.ai/concepts/system-one
- [3] TypeSafe Docs, API reference: https://docs.typesafe.ai/api/system-one ; Request rules and errors: https://docs.typesafe.ai/api/errors
- [4] TypeSafe Docs, Models: https://docs.typesafe.ai/models
- [5] TypeSafe Docs, Jev 1.13 jaggedness: https://docs.typesafe.ai/model-jaggedness/jev-1.13
- [7] Quick start: https://docs.typesafe.ai/introduction/quickstart
- [8] Primitives (Questions): https://docs.typesafe.ai/primitives
- [9] Choice: https://docs.typesafe.ai/primitives/choice
- [10] Score: https://docs.typesafe.ai/primitives/score
- [11] Noul: https://docs.typesafe.ai/primitives/noul
- [13] Confidence: https://docs.typesafe.ai/confidence
- [14] How to build with TypeSafe: https://docs.typesafe.ai/concepts/how-to-build-with-system-one
- [15] State: https://docs.typesafe.ai/concepts/state
- [17] Python SDK Usage: https://docs.typesafe.ai/sdk/python/usage
- [23] JS TypeSafeClient / TypeSafeClientConfig / RetryPolicy / RequestOptions: https://docs.typesafe.ai/sdk/javascript/api/classes/TypeSafeClient , https://docs.typesafe.ai/sdk/javascript/api/interfaces/TypeSafeClientConfig , https://docs.typesafe.ai/sdk/javascript/api/interfaces/RetryPolicy , https://docs.typesafe.ai/sdk/javascript/api/interfaces/RequestOptions
- [24] Changelogs: https://docs.typesafe.ai/sdk/python/changelog , https://docs.typesafe.ai/sdk/javascript/changelog
- [25] Intent routing: https://docs.typesafe.ai/patterns/intent-routing
- [27] Classifying RAG passages: https://docs.typesafe.ai/cookbooks/classifying_rag_passages
- [28] Re-ranking: https://docs.typesafe.ai/cookbooks/rerank_typesafe
- [30] Self-consistency: choices / nouls: https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook , https://docs.typesafe.ai/cookbooks/consistency_noul_cookbook
- [33] Legal: https://docs.typesafe.ai/legal

TypeSafe 법무/기타

- [34] Data Processing Addendum (2026-04-24): https://typesafe.ai/legal/data-processing
- [35] Privacy Policy (2025-11-19): https://typesafe.ai/legal/privacy-policy
- [36] Master Customer Agreement (2026-09-23): https://typesafe.ai/legal/mca
- [37] Enterprise: https://typesafe.ai/enterprise
- [38] OpenAPI spec v0.2.0: https://api.typesafe.ai/openapi.json (문서 UI: https://api.typesafe.ai/docs/)

TypeSafe 관련 인터뷰/해설 (2차 포함)

- [47] eesel.ai, Is Jev really ultrafast?: https://www.eesel.ai/blog/jev-ultrafast

Kev

- [49] jaredpalmer/kev GitHub README (main): https://github.com/jaredpalmer/kev
- [50] Kev 모델카드 0.8B / 4B / 9B / 27B: https://github.com/jaredpalmer/kev/tree/main/docs/model-cards (HF: https://huggingface.co/jaredpalmer/kev-4b 등)
- [51] Kev-0.5B 모델카드(프로토타입): https://github.com/jaredpalmer/kev/blob/main/docs/model-cards/kev-0.5b.md , https://huggingface.co/jaredpalmer/kev-0.5b
- [52] Kev 1.0 릴리스 노트: https://github.com/jaredpalmer/kev/releases/tag/kev-1.0
- [53] Jared Palmer, Introducing Kev (블로그): https://jaredpalmer.com/blog/introducing-kev
- [54] Kev 소스 `kev/model.py`, `kev/api.py`: https://github.com/jaredpalmer/kev/blob/main/kev/model.py
- [56] OpenRouter 모델 API(`/api/v1/models/jaredpalmer/kev-4b/endpoints`), https://openrouter.ai/jaredpalmer
- [58] Archer Hume, Jev's Architecture Unmasked (2026-09-17): https://archerhume.com/posts/jevs-architecture-unmasked
- [59] AI Weekly, Jared Palmer Ports Kev to Qwen3.5 for Roughly $95 in H100 (2차, $95/$0.03/0.837 출처): https://aiweekly.co/alerts/jared-palmer-ships-kev-an-apache-20-jev-style-decision-model-family-built-on
- [60] Opper.ai, Jev vs. Kev tested side by side (2026-09-25): https://opper.ai/blog/jev-vs-kev-open-decision-model
- [61] ddalcu/mlx-serve Issue #599, Kev-4B 2,394문항 시험 (2026-09-27): https://github.com/ddalcu/mlx-serve/issues/599
- [62] GovTech Singapore AI 블로그, Decision Models for Guardrails: Exploring Jev and Kev for Moderation (2026-09-28): https://blog.ai.gov.sg/decision-models-for-guardrails-exploring-jev-and-kev-for-moderation/
- [63] Qwen 모델 HF 카드(license 필드): https://huggingface.co/Qwen/Qwen3.5-4B-Base , https://huggingface.co/Qwen/Qwen3.8-27B

기타 Jev류 모델/비교

- [70] autotrust/JEV-9B (Hugging Face): https://huggingface.co/autotrust/JEV-9B
- [71] Strands Agents, Introducing Strands Decider 2B: https://strandsagents.com/blog/introducing-strands-decider/
- [72] Cloudflare, Introducing Clef: https://blog.cloudflare.com/clef-decision-models/
- [73] Microsoft, Microsoft-Decision-1: https://commandline.microsoft.com/microsoft-decision-1-model-foundry/

OpenAI

- [74] OpenAI Developer Community, Decisions API is now available in Public Beta: https://community.openai.com/t/decisions-api-is-now-available-in-public-beta/1403877
- [75] OpenAI Docs, Decisions: https://developers.openai.com/api/docs/guides/decisions
- [77] OpenAI Docs, GPT-6 Luna model page: https://developers.openai.com/api/docs/models/gpt-6-luna

Anthropic / 어댑터

- [83] Anthropic, Introducing Claude Haiku 5.5: https://www.anthropic.com/claude-haiku-5-5
- [85] Vincent van Deth, OpenAI Decisions API: Output, Cost, Alternatives: https://vincentvandeth.nl/blog/openai-decisions-api-explained-jev-haiku
- [87] Vercel AI SDK Docs, Decisions: https://ai-sdk.dev/docs/ai-sdk-core/decisions
- [88] Medium, Haiku 5.5 vs Jev (사용 사례/출시 타임라인 언급): https://medium.com/@itaispector1/haiku-5-5-vs-jev-is-anthropics-jev-killer-about-to-make-decision-models-obsolete-e25520bbe9f8 (본문 미확인, 요약 기준)

학술 (calibration / RLCD 동명 논문)

- [89] Yang et al., RLCD: Reinforcement Learning from Contrastive Distillation for Language Model Alignment (ICLR 2024): https://arxiv.org/abs/2307.12950
- [92] Guo et al., On Calibration of Modern Neural Networks (ICML 2017): https://arxiv.org/abs/1706.04599
- [93] OpenAI, GPT-4 Technical Report: https://arxiv.org/abs/2303.08774
- [95] Tian et al., Just Ask for Calibration (EMNLP 2023): https://arxiv.org/abs/2305.14975
- [97] Yaldiz et al., Balancing Classification and Calibration Performance in Decision-Making LLMs via Calibration Aware Reinforcement Learning: https://arxiv.org/abs/2601.13284

명칭


입출력 예시와 한도

- [102] TypeSafe Docs, Images / Box: https://docs.typesafe.ai/images , https://docs.typesafe.ai/primitives/box
- [103] TypeSafe Docs, Python SDK Advanced usage (zstd 압축 설정): https://docs.typesafe.ai/sdk/python/usage/advanced
- [105] Kev 소스 `kev/serve.py` (main): https://github.com/jaredpalmer/kev/blob/main/kev/serve.py
- [106] Kev `uv.lock` (`typesafe-sdk` 0.6.0 고정): https://github.com/jaredpalmer/kev/blob/main/uv.lock
- [110] Vaswani et al. 2017, "Attention Is All You Need", Figure 1: https://arxiv.org/abs/1706.03762
- [111] Jay Alammar, "The Illustrated GPT-2": https://jalammar.github.io/illustrated-gpt2/
- [114] Qwen3.5-0.8B-Base / 4B-Base / 9B-Base, Qwen3.8-27B 모델 카드와 config.json(Kev 고정 revision, `layer_types`/`full_attention_interval`/`vocab_size`/`tie_word_embeddings`/hidden 확인): https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/raw/dc7cdfe2/config.json , https://huggingface.co/Qwen/Qwen3.5-4B-Base/raw/1001bb4d/config.json , https://huggingface.co/Qwen/Qwen3.5-9B-Base/raw/68c46c4b/config.json , https://huggingface.co/Qwen/Qwen3.8-27B/raw/1d4bf0f2/config.json
- [115] Yang, Kautz, Hatamizadeh, "Gated Delta Networks: Improving Mamba2 with Delta Rule" (ICLR 2025): https://arxiv.org/abs/2412.06464
- [116] Qiu et al. 2025, "Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free": https://arxiv.org/abs/2505.06708
- [117] Hugging Face transformers `modeling_qwen3_5.py` (main): https://github.com/huggingface/transformers/blob/main/src/transformers/models/qwen3_5/modeling_qwen3_5.py
- [119] Sebastian Raschka, LLMs-from-scratch Gated DeltaNet README: https://github.com/rasbt/LLMs-from-scratch/blob/main/ch04/08_deltanet/README.md
- [121] Qwen2.5-0.5B / Qwen3-4B-Base config.json (`vocab_size` 151,936 대조용): https://huggingface.co/Qwen/Qwen2.5-0.5B/raw/main/config.json , https://huggingface.co/Qwen/Qwen3-4B-Base/raw/main/config.json

인코더/디코더 분류 구조와 pointer 계보

- [122] Vinyals, Fortunato, Jaitly, Pointer Networks (NeurIPS 2015): https://arxiv.org/abs/1506.03134
- [128] BertForMultipleChoice (공유 `Linear(hidden→1)` + 선택지 softmax), Spark NLP 문서: https://sparknlp.org/api/python/reference/autosummary/sparknlp/annotator/classifier_dl/bert_for_multiple_choice
- [129] GLiClass 논문 / repo: https://www.arxiv.org/pdf/2508.07662 , https://github.com/Knowledgator/GLiClass
- [130] LlamaForSequenceClassification 마지막 비패딩 토큰 pooling: Label Supervised LLaMA Finetuning https://arxiv.org/abs/2310.01208 , HF forum https://discuss.huggingface.co/t/when-training-llama-for-sequence-classification-should-the-final-token-be-an-eos/54500
- [131] Yin, Hay, Roth, Benchmarking Zero-shot Text Classification: Datasets, Evaluation and Entailment Approach (EMNLP 2019): https://aclanthology.org/D19-1404/
- [132] BehnamGhader et al., LLM2Vec: Large Language Models Are Secretly Powerful Text Encoders (2024): https://arxiv.org/abs/2404.05961
- [133] Weller et al., Seq vs Seq: An Open Suite of Paired Encoders and Decoders (Ettin, 2025): https://huggingface.co/papers/2507.11412
- [134] Answer.AI / Hugging Face, Finally, a Replacement for BERT: Introducing ModernBERT (2024-12-19): https://huggingface.co/blog/modernbert
- [137] Jurafsky & Martin, Speech and Language Processing 3rd ed. draft, ch.10 (양방향 인코더 vs causal): https://web.stanford.edu/~jurafsky/slp3/10.pdf

</details>
