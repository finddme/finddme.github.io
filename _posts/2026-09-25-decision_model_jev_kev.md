---
title: "Decision Model: <span style='font-weight:bold; font-family:CMU Serif Roman;'>Jev</span>, Kev"
category: LLM / Multimodal
tag: Multimodal
thumbnail: https://github.com/user-attachments/assets/6408c678-9703-4cb7-92e7-7c3e78bc51b8
---



 




* 목차
{:toc}










# Decision Model: Jev, Kev

- 확인일: 2026-10-14. 가격/버전/한도/출시일/SDK 버전/라이선스 상태는 모두 이 날짜 기준이며 변경 가능
- Kev 수치는 별도 표기가 없으면 Kev 저장소 `main`(Kev 1.0)의 **Kev 측 자체 평가**
- 표기
    - 출처: [n] (문서 끝 Sources의 일련번호)
    - 확인하지 못한 항목: "확인 못 함"
    - 근거 없는 추론: "(추측)"
    - 2차 보도/비공식 자료: "(2차)"
    - 특정 모델과 무관한 일반 지식: "(일반론)"
    - 특정 서비스에 대입한 예시: "(응용 예)"
- Kev README/모델카드/코드 일부(`kev/model.py`, `kev/api.py`)는 raw 파일 기준

---

## 0. 한눈에 보기

### 0.1 비교 요약

| 항목 | Jev | Kev | OpenAI Decisions |
| --- | --- | --- | --- |
| 제공사 | TypeSafe AI (미국 스타트업) | Jared Palmer 개인 오픈소스 (TypeSafe와 별개) | OpenAI |
| 공개 범위 | 호스팅 API만(early access). 가중치/아키텍처/학습 데이터/학습 레시피 비공개 | 가중치/학습/평가/서빙 코드/평가셋/학습 레시피 공개 | 호스팅 API만(2026-10-06 public beta). 결정 모드 구현 방식 비공개 |
| backbone | 비공개 | Qwen3.5-0.8B/4B/9B-Base, Qwen3.8-27B | `gpt-6-luna` (결정 모드로 바꾸는 방식은 비공개) |
| 크기 | 비공개 | 0.8B / 4B / 9B / 27B | 비공개 |
| 가격 (100만 토큰당) | 입력 $0.042, 출력 무료 | 가중치 무료(자체 GPU 비용). OpenRouter의 `kev-4b`는 입력 $0.042, 출력 무료 | 입력 $0.10, 출력/캐시 읽기/쓰기 무료 |
| 언어 | 영어 우선. CJK 포함 타 언어는 "처리하지만 같은 수준은 아님" | 모델카드 4종 모두 "Languages: English", 영어 외 out-of-scope | Decisions 문서의 언어 지원 기재는 확인 못 함 |
| 입력 | 텍스트만 | 텍스트 | 텍스트 + 이미지(inline base64) |
| 라이선스/약관 | 상용 API(MCA). Output으로 모델 증류/모방 모델 학습 금지 | 코드/어댑터/head/Qwen base 모두 Apache-2.0. 학습 데이터셋은 각자 라이선스 | 상용 API |
| 고객 데이터로 fine-tuning | 불가 | 가능(`--init_from`) | 확인 못 함 |
| calibration 공식 주장 | 있다(RLCD, 상세 비공개) | 지도학습 + 체크포인트별 temperature 1개 | 없다(문서에 미언급) |

출처: [1][4][36][49][50][56][63][75][77]

### 0.2 핵심 결론

1. Decision model은 "상태(텍스트/JSON) + 타입 지정 질문"을 받아 **답과 확률만** 반환하는 모델. 텍스트를 생성하지 않아 출력 토큰 과금이 없고 지연은 입력 길이에만 좌우
2. Jev는 이 카테고리의 첫 상용 모델(2026-09-15 공개). backbone/파라미터 수/아키텍처는 비공개. 학습 방식은 "RLCD"라는 이름과 목표만 공개
3. Kev는 Jev 구조에 대한 제3자 가설(Archer Hume)을 Qwen 위에 구현한 오픈소스 재현판. LM head를 버리고 pointer head를 붙여 forward 1회로 결정. Jev와 같은 구조라는 보장은 없다
4. Kev 측 평가에서 Kev-27B는 정확도 0.851로 Jev 0.857에 근접. 지식형 질문(MMLU-Pro 0.675 vs 0.840)과 confidence 순위화(5% 오류예산 자동화율 0.52~0.69 vs 0.70)는 Jev 우위
5. OpenAI는 Decisions API(`gpt-6-luna`)로 같은 카테고리에 진입. Anthropic은 2026-10-14 기준 결정 전용 모델/엔드포인트 부재(Claude Haiku 5.5는 일반 생성형)
6. 한국어: Jev/Kev 모두 영어 중심이며 한국어 정확도 공식 수치 부재
    - Jev는 고객별 fine-tuning 불가 → 자체 골든셋 검증과 임계값 조정만 가능
    - Kev는 오픈소스라 한국어 라벨 fine-tuning + temperature 재보정 가능
7. Jev는 외부 SaaS(미국 호스팅). ZDR은 엔터프라이즈 계약에서만 제공. 외부 전송 불가 데이터 경로는 Kev 등 오픈 가중치 모델의 자체 호스팅이 선택지

---

## 1. Decision model이란

### 1.1 정의와 명칭

- **decision model**: 일반 카테고리 명칭. 비구조 상태를 받아 타입이 지정된 확률적 결정을 반환하는 모델
- **System One model**: TypeSafe의 명칭. Kahneman의 System 1(빠른 직관적 판단)에서 유래하며 LLM을 System 2(느린 숙고)로 규정 [1][2]
    - TypeSafe 표어: "unstructured state in, typed probabilistic decisions out". 소프트웨어가 호출하는 결정 함수로 포지셔닝 [1]
- 명칭 사용 현황

| 주체 | 표현 |
| --- | --- |
| Pydantic AI 문서 | decision model을 일반 카테고리로 정의. Jev는 `POST /v1/systemone` API로 제공되는 decision model 중 하나라고 설명 [99] |
| Kev | 스스로 "Jev-style decision model" / "Jev-like" 결정 모델군으로 지칭 [49][59] |
| OpenAI | "Decisions API" [74][75] |
| TechCrunch | OpenAI Decisions를 "Jev clone"으로 표현 [100] |
- 신생 카테고리라 표준 명칭 미확정

### 1.2 생성 LLM과의 차이

| 구분 | 생성 LLM | Decision model |
| --- | --- | --- |
| 출력 | 텍스트(토큰열) | 닫힌 집합의 답 + 확률/confidence |
| 실행 | 출력 토큰마다 forward 반복(자기회귀 디코딩) | prefill 한 번으로 종료 |
| 지연 | 입력 + 출력 길이에 비례 | 입력 길이에만 좌우 |
| 과금 | 입력 + 출력 | 입력만(출력 토큰 0) |
| 확률 | 직접 주지 않거나(Anthropic) 프롬프트 추정치라 calibration이 약하다 [87] | softmax에서 직접 나오므로 temperature scaling 등으로 calibration 조정이 쉽다 |
| 질문 정의 | 프롬프트 | 런타임에 자연어로 질문과 선택지 정의 |
| 대표 용도 | 생성/설명/추론 | 분류/라우팅/이진 판정/점수화 |
- 위 실행/지연/과금/확률 비교는 일반론. Jev가 같은 방식이라는 보장은 없다(Jev 내부 비공개)
- "환각 0%"(TypeSafe 주장)는 **타입 안전성(스키마 일치)**에 대한 주장이며 답의 정확성 보장이 아니다 [1][2]
- Jev 공개(2026-09-15) 뒤 약 3주 사이 Kev, OpenAI Decisions API, Claude Haiku 5.5 등이 잇따라 나왔다

---

## 2. 동작 원리: 생성형 LLM 기반인데 왜 생성하지 않나

- **Jev 내부는 비공개.** 이 장은 소스가 공개된 Kev 코드 기준 설명
- Kev 구조 자체도 Archer Hume의 Jev 구조 가설을 구현한 것이라 Jev와 같다는 보장은 없다 [49][58]
- Jev에 대해 공식 확인된 구조적 특성은 다음 3가지뿐 [1][2]
    - 비자기회귀
    - 한 번의 병렬 forward pass로 모든 질문 처리
    - 출력 토큰 0개(그래서 출력 무료)
- TypeSafe 블로그의 구조 표현은 "new model architecture", "parallel sampler", 모든 출력을 한 번에 생성한다는 수준 [1]

### 2.1 decoder LLM은 두 부분으로 나뉜다 (일반론)

<center><img width="1200" src="https://github.com/user-attachments/assets/6408c678-9703-4cb7-92e7-7c3e78bc51b8"></center>

- 그림: 입력 토큰 → 트랜스포머 본체(backbone) → 토큰마다 hidden state → (마지막 위치) LM head(선형층 1개) → 다음 토큰 확률(어휘 전체) → 샘플링(토큰 1개 선택) → 토큰을 덧붙여 재실행. 출력이 100토큰이면 이 루프를 100회 반복

```
입력 토큰들 ──▶ [트랜스포머 본체] ──▶ 토큰마다 hidden state(숫자 벡터)
                                         │
                                         ▼
                                   [LM head] ──▶ 다음 토큰 확률(어휘 전체)
                                         │
                                         ▼
                              샘플링 → 토큰 1개 덧붙임 → 다시 처음부터 (반복)
```

1. **본체**: 토큰열을 읽어 위치마다 hidden state를 계산하는 함수
    - 각 위치의 hidden state는 그 위치까지의 입력 내용을 담은 벡터 표현
    - 본체 자체는 아무것도 생성하지 않는다
2. **LM head**: 마지막 위치의 hidden state를 어휘 크기의 점수(다음 토큰 확률)로 바꾸는 선형층 하나
3. **"생성"**: **반복 루프**(autoregressive decoding)일 뿐
    - LM head 출력에서 토큰 하나를 샘플링
    - 그 토큰을 입력 끝에 붙여 본체를 다시 실행
    - 출력이 100토큰이면 100회 반복
- "생성형"이라는 성질은 모델 가중치가 아니라 **LM head + 반복 루프라는 사용 방식**에 있다
- 본체는 입력 문맥을 hidden state로 인코딩하는 부분이며 그 능력은 대규모 사전학습에서 획득

본체 내부 (일반론)

- 입력 토큰을 토큰 임베딩(토큰마다 벡터 1개)으로 바꾸고 위치 정보를 반영. 위치 정보 방식은 모델마다 다르다(임베딩에 더하는 방식, RoPE처럼 attention 안에서 적용하는 방식 등) [110][111]
- 같은 구조의 블록을 N번 쌓아 통과. 블록 하나 = masked self-attention + FFN(feed-forward network) [110][111]
    - masked self-attention: 위치 사이에서 정보를 주고받는 유일한 sublayer. 각 위치는 자기보다 앞 위치만 참조(causal mask) [110][111]
    - FFN: 위치마다 따로 적용(position-wise) [110]
    - 각 sublayer 앞에 정규화, 뒤에 입력을 다시 더하는 residual 연결을 두는 pre-norm 배치. 원 Transformer는 sublayer 뒤에 정규화를 두는 post-norm [110][112]
    - 정규화는 LayerNorm 또는 re-centering을 뺀 RMSNorm. Qwen3.5 계열 구현은 RMSNorm pre-norm [113][117]
- 마지막 블록 뒤에 정규화를 한 번 더 적용. 그 결과가 위치별 hidden state [117][120]
- 그래서 토큰마다 같은 블록 스택을 통과하는 세로 기둥 구조가 되고 기둥 사이 연결은 attention에서만 발생 [111]
- 실제 서빙에서는 앞 위치의 attention 계산 결과(KV 캐시)를 보관해 새 토큰 위치만 계산. 위 루프의 "다시 처음부터"는 개념 설명 [111]

### 2.2 출력층 교체: pointer head

<center><img width="1200" src="https://github.com/user-attachments/assets/668221cd-c324-4c91-96b1-d8c025514036"></center>

- 그림: 직렬화 입력(`<state> … <q> … <opt> … </opt> ×K <decide>`, Qwen 특수 토큰 재활용) → 트랜스포머 본체(Qwen, prefill ×1, 위치별 hidden state) → 선택지 표현 h(`</opt>`)=key(선택지마다 1개)와 질문 표현 h(`<decide>`)=query(전체 문맥 반영) → pointer head(q,k: Linear(d→256), k·q/√256, 선택지별 점수) → 선택지별 확률 softmax(z/T)(T는 체크포인트별 1개, 예: 4B T=2.41) → System One JSON(choice/confidence/score). LM head(어휘 248,320, padded)는 로드 후 버린다. forward 1회, 생성 토큰 0개, 선택지 최대 255개(요청마다 달라도 된다)

코드 근거 [54]

- `DecisionModel`은 `AutoModelForCausalLM.from_pretrained(...).model`로 **본체만 꺼내고 LM head는 버린다**
- 주석: "backbone only (no vocab head): we never generate text."
    - 주석의 "no vocab head"는 쓰지 않는다는 뜻. 기본 경로는 LM head까지 로드한 뒤 본체만 꺼내 쓰는 방식(로드 자체는 생략하지 않는다)
- 0.8B/4B backbone은 `tie_word_embeddings: true`라 LM head 가중치가 입력 임베딩과 같은 행렬. 9B는 false [114]
- 이후 `last_hidden_state`(마지막 층 hidden state)만 사용

단계별 흐름 [49][51][54]

1. **입력을 한 줄로 직렬화.** 선택지마다 여는/닫는 마커를 두고 질문 끝에 `<decide>` 마커를 둔다
    
    ```
    <state> …문서… <q> 지시문 <opt> 선택지1 </opt> <opt> 선택지2 </opt> … <decide>
    ```
    
    - 마커는 새 토큰 추가가 아니라 Qwen에 이미 있는 특수 토큰(`<|fim_prefix|>`, `<|box_start|>` 등)의 재활용(Kev-0.5B 카드 기준). 사용자 입력에 같은 문자열이 있으면 이스케이프해 마커 위조 차단 [51][49]
    - 타입별 변환 [54]
        - `noul`: 선택지 2개(`no`, `yes`)로 변환. 응답은 p(yes)
        - `score`: 단계들을 순서대로 선택지로 변환해 같은 틀에 투입. 응답은 단계 확률의 기대값
2. **본체를 한 번 통과**(prefill)시켜 모든 위치의 hidden state 획득
3. **두 종류의 위치를 골라 읽기**
    - 각 선택지의 `</opt>` 위치: causal 모델이므로 "문서 + 지시문 + (앞 선택지들) + 이 선택지 내용"까지 반영한 표현. 즉 **선택지 하나의 표현**
    - `<decide>` 위치: 맨 끝이라 문서/지시문/모든 선택지를 모두 반영한 상태. 즉 **"그래서 답이 뭐지?"에 해당하는 질문 표현** [49]
4. **pointer head**로 둘을 비교. 실제 코드 [54]
    
    ```python
    self.q, self.k = nn.Linear(d, 256), nn.Linear(d, 256)
    z = (self.k(h_opts) @ self.q(h_decide)) / sqrt(256)   # 선택지별 점수
    ```
    
    - `<decide>` 벡터를 query로, 각 `</opt>` 벡터를 key로 256차원에 투영한 뒤 내적(scaled dot product). attention 점수 계산과 같은 형태
    - "pointer"라는 이름: 출력이 고정 라벨이 아니라 **입력 안의 위치(선택지) 중 하나를 가리키는 분포**(pointer network 계열 명명, 일반론). 용어 유래는 2.8 끝 참고 박스
5. **temperature로 나누고 softmax** → 선택지별 확률 [49]
    - temperature는 체크포인트마다 하나: 0.8B 2.35 / 4B 2.41 / 9B 2.19 / 27B 1.32
    - 답의 순위는 바꾸지 않고 확신도만 조정
6. 확률에서 `choice`/`confidence`/`score`를 계산해 System One 형식 JSON으로 반환
    - Choice confidence = `(p_max − 1/K)/(1 − 1/K)`(TypeSafe 레퍼런스 어댑터와 동일 공식) [49]
- 결과: **선택지 개수와 무관하게 forward 1회**, 생성 토큰 0개
    - API의 `usage.output_tokens`는 생성 토큰이 아니라 응답 JSON 길이를 센 값 [49]
- 출력층이 어휘 전체(Kev 1.0 backbone 기준 248,320개)짜리 분류기에서 "주어진 선택지 K개짜리 분류기"로 바뀐 구조 [114]
    - 선택지는 매 요청마다 달라도 된다(최대 255개). 고정 라벨 분류 head와의 핵심 차이

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
- gated attention: softmax attention 출력에 head별 sigmoid gate를 곱한 형태. Qwen3.5 구현은 q_proj 출력을 query와 gate로 나눠 `attn_output × sigmoid(gate)` [116][117]
- Kev가 읽는 `last_hidden_state`는 최종 RMSNorm을 거친 값 [54][117]
- 어휘: Qwen3.5/3.8 backbone의 `vocab_size`는 248,320(padded). Kev-0.5B 프로토타입의 Qwen2.5와 Qwen3 세대는 151,936 [114][121]

