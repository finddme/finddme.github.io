---
title: "Agent's Memory: Knowledge Graph Memory MCP Server, Memory OS of AI Agent"
category: LLM / Multimodal
tag: Multimodal
---


 




* 목차
{:toc}












# Agent's Memory
ai agent 기반 서비스에서는 사용자와의 대화 내용을 agent가 기억어는 것이 중요하다. 일반적으로 agent들이 기억을 유지하는 방법은 아래와 같다:

1. context window 의존
  가장 기본적인 방법으로, LLM이 수용할 수 있는 고정된 길이의 context window에 대화 history를 잘라 넣는 방법이다.
2. vector memory
  대화 내용을 vector embedding으로 변환하여 db에 저장, 새로운 질문이 들어오면 db에서 유사한 기록을 검색하여 현재 time step의 context에 포함시켜 답변 생성
3. summary based memory
   LLM으로 prompt-completion 쌍에 대한 요약을 생성하고 이를 NoSQL DB에 저장 (user_id, summary_type, json_body, created_at, ttl_days 등 자유롭게 부가 데이터 추가)<br>
   대표 사례: Anthropic Hierarchical Summarization


> llm의 context가 길수록 instruction/prompt를 잘 잊는 이유? 
>  1. Attention 메커니즘의 한계
    Transformer는 모든 토큰 간의 관계를 계산하지만, Attention의 복잡도는 O(n²)이므로 긴 컨텍스트에서는 계산이 기하급수적으로 증가하여 context가 길어질수록 각 토큰에 할당되는 attention이 희석되고 정밀도 손실이 커진다.
    따라서 중요한 정보와 덜 중요한 정보를 구별하기 어려워진다.
>  2. Positional encoding의 한계
    Transformer는 기본적으로 순서를 모르는 구조라 positional encoding을 해주는데, 초기 positional encoding 방법에서는 sequence가 길면 주기가 반복되어 서로 다른 위치가 같은 encoding 값을 가지게 되는 것도 문제이고, sin/cos 값들이 매우 유사해진다는 문제도 있었다.
    그리고 최근 많이 사용되는 RoPE와 같이 상대적 위치 인코딩을 하더라도, 여전히 한계가 있다. 가까운 거리용 고주파수와 먼 거리용 저주파수를 동시에 써야하는데 긴 sequence에서는 모든 거리를 완벽하게 구별하기 어렵다.

> Lost in the Middle:
>  - 너무 긴 sequence를 입력하면 Lost in the Middle 현상이 발생한다고 알려져 있다. 이는 LLM이 입력 sequence 내 중간 부분을 잊어버리는 현상으로, LLM이 입력의 시작(primacy effect)과 끝(recency effect)에 상대적으로 더 많은 attention을 할당하고 중간 부분의 정보에 대한 attention이 줄어들어 U-shape를 형성하는 구조적 bias에서 비롯 것이다.
>  - 앞쪽은 llm이 causal mask를 사용하기 때문에 Softmax 정규화로 인한 Attention Sink가 발생. 결과적으로 1-번 토큰(혹은 BOS)과 그 근처는 layer가 누적될수록 앞쪽 toakne에 대한 attention이 눈덩이처럼 불어나 더 높은 attention이 할당되어 앞쪽의 logit과 gradiant가 커져서 attention이 집중된다.
>  - 뒷쪽은 llm이 next-token prediction을 하는 모델이기 때문에 recency prior를 강하게 받아들이는 특성이 있기 때문에 attention이 집중된다.
>  - 중앙은 이도 저도 아니어서 상대적으로 attention이 약해서 정보 손실이 발생하는 것이다.

본 게시물에서는 최근 주목 받고 있는 meomry 유지 방법인 **Knowledge Graph 기반 memory 관리** 그리고 **계층적 memory 관리** 방법 두 가지를 소개하고자 한다.

# Knowledge Graph Memory MCP Server
Knowledge Graph Memory MCP Server는 Anthropic이 공개한 MCP server로, 대화 내용에 대해 Entities-Relations-Observations 구조의 Knowledge Graph를 구축하여 로컬에 저장해 history를 유지하는 방법이다.

- Knowledge Graph Memory 구성 요소
  