### 2.3 실행 경로 비교: 생성 LLM vs Kev

<center><img width="1200" src="https://github.com/user-attachments/assets/cd3b8184-954b-43e5-899c-4347e9287358"></center>

- 그림의 변경 사항
    - 01 CHANGED: LM head → pointer head 교체(LM head는 로드 후 버리고 쓰지 않는다). 입력에 선택지 마커(`<opt>`/`</opt>`/`<decide>`) 추가
    - 02 REMOVED/REWIRED: 샘플링/덧붙임 단계 제거, LM head → 샘플링 연결 제거, 재실행 루프 제거 → forward 1회(prefill), 출력 경로를 샘플링에서 pointer head로 재연결
    - 03 CHANGED: 출력이 텍스트 → 선택지별 확률 + confidence
    - 04 학습(구조는 동일): 본체 LoRA(27B는 전체 가중치) + pointer head 짧은 fine-tuning
    - 05 temperature 보정(구조는 동일): 순위 불변, 확신도만 조정
    - 변경 없음: 트랜스포머 본체, hidden state(`last_hidden_state`)

| 구분 | 생성 LLM | Kev |
| --- | --- | --- |
| 사용하는 부분 | 본체 + LM head | 본체 + pointer head (LM head는 로드 후 버린다) |
| 본체 출력 | 위치별 hidden state | 위치별 hidden state (동일) |
| 최종 출력층 | LM head: 마지막 hidden state → 어휘 전체의 다음 토큰 확률 | pointer head: `<decide>`와 각 `</opt>` hidden state 내적 → 선택지 K개의 확률 |
| 실행 횟수 | 출력 토큰 수만큼 forward 반복(샘플링 → 덧붙임 → 재실행) | forward(prefill) 1회 |
| 출력 | 텍스트 | 선택지별 확률 + confidence |
- 사전학습으로 얻은 본체의 문맥 이해 능력(hidden state)은 그대로 쓰고 텍스트를 만드는 LM head와 샘플링 루프만 제거한 구조
- 생성은 출력 길이만큼 forward가 필요. Kev는 입력과 선택지를 한 번 읽는 prefill로 종료
- LoRA/head 학습: 본체(LoRA, 27B는 전체 가중치)와 pointer head를 선택지 비교 과제에 맞추는 짧은 fine-tuning
- temperature: 확률값이 실제 정답률과 맞도록(calibration) softmax 분포의 확신 정도만 조정하는 보정 계수(답의 순위는 불변)

왜 빠르고 싼가 (일반론, Jev가 같은 방식이라는 보장은 없다)

- 자기회귀 디코딩은 출력 토큰마다 forward를 반복
- 결정 모델은 prefill 한 번으로 종료. 지연은 입력 길이에만 좌우되고 출력 토큰이 0이라 과금도 입력만 발생
- 확률이 softmax에서 직접 나오므로 temperature scaling 등으로 calibration 조정이 쉽다

### 2.4 여러 질문 동시 처리: 세대별 차이

<center><img width="1200" src="https://github.com/user-attachments/assets/2417e7eb-f74e-42e3-9493-d389dd362f29"></center>

- 그림
    - Before(Kev-0.5B / Qwen3 세대, attention-only): state와 Q1/Q2/Q3를 한 시퀀스로 연결하고 질문마다 position 재시작 → attention mask로 질문 간 격리(질문 토큰은 state와 자기 질문만 참조) → forward 1회로 모든 질문 처리(1 sequence, 1 pass)
    - 전환 원인: Gated DeltaNet(순환형, linear-attention family)은 mask를 무시
    - After(Kev 1.0, Qwen3.5/Qwen3.8 backbone): state는 한 번만 계산해 캐시 → 질문마다 별도 행(state 캐시 + 그 질문), 행끼리 독립이라 질문 간 격리가 exact → 행들을 한 배치로 묶어 처리(패스당 토큰 예산 16,384, 행마다 state 길이 포함)

| 세대 | 방식 | 근거 |
| --- | --- | --- |
| Kev-0.5B, Qwen3 세대(attention-only) | state와 모든 질문을 **한 시퀀스**로 연결. attention mask로 "질문 토큰은 state와 자기 질문만 보고 다른 질문은 못 본다"를 강제. 질문마다 position id를 state 직후부터 다시 시작. 실제로 한 번의 forward pass | [49][51] |
| **Kev 1.0 (Qwen3.5/3.8, 현행)** | DeltaNet 층은 순환형이라 mask를 무시. 그래서 **질문마다 별도 행**(state + 그 질문)으로 실행. state 부분은 한 번 계산해 캐시를 모든 행에 재사용. 행이 독립이라 격리는 정확(exact). 서버는 행들을 한 배치로 묶어 처리. 16,384는 패스당 토큰 예산(`ROW_PASS_TOKENS`)이고 행마다 state 길이를 포함해 센다. 패스당 행 수 = `max(1, 16384 // (state 길이 + 가장 긴 행 길이))` | [49][54] |
- "질문 간 attention mask로 한 번의 forward pass에서 여러 질문 평가"는 **현행 Kev(Qwen3.5/3.8)에는 해당하지 않는다.** attention-only인 Qwen3 세대와 프로토타입 방식 [49]
- attention-only 모델에서 두 방식이 같은 확률을 낸다는 테스트 존재(fp32에서 차이 4e-6 이내). 서빙 경로와 평가 경로도 fp32 반올림 수준으로 일치 [49]
- 격리는 **질문 간**에만 보장 [49]
    - 한 질문 안의 선택지끼리는 서로 영향을 주므로 선택지 순서가 답을 바꿀 수 있다
    - 이를 점검하는 `/v1/systemone/permute`(순서 섞어 n회) 엔드포인트가 별도 존재
- 효과: 같은 문서에 질문을 추가하면 질문 부분 비용만 발생. Kev-4B H100 기준 새 문서 18.1ms, 같은 문서 재질의 12.9ms [49]

순환형 층에서 mask가 통하지 않는 원리 (Kev 1.0)

- attention mask는 query-key 점수 행렬의 특정 칸을 지우는 장치 [110]
- Gated DeltaNet 층은 점수 행렬 없이 상태 `S_t`를 직전 상태 `S_{t-1}`과 현재 토큰(k_t, v_t, α_t, β_t)으로만 갱신 [115]
    - 위치 t의 출력이 볼 수 있는 과거는 누적 상태 1개뿐이라 특정 과거 토큰만 빼는 경로가 식에 없다. Kev README의 "recurrent and ignore attention masks"와 같은 내용 [49][115]
    - state, Q1, Q2를 한 시퀀스로 이으면 Q2 첫 토큰이 받는 상태에 Q1이 이미 포함
- transformers 구현에서 DeltaNet 층으로 전달되는 mask는 padding 토큰의 hidden state를 0으로 만드는 용도 [117]
- packed 시퀀스 경계는 `cu_seq_lens_q`/`seq_idx`를 줄 때 구간마다 상태를 새로 시작하는 방식으로만 분리. `position_ids`만 주면 문서가 섞인다(Qwen3.5-0.8B에서 최대 로그확률 차이 1.96) [118]
- 상태를 새로 시작하면 state 구간의 상태도 사라지므로 "state는 보고 다른 질문은 보지 않는" 격리는 한 시퀀스 안에서 표현할 수 없고 질문마다 행을 분리해야 한다(추론, [115][118]에서 끌어낸 결론이며 이 내용을 그대로 서술한 1차 자료는 확인 못 함)
- Kev 코드의 `is_hybrid(config)`는 `layer_types`에 `linear_attention`이 있으면 하이브리드로 판정하고 행 형식으로 실행. 선택지 간 격리 옵션 `option_isolation`은 하이브리드에서 ValueError [54]

state 캐시 내용과 행 배치 [49][54][105]

- `prefix()`: state 토큰만 1회 실행해 `DynamicCache` 반환 [54]
- 캐시 = full attention 층의 state 구간 KV + DeltaNet 층의 state 끝 시점 순환 상태(`recurrent_states`)와 conv 상태(`conv_states`). 층 수는 attention/DeltaNet 기준 0.8B 6/18, 4B와 9B 8/24, 27B 16/48 [54][114]
- 행 실행 시 캐시 복제본을 만들고 `reorder_cache`로 행 수만큼 batch 차원을 복제. 원본 prefix 캐시는 그대로 유지 [54]
- 각 행은 질문 토큰만 입력하고 position은 state 뒤에서 이어짐. attention_mask는 state 길이만큼의 1 + 행별 padding mask [49][54]
- 패스당 행 수: 토큰 예산 `ROW_PASS_TOKENS = 16384` 안에서 `max(1, 16384 // (state 길이 + 가장 긴 행 길이))`. 행마다 캐시된 state 길이를 한 번씩 센다. 질문 수가 늘면 패스 수만 늘고 메모리는 늘지 않는다 [49][54]
- 서버는 요청 간에도 `PrefixCache`(LRU)로 state 캐시(KV + DeltaNet 상태)를 최대 4개 보관. 상한 `PREFIX_MAX_TOKENS = 65536` [105]
- Jev 쪽: 여러 질문을 한 요청 안에서 서로 독립적으로 평가한다는 것만 공식 [2]. 구현 방식은 비공개

### 2.5 인코더(BERT류)를 쓰지 않는 이유

Kev 저장소/블로그에는 이 선택의 이유를 직접 쓴 문장이 **없다**(확인 못 함). 관련 근거와 일반론을 구분해 정리.

| 구분 | 내용 |
| --- | --- |
| Kev 근거(간접) | "지식형 질문 성능은 대부분 base 모델이 결정한다." MMLU-Pro가 0.8B 0.230 → 27B 0.675로 base 크기에 비례 [49][50]. 즉 사전학습 지식이 성능의 핵심 |
| Kev 근거(간접) | 목표가 Jev 재현이었고 Jev 구조 가설(Archer Hume)이 causal decoder 기반 [49][58] |
| Archer Hume(Jev에 대한 주장) | Jev 수준 지식(MMLU-Pro 84.6%)은 프런티어급 사전학습에서만 나오고 그 규모 모델은 전부 causal decoder. 공유 prefix KV 캐시는 decoder 서빙에서 표준 [58] |
| 독립 측정 | 한 사용자 시험(2,394문항)에서 Kev-4B 79.3% vs ModernBERT-large 기반 Laya 55.3%. 대신 Laya는 문항당 약 14ms, Kev는 배치 약 1초 [61] |
| 일반론 | decoder 장점: 지시문 이해(질문을 런타임에 자연어로 정의) / 긴 컨텍스트(인코더는 보통 512~8k) / 모델 크기 선택지(0.8B~27B 이상) / 생태계(LoRA, 서빙 커널). 반대로 인코더는 양방향이라 표현이 효율적이고 훨씬 작고 빠르다. 인코더 분류 head와의 구조 비교는 2.8 |

### 2.6 비생성 기법 계열 비교

생성형 LLM을 base로 쓰면서 생성하지 않는 방식. Jev 내부는 알 수 없으므로 소스가 공개된 모델에서 확인된 방식만 정리.

| 기법 | 방법 | 선택지 런타임 변경 | 확률 | 대표 사례 |
| --- | --- | --- | --- | --- |
| 고정 분류 head | 마지막 토큰 hidden state를 라벨 수만큼의 선형 head에 입력. JEV-9B는 24 slot, 종류별 temperature 적용 후 활성 슬롯만 softmax. 원래 `lm_head`를 유지해 같은 가중치로 생성(System 2)도 가능 | 불가(라벨 고정, 슬롯 수 한정) | softmax | autotrust/JEV-9B(24슬롯) [70] |
| 후보 토큰 logit 읽기 | LM head는 유지. 생성 없이 허용 후보 토큰(예: 선택지 문자 A/B/C)의 다음 토큰 logit만 1회 읽어 확률화 | 가능(선택지를 기호로 표기) | 후보 logit softmax, 보정 필요 | Nimble, SemIf, Rizzo Flow [67][68], FIRST(LLM 리랭커, Kev README의 related work) [49] |
| **pointer head (Kev)** | LM head 제거. 프롬프트에 선택지마다 마커 토큰(`</opt>`)과 질문 토큰(`<decide>`)을 삽입하고 두 위치 hidden state의 내적으로 선택지별 점수 산출 → softmax | 가능(최대 255개, 설명 포함) | softmax + temperature | Kev [49], AWS Strands Decider(LM head를 pointer head로 교체) [71] |
| 임베딩 + 분류기 | 문서/라벨을 각각 임베딩해 유사도 계산 또는 별도 분류기 | 유사도 방식은 가능 | 보정 별도 | 임베딩 모델 + 로지스틱 회귀 |
| 양방향 인코더 + head | decoder 대신 ModernBERT 같은 인코더에 결정 head 부착 | 구현에 따라 | softmax | Laya, Von [67] |

### 2.7 출력 크기: 생성 길이 대신 스키마가 결정

일반 설명과 근거 있는 부분을 나눠 정리.

일반 설명 (일반론)

- 생성 LLM은 출력 토큰을 하나씩 만들므로 출력 길이가 비용/지연/메모리를 좌우. 그래서 `max_tokens` 같은 출력 길이 한도가 필요
- decision model은 forward(prefill) 1회로 선택지별 확률만 계산하고 생성 토큰은 0개(2.2/2.3). 출력 길이를 늘릴 루프가 없으므로 출력 길이 한도가 필요 없다
- 대신 응답 크기는 요청 스키마가 정한다
    - 질문 수 × 타입별 고정 필드
    - Choice는 선택지 수만큼, Score는 단계 수만큼 확률 항목이 붙는다
- 따라서 실무에서 관리할 한도는 입력 쪽(컨텍스트 토큰, 바디 크기)과 스키마 상한(선택지/단계 수)

근거 있는 부분

- Jev
    - 요청 필드는 `model`/`state`/`questions`/`assets`뿐이며 출력 길이 파라미터가 없다 [38]
    - 답 필드는 타입별 고정: noul `noul`, choice `choice`/`probabilities`/`confidence`, score `score`/`legend`/`probabilities`/`confidence` [3]
    - 상한: Choice 선택지 255, Score 단계 10 [3]. 요청당 질문 수 상한은 없다 [4][8]
    - 가격: "You pay per input token. Output tokens are free." [4]. `usage.output_tokens`는 "output tokens used to answer the questions"로만 정의되어 무엇을 세는지는 확인 못 함 [38]
- Kev
    - LM head를 로드 후 버리고 본체만 쓰므로 생성 자체가 불가 [54]
    - `usage.output_tokens`는 직렬화된 answers JSON의 토큰 수. 코드 docstring: "Not a measure of generation (there is none)." [49][54]
- OpenRouter 엔드포인트 API에는 decision model에도 `max_completion_tokens`가 표기된다(Jev 57600, Kev 7372, 각각 컨텍스트의 90%). 의미 설명은 없다(3.8/4.7) [56][108]

### 2.8 인코더 분류 head vs 디코더 pointer head: 무엇이 다른가

- 수학적으로는 둘 다 "후보 집합 위의 softmax"인 분류이고 forward도 1회. BERT 분류도 원래 생성하지 않으므로 "생성하지 않는다"는 생성 LLM 대비 차이일 뿐 decision model 고유의 특징이 아니다 (일반론)
- 실제 차이는 3가지
    1. 라벨 공간이 어디에 있는가: head 가중치 안 vs 입력 텍스트 안
    2. backbone의 attention 방향과 규모: 양방향 수억 파라미터 vs causal 수십B
    3. 확률을 출력 계약으로 내놓는가: calibration

#### 구조 비교

- 라벨 고정 여부는 backbone이 아니라 출력층 설계가 정한다. 디코더 + 고정 head(D)도 있고 인코더 + 런타임 라벨(B, C)도 있다

| 구성 | 라벨 정의 위치 | 출력층 | 라벨 런타임 변경 | 사례 |
| --- | --- | --- | --- | --- |
| A. 인코더 + `[CLS]` 고정 head | head 가중치 `W ∈ R^{d×C}` | 선형층 1개 | 불가 | BERT 분류 [137] |
| B. 인코더 cross-encoder 다중선택 | 입력 (질문, 선택지) 쌍 | 공유 `Linear(d→1)`, 선택지마다 forward | 가능 | BertForMultipleChoice [128] |
| C. 인코더 + 입력 내 라벨 토큰 | 입력(`«LABEL»` 마커) | 토큰/라벨 표현 상호작용(내적), forward 1회 | 가능 | GLiClass [129] |
| D. 디코더 + 고정 head | head 가중치 | 마지막 비패딩 토큰 → 선형층 | 불가 | LlamaForSequenceClassification [130], autotrust/JEV-9B(24슬롯) [70] |
| E. 디코더 + pointer head | 입력(`<opt>…</opt>`) | `<decide>`(query) · `</opt>`(key) 내적 | 가능(최대 255개) | Kev [49], AWS Strands Decider [71] |

출력층: 무엇을 학습하는가 (가장 큰 차이)

- 고정 head(A/D): `W`의 각 행이 "스팸", "환불요청" 같은 라벨 의미 자체를 학습. head 크기가 라벨 수 C에 묶이고 모델 하나 = 태스크 하나
- pointer head(E): `W_q`, `W_k ∈ R^{d×256}` 두 개뿐 [54]. 라벨 의미는 입력 텍스트(`</opt>` 위치 hidden state)가 가져오고 head는 "질문 표현과 선택지 표현을 비교하는 방법"만 학습. head 크기는 라벨 수와 무관
- fine-tuning 대상도 다르다
    - 고정 head: 특정 태스크
    - Kev: 공개 데이터셋 10개 혼합(`decision-v7`)으로 "질문과 선택지를 읽고 고르는" 메타 태스크 [50]. 못 본 질문으로 일반화하는 근거

attention 방향: 어느 위치를 읽는가

- 인코더(양방향): 모든 토큰이 전체를 본다. `[CLS]` 하나로 전체 요약이 되고 선택지 토큰도 뒤 선택지를 본다 [137]
- 디코더(causal): 위치 i는 i 이전만 본다. 그래서 Kev는 읽는 위치를 의도적으로 고른다(2.2)
    - `</opt>`: 문서 + 질문 + 그 선택지까지 반영한 선택지 표현
    - `<decide>`: 맨 끝이라 전부 반영한 질문 표현
    - 부작용: 앞 선택지는 뒤 선택지를 못 본다 → 선택지 순서가 답에 영향(Jev 공식 약점 8번 [5], Kev `/permute` 엔드포인트 [49])
- causal attention의 표현력 제한은 LLM2Vec도 지적하고 mask를 양방향으로 바꿔 우회 [132]

backbone 규모와 지식

- 인코더는 실질 상한이 수억 파라미터(ModernBERT-large 395M, 컨텍스트 8k) [134]. 디코더는 수십B(Kev 0.8B~27B)
- Kev 측 평가에서 MMLU-Pro는 base 크기에 비례(0.8B 0.230 → 27B 0.675) [49][50]
- 반대 근거: Ettin(2025)은 같은 데이터/레시피면 인코더가 분류에 우위(400M 인코더가 MNLI에서 1B 디코더를 이김) [133]
- 따라서 "디코더가 분류에 본질적으로 우월"이 아니라 "프런티어급 사전학습 지식과 지시문 이해가 디코더 쪽에만 있어서 디코더를 쓴다"가 정확. Archer Hume의 논리도 같다(2.5) [58]

#### encoder 기반 classification vs decoder 기반 decision

둘 다 수학적으로는 분류인데 후자가 "decision"으로 느껴지는 이유

| 구분 | encoder 기반 classification (A) | decoder 기반 decision (E) |
| --- | --- | --- |
| 함수 시그니처 | `f(text) → P(고정 C개)` | `f(state, 자연어 질문, 런타임 선택지) → P(선택지)` |
| 모델 하나가 맡는 일 | 태스크 하나 | 질문을 인자로 받는 범용 함수 |
| 새 라벨/질문 | 재학습 필요 | 요청에 적으면 끝 |
| 확률의 위상 | 내부 산출물(보통 argmax만 사용) | 출력 계약(보정된 확률로 분기) |
| 포지셔닝 | 분류기 | "typed probabilistic decisions" [1] |
1. 함수 시그니처: 질문까지 인자로 받으므로 분류기보다 판단 함수처럼 쓰인다
2. 확률이 출력 계약: 생성 LLM이 말로 표현한 confidence는 과신 경향(Xiong et al., GPT-3.5 등 평균 ECE 0.377 초과) [135]. decision model은 softmax 확률을 temperature scaling으로 보정해 반환 [92] → confidence 임계값 분기를 코드로 작성 가능(5장)
3. 포지셔닝: "unstructured state in, typed probabilistic decisions out", "System One" [1]. 마케팅 framing 비중이 크다
- 런타임 라벨 분류 자체는 선행 계보가 있다: NLI 기반 zero-shot 분류(Yin et al. 2019) [131], 인코더 1-pass 런타임 라벨 GLiClass [129]
- decision model은 이 계보를 LLM급 backbone + 지시문/state 입력 포맷 + 보정 확률 API로 제품화한 것으로 보는 것이 가장 정확(추측). 새 연산이 아니다

> **참고: "pointer head" 용어의 유래**
> 
> - Jev에서 처음 나온 용어가 아니고, Jev(TypeSafe) 쪽 용어도 아니다
> - 개념 기원은 Pointer Networks(Vinyals et al., NeurIPS 2015) [122]. attention을 문맥 벡터 혼합이 아니라 입력 안 위치를 고르는 포인터로 쓰므로 출력 사전 크기가 입력에 따라 달라진다. Kev의 "선택지가 요청마다 달라도 된다"와 같은 성질
> - 세부 차이: Vinyals는 additive attention(`vᵀ tanh(W₁e + W₂d)`), Kev는 scaled dot-product(`k·q/√256`) [54]
> - 이후 계보: Pointer Sentinel(2016, 문맥 단어 복사) [123] → Match-LSTM + Answer Pointer(2016, QA span 시작/끝. BERT QA의 start/end logits도 같은 구조) [125] → Pointer-Generator(2017, 요약 복사) [124] → Stack-Pointer(2018, 의존 구문) [126] → Span Pointer(2021, 의미 파싱 span) [127]
> - pointer + head 조합 표현은 2019년 CS224n 리포트("BERT + Answer Pointer head")에도 존재 [136]
> - Jev 생태계 안 등장 순서
>     - 2026-09-17 Archer Hume: "pointer-style scorer". 선행연구 인용 없음(FIRST만 언급) [58]
>     - 이후 Kev README/HF 모델카드, Jared Palmer X 게시물: "pointer head", "LoRA + small pointer head technique" [49][50][65]
>     - TypeSafe 공식 자료: Jev 구조 비공개. pointer 언급은 확인 못 함
> - Kev README는 Pointer Networks를 인용하지 않는다(related work는 Hydragen/DeFT/FIRST뿐) [49]
> - "pointer head" 두 단어 조합의 최초 사용자는 확인 못 함. 2026년 이전에도 산발적으로 쓰였을 가능성이 높으나(추측) 확립된 표준 용어였다는 근거는 없다. 널리 퍼진 것은 Kev 이후

---

## 3. Jev (TypeSafe)

### 3.1 개요

- TypeSafe AI가 2026-09-15 공개한 첫 "System One 모델" [1]
- 텍스트/JSON 상태와 타입 지정 질문을 입력받아 답과 확률/confidence만 반환. 텍스트 생성은 하지 않는다. 현행 버전 `jev-1.13.0` [1][2][3]
- 회사 [41]
    - CEO Diogo Almeida(전 OpenAI, RLHF/InstructGPT 참여), 공동창업자 Erik Gafni / Sasha Sheng
    - DCVC 주도 $40M 시드로 스텔스 해제
- 현재 early access(제한 접근). 대기열에서 개발자를 순차 승인 [1]

### 3.2 입출력 타입

- 엔드포인트: `POST <https://api.typesafe.ai/v1/systemone`>, Bearer 인증 [3]
- 요청 [3]
    - `model`(`jev-latest`)
    - `state`(문자열/JSON 객체/배열)
    - `questions`(이름별 질문 map): 질문마다 `type` / `instructions` / `criteria`
- 질문 타입 [2][3]

| 타입 | 용도 | 응답 |
| --- | --- | --- |
| `noul` | 예/아니오 | 0~1 확률 |
| `choice` | 선택지 중 하나(최대 255개) | 선택값 + 선택지별 확률 + confidence |
| `score` | 2~10단계 척도 | 확률가중 점수 + 단계별 확률 + confidence |
- 여러 질문을 한 요청 안에서 서로 독립적으로 평가 [2]
- 입력은 텍스트만 [4]
    - 이미지/음성/영상은 사전에 텍스트 변환 필요
    - 영어 우선. CJK 포함 타 언어는 지원하나 정확도가 낮다(8.3 참조)
- 컨텍스트: 요청당 64k 토큰, `state` + 가장 긴 질문은 32k [4]
- 레이트리밋 [4]
    - 조직별 설정(콘솔에서 확인, 2026-10-15 기준, 3.8)
    - 2026-10-14 시점 문서에는 100K tokens/s, 80 req/s(수요에 따라 변동 중)로 고정 표기

### 3.3 공개 범위

| 항목 | 공개 여부 | 내용 |
| --- | --- | --- |
| backbone(base 모델) | 비공개 | 블로그/문서(Models, API, AI primer 목차, jaggedness) 모두 미기재 [1][3][4][5] |
| 파라미터 수 | 비공개 | [1][4][69] |
| 아키텍처 | 비공개 | "new model architecture", "parallel sampler" 표현만 존재 [1] |
| 가중치/학습 데이터/학습 레시피 | 비공개 | DataCamp: "아키텍처·가중치·학습 데이터·학습 레시피가 공개되지 않았다" [67] |
| 학습 방식 | 이름만 공개 | RLCD. 5.2 참조 |
| 구조적 특성 | 공개 | 비자기회귀 / 단일 병렬 forward pass / 출력 토큰 0개 [1][2] |
| 고객별 fine-tuning | 미제공 | 도메인 적응은 `state`/`instructions`/`criteria`로 [4] |
| 고객 데이터 학습 | 미사용 | 고객 요청/응답으로 학습하지 않는다 [4] |
- 외부 정리도 동일
    - akitaonrails 벤치마크: Jev backbone을 "Undisclosed"로 표기 [69]
    - 일부 관찰자의 오픈웨이트 LLM 기반 추측은 근거 없는 추측으로 취급 [48]
- 정황 (추측 근거로만) [39]
    - TypeSafe GitHub org(`typesafe-ai`)에 **LLaDA**(양방향/비자기회귀 확산 언어모델 "Large Language Diffusion Models", ML-GSAI/LLaDA) 포크와 **vLLM** 포크 존재
    - 마지막 push는 각각 2025-06-17, 2025-05-23. Jev 공개 1년 이상 전
    - 비자기회귀/양방향 구조 실험 흔적으로 볼 여지는 있으나 Jev가 LLaDA 계열이라는 증거는 아니다(추측)

### 3.4 학습 방식

- 공식 정보는 "RLCD(Reinforcement Learning for Calibrated Decisions)"라는 이름과 목표뿐. 상세는 5.2 참조

### 3.5 성능/가격 (TypeSafe 주장)

- 지연 70~500ms. System One 작업에서 frontier LLM 대비 40~200배 빠름 [1]
- 데모 [1][47]

| 항목 | Jev | LLM 기준선 | 배수 |
| --- | --- | --- | --- |
| 지연 | 0.114초 | 8.566초 | 193.6배 빠름 |
| 비용 | $0.000081 | $0.013880 | 444.6배 저렴 |
- 데모 단서: TypeSafe 스스로 "실제 이득의 상위 범위"라는 단서를 붙였고 평가 워크플로를 자사 팀이 구성했다고 명시
- 가격: 입력 100만 토큰당 $0.042, 출력 무료 [1][4]
- "환각 0%"는 **타입 안전성(스키마 일치)**에 대한 주장이며 답의 정확성 보장이 아니다
    - TypeSafe 설명: "경험적 수치가 아니라 스키마 매칭이 보장된다는 의미" [1]
    - 문서도 개별 답의 정확성은 보장하지 않는다고 명시 [2]
- 제3자 측정 수치(Kev README, Kev 측 평가). 4.4 표 참조 [49]
    - 정확도 0.857
    - Brier 0.211
    - MMLU-Pro 0.840
    - 5% 오류예산 자동화율 70% 등
- 사용 사례 [2][88]
    - 반복적/대량 판단
        - 문의 분류/라우팅
        - 에이전트의 다음 도구 선택
        - "이 diff가 인증을 건드리는가" 같은 이진 판정
        - 품질 점수화
    - confidence 기반 분기: 자동 처리 vs 사람/LLM 에스컬레이션 [2]

### 3.6 공식 한계 (jaggedness)

공식 "Jev 1.13 jaggedness" 문서(2026-10-02 갱신) [5]

1. 의도보다 문자 그대로 해석
2. 수학/계산 취약
3. 날짜/시간 비교 부정확
4. 다단계 간접 추론 취약
5. state에 무관한 정보가 많으면 정확도 하락
6. 적대적 콘텐츠(프롬프트 인젝션 등)를 적대적으로 취급하지 않는다
7. instructions와 criteria가 모순되면 혼란
8. 선택지 순서가 답에 영향
9. 텍스트 생성 불가(코드 생성/설명 불가)
- 추가: 멀티모달 미지원 [4], 고객별 fine-tuning 미제공 [4]
- 공식 회피법은 부록의 "jev 공식 약점 9가지와 회피법" 표

### 3.7 모델 라인업

- 2026-10-14 시점 공개 라인업은 `jev-1.13.0` 하나였고 `jev-latest`/`jev-preview` 모두 같은 버전을 지칭 [4]
- 2026-10-15 기준 `jev-1.14.0`(2026-10-14 제공 시작)이 추가되어 `jev-preview` → `jev-1.14.0`, `jev-latest` → `jev-1.13.0`(3.8) [4]
- 블로그에도 변형 모델 미언급 [1]

### 3.8 입출력 예시와 한도

2026-10-15 기준 API reference [3], Models [4], OpenAPI [38].

최소 예시 (API reference 원문 [3]. 요청은 Request body 절, 응답은 Response body 절의 예시이며 같은 실행이라는 명시는 없다)

```json
{
  "state": "Help! My payouts have been failing for 3 days.",
  "model": "jev-latest",
  "questions": {
    "is_urgent": {
      "type": "noul",
      "instructions": "Does this convey urgency?"
    }
  }
}
```

```json
{
  "model": "jev-1.13.0",
  "answers": {
    "is_urgent": {
      "type": "noul",
      "noul": 0.95
    }
  },
  "usage": { "input_tokens": 296, "output_tokens": 20 }
}
```

주요 한도

- 요청당 질문 수: **별도 상한 없음**. 요청당 64k / 질문당 32k 컨텍스트에 들어가면 개수 무관 [4][8]
- 컨텍스트 초과: `400` + `max_tokens_exceeded`(422 아님) [3]
- 요청 바디 형식 [3]
    - 바디 32 MiB(초과 `413`)
    - 중첩 64단계
    - UTF-8 JSON, 유한수만
    - gzip/zstd 압축 1겹(위반 `400`/`415`)
- Choice 선택지 최대 255, Score 단계 최소 2/최대 10 [3]. 서버 강제 여부는 확인 못 함
- 질문 키 길이, `instructions`/`criteria` 개별 길이, 응답 크기 상한: 기재 없음 → 확인 못 함 [3][38]
- 출력 길이 파라미터 없음. 응답 크기는 질문 수와 선택지/단계 수로 정해진다(2.7). `usage.output_tokens`는 무과금이며 계산 방식은 확인 못 함 [4][38]
- Long context: `TypeSafe-Danger-Zone-Long-Context: true` 헤더로 요청당/질문당 모두 262k. 단가 동일, 더 느리고 덜 정확 [4]
- OpenRouter 경유: Jev 가이드는 "Context length is 32,000 tokens", 엔드포인트 API는 `context_length` 64000 / `max_prompt_tokens` 32000 / `max_completion_tokens` 57600으로 표기 [107][108]

2026-10-14 이후 변경 (2026-10-15 Models 문서)

- `jev-1.14.0` 추가(2026-10-14부터). `jev-preview` → `jev-1.14.0`, `jev-latest`는 계속 `jev-1.13.0`. 가격/컨텍스트 동일 [4]
- Rate limit은 고정 수치 대신 "set per organization", 현재 값은 콘솔에서 확인 [4]
- 이미지 입력/Box 질문이 "Dreamer-ready" 실험 기능으로 추가(헤더 `TypeSafe-Danger-Zone-Images: true`). 이미지 파일당 16 MiB, 가로/세로 256~1568px 등 별도 한도 [102]
- Python SDK v0.7.5 / JS SDK v0.7.0부터 1 KiB 이상 바디를 zstd로 기본 압축(`compression=False`로 끔) [24][103]

---

## 4. Kev (Jared Palmer, 오픈소스)

### 4.1 개요

- Jared Palmer가 만든 오픈소스 "Jev-like" 결정 모델군. TypeSafe 제품이 아니다. Apache-2.0 [49]
- Jev 공개 직후 단시간에 재현판을 공개했다는 2차 보도 존재 [64]
- 아키텍처 출처 [49][58]
    - README에 따르면 Archer Hume의 글 "Jev's Architecture Unmasked"를 구현. 이 글은 2026-09-17 Jev API를 1만 회 이상 호출해 구조를 역추론
    - 즉 **Kev가 Jev와 같은 구조라는 보장은 없다. Jev 구조에 대한 제3자 가설의 구현**
- 개발 도구: README에 "Built with Devin" 명시 [49]
- 동작 원리(LM head는 로드 후 버림 + pointer head, forward 1회)는 2장 참조

### 4.2 backbone과 이력

Kev 1.0 (현행, 2026-09-30 확정본) [49][50][51]