| 개념              | 설명                    | 예시                                                                                       |
| --------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| **Entity**      | 그래프의 노드 | `{ "name": "John_Smith", "entityType": "person", "observations": ["Speaks fluent Spanish"] }` |
| **Relation**    | 방향성을 가진 엣지. from → to 방향과 relationType을 갖는 엣지, 능동태로 기재.         | `{ "from": "John_Smith", "to": "Anthropic", "relationType": "works_at" }`                     |
| **Observation** | 엔티티에 붙는 원자적 사실(한 문장짜리 원자적 사실을 엔티티에 부착)        | `{ "entityName": "John_Smith", "observations": ["Graduated in 2019"] }`                       |


- memory 저장 방식
  - 로컬 저장을 지원한다.
  - 기본은 memory.jsonl (JSON Lines) 파일이다. (실행 시 --memory-path 플래그나 MEMORY_FILE_PATH 환경 변수로 저장 위치를 변경할 수 있다.)
    
- 상세 사용 방법
  - https://github.com/shaneholloman/mcp-knowledge-graph 에서 확인 가능

> 개인적인 의견: Knowledge Graph의 고질적인 문제에서 벗어나지 못한다는 점이 아쉽다. 복잡한 그래프 구조로 인한 오류 누적, 상업적으로 사용하기에 db 구축 시 llm 호출이 많아 효율성 및 실용성 부족. 이걸 해결할 수 있으면 대화형 chat에는 적합할 것 같다.  
 
# Memory OS of AI Agent
"Memory OS of AI Agent" 논문 저자들은 운영체제의 메모리 관리 원칙에서 영감을 받아 AI 에이전트를 위한 4-module, 3-layer로 구성된 memory 운영 시스템 개발하였다. 

- 4-module

| module         | 주요 기능                                          | 핵심 아이디어             |
| ---------- | ---------------------------------------------- | ------------------- | 
| Storage    | STM·MTM·LPM 3층 구조                              | 대화 길이에 따른 단계적 보존    |
| Updating   | STM→MTM FIFO, MTM→LPM Heat 기반                  | 세그먼트·페이지 교체, 퍼소나 진화 |
| Retrieval  | ① STM 전체, ② MTM 2단계(세그먼트→페이지), ③ LPM 지식 · 트레이트 | 심리학적 기억 회상을 모사      |
| Generation | 세 계층에서 꺼낸 정보로 최종 프롬프트 구성                       | 일관성·개인화를 동시에 확보     |

- 3-layer
4-module 중 Memory Storage Module에 3 memory layer가 존재한다.

| layer         | 설명                                          |
| ---------- | ---------------------------------------------- |
| Short-Term Memory    | - 실시간 대화 데이터를 대화 페이지 단위로 저장<br>- 각 페이지 구조: page_i = {Q_i, R_i, T_i} (쿼리, 응답, 타임스탬프)<br>- 대화 체인 구성: page_chain_i = {Q_i, R_i, T_i, meta_chain_i}<br>- 메타 정보는 LLM이 두 단계로 생성:<br>   1) 새 페이지의 이전 페이지들과의 문맥적 관련성 평가<br>2) 모든 체인 페이지들을 meta_chain_i로 요약   <br>| 
| Mid-Term Memory   | - OS의 세그먼트 페이징 저장 아키텍처 채택<br>- 같은 주제의 대화 페이지들을 세그먼트로 그룹화<br>- 세그먼트 정의: `segment_i = {page_i \| F_score(page_i, segment_i) > θ}` <br>- 유사도 점수 계산:<br>`F_score = cos(e_s, e_p) + F_Jacard(K_s, K_p)`<br>`e_s`, `e_p`: 세그먼트와 페이지의 임베딩 벡터<br>`K_s`, `K_p`: LLM이 요약한 키워드 세트<br>`F_Jacard = \|K_s ∩ K_p\| / \|K_s ∪ K_p\|`<br>| 
| Long-term Personal Memory  |- User Persona:<br>  User Profile (성별, 이름, 출생년도 등 고정 속성)<br>  User Knowledge Base (동적으로 저장되는 사실 정보)<br>  User Traits (진화하는 관심사, 습관, 선호도)<br>- Agent Persona:<br>  Agent Profile (AI 에이전트의 역할, 성격 특성 등 고정 설정)<br>  Agent Traits (사용자와의 상호작용을 통해 발전하는 동적 속성)| 