| 모델 | backbone (HF revision) | 구조 | 학습 형태 | 학습 파라미터 |
| --- | --- | --- | --- | --- |
| Kev-0.8B | Qwen3.5-0.8B-Base (`dc7cdfe2`) | 24층(Gated DeltaNet 18 + full attention 6), hidden 1,024 [114] | 동결 + LoRA | LoRA 11.3M |
| Kev-4B | Qwen3.5-4B-Base (`1001bb4d`) | 32층(DeltaNet 24 + attention 8), hidden 2,560 | 동결 + LoRA | LoRA 33.8M |
| Kev-9B (v2) | Qwen3.5-9B-Base (`68c46c4b`) | 32층(DeltaNet 24 + attention 8), hidden 4,096 | 동결 + LoRA | LoRA 45.4M |
| Kev-27B (v2) | Qwen3.8-27B (`1d4bf0f2`, post-trained) | 64층(DeltaNet 48 + attention 16), hidden 5,120 | **전체 가중치 FT** | 전부(bf16 51GB) |
- 0.8B~9B는 지시 튜닝 전의 `Base` 체크포인트에서 출발. 27B만 Qwen의 post-trained 공개판에서 출발했고 그 post-training 데이터는 Kev 측도 모른다고 명시 [49]
- Gated DeltaNet은 선형 attention 계열의 **순환형(recurrent) 층**. 현행 세대가 attention mask 방식을 쓰지 않는 원인(2.4) [49]
- 일부 2차 출처는 0.8B/4B/9B만 언급. 27B는 이후 추가된 것으로 보인다(추측) [68]

이력 [49][51][55]

| 시점 | 세대 | 내용 |
| --- | --- | --- |
| 2026-09-17 학습 / 09-18 HF 업로드 | Kev-0.5B (프로토타입, `v0.1`) | Qwen2.5-0.5B + LoRA + pointer head. Apple M5 노트북에서 약 1시간 45분 학습. 6개 공개 데이터셋 9,000 레코드, LLM 생성 데이터 미사용. 지금은 참고용(superseded) |
| 09-19 전후 | Qwen3 세대 | Kev-0.6B / 4B(`kev-4b@qwen3` 태그) / 8B. 같은 데이터/설정, attention mask 방식. 개발 중단, 가중치는 유지 |
| 09-20 | Qwen3.5 세대 | 0.8B / 4B / 9B 공개(2차 보도 기준 공개일) [59] |
| 09-24 | `kev-family` 릴리스 | Kev-27B v1(LoRA 어댑터판) 추가 |
| 09-30 | v2 업데이트 | Kev-27B v2(full FT), Kev-9B v2(문서/스킬 단계 추가) |
| Kev 1.0 | 버전 고정 | 새 학습 없이 네 체크포인트/모델카드/평가셋/서빙 코드를 `v1.0` 태그로 고정. 이후 세대의 비교 기준 |

2차 보도 수치와 현행 저장소의 차이

1. "Kev-9B 0.837": 9-20 초기 공개 시점의 2차 보도 수치(aiweekly가 runtimewire 인용). 현재 저장소에서는 확인되지 않는다. 현행 README는 Kev-9B **0.820(dev) / 0.852(locked test)** [49][59]
2. "Kev-27B 0.851 / Jev 0.857": 정확. 단 둘 다 **development split** 수치이고 Jev는 test split을 돌리지 않는다 [49]
3. "H100 약 $95": **초기 Qwen3.5 포팅 1회**의 비용(2차 보도) [59][52][53]
    - Kev-27B v2 학습 1회는 약 $650(8xH200 16시간)
    - 연구 전체 Modal 누적 지출은 9-29 기준 $4,500 이상
4. "약 1만 공개 데이터셋 예제": 정확히는 12,576건(`decision-v7`) [50]
    - 10개 공개 데이터셋 x 1,000개 = 10,000 + 생성 정책 896 + 규칙 구조 60종에서 1,680
    - 이는 **기본 단계**만이고 이후 추가 단계 데이터가 더 있다

### 4.3 fine-tuning

0.8B / 4B / 9B: 동결 base + LoRA [49][50]

| 항목 | 값 |
| --- | --- |
| 방식 | base 동결, LoRA rank 16 / α 32를 attention/MLP/DeltaNet projection에 부착. LoRA와 pointer head를 함께 학습 |
| 손실 | 각 질문의 선택지에 대한 cross-entropy(정답 선택지 확률 최대화). 선택적 손실 `--perm_kl`(순서 일관성), `--ord_w`(score 순서)는 릴리스 모델에서 **미사용** |
| 증강 | 선택지 순서 섞기 / "none of the above" 삽입 / 방해 선택지 추가 / choice 레코드의 1/4에 정답 유무만 다른 minimal pair |
| 1단계 | `decision-v7` 2 epoch. lr 1e-4(0.8B) / 5e-5(4B/9B), one-cycle. 배치 8(0.8B), 4 x accum 2(4B). bf16 autocast, gradient checkpointing |
| 추가 단계 | `--init_from`으로 이어서 각 1 epoch, lr 2e-5. 이전 데이터 재생(replay) 2,000~4,000건 혼합. 순서: 날짜/증거 제거 → 실제 문서 → 스킬/개발도구 |
| calibration | 마지막에 temperature 하나를 NLL 최소화로 fitting. 0.8B/4B는 학습 분포 dev, 9B/27B는 미학습 데이터셋 사용 |
| 시간(4B) | 1단계 약 56분(H100 1장), 날짜 9분, 문서 43분(H200), 스킬 1.4시간(H200) |
| 시간(0.8B) | 1단계 약 20분(H100), 문서/스킬 52분(H200) |

27B: full fine-tuning [49][52][53]

- 모든 가중치를 bf16으로 1 epoch, lr 2e-6, 8xH200에서 16.2시간(129 GPU-hours). 블로그 기준 1회 약 $650
- 데이터 145,840 레코드(질문 약 337,000개), state 최대 32,768 토큰
- 그 결과를 이전 LoRA판(v1)과 가중치 0.85:0.15로 평균(weight averaging)
    - v1 대비 미학습 데이터셋 +1.2pp
    - 장문 계약서(CUAD)에서는 정확도 −1.6pp, 과신(ECE 0.053 vs 0.007)으로 악화

학습 데이터 구성과 생성 방법 [50][53]

| 단계 | 건수 | 내용/라벨 출처 |
| --- | --- | --- |
| `decision-v7` | 12,576 | 공개 분류 데이터셋 10개 x 1,000(원래 라벨) / 생성 정책 minimal pair 896(템플릿 9종) / 무작위 규칙 구조 60종 x 4가지 렌더링 = 1,680. 생성분 라벨은 **코드로 계산** |
| 날짜/증거 제거 | 1,425 | 날짜 정책 900 + 결정 근거 문장을 지우고 균등분포를 정답으로 둔 255(+정상 대조 270) |
| 실제 문서 | 5,219 | 미국 CFPB 금융 민원(최대 약 7k 토큰). **오픈웨이트 teacher 모델 2개가 소비자 본인 분류와 일치한 건만** 유지 |
| 스킬(`hard-v1`) | 6,000 | 예외 많은 정책 / 우선순위 트레이드오프 / 기대값 / 다단계 추론 / 날짜와 산술 / 답 채점 / 모르면 기권. 프로그램으로 라벨 |
| 개발도구(`devtools-v1`) | 5,320 | CodeReviewer, CommitPackFT, FlakeFlagger, Aegis(콘텐츠 안전) 원래 라벨 |
| 27B 추가 | 합계 145,840 | 위 + 라이선스 확인된 공개 태스크 + 오픈웨이트 모델이 쓴 합성 결정 + 코드가 생성한 장문서/도구 라우팅/에이전트 로그/가드레일 레코드 |
- **Jev로 라벨링/증류하지 않는다.** README/모델카드/블로그 모두 "No Jev outputs were used"를 명시 [49][50][53]. 라벨 출처는 공개 데이터 원래 라벨 / 코드 계산 / 오픈웨이트 LLM 보조
- **"$0.03 Jev API 비용"** [59]
    - 2차 보도(aiweekly) 표기: "Modal H100 약 $95 + Jev API 호출 $0.03". 용도는 원문에서 확인 못 함
    - Kev에는 같은 문항을 Jev에 돌려 비교하는 `kev.jev`(Vercel AI Gateway 경유) 도구가 있다. 따라서 **비교 평가용 호출**일 가능성이 높다(추측)
    - 학습용이 아니라는 점은 위 공식 문구로 확인
- 데이터 공개: 평가셋과 `documents-v1`/`hard-v1` 학습 분할은 HF `jaredpalmer/kev-suites`에 해시와 함께 공개 [52]

학습 코드와 사용자 fine-tune [49]

- 학습/평가/서빙 코드 전부 공개(`kev.train`, `kev.benchmark`, `kev.serve`). Modal 스터디 스크립트와 실험 기록(`PLAN.md`, 태그 `research-archive-2026-09-24`) 포함
- 사용자 데이터 형식은 API 요청 JSONL에 질문별 `label`만 추가. `init_from jaredpalmer/kev-4b`, lr 2e-5 권장
    - base에서 새로 학습하면 기존 능력 상실: 한 사용자 사례에서 base 출발 0.33 vs `init_from` 0.83(기존 평가셋) [49]
    - 효과 사례
        - 생성 1,050건/H100 15분: Kev-4B 67.7% → 73.6%(5% 오류예산 자동화 34% → 48%)
        - 실제 CFPB 5,219건 1 epoch: 0.804 → 0.904
        - 400건은 노이즈 범위
    - 같은 1,050건 사례를 "1,050건 3시간 학습으로 Kev-4B 67.7%→73.6%"로 요약한 기록도 존재(같은 Kev README 출처 [49]). 학습 시간 표기가 "H100 15분"과 "3시간"으로 기록마다 다르다(확인 못 함)
- coding agent용 스킬 `kev-finetune`: 데이터 준비 → Modal 학습 → temperature fitting → 비교 → 배포 → 정리까지 수행. Kev-4B 1회 약 $1(H100)
    - 라벨이 없으면 "아무 LLM으로 생성"하는 경로도 존재 → **내부 데이터로 쓸 때 외부 LLM 호출 여부 확인 필요**

### 4.4 라인업/성능/지연/메모리/배포

정확도 [49][52]

| 모델 | 미학습 소스 정확도 dev / test | 학습 소스 dev / test | Brier(raw) dev / test | breadth-v1 index | MMLU-Pro | 5% 오류예산 자동화율 |
| --- | --- | --- | --- | --- | --- | --- |
| Kev-0.8B | 0.648 / 0.697 | 0.827 / 0.838 | 0.481 / 0.416 | 23.3 | 0.230 | 0.14 |
| Kev-4B | 0.817 / 0.838 | 0.873 / 0.865 | 0.269 / 0.242 | 38.0 | 0.565 | 0.52~0.69 |
| Kev-9B | 0.820 / 0.852 | 0.874 / 0.873 | 0.289 / 0.217 | 41.0 | 0.590 | 0.52~0.69 |
| Kev-27B | 0.851 / 0.889 | 0.865 / 0.866 | 0.225 / 0.156 | 52.3 | 0.675 | 0.52~0.69 |
| Jev | 0.857 / – | 0.845 / – | 0.211 / – | 54.0 | 0.840 | 0.70 |
- 용어 [49]
    - "미학습 소스" = `transfer-v4`(QNLI, SciQ, PAWS, MMLU, Emotion, TweetEval + 미학습 정책/규칙, 764건)
    - breadth-v1 = Kev가 학습하지 않은 공개 데이터셋 14개의 chance 보정 지수
- 단서 [49][52]
    - Kev 측도 "Jev 학습 데이터를 모르므로 통제된 비교가 아니다"라고 명시
    - 27B v2/9B v2는 dev 결과를 본 상태에서 재선택해 **test 마진이 낙관적**이라고 릴리스 노트가 자인
- 독립 비교 (2차)
    - Opper.ai(09-25, Kev-4B): arXiv 분류 96.9 vs 95.0 / Stack Exchange 97.5 vs 98.3 / PAWS 87.0 vs 74.5 등. PAWS 외에는 근소 [60]
    - prismix.dev 보도: 패러프레이즈 판별(PAWS)은 Jev 87.0% vs Kev 74.5%로 Jev 우위, 나머지는 2점 이내 [64]
    - OpenRouter 페이지가 인용한 JevBench v1.4.2: Kev-4B 36.1(#24) vs Jev 63.0(#1)로 격차가 크다는 보도(2차, 원 벤치마크 미확인) [57]

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

배포 방법 [49][56]

| 경로 | 내용 |
| --- | --- |
| Hugging Face | `jaredpalmer/kev-0.8b`, `kev-4b`, `kev-9b`, `kev-27b`(+ `@v1.0` 태그 고정), 데모 Space `jaredpalmer/kev`(4B/0.8B) |
| 로컬 | `uv sync --extra serve` 후 `uv run --extra serve python -m kev.serve --run jaredpalmer/kev-4b --port 8009`. CUDA/ROCm/MLX/CPU 자동 선택. **`pip install kev`는 무관한 다른 패키지**(PyPI 이름 충돌) |
| Modal | `kev_serve.py` 하나로 HTTPS 엔드포인트 배포, 유휴 시 0으로 축소 |
| OpenRouter | `jaredpalmer/kev-4b`만 등재(2026-09-25 등록). 입력 $0.042/M, 출력 무료, 컨텍스트 8,192. 제공자 Phala, SiliconFlow(fp8). 엔드포인트 이름 `kev-4b-20260924`(OpenRouter 공개 API, 2026-10-14 기준). 한 2차 사이트는 $0.01/M으로 표기해 불일치 [56][57] |
- **TypeSafe API 호환** [49]
    - `POST /v1/systemone`, 요청 `state`/`model`/`questions`(`noul`/`choice`/`score`, `instructions`, `criteria`) 형식 그대로
    - TypeSafe Python SDK의 `base_url`만 바꾸면 동작. 저장소 테스트가 TypeSafe 예제 요청과 공식 SDK로 검증
    - `kev.benchmark --remote`로 Jev 포함 임의의 System One 엔드포인트를 같은 문항으로 평가 가능
- 보안 [49][50]
    - 서버는 기본 `127.0.0.1` 바인딩, **기본 무인증**
    - `KEV_API_KEY`를 설정해야 Bearer 인증 적용
    - 외부 노출 시 인증/프록시/접근통제 필수

### 4.5 Jev 대비 차이와 한계

Jev와의 차이 (수치는 모두 Kev README의 Kev 측 자체 평가 [49])

| 항목 | Jev | Kev |
| --- | --- | --- |
| 제공 | TypeSafe 호스팅 API(유료, early access) | 오픈 가중치, 로컬/Modal 자체 호스팅 |
| backbone | 비공개 | Qwen3.5/3.8 공개 |
| 결정 방식 | 비공개 | pointer head(현행 세대는 질문별 행 + state 캐시 재사용) |
| API | `POST /v1/systemone` | 동일 형식 호환(TypeSafe Python SDK를 그대로 연결) |
| fine-tuning | 고객별 불가 | 사용자 데이터로 가능(4.3의 1,050건 사례) |
| 정확도(미학습 소스, dev) | 0.857 | Kev-27B 0.851, 4B/9B는 4점 이내 차이 |
| Brier(낮을수록 우수) | 0.211 | Kev-27B 0.225(미학습 소스) |
| 지식형 질문(MMLU-Pro) | 0.840 | Kev-27B 0.675 |
| 5% 오류 예산 자동화율 | 70% | 52~69% |
| 컨텍스트 | 64k | 0.8B~9B 검증 8,192 / 27B 65,536 |
| 지연 | 70~500ms(공식) | Kev-4B 18~89ms, Kev-27B 75~278ms(H100, Kev 측정) |

한계

| 항목 | 내용 | 출처 |
| --- | --- | --- |
| 지식형 질문 | base 크기가 좌우. MMLU-Pro 0.230~0.675 vs Jev 0.840. MMLU는 27B가 Jev와 동률(0.90) | [49][52] |
| confidence 순위 | temperature 하나로는 확신도 순서를 바꿀 수 없다 → 5% 오류예산 자동화율이 Jev보다 낮다. 대신 0.9 이상 확신 오답 비율은 Kev-9B 2.4% vs Jev 3.7%. 근거 제거 문항의 고확신 응답은 Kev-9B 0% vs Jev 9% | [49] |
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
    - Qwen3.5-0.8B/4B/9B-Base, Qwen3.8-27B: HF 카드 기준 Apache-2.0(HF API, 2026-10-14 기준)
    - 상업 이용/수정/재배포 가능. NOTICE와 라이선스 고지 유지 필요(Apache-2.0 일반 조건)
- **학습 데이터셋은 각자 라이선스**라고 README가 명시 [49][50]
    - 일부는 Zenodo 데이터(CodeReviewer, FlakeFlagger), 미국 정부 저작물(CFPB) 등이며 매니페스트에 기록
    - 가중치 사용 자체는 Apache-2.0. 다만 법무 검토 시 데이터 출처 목록을 함께 넘기는 것이 안전(법적 판단 제외)

### 4.7 입출력 예시와 한도

- 2026-10-15 기준

README API 절 [49], `kev/api.py`/`kev/model.py` [54], `kev/serve.py` [105], 모델카드 [50]를 raw 파일로 확인(main, 최신 커밋 2026-10-14).

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
- Modal 배포는 같은 API에 `Authorization: Bearer <key>`만 추가. Modal용 별도 예시는 README에 없다 [49]

TypeSafe 형식과 다른 점

| 항목 | Kev | Jev |
| --- | --- | --- |
| 응답 `model` | 요청한 이름 그대로(`kev-latest` 등) [105] | 실제 버전 ID [4] |
| 응답 추가 필드 | `latency_ms` 항상. `KEV_TRUNCATE_STATES=1`이면 `truncated`, `usage.state_tokens`/`state_tokens_used` [49][105] | 없음 |
| `usage.output_tokens` | 직렬화된 answers의 토큰 수(`json.dumps(answers)`를 토크나이저로 계산) [54] | 계산 방식 확인 못 함 [38] |
| Score 단계 | **1~255** [49][54] | 2~10 [3] |
| Choice 선택지 | 1~255 [54] | 최대 255 [3] |
| Noul `instructions` | 선택 [54] | 필수 [3] |
| state 길이 초과 | `422` [49][105] | `400` + `max_tokens_exceeded` [3] |
| 바디 압축 | `serve.py`에 해제 처리 없음 [105] | gzip/zstd [3] |
| 확률 표기 | 소수 4자리 반올림 [54] | 확인 못 함 |
- `usage.output_tokens`는 계산 방식이 달라 Jev와 값 비교가 의미 없다
- 압축 호환 [24][106]
    - TypeSafe SDK 최신판(Python v0.7.5 / JS v0.7.0)은 1 KiB 이상 바디를 zstd로 기본 압축
    - Kev `uv.lock`은 `typesafe-sdk` 0.6.0 고정
    - 최신 SDK로 Kev를 호출하면 실패할 수 있다(추측, 실행 미검증). `compression=False` 권장 [103]

내부 직렬화

- README 템플릿: `<state> …state… <q> instructions <opt> option 1 </opt> <opt> option 2 </opt> … <decide>` [49]
- 실제 마커 토큰(`kev/model.py` `SPECIAL`): `<state>`=`<|fim_prefix|>`, `<q>`=`<|fim_middle|>`, `<opt>`=`<|box_start|>`, `</opt>`=`<|box_end|>`, `<decide>`=`<|fim_suffix|>` [54]
- 변환 [54]
    - 객체/배열: `key: value`/`항목` 라벨 텍스트
    - Choice 선택지: `이름: 설명`(설명 없으면 `이름`)
    - Noul: `no`/`yes` 2개
    - Score: 단계 설명 그대로
    - 사용자 텍스트의 `<|name|>`은 `<¦name¦>`로 바꿔 마커 위조 차단
- README 예시 escalate 질문 행 (구성 예, 공식 아님. 실제로는 공백/줄바꿈 없이 연결): `<state>Shoes arrived two weeks late and in the wrong size. Also I see two charges on my card.<q>Does this need urgent human attention?<opt>no</opt><opt>yes</opt><decide>`
- README/모델카드에 실제 직렬화 문자열 예는 없다

한도

| 항목 | 값 | 초과 시 |
| --- | --- | --- |
| state | 65,536 토큰(`<state>` 포함) [54] | `422`. `KEV_TRUNCATE_STATES=1`이면 앞부분만 읽고 `truncated: true` [105] |
| 질문 행(state + 질문) | 73,728 토큰(65,536 + 8,192) [54] | `422`(잘라내기 없음) |
| 요청당 질문 수 | 상한 없음. 패스당 16,384 토큰 예산(행마다 state 길이 포함)으로 행을 나눠 실행 [49][54] | 해당 없음 |
| Choice 선택지 / Score 단계 | 각 1~255 [54] | `422` |
| `/v1/systemone/permute` `n_perm` | 1~64, 기본 6 [105] | `422` |
| 질문 키 길이, 바디 크기 | 확인 못 함 | 확인 못 함 |
- 코드 주석: "a state of up to 64k tokens (twice Jev's 32k; the Qwen3.5 / Qwen3.8 bases' window is 262k)" [54]
- 서버 허용치와 별개로 검증된 길이는 0.8B~9B 8,192 / 27B 65,536(4.4) [49]
- 422 본문
    - `HTTPException(422, 메시지)`라 FastAPI 기본 형식 `{"detail": "..."}`(일반론)
    - state 초과 메시지 원문 형식: `state exceeds {max_state} tokens: {n}` 뒤에 `; or start the server with KEV_TRUNCATE_STATES=1 to read only its first {65,536} tokens (responses then say truncated: true)` [54][105]
    - README에 실제 422 응답 예는 없다

`/v1/systemone/permute` (코드 기준 [105])

- 요청
    - `request`(System One 요청 전체)
    - `question`(Choice 질문 id)
    - `n_perm`(1~64, 기본 6)
    - `seed`(기본 0)
- 응답: `runs[]`(회별 `order`/`probabilities`/`choice`/`latency_ms`), `argmax_stable`, `spread`(선택지별 확률 최대 − 최소)
- 첫 회는 원래 순서, 이후 seed 기반 셔플. Choice가 아니면 `422`. 실제 요청/응답 JSON 예는 README에 없다

OpenRouter `jaredpalmer/kev-4b` 표기 [56]

- `context_length` 8192, `max_completion_tokens` 7372, `max_prompt_tokens` null, `supported_parameters` 빈 목록
- 7372는 8192의 90%. Jev 엔드포인트도 64000 대비 57600(90%) [108]. 컨텍스트 비율로 일괄 기재한 값으로 보이며 decision model 출력 한도로서의 의미는 설명이 없다(추측)

---

## 5. calibration

### 5.1 calibration 개념 (일반론, Jev 공식 방식과 무관)

<center><img width="1200" src="https://github.com/user-attachments/assets/c52b74ed-14e8-4fb2-beeb-f189c688867d"></center>

- **Calibration**: 확률 p로 예측한 사례들 중 실제 정답 비율이 p에 가까운 성질. 개별 정답 보장이 아니라 집단 통계(TypeSafe 문서에도 같은 단서 포함 [2])
- **Reliability diagram**: 예측 확률을 구간(bin)으로 나눠 구간별 평균 confidence(x)와 실제 정확도(y)를 그린 그림. 대각선에 가까울수록 잘 맞고 대각선 아래면 과신(overconfident)
- **ECE (Expected Calibration Error)**: 구간별 |정확도 − 평균 confidence|를 표본 비율로 가중 평균
    - 직관적이지만 bin 수에 민감하고 top-1만 본다
    - Guo et al. 2017 [92]: 현대 신경망은 과신하며 temperature scaling(파라미터 1개)으로 상당 부분 교정된다는 연구
- **Proper scoring rule**: 참 분포를 그대로 보고할 때 기대 점수가 최적이 되는 채점 규칙. 보상/손실로 쓰면 "정직한 확률"을 유도
    - **Brier score**: Σ(p_k − y_k)². 유계(bounded), 극단 오답에도 손실 상한 존재
    - **Log loss (log score)**: −log p(정답). 무계(unbounded), 확신에 찬 오답에 큰 페널티. cross-entropy 학습이 곧 log loss 최소화
    - 순서형(score 타입 같은 척도)에는 RPS(ranked probability score)를 자주 사용. autotrust/JEV-9B가 score 질문에 RPS 사용 [70]
- 정확도와 calibration은 별개
    - 정확도가 높아도 과신 가능
    - 판별력(AUROC)이 낮으면 calibration만 맞춰도 임계값 분기의 효용이 작다

### 5.2 Jev: RLCD (Reinforcement Learning for Calibrated Decisions)

#### 공식 공개 범위

**TypeSafe가 공개한 RLCD 정보는 "이름 + 목표 + 몇 가지 정성적 설명"뿐.**

- 비공개: 보상 함수, scoring rule(Brier/log loss 등), 학습 단계(SFT 후 RL 여부), 데이터 규모/구성, base 모델
- 공개된 논문/기술 보고서/arXiv 프리프린트는 없다(확인 범위 내) [1][2][6][43][46]

| 항목 | 공식 공개 여부 | 내용 |
| --- | --- | --- |
| 이름 | 공개 | Reinforcement Learning for Calibrated Decisions (RLCD) [1] |
| 목표 | 공개 | "Calibrated decisions: answers with epistemically honest probabilities on System One tasks" [1]. "higher confidence means higher accuracy" [1] |
| RLHF/RLVR과의 관계 | 공개(대비만) | LLM은 RLHF/RLVR로 "human preference"를 최적화, Jev는 RLCD로 calibrated decision을 최적화한다는 대비표 [1] |
| 확률 최적화 대상 | 부분 공개 | "probabilities are optimized against outcomes to reflect uncertainty" [2]: 결과(정답)에 대해 확률을 최적화한다는 것까지만 공개 |
| 데이터 | 부분 공개(구두) | 팟캐스트에서 진행자의 "all your data is synthetic" 질문에 Almeida가 "Yep"이라고 답변 [43]. 규모/생성 방식은 비공개 |
| 보상 함수 / scoring rule | **비공개** | Brier score, log loss, proper scoring rule 등 용어 자체가 공식 자료에 부재 [1][2][6] |
| 학습 단계(pretrain/SFT/RL) | **비공개** | 확인 못 함 [43] |
| LoRA vs full FT / 학습 규모 / 손실 함수 | **비공개** | 확인 못 함 [1][4] |
| base 모델/아키텍처 | **비공개** | "new model architecture", "parallel sampler"라는 표현만 존재 [1] |
| 논문/기술 보고서 | **없음** | Latent Space 소개문도 "novel, unpublished technique"라고 표현 [43]. arXiv 검색에서도 미발견 |
| calibration 수치(ECE 등) | 공식 미공개 | Brier 0.211(Jev)은 Kev README의 제3자 측정치 [49] |

TypeSafe 블로그 (2026-09-15) [1]

- "a training method we call Reinforcement Learning for Calibrated Decisions (RLCD)"
- 대비표: LLM = RLHF / RLVR → "Human preference: writeups and chat responses that human raters prefer". Jev = RLCD → "Calibrated decisions: answers with epistemically honest probabilities on System One tasks"
- 출력 특성: "Always communicates confidence and uncertainty with every output. Calibrated: higher confidence means higher accuracy"
- 구조는 "new model architecture", "parallel sampler", 모든 출력을 한 번에 생성한다는 수준만 언급. Brier/log loss 등 지표명은 블로그에 부재

TypeSafe Docs [2][6]

- System One 개념 문서 [2]
    - "System One models are trained for calibrated decisions: their probabilities are optimized against outcomes to reflect uncertainty."
    - "Calibration is measured across groups of predictions; it does not guarantee that an individual answer is correct."
    - confidence로 "when to act and when to escalate to a person or a reasoning model"을 정하라고 안내
- Machine learning primer [6]
    - calibration 설명: "Outcomes assigned a probability of 0.2 should occur about 20% of the time"
    - RLHF의 한계로 "mode dropping"(선호 스타일로 확률이 몰려 다른 가능한 출력의 확률이 낮아지는 현상) 지적
    - "An output can be compelling to a person without being reliable enough for unattended automation"
- 두 문서 모두 scoring rule/보상/학습 단계 설명 부재

창업자 발언 (팟캐스트)

- Latent Space(2026-09-21, Diogo Almeida 출연) [43]
    - 소개문: Jev의 핵심 혁신은 RLCD이며 "a novel, unpublished technique"
    - 데이터: 진행자 "all your data is synthetic" → Almeida "Yep". 이어서 흔히 생각하는 방식의 synthetic data와는 다르다는 취지로 발언(세부는 확인 못 함)
    - "calibration is, like, total poison into, like, the probability distributions of strings": mode collapse 논의 중 나온 발언. 전사본 일부만 확인해 정확한 문맥(무엇이 무엇에 독인지)의 해석은 확인 못 함
    - 보상 설계/학습 단계/base 모델에 대한 구체 발언은 확인 못 함
- TWIML AI Podcast #779(2026-10-06) [44]: 에피소드 소개에 RLCD와 "calibration and reliability are central to making AI useful as a software primitive" 언급. 전사본은 확인 못 함
- Almeida의 X 게시물, 학회 발표(ai.engineer 연사 페이지 존재 [45])에서 RLCD 기술 상세: 확인 못 함

2차 자료의 서술 수준

- Turing Post(2026-09-19): "TypeSafe has described the goal and its synthetic-data approach, but has not published enough technical detail to separate RLCD's contribution from the model architecture, data, or serving stack." [42]
- 여러 해설 사이트가 "확률이 실제 결과와 맞는지에 보상을 준다"고 풀어 쓴다. 공식 문구("optimized against outcomes")의 재서술이며 구체 보상식의 출처는 부재 [46]
- "RLCD = Brier 보상" 같은 단정은 **근거 없음**으로 취급

추론 (근거 없는 추측)

- "outcomes에 대해 확률을 최적화"하고 이름이 RL이라면 보상은 정답 여부와 출력 확률로 계산하는 proper scoring rule(log score 또는 Brier) 계열일 가능성이 높다(추측)
- 미해명 지점: 비자기회귀/단일 forward pass 모델에서 굳이 "RL"이라 부르는 이유. 정답 라벨이 있으면 cross-entropy 지도학습만으로도 log loss를 직접 최소화 가능
- 가능성: 라벨이 확정적이지 않은 synthetic 환경의 결과 신호를 쓰거나 정책 샘플링이 필요한 구조일 수 있다(추측)

#### 이름 혼동 주의

학계에는 이미 **"RLCD: Reinforcement Learning from *Contrastive Distillation*"**(Yang et al., ICLR 2024)이 존재 [89]. TypeSafe의 RLCD와 **이름만 같고 무관**.

| 표기 | 정체 | 주제 |
| --- | --- | --- |
| **RLCD(TypeSafe)** | Reinforcement Learning for Calibrated Decisions, Jev 학습 방식, 비공개 | 확률 calibration |
| **RLCD(Yang 2023)** | Reinforcement Learning from Contrastive Distillation, arXiv 2307.12950 | 인간 라벨 없이 선호쌍을 만드는 정렬(alignment) 기법 |
- "RLCD"만으로 검색하면 Yang 2023 논문이 섞여 나온다
- "RLCR"(Damani et al. 2025, calibration reward)과도 철자가 비슷해 혼동 주의(아래 관련 연구 참조)

#### 관련 연구 (실재 확인한 것만)

RLHF/RL 후처리가 calibration을 망가뜨린다는 근거

| 연구 | 내용 |
| --- | --- |
| GPT-4 Technical Report (OpenAI, 2023, arXiv 2303.08774) [93] | MMLU에서 사전학습 모델은 calibration이 매우 우수(ECE 0.007), PPO 후처리 후 ECE 0.074로 악화. 보고서의 calibration 그래프(reliability diagram)로 제시 |
| Kadavath et al. 2022, "Language Models (Mostly) Know What They Know" (arXiv 2207.05221) [94] | 큰 사전학습 LM은 객관식에서 대체로 잘 calibrated. RLHF 정책은 그대로 두면 calibration이 나빠지나 temperature 조정으로 상당 부분 회복 |
| Tian et al. 2023, "Just Ask for Calibration" (EMNLP 2023, arXiv 2305.14975) [95] | RLHF 모델(ChatGPT/GPT-4/Claude)에서 토큰 조건부 확률보다 **말로 표현한 confidence**가 더 잘 calibrated, ECE 약 50% 감소 |
| Leng et al. 2024, "Taming Overconfidence in LLMs: Reward Calibration in RLHF" (arXiv 2410.09724) [96] | RLHF 모델이 과신하는 원인으로 보상모델의 고신뢰 편향 지목. PPO-M/PPO-C로 calibration 오류 감소 |
| Yaldiz et al. 2026 (Amazon), "Balancing Classification and Calibration Performance in Decision-Making LLMs via Calibration Aware RL" (arXiv 2601.13284) [97] | **결정 과제**에서 RLVR이 정확도는 올리지만 극단적 과신 모델을 만든다고 진단. decision 토큰 확률을 직접 조정하는 calibration-aware RL로 정확도 유지 + ECE 최대 9pt 감소. Jev류 "결정 모델"과 문제 설정이 가장 가까운 공개 연구 |
- TypeSafe의 문제의식(RLHF는 human preference를 최적화하므로 확률 분포가 망가진다)과 위 연구 흐름은 방향이 같다. 단 TypeSafe가 이 연구들을 근거로 들었다는 기록은 확인 못 함

proper scoring rule을 RL 보상으로 쓰는 연구

| 연구 | 보상 | 요지 |
| --- | --- | --- |
| **RLCR**: Damani et al., "Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty" (arXiv 2507.16806, 2025-07) [90] | 정답 여부(binary) + **Brier score**(말로 낸 confidence에 대해) | 추론 후 답과 수치 confidence를 함께 출력하도록 학습. 정확도 손실 없이 calibration 개선, 도메인 외에서도 일반 RL/사후 분류기보다 우수. 유계 proper scoring rule 기반 보상이 정확하고 calibrated한 모델을 만든다는 것을 증명 |
| **Rewarding Doubt**: Bani-Harouni et al. (arXiv 2503.02623, 2025-03) [91] | **log scoring rule** 기반 보상 | 사실 질문에 대한 confidence 표현을 RL로 calibration. 과신/과소신 모두에 페널티, 미학습 과제로 일반화 |
| Yaldiz et al. 2026 [97] | calibration-aware RL 목표(위 표 참조) | 생성된 decision 토큰 확률 자체를 교정 |
- 위 연구들은 대부분 **생성형 LLM이 confidence를 말로 출력(verbalized)**하는 설정
- Jev는 softmax 등에서 확률을 직접 내는 비생성 모델로 알려져 있어 설정이 다르다 [1]. RLCD(TypeSafe)가 이들 중 어느 것과 비슷한지는 확인 못 함
- verbalized confidence 계열의 초기 연구로 Lin et al. 2022 "Teaching Models to Express Their Uncertainty in Words"(arXiv 2205.14334) 존재 [98]

### 5.3 모델별 calibration 처리 비교

<center><img width="1200" src="https://github.com/user-attachments/assets/a49928af-7ce9-40fd-8c2f-215a69bbeee9"></center>

| 모델 | 학습 손실 | calibration 처리 | 출처 |
| --- | --- | --- | --- |
| Jev | 비공개 | RLCD로 학습했다고 주장(상세 비공개) | [1][2] |
| Kev (Jared Palmer) | 정답에 대한 cross-entropy(지도학습, RL 미사용) | 체크포인트별 temperature 하나를 저장해 pointer head에 적용(0.8B 2.35 / 4B 2.41 / 9B 2.19 / 27B 1.32). NLL 최소화로 fitting. 0.8B/4B는 in-distribution dev셋, 9B/27B는 held-out 데이터셋으로 fitting. 평가는 Brier score("whole probability distribution"을 채점) | [49] |
| autotrust/JEV-9B (AutoTrust, TypeSafe와 무관 명시) | Jev 출력 모사 distillation(741k행 코퍼스): KL loss + score 질문은 RPS. LoRA 40.1M + head 98k 파라미터, B200 1장 약 3시간 | 타입별 temperature 적용 후 활성 슬롯 softmax | [70] |
| OpenAI Decisions | 비공개 | **미언급.** Decisions 가이드에 "calibrat" 단어 자체가 없다. 임계값 설정은 사용자 측정에 위임 | [75] |
- 공개 복제 모델 중 RL로 calibration을 학습했다고 밝힌 사례는 확인 못 함. 확인된 방식은 2가지
    - "cross-entropy(=log loss) 지도학습 + 사후 temperature scaling"
    - "Jev 확률 분포를 직접 증류"
- 함의 (추측)
    - Jev의 확률을 증류하면 Jev의 calibration 특성까지 일부 복제된다
    - Kev는 RL 없이 Brier 0.225(Jev 0.211, Kev 자체 측정)를 보고. 결정 과제의 calibration 상당 부분은 지도학습 + temperature scaling으로도 얻을 수 있고 RLCD의 추가 기여 크기는 공개 자료로 판단 불가 [49]
- 참고: Jev의 MCA는 Output으로 모델 증류/출력 모방 모델 학습을 금지 [36]. JEV-9B 같은 증류 방식은 이 조항과 충돌 소지(8.2)

#### 실무 의미: calibrated 확률이 왜 중요한가

확률이 calibrated일 때만 "확률 = 기대 정확도"로 읽을 수 있다. 그래야 아래 설계가 수치적으로 성립.

| 용도 | 방식 | calibration이 깨지면 |
| --- | --- | --- |
| 임계값 기반 라우팅 | confidence가 임계값 τ 이상이면 자동 처리, 아니면 다른 경로(공식 기본은 높음/중간/낮음 3구간, 7.3). 오류 예산(예: 5%)에 맞춰 τ 결정. Choice의 confidence는 p_max 자체가 아니라 `(p_max - 1/n) / (1 - 1/n)` | 과신 모델은 τ를 높여도 실제 오류율이 예산을 초과 |
| 사람 검토로 넘기기(HITL) | 낮은 confidence 구간만 사람에게. 검토량 = 해당 구간 비율 | 검토 대상이 잘못 선정되어 사람 비용 대비 오류 감소 효과가 작다 |
| abstain(답변 보류) | 확신이 낮으면 "판단 불가"/LLM 재질의로 escalation | 보류해야 할 오답을 높은 확신으로 통과 |
| 비용 기반 결정 | 기대 비용 = p·이익 − (1−p)·손실로 행동 선택 | 기대값 계산 자체가 틀어짐 |
| 다단계 파이프라인 결합 | 단계별 확률을 곱하거나 조합 | 오차 누적/증폭 |

실무 체크리스트 (제안)

1. **벤더 calibration 주장을 그대로 믿지 말 것**
    - TypeSafe도 calibration은 집단 통계이며 개별 정답을 보장하지 않는다고 명시 [2]
    - 자체 도메인(한국어/일본어, 자체 라벨셋)에서 재측정 필요. 특히 Jev는 영어 외 언어 정확도가 낮다고 공식 문서에 명시(3.2)
2. 측정 지표: reliability diagram + ECE + Brier(또는 log loss) + AUROC를 함께 측정. ECE만 보면 판별력 부족을 놓친다
3. 분포가 바뀌면 calibration도 바뀐다. 운영 데이터로 주기적 재측정, 필요하면 자체 temperature/isotonic 사후 보정 레이어를 둔다
4. 임계값은 "confidence τ별 자동 처리율 vs 오류율" 곡선에서 오류 예산으로 결정. OpenAI Decisions 문서도 같은 방식(자체 라벨 데이터로 임계값 설정, FP/FN 비용 고려)을 권장(6.2)
5. 생성형 LLM의 토큰 logprob이나 말로 낸 confidence는 RLHF로 calibration이 망가졌을 수 있으므로 반드시 보정 후 사용 [93][95]

---

## 6. Jev vs Kev vs OpenAI Decisions

### 6.1 항목별 비교

| 항목 | Jev 1.13 | Kev 1.0 | OpenAI Decisions | Claude Haiku 5.5 (참고) |
| --- | --- | --- | --- | --- |
| 종류 | 결정 전용 | 결정 전용(오픈 가중치) | 결정 전용 엔드포인트 | 일반 생성형 |
| 공개 | 2026-09-15, early access | 2026-09-20 Qwen3.5 세대(2차), 09-30 Kev 1.0 | 09-29 발표, 10-06 public beta | 10-07 GA |
| 입력 | 텍스트 | 텍스트 | 텍스트+이미지 | 텍스트+이미지 |
| 출력 | noul/choice/score + 확률 | noul/choice/score + 확률(System One 호환) | predicate/choice/score + 확률 | 텍스트(structured outputs 가능), 확률 미제공 |
| 가격(입력/출력, per M) | $0.042 / 무료 | 자체 호스팅(OpenRouter `kev-4b` $0.042 / 무료) | $0.10 / 무료 | $0.10~0.50 / $0.50~2.50 |
| 지연 | 70~500ms(공식) | Kev-4B 18~89ms, Kev-27B 75~278ms(H100, 모델 시간) | 중앙값 179ms(독립 측정 1건) | Jev보다 약 10배 느림(독립 측정 1건) |
| 기반 모델/구조 | 비공개 | Qwen3.5/3.8 + pointer head | `gpt-6-luna`(2026-09-22 출시) 기반, 결정 모드 구현 방식/파라미터 수 비공개 | 일반 생성형 |
| calibration 공식 주장 | 있다(RLCD로 학습했다고 주장, 상세 비공개) | temperature scaling(체크포인트별 1개) | 없다(문서에 미언급, 임계값은 사용자 측정 권고) | 없다(확률 미제공) |
| 컨텍스트 | 64k | 0.8B~9B 검증 8,192 / 27B 65,536 | Decisions 한도는 확인 못 함(Luna 모델 자체는 1.05M) | 확인 안 함 |
| 요청당 질문 수 상한 | 없음(64k/32k 컨텍스트 안이면 무관) [4] | 없음(패스당 16,384 토큰 예산으로 행을 나눠 실행) [49] | 확인 못 함 | 해당 없음 |
| 출력 크기 결정 방식 | 스키마(질문 수 × 타입별 필드, choice ≤255, score 2~10). 출력 길이 파라미터 없음 [3][38] | 스키마(choice/score 각 1~255). `output_tokens` = answers JSON 토큰 수 [54] | 확인 못 함 | 생성 토큰 수(출력 길이 한도로 제어, 일반론) |
| 데이터 거버넌스 | 학습 미사용, ZDR은 엔터프라이즈만, 미국 호스팅 | 자체 호스팅이면 외부 전송 불필요 | ZDR/HIPAA, US/EEA 리전 | Anthropic 표준 정책 |
| 출처 | [1][4] | [49][59] | [74][75][77][85] | [83][85] |
- Jev 데이터 거버넌스: TypeSafe 블로그/Models 문서에는 데이터 리전/ZDR 미기재. 법무 문서(Legal/DPA/Privacy Policy/MCA)에서 확인한 내용이 위 표 [33][34][35][36]

### 6.2 OpenAI Decisions API 상세

- 엔드포인트 `POST /v1/decisions`, 모델은 `gpt-6-luna`만 지원 [75]
- DevDay 2026-09-29 발표(제한 프리뷰) → 2026-10-06 public beta [74][75]
- 입력: 텍스트 / 이미지(inline base64만, URL/file ID 불가) / 혼합 [75]. **Jev와 달리 이미지 지원**
- 질문 타입 [75]: Jev의 noul/choice/score와 1:1 대응
    - Predicate: 0~1 확률
    - Choice: 선택값 + confidence + 선택지별 확률
    - Score: 확률가중 점수 + 단계별 확률
- 속도
    - Responses API로 `gpt-6-luna`를 호출할 때보다 최대 10배 빠르다(OpenAI 주장) [74][75]
    - 독립 측정 보고: 요청당 중앙값 179ms [85]
- 가격: 입력 100만 토큰당 $0.10, 출력과 캐시 읽기/쓰기 무료. 리전 처리/롱컨텍스트 할증 존재 [74][75]
- ZDR/HIPAA 적용 가능, 데이터 리전 US / EEA+스위스 [75]
- `gpt-6-luna`는 불변 스냅샷이 아니라 가중치가 교체될 수 있는 별칭이라는 지적 [69]
- 커뮤니티 보고 이슈 [74]
    - 입력 캐싱 미지원
    - Choice 확률 분포 편향
    - 선택지 순서에 따른 확률 변동

모델 측면 공개 정보

- **OpenAI 공개 범위: "GPT-6 Luna로 구동된다"는 사실과 API 동작(입출력/가격/속도 주장)뿐**
- **Decisions API가 Luna를 결정 모드로 바꾸는 방식(별도 head, 비자기회귀 여부, 별도 학습, calibration)은 공식적으로 전부 비공개**

| 항목 | 공식 공개 여부 | 내용 |
| --- | --- | --- |
| 기반 모델 | 공개 | "Powered by GPT-6 Luna" [74][76]. DevDay recap 문구: "focusing Luna's intelligence on a specific set of user-defined questions with finite pre-defined answers" 76 |
| GPT-6 Luna 기본 정보 | 공개 | 2026-09-22 GPT-6 Sol과 함께 출시(ChatGPT Work/Codex/API) [78][79]. "Our most efficient model for focused, high-volume tasks". 컨텍스트 1,050,000(입력 최대 922,000) / 출력 최대 128,000 토큰. 입력 텍스트/이미지, 출력 텍스트. knowledge cutoff 2026-05-18. `reasoning_effort` none~max 지원. 일반 API 가격 입력 $0.10/출력 $0.50(100만 토큰당) [77] |
| 아키텍처/파라미터 수 | **비공개** | 모델 페이지/system card 어디에도 미기재 [77][78] |
| 결정 모드 구현(생성형 그대로? 별도 head? 비자기회귀?) | **비공개** | Decisions 가이드에 내부 메커니즘 설명 미기재 [75]. 커뮤니티 공지 스레드에서도 OpenAI 직원은 내부 구조를 언급하지 않는다 [74]. "Responses API로 Luna를 쓸 때보다 최대 10배 빠름"이라는 결과만 공개 [74] |
| 별도 학습 여부 | **비공개** | "specialized version of GPT-6 Luna"라는 표현은 2차 보도 출처이며 OpenAI 공식 문구에는 없다 [76] |
| calibration | **비공개(미언급)** | Decisions 가이드에 "calibrat" 단어 자체가 없다 [75]. TypeSafe(RLCD)와 달리 calibration 학습을 내세우지 않는다. 임계값 설정은 사용자 측정에 위임: "Use labeled examples from your application to set thresholds ... based on the cost of false positives and false negatives" [75] |
| 확률 출력 | 공개 | predicate는 `probability`(0~1), choice는 `choice`+`probabilities`+`confidence`, score는 확률가중 `score`+단계별 확률 [75]. 단 `confidence`의 정의(최대 확률인지, 별도 산출인지)는 문서에 없다. 예시 응답은 소수 둘째 자리 값 [75] |
| 지원 엔드포인트 표기 | 공개 | `gpt-6-luna` 모델 페이지는 Chat Completions/Responses/Batch만 나열하고 Decisions는 미포함(2026-10-14 기준) [77]. Decisions 가이드는 지원 모델을 `gpt-6-luna`만으로 명시 [75] |
| model card / system card | 부분 | Luna 전용 system card는 없다. GPT-6 Astra system card(2026-09-03 공개)에 2026-09-22 "Appendix: GPT-6 Sol, GPT-6 Luna" 추가. 안전성/정렬 평가 중심이며 아키텍처/학습/calibration/Decisions API 언급은 확인 못 함 [78] |
| 데이터 거버넌스 | 공개 | ZDR/HIPAA, US / EEA+스위스 리전 [75] |

2차 분석/추측 (비공식)

- "distilled Luna neural heads가 자기회귀 생성을 우회" 주장 [80]
    - P50 19ms 등 구체 수치를 담은 글이 DevDay 당일 게시
    - 그러나 OpenAI 출처 인용이 없고 독립 측정 중앙값 179ms [85]와도 크게 어긋난다. 신뢰하지 말 것(추측/2차)
- 결정 모델 일반의 구현 후보를 정리한 해설 존재: 허용 선택지 logit만 정규화하는 restricted softmax / 선택지별 마커 / pointer readout. OpenAI가 이 중 무엇을 쓰는지는 근거 없음(추측/2차) [81]
- Luna 자체의 calibration [82]
    - Responses API의 `logprobs`로 측정한 독립 실험: ProofWriter 3,600문항 중 "99% 이상 확신" 구간 정확도 68%, 5단계 추론에서 AUROC 0.51
    - **Decisions API가 아닌 일반 Luna 생성 경로의 측정**이므로 Decisions 확률에 그대로 적용 불가(2차)
    - 커뮤니티에서도 Choice 확률 편향/선택지 순서 민감성 보고 존재 [74]
- "결정 엔드포인트가 Luna와 같은 가중치에 별도 readout을 붙인 형태"라는 추정은 10배 속도와 출력 무료 과금 구조에 부합. 다만 확인된 사실은 아니다(추측)
- 날짜 메모: 일부 2차 페이지는 `gpt-6-luna`를 deprecated로 표기하나 공식 모델 페이지에는 그런 표시가 없다(2026-10-14) [77]

### 6.3 Anthropic: 결정 전용 모델 부재, Haiku 5.5

- **전용 모델/엔드포인트 없음**(2026-10-14 기준) [85][87]
    - 예측시장(Manifold)도 "Anthropic 네이티브 대응 제품 출시 시점"을 미결로 추적 중 [86]
- Vercel AI SDK의 Decisions 기능은 Anthropic을 "native provider"가 아닌 structured output으로 동작을 근사하는 **adapter**로 분류 [87]
    - 한계 [87]
        - Choice/Score에 확률 분포 미제공
        - Boolean의 P(true)는 프롬프트로 추정한 값
        - 모든 질문을 한 프롬프트에서 평가(질문 간 독립성 부재)
- Claude Haiku 5.5(2026-10-07): 요약/분류/DB 쿼리/고객지원 등 대량/저지연 작업용 소형 **일반 생성형** 모델 [83][84][85]
    - 가격: 입력 $0.10~0.50 / 출력 $0.50~2.50(100만 토큰당, 프롬프트 길이에 따라) [83]
    - 분류는 structured outputs 또는 enum 필드 tool로 구현하라고 안내 [84]
    - 출시일 불일치: 한 블로그는 "9월 말"로 기술 [85] → Anthropic 공식(10-07) 우선
    - 독립 벤치마크
        - 네덜란드어 450건: Haiku 5.5(thinking on) 오류 약 15/600, OpenAI Decisions 약 26/600. 대신 비용/지연은 Haiku가 더 크다 [85]
        - 5개 공개 분류셋 중 4개에서 결정 API와 구분 불가, BoolQ는 Jev 91.0% vs Haiku 87.2%라는 보도(2차, 원문 미확인) [88]
- "Anthropic의 Jev 킬러" 같은 표현은 Medium 필자의 프레이밍이며 Anthropic 공식 표현이 아니다(본문 미확인, 제목/요약 기준) [88]

기존 기능으로 Jev 비슷하게 하기 (유사 개념)

| 방법 | Jev 대비 |
| --- | --- |
| Structured outputs / enum tool (Claude, OpenAI 공통) | 타입 보장은 되지만 생성 디코딩이라 느리고 출력 과금, 확률 미제공 |
| logprobs 기반 분류(OpenAI 등 logprobs 제공 모델) | 후보 토큰 확률을 읽는 방식으로 개념상 가장 근접. calibration은 별도 보정 필요. Anthropic API는 logprobs 미제공(일반 지식, 확인 못 함) |
| 전용 경량 분류기/리랭커 | 빠르고 싸지만 라벨셋마다 학습 필요. Jev는 질문을 런타임에 정의 |

### 6.4 그 외 유사 모델

Jev 이후 2~3주 내 공개된 Jev류

| 모델 | 회사 | 공개일 | base / 크기 | 제공/가격 | 특징 |
| --- | --- | --- | --- | --- | --- |
| Decisions API | OpenAI | 09-29 발표, 10-06 beta | 비공개(`gpt-6-luna`) | API, $0.10/M 입력 | 이미지 지원 [74][75] |
| Clef / Clef-flash | Cloudflare | 10-01 | 27B / 9B, Qwen 계열(2차 출처) | Apache-2.0 가중치, Workers AI $0.24 / $0.09 per M 입력 | 멀티모달(텍스트/JSON/이미지/영상) [72][69] |
| Strands Decider 2B | AWS | 10-01 | Qwen3.5-2B | Apache-2.0, 유료 API 미제공 | LM head → pointer head, RTX 3090 중앙값 106ms [71] |
| pplx-decider-v1-27b | Perplexity | 10-01(2차 출처) | 27B, non-causal custom | 확인 못 함 | 23개 비교에서 최상위 정확도. 대신 49GB, 1.4초+ [69][88] |
| Decision-1 | Microsoft | 10-09 | Qwen3.5-9B | Microsoft Foundry, $0.042/M 입력, 출력 무료 | Jev와 동가, 정확도 동률 보고 [73][69] |
| Kev | Jared Palmer(오픈소스) | 2026-09-20 (2차 출처: aiweekly.co) | Qwen3.5 0.8B/4B/9B, Qwen3.8 27B | Apache-2.0 | TypeSafe API 호환 [49] |
| Nimble | 오픈소스 | 확인 못 함 | Qwen3.5-9B | 확인 못 함 | 후보 토큰 logit 읽기 방식 [67][68] |
| NanoJev | 오픈소스 | 확인 못 함 | Qwen3-0.6B | 확인 못 함 | [67][68] |
| autotrust/JEV-9B | AutoTrust(TypeSafe와 무관 명시) | 확인 못 함 | Qwen3.5-9B | Hugging Face 가중치 | Jev 출력 distillation, 24슬롯 고정 head [70] |
| Laya | 확인 못 함 | 확인 못 함 | ModernBERT-large 기반 인코더 | 확인 못 함 | 양방향 인코더 + 결정 head [67][61] |
| Von | 확인 못 함 | 확인 못 함 | 양방향 인코더 | 확인 못 함 | [67] |
- 공개일/가격 중 2차 출처만 있는 항목은 1차 출처 미확인
- 외부 데이터를 보낼 수 없는 경우 Kev / Strands Decider 2B / Microsoft Decision-1 등 오픈 가중치 Qwen 기반 모델의 자체 호스팅이 선택지(라이선스는 모델별 확인) [49][71].

---

## 7. 사용법 요약

공식 약점 9가지와 회피법은 부록.

### 7.1 API 형식

- 키 발급: TypeSafe 콘솔(`https://console.typesafe.ai/keys`). 인증: `Authorization: Bearer <키>` 헤더. 현재 early access(대기열 순차 승인) [7][1]
- 엔드포인트는 사실상 하나: `POST <https://api.typesafe.ai/v1/systemone`>. 보조로 `GET /v1/models` [3][4][38]
- 요청 = `model` + `state` + `questions`(이름 → 질문 map). 질문 타입은 `noul` / `choice`(선택지 최대 255) / `score`(2~10단계) [3]
- 질문 여러 개는 **한 요청에 묶는 것이 기본**(병렬 평가, 지연 거의 동일). 별도 Batch API는 문서에 없다 [8][29]
- 공식 SDK: Python `typesafe-sdk`(v0.7.3), JS/TS `@typesafe-ai/sdk`(v0.6.0). 둘 다 429/5xx 자동 재시도 [16][22][24]
- 버전 고정: 임계값을 튜닝했다면 `jev-latest` 대신 `jev-1.13.0`으로 고정(공식 권고) [4]
- 응답의 `model`에는 alias가 아닌 실제 버전 ID가 반환 → 결과마다 로그로 기록 [4]

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
- 위험도별로 임계값을 다르게(예: 전체 floor 0.5 미만 → 사람, 고위험은 0.9 초과일 때만) [13]
- "보수적으로 시작, 자기 데이터로 confidence 대 정확도를 그려서 조정" [13][14]
- confidence 1.0은 "분포가 한 단계에 몰렸다"일 뿐 **정답 보장이 아니다** [10]

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

| 단계 | 활용 가능성 | 주의 | 근거 |
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
    - 긴 문서 기반 판정: 27B(80GB GPU)가 아니면 8k 이하로 잘라 넣어야 한다

### 8.2 도입 시 고려사항

데이터 외부 전송 [35][36][33][37]

- Jev는 외부 SaaS(미국 스타트업, early access). 고객 문서/개인정보를 `state`로 보내는 순간 외부 전송 → 데이터 처리 계약/리전/보존 정책 확인 필요
- 서비스는 **미국 호스팅**. 리전 선택 옵션은 문서에 없다 [35]
- 학습 미사용 약속은 있으나 **ZDR은 엔터프라이즈 계약에서만** 제공 [33][37]
- 비교: OpenAI Decisions API는 ZDR / US/EEA 리전 옵션 명시 [75]
- 사내 데이터를 외부로 못 보내는 경우 Kev 등 오픈 가중치 모델의 자체 호스팅이 선택지 [49][71]
    - Kev 상용 API 대비 최대 장점: 가중치/코드/평가셋/학습 레시피가 모두 공개돼 재현과 감사가 가능
    - OpenRouter 경유 Kev는 데이터가 제3자 제공자(Phala, SiliconFlow)로 전송 → 자체 호스팅의 이점이 사라지므로 내부 데이터에는 쓰지 말 것 [56]
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

- SDK 로그는 인증 헤더/키/쿠키/`token`/`secret` 헤더만 마스킹. **요청/응답 body는 마스킹하지 않는다**
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
    - "무관 필드 민감성인지 동일 요청 변동인지 구분 못 함"이라고 명시 → **Jev도 완전히 결정적이라고 가정하지 말 것**
    - 경계선 케이스는 임계값 밴드로 사람 검토
- Kev는 결정론적 forward라 반복 편차는 작겠지만(추측) bf16/fp32 경로 차이(최상위 답 약 300문항 중 1개 변동)는 존재 [49]
- alias(`jev-latest`)는 새 릴리스 시 답이 바뀔 수 있다 → 버전 ID 고정 [4]
- 선택지 순서 민감성: 순서 고정 또는 순서를 섞어 다회 평가 후 평균 [5]
- 장애 대비: rate limit이 예고 없이 바뀔 수 있으므로 실패 시 기존 LLM 경로로 fallback [4]

### 8.3 한국어

Jev

- 공식 문서: 영어가 주 학습 언어. **CJK 포함 타 언어는 "처리하지만 같은 수준은 아님"** [4]
- **고객별 fine-tuning 불가** [4] → 할 수 있는 것은 자체 데이터 검증과 임계값 조정뿐. confidence는 특히 주의
- 한국어 instructions와 영어 instructions 중 무엇이 나은지는 비교 대상. 공식 문서는 영어가 가장 정확하다고만 명시하고 혼용 효과는 확인 못 함
- 토크나이저와 한국어 토큰 효율, 언어별 정확도 수치는 확인 못 함

Kev

- **모델카드 4종 모두 "Languages: English", 영어 외 언어는 out-of-scope로 명시.** 한국어/일본어 공식 평가 부재 [50]
- 제3자 측정
    - 한 사용자 시험(2,394문항 중 비영어 472): Kev-4B 전체 79.3%, 영어만 85.3% → 비영어 약 55%로 역산(역산값, 언어별 내역 미확인) [61]
    - 싱가포르 정부 AI팀(GovTech) 모더레이션 평가 [62]
        - Kev-0.8B 기본판은 F1 0.12~0.56으로 낮다
        - LionGuard 데이터로 fine-tune 후 0.63~0.98(중국어 0.81, 타밀어 0.63)로 회복
        - Jev는 0.76~1.00
    - 일본어 결정 모델 측정기(dev.to): Kev는 일본어 참고 측정만 언급되고 수치 미기재. 게시일이 2026-01-31로 나와 신뢰 불가 [66]
- 오픈소스이므로 한국어 라벨로 `init_from` fine-tune + temperature 재fitting 가능 [49]
    - 수천 건 규모 필요(추측). README는 400건이 노이즈 범위라고 언급
    - fine-tune이 개별 능력(예: 날짜)을 악화시킨 사례가 있으므로 기존 평가셋도 함께 재측정 [49]
- **한국어 정확도 공식 수치는 Jev/Kev 모두 없다.** 위 제3자 수치는 한국어 성능의 직접 근거가 아니므로 단정 금지

### 8.4 한국어 범용 agent를 위한 선택지와 권장 단계

선택지

| 선택지 | 가능한 조정 | 장점 | 제약 |
| --- | --- | --- | --- |
| Jev 그대로 사용 | 골든셋 검증 + 임계값 조정, 질문 문구(한/영) 비교 | 추가 운영 부담 최소, Kev 측 평가 기준 최고 수준 정확도/confidence 순위화 | 고객별 fine-tuning 불가, 외부 전송(미국 호스팅), ZDR은 엔터프라이즈만, 증류 금지 |
| OpenAI Decisions | 골든셋 검증 + 임계값 조정 | 이미지 입력, ZDR/HIPAA, US/EEA 리전 | calibration 미언급, 구현 비공개 |
| Kev 한국어 fine-tune | `--init_from` fine-tune + temperature 재fitting | 자체 호스팅(외부 전송 불필요), 재현/감사 가능, Kev-4B 1회 약 $1(H100) | 기본판은 영어 전용, GPU 운영 필요, 지식형/날짜 약점 |
| 현행 생성 LLM 유지 | 프롬프트 | 추가 도입 불필요 | 확률 미제공 또는 calibration 취약, 출력 과금/지연 |

권장 단계 (제안)

1. 기존 intent/라우팅 골든셋(한국어/일본어)으로 후보 비교: Jev / OpenAI Decisions / Kev-4B 기본판(로컬) / 현행 LLM
    - 지표: 정확도 / calibration(Brier, reliability diagram, ECE) / AUROC / 5% 오류예산 자동화율 / 지연 / 비용
    - Kev는 로컬 GPU 또는 내부 GPU에서 실행(OpenRouter 사용 금지)
    - 기존 LLM 기준선(예: Azure gpt-4.1)의 비결정성을 고려해 같은 문항으로 반복 측정(N>=5)
    - `kev.benchmark --remote`로 Jev 포함 System One 엔드포인트를 같은 문항으로 평가 가능 [49]
2. Kev와 격차가 크면 내부 라벨로 `init_from` fine-tune 1회(약 $1/H100 규모)를 시험하고 같은 지표로 재측정
3. confidence 임계값별 "자동 처리율 vs 오류율" 곡선으로 fallback 기준 결정. 임계값은 자체 데이터로 반드시 다시 설정(Kev README도 같은 권고) [49]
4. 외부 전송 불가 데이터 경로는 오픈 가중치 모델만 후보로 한정
5. 결과가 괜찮으면 confidence 임계값 + LLM fallback 구조로 소규모 shadow 운영
6. 운영 후에도 분포 변화에 대비해 주기적으로 재측정하고 필요하면 temperature/isotonic 사후 보정 레이어 추가(5.3)

---

## 부록

### jev 공식 약점 9가지와 회피법 (jev-1.13, 2026-10-02 검토)

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

- 영어가 주 학습 언어. **CJK 포함 타 언어는 "처리하지만 같은 수준은 아님"**
- → 한국어/일본어는 자체 데이터 검증 필수. confidence는 특히 주의

## Reference

번호는 주제별로 묶은 일련번호. 기준일은 별도 표기가 없으면 2026-10-14.

TypeSafe 공식 블로그/문서 (docs.typesafe.ai)

- [1] TypeSafe, Introducing System One models and Jev (2026-09-15): https://typesafe.ai/blog/introducing-system-one-models-and-jev
- [2] TypeSafe Docs, System One: https://docs.typesafe.ai/concepts/system-one
- [3] TypeSafe Docs, API reference: https://docs.typesafe.ai/api.md
- [4] TypeSafe Docs, Models: https://docs.typesafe.ai/models.md
- [5] TypeSafe Docs, Jev 1.13 jaggedness: https://docs.typesafe.ai/model-jaggedness/jev-1.13.md
- [6] TypeSafe Docs, Machine learning primer: https://docs.typesafe.ai/introduction/machine-learning-primer
- [7] Quick start: https://docs.typesafe.ai/introduction/quickstart.md
- [8] Primitives (Questions): https://docs.typesafe.ai/primitives.md
- [9] Choice: https://docs.typesafe.ai/primitives/choice.md
- [10] Score: https://docs.typesafe.ai/primitives/score.md
- [11] Noul: https://docs.typesafe.ai/primitives/noul.md
- [13] Confidence: https://docs.typesafe.ai/confidence.md
- [14] How to build with TypeSafe: https://docs.typesafe.ai/concepts/how-to-build-with-system-one.md
- [15] State: https://docs.typesafe.ai/concepts/state.md
- [16] TypeSafe Python SDK: https://docs.typesafe.ai/sdk/python.md
- [17] Python SDK Usage: https://docs.typesafe.ai/sdk/python/usage.md
- [22] JavaScript SDK: https://docs.typesafe.ai/sdk/javascript.md
- [23] JS TypeSafeClient / TypeSafeClientConfig / RetryPolicy / RequestOptions: https://docs.typesafe.ai/sdk/javascript/api/classes/TypeSafeClient.md , https://docs.typesafe.ai/sdk/javascript/api/interfaces/TypeSafeClientConfig.md , https://docs.typesafe.ai/sdk/javascript/api/interfaces/RetryPolicy.md , https://docs.typesafe.ai/sdk/javascript/api/interfaces/RequestOptions.md
- [24] Changelogs: https://docs.typesafe.ai/sdk/python/changelog.md , https://docs.typesafe.ai/sdk/javascript/changelog.md
- [25] Intent routing: https://docs.typesafe.ai/patterns/intent-routing.md
- [27] Classifying RAG passages: https://docs.typesafe.ai/cookbooks/classifying_rag_passages.md
- [28] Re-ranking: https://docs.typesafe.ai/cookbooks/rerank_typesafe.md
- [29] Parallel questions / Cookbooks index: https://docs.typesafe.ai/cookbooks/parallel_questions.md , https://docs.typesafe.ai/cookbooks.md
- [30] Self-consistency: choices / nouls: https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook.md , https://docs.typesafe.ai/cookbooks/consistency_noul_cookbook.md
- [33] Legal: https://docs.typesafe.ai/legal.md

TypeSafe 법무/기타

- [34] Data Processing Addendum (2026-04-24): https://typesafe.ai/legal/data-processing
- [35] Privacy Policy (2025-11-19): https://typesafe.ai/legal/privacy-policy
- [36] Master Customer Agreement (2026-09-23): https://typesafe.ai/legal/mca
- [37] Enterprise: https://typesafe.ai/enterprise
- [38] OpenAPI spec v0.2.0: https://api.typesafe.ai/openapi.json (문서 UI: https://api.typesafe.ai/docs/)
- [39] GitHub API, typesafe-ai org 저장소 목록: https://github.com/typesafe-ai
- [41] SiliconANGLE, TypeSafe AI exits stealth with $40M: https://siliconangle.com/2026-09-16/typesafe-ai-exits-stealth-with-40m-to-build-ai-for-use-by-software/

TypeSafe 관련 인터뷰/해설 (2차 포함)

- [42] Turing Post, What Is Jev AI? Inside TypeSafe's RLCD Model (Ksenia Se, 2026-09-19, 일부 유료): https://www.turingpost.com/p/what-is-jev-rlcd
- [43] Latent Space, Jev: System One models for Prod, not God — with Diogo Almeida (2026-09-21): https://www.latent.space/p/jev
- [44] TWIML AI Podcast #779, Why Jev Is Changing How We Build With AI (2026-10-06): https://twimlai.com/podcast/twimlai/jev-changing-how-we-build-ai
- [45] AI Engineer, Diogo Almeida speaker page: https://ai.engineer/speakers/diogo-almeida
- [46] 해설 예시(비공식): systemonemodels.org RLCD explained: https://systemonemodels.org/guides/rlcd-explained/ , befailproof.ai: https://befailproof.ai/jev/rlcd/
- [47] eesel.ai, Is Jev really ultrafast?: https://www.eesel.ai/blog/jev-ultrafast
- [48] emergent.sh 등(백본 추측 언급, 본문 미확인, 요약 기준): https://emergent.sh/learn/jev

Kev

- [49] jaredpalmer/kev GitHub README (main): https://github.com/jaredpalmer/kev
- [50] Kev 모델카드 0.8B / 4B / 9B / 27B: https://github.com/jaredpalmer/kev/tree/main/docs/model-cards (HF: https://huggingface.co/jaredpalmer/kev-4b 등)
- [51] Kev-0.5B 모델카드(프로토타입): https://github.com/jaredpalmer/kev/blob/main/docs/model-cards/kev-0.5b.md , https://huggingface.co/jaredpalmer/kev-0.5b
- [52] Kev 1.0 릴리스 노트: https://github.com/jaredpalmer/kev/blob/main/docs/releases/kev-1.0.md
- [53] Jared Palmer, Introducing Kev (블로그): https://jaredpalmer.com/blog/introducing-kev
- [54] Kev 소스 `kev/model.py`, `kev/api.py`: https://github.com/jaredpalmer/kev/blob/main/kev/model.py
- [55] Hugging Face 모델 메타데이터(생성일/base_model/license, HF API로 확인): https://huggingface.co/collections/jaredpalmer/kev-6aad9d0ea49f2589665e07cd
- [56] OpenRouter 모델 API(`/api/v1/models/jaredpalmer/kev-4b/endpoints`), https://openrouter.ai/jaredpalmer
- [57] ModelSystem.One, Kev 4B lands on OpenRouter (2차, 가격 $0.01 표기/JevBench 인용): https://modelsystem.one/news/kev-openrouter/
- [58] Archer Hume, Jev's Architecture Unmasked (2026-09-17): https://archerhume.com/posts/jevs-architecture-unmasked
- [59] AI Weekly, Jared Palmer Ports Kev to Qwen3.5 for Roughly $95 in H100 (2차, $95/$0.03/0.837 출처): https://aiweekly.co/alerts/jared-palmer-ships-kev-an-apache-20-jev-style-decision-model-family-built-on
- [60] Opper.ai, Jev vs. Kev tested side by side (2026-09-25): https://opper.ai/blog/jev-vs-kev-open-decision-model
- [61] ddalcu/mlx-serve Issue #599, Kev-4B 2,394문항 시험 (2026-09-27): https://github.com/ddalcu/mlx-serve/issues/599
- [62] GovTech Singapore AI 블로그, Decision Models for Guardrails: Exploring Jev and Kev for Moderation (2026-09-28): https://blog.ai.gov.sg/decision-models-for-guardrails-exploring-jev-and-kev-for-moderation/
- [63] Qwen 모델 HF 카드(license 필드): https://huggingface.co/Qwen/Qwen3.5-4B-Base , https://huggingface.co/Qwen/Qwen3.8-27B
- [64] prismix.dev, Jev vs. Kev tested side by side: https://prismix.dev/news/6391253633e5 (본문 미확인, 요약 기준)
- [65] Jared Palmer X 게시물(Qwen3 세대 공지) https://x.com/jaredpalmer/status/2101715352258232539 , OpenRouter X 공지 https://x.com/OpenRouter/status/2103560682113487257 (둘 다 본문 미확인, 요약 기준)
- [66] 참고: 일본어 결정 모델 측정기(dev.to, GeneLab_999): https://dev.to/genelab_999/decision-models-are-english-first-i-measured-them-in-japanese-then-built-one-1p12 : Kev는 일본어 참고 측정만 언급되고 수치 미기재. 게시일 표기가 2026-01-31로 Jev 출시 이전이라 신뢰 불가

기타 Jev류 모델/비교

- [67] DataCamp, Top 7 Open-Source TypeSafe Jev Alternatives: https://www.datacamp.com/blog/top-open-source-jev-alternatives
- [68] Kev/Nimble/Strands 관련 자료(본문 미확인, 요약 기준) 및 awesome-typesafe-jev: https://github.com/AbdelStark/awesome-typesafe-jev
- [69] akitaonrails, Which Jev-like AI Decision/Classifier Model Is Best? (2026-10-10): https://akitaonrails.com/en/2026/10/10/which-jev-like-ai-decision-classifier-model-is-best/
- [70] autotrust/JEV-9B (Hugging Face): https://huggingface.co/autotrust/JEV-9B
- [71] The New Stack / pasqualepillitteri.it, AWS Strands Decider 2B: https://pasqualepillitteri.it/en/news/19998/aws-strands-decider-2b-jev
- [72] InfoQ / pasqualepillitteri.it, Cloudflare Clef: https://pasqualepillitteri.it/en/news/19913/cloudflare-clef-challenges-jev , https://infoq.com/news/2026/10/clef-decision-models
- [73] The Next Web, Microsoft launches a decision model built on Alibaba's Qwen: https://thenextweb.com/news/microsoft-decision-1-qwen-decision-model (본문 미확인, 요약 기준)

OpenAI

- [74] OpenAI Developer Community, Decisions API is now available in Public Beta: https://community.openai.com/t/decisions-api-is-now-available-in-public-beta/1403877
- [75] OpenAI Docs, Decisions: https://developers.openai.com/api/docs/guides/decisions
- [76] OpenAI Developer Community, DevDay 2026 announcements and developer resources (2026-09-29): https://community.openai.com/t/devday-2026-announcements-and-developer-resources/1402006 ; ModelSystem.One, OpenAI announces a Decisions API on GPT-6 Luna (DevDay recap 문구 인용): https://modelsystem.one/news/openai-decisions-api-preview/
    - DevDay 2026 Recap https://openai.com/index/devday-2026-recap/ (본문 미확인). 09-29 발표일은 [76]/[85]/[86] 기준
- [77] OpenAI Docs, GPT-6 Luna model page: https://developers.openai.com/api/docs/models/gpt-6-luna
- [78] OpenAI Deployment Safety Hub, GPT-6 Astra system card (Appendix: GPT-6 Sol, GPT-6 Luna, 2026-09-22 추가): https://deploymentsafety.openai.com/gpt-6-astra
- [79] Let's Data Science, OpenAI Introduces GPT-6 Sol and Luna (출시일 09-22): https://letsdatascience.com/news/openai-expands-gpt-56-options-in-chatgpt-360ebb75
- [80] aiintoai, OpenAI Decisions API: Sub-Second Classification & Routing Deep Report (2026-09-29, 출처 인용 부재): https://aiintoai.vercel.app/article/openai-decisions-api-sub-second-classification-deep-report
- [81] Hugging Face blog(커뮤니티), What Is OpenAI Decisions API? A Practical Guide: https://huggingface.co/blog/sora-2/what-is-openai-decisions-api-a-practical-guide (본문 미확인, 요약 기준)
- [82] Anthus (Ryan Porter), The OpenAI Decisions API Needs a Confidence You Can Trust (2026-10-01): https://anth.us/blog/openai-decisions-api-preview

Anthropic / 어댑터

- [83] Anthropic, Introducing Claude Haiku 5.5: https://www.anthropic.com/claude-haiku-5-5
- [84] Claude Platform Docs, Claude Haiku 5.5 migration guide: https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide (본문 미확인, 요약 기준)
- [85] Vincent van Deth, OpenAI Decisions API: Output, Cost, Alternatives: https://vincentvandeth.nl/blog/openai-decisions-api-explained-jev-haiku
- [86] Manifold, When Anthropic will release Jev/DecisionAPI alternative?: https://manifold.markets/fornever/when-anthropic-will-release-jevdeci
- [87] Vercel AI SDK Docs, Decisions: https://ai-sdk.dev/docs/ai-sdk-core/decisions
- [88] Medium, Haiku 5.5 vs Jev (사용 사례/출시 타임라인 언급): https://medium.com/@itaispector1/haiku-5-5-vs-jev-is-anthropics-jev-killer-about-to-make-decision-models-obsolete-e25520bbe9f8 (본문 미확인, 요약 기준)

학술 (calibration / RLCD 동명 논문)

- [89] Yang et al., RLCD: Reinforcement Learning from Contrastive Distillation for Language Model Alignment (ICLR 2024): https://arxiv.org/abs/2307.12950
- [90] Damani et al., Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty (RLCR): https://arxiv.org/abs/2507.16806
- [91] Bani-Harouni et al., Rewarding Doubt: A Reinforcement Learning Approach to Calibrated Confidence Expression of LLMs: https://arxiv.org/abs/2503.02623
- [92] Guo et al., On Calibration of Modern Neural Networks (ICML 2017): https://arxiv.org/abs/1706.04599
- [93] OpenAI, GPT-4 Technical Report: https://arxiv.org/abs/2303.08774
- [94] Kadavath et al., Language Models (Mostly) Know What They Know: https://arxiv.org/abs/2207.05221
- [95] Tian et al., Just Ask for Calibration (EMNLP 2023): https://arxiv.org/abs/2305.14975
- [96] Leng et al., Taming Overconfidence in LLMs: Reward Calibration in RLHF: https://arxiv.org/abs/2410.09724
- [97] Yaldiz et al., Balancing Classification and Calibration Performance in Decision-Making LLMs via Calibration Aware Reinforcement Learning: https://arxiv.org/abs/2601.13284
- [98] Lin et al., Teaching Models to Express Their Uncertainty in Words: https://arxiv.org/abs/2205.14334

명칭

- [99] Pydantic AI Docs, System One models: https://pydantic.dev/docs/ai/models/system-one/
- [100] TechCrunch, OpenAI's Jev clone could help the frontier lab stop its swarming agents (2026-09-30): https://techcrunch.com/2026/09/30/openais-jev-clone-could-help-the-frontier-lab-stop-its-swarming-agents

입출력 예시와 한도 (2026-10-15 기준)

- [102] TypeSafe Docs, Images / Box: https://docs.typesafe.ai/images.md , https://docs.typesafe.ai/primitives/box.md
- [103] TypeSafe Docs, Python SDK Advanced usage (zstd 압축 설정): https://docs.typesafe.ai/sdk/python/usage/advanced.md
- [105] Kev 소스 `kev/serve.py` (main, raw 확인): https://github.com/jaredpalmer/kev/blob/main/kev/serve.py
- [106] Kev `uv.lock` (`typesafe-sdk` 0.6.0 고정): https://github.com/jaredpalmer/kev/blob/main/uv.lock
- [107] OpenRouter Docs, Jev guide: https://openrouter.ai/docs/guides/community/jev.md
- [108] OpenRouter 모델 API `/api/v1/models/typesafe/jev-1.13/endpoints`: https://openrouter.ai/api/v1/models/typesafe/jev-1.13/endpoints
- [110] Vaswani et al. 2017, "Attention Is All You Need", Figure 1: https://arxiv.org/abs/1706.03762
- [111] Jay Alammar, "The Illustrated GPT-2": https://jalammar.github.io/illustrated-gpt2/
- [112] Xiong et al. 2020, "On Layer Normalization in the Transformer Architecture" (ICML 2020): https://arxiv.org/abs/2002.04745
- [113] Zhang & Sennrich 2019, "Root Mean Square Layer Normalization" (NeurIPS 2019): https://arxiv.org/abs/1910.07467
- [114] Qwen3.5-0.8B-Base / 4B-Base / 9B-Base, Qwen3.8-27B 모델 카드와 config.json(Kev 고정 revision, `layer_types`/`full_attention_interval`/`vocab_size`/`tie_word_embeddings`/hidden 확인): https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/raw/dc7cdfe2/config.json , https://huggingface.co/Qwen/Qwen3.5-4B-Base/raw/1001bb4d/config.json , https://huggingface.co/Qwen/Qwen3.5-9B-Base/raw/68c46c4b/config.json , https://huggingface.co/Qwen/Qwen3.8-27B/raw/1d4bf0f2/config.json
- [115] Yang, Kautz, Hatamizadeh, "Gated Delta Networks: Improving Mamba2 with Delta Rule" (ICLR 2025): https://arxiv.org/abs/2412.06464
- [116] Qiu et al. 2025, "Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free": https://arxiv.org/abs/2505.06708
- [117] Hugging Face transformers `modeling_qwen3_5.py` (main, 2026-10-15 기준): https://github.com/huggingface/transformers/blob/main/src/transformers/models/qwen3_5/modeling_qwen3_5.py
- [118] huggingface/transformers PR #49441 "Derive packed-sequence boundaries from position_ids in gated-DeltaNet models" (closed 2026-10-08): https://github.com/huggingface/transformers/pull/49441
- [119] Sebastian Raschka, LLMs-from-scratch Gated DeltaNet README: https://github.com/rasbt/LLMs-from-scratch/blob/main/ch04/08_deltanet/README.md
- [120] Sebastian Raschka, LLMs-from-scratch (ch04 GPT 구현/아키텍처 그림): https://github.com/rasbt/LLMs-from-scratch
- [121] Qwen2.5-0.5B / Qwen3-4B-Base config.json (`vocab_size` 151,936 대조용): https://huggingface.co/Qwen/Qwen2.5-0.5B/raw/main/config.json , https://huggingface.co/Qwen/Qwen3-4B-Base/raw/main/config.json

인코더/디코더 분류 구조와 pointer 계보 (2.8, 2026-10-17 확인)

- [122] Vinyals, Fortunato, Jaitly, Pointer Networks (NeurIPS 2015): https://arxiv.org/abs/1506.03134
- [123] Merity et al., Pointer Sentinel Mixture Models (2016): https://arxiv.org/abs/1609.07843
- [124] See et al., Get To The Point: Summarization with Pointer-Generator Networks (ACL 2017): https://aclanthology.org/P17-1099/
- [125] Wang & Jiang, Machine Comprehension Using Match-LSTM and Answer Pointer (ICLR 2017): https://arxiv.org/abs/1608.07905
- [126] Ma et al., Stack-Pointer Networks for Dependency Parsing (2018): https://arxiv.org/abs/1805.01087
- [127] Shrivastava et al., Span Pointer Networks for Non-Autoregressive Task-Oriented Semantic Parsing (Findings of EMNLP 2021): https://arxiv.org/abs/2104.07275
- [128] BertForMultipleChoice (공유 `Linear(hidden→1)` + 선택지 softmax), Spark NLP 문서: https://sparknlp.org/api/python/reference/autosummary/sparknlp/annotator/classifier_dl/bert_for_multiple_choice
- [129] GLiClass 논문 / 저장소: https://www.arxiv.org/pdf/2508.07662 , https://github.com/Knowledgator/GLiClass
- [130] LlamaForSequenceClassification 마지막 비패딩 토큰 pooling: Label Supervised LLaMA Finetuning https://arxiv.org/abs/2310.01208 , HF forum https://discuss.huggingface.co/t/when-training-llama-for-sequence-classification-should-the-final-token-be-an-eos/54500
- [131] Yin, Hay, Roth, Benchmarking Zero-shot Text Classification: Datasets, Evaluation and Entailment Approach (EMNLP 2019): https://aclanthology.org/D19-1404/
- [132] BehnamGhader et al., LLM2Vec: Large Language Models Are Secretly Powerful Text Encoders (2024): https://arxiv.org/abs/2404.05961
- [133] Weller et al., Seq vs Seq: An Open Suite of Paired Encoders and Decoders (Ettin, 2025): https://huggingface.co/papers/2507.11412
- [134] Answer.AI / Hugging Face, Finally, a Replacement for BERT: Introducing ModernBERT (2024-12-19): https://huggingface.co/blog/modernbert
- [135] Xiong et al., Can LLMs Express Their Uncertainty? An Empirical Evaluation of Confidence Elicitation in LLMs (ICLR 2024): https://arxiv.org/abs/2306.13063
- [136] Stanford CS224n 2019 default project report (BERT + Answer Pointer head): https://web.stanford.edu/class/archive/cs/cs224n/cs224n.1194/reports/default/15791435.pdf
- [137] Jurafsky & Martin, Speech and Language Processing 3rd ed. draft, ch.10 (양방향 인코더 vs causal): https://web.stanford.edu/~jurafsky/slp3/10.pdf
- 2026-10-15 기준 자료: [3] API reference, [4] Models, [8] Primitives, [24] Changelogs, [38] OpenAPI(버전 표기 0.2.0 유지, `assets`/Box/Long context 헤더 추가 상태), [49] Kev README, [50] Kev-4B 모델카드, [54] `kev/api.py`/`kev/model.py`, [56] OpenRouter `kev-4b` 엔드포인트 API
