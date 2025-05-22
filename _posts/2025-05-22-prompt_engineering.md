---
title: "Prompt Engineering"
category: LLM / Multimodal
tag: LLM
---


 




* 목차
{:toc}












LLM은 입력된 token sequence에서 다음 token의 확률 분포를 계산하여 다음 token을 생성하는 모델이다. LLM에게 prompt는 전체가 하나의 token sequence일 뿐이라는 점을 인지하여 prompt engineering을 해야 한다. 

간혹 LLM을 생각하는 존재로 취급하고 Prompting을 하는 경우를 볼 수 있는데, LLM은 기본적으로 next token prediction으로 작동한다는 점을 인지하고 prompt를 작성해야 한다. 


> **LLM 작동 방식**
> 1. 사용자 입력 -> tokenize
> 2. tokens -> embedding
> 3. transformer decoder 기반의 각 모델 architecture를 통해 순차적으로 처리 (모델에 따라 순차적이지 않을 수 있다. [Multi-Token Prediction](https://finddme.github.io/llm%20/%20multimodal/2025/01/14/deepseek_v3/#multi-token-prediction-mtp))
> 4. 다음 token의 확률 분포 계산
> 5. 설정된 [Sampling Parameter](https://finddme.github.io/llm%20/%20multimodal/2024/08/06/hallucination_detect/#additional-information-sampling-parameters)를 기반으로 token 선택
> 6. 종료까지 반복

# Prompt Engineering

## Delimiters

LLM은 순차적으로 toekn들을 처리하면서 각 위치에서 다음 위치에 올 token을 예측한다. 이때 attention mechanism을 통해 입력 sequence 내의 모든 token들 간의 관계를 파악하는데 LLM에게 입력된 전체 sequence가 모두 하나의 context-window에 속해 있기 때문에 text의 구조적 경계를 명확히 인식하는데 한계가 있다. 따라서 Prompt 작성 시 Delimiter들을 통해 명확히 context를 분리해 주는 것이 좋다. 

모델마다 효과적인 delimiter가 다르다. 그 이유는 모델별 학습 데이터에 차이가 있기 때문이다. 사용하고자 하는 모델들의 docs을 보면 일반적으로 prompt 예시가 있다. 그걸 참고하고 작성하는 게 좋다. 라면도 봉지에 적힌 설명대로 끓인 게 제일 맛있듯 모델도 배포한 곳에서 작성한 설명을 따르는 게 좋다. 

- `\```\`(Backticks)
- `"""` (Triple Quotation Marks)
- `---` (Triple Hyphen)
- Markdown format
```
### Task:
... 내용 작성
### Context:
... 내용 작성

**강조**
```
- XML tag format
```
<context>
... 내용 작성
</context>

<task>
... 내용 작성
</task>

<output_format>
... 내용 작성
</output_format>
```
- 대괄호
```
[INST]
... 내용 작성 
[/INST]
```


## Basic 

### System, Contextual, and Role Prompting

- System Prompting: LLM 응답의 전반적인 tone and manner 그리고 목적을 설정
- Contextual Prompting: 응답 시 참조하면 좋은 task에 관련된 배경 정보 제공
- Role Prompting: 특정 캐릭터로서 역할을 수행하도록 지시 

### XX-Shot Prompting

- Zero-Shot Prompting
  
  예시 없이 instruction만 제공하는 방식으로, LLM의 기본 지식에 대한 의존도가 높다. 

  Prompt Engineering은 LLM에게 명확한 instruction을 제공하여 LLM으로부터 원하는 결과를 얻어내는 방법이다.

- One-Shot Prompting

  원하는 출력에 대한 예시를 1-n개 제공하는 방식으로, 제공된 패턴을 기반으로 LLM이 응답을 생성한다.

  이 방식은 반환 받고 싶은 응답의 형식이나 스타일을 지정할 수 있다.

## Chain-of-XX

### Chain-of-Thought
인간이 특정 문제를 단계별로 분해하여 해결하는 방식을 LLM 프롬프팅에 적용한 것으로, LLM이 단계별로 사고 과정을 설명하도록 유도하여 LLM 스스로 생성한 token들까지도 다음 token 예측에 활용하여 추론 능력을 부스팅하는 방법이다. 

이 방법은 복잡한 작업이나 논리적 추론이 필요한 작업에 적합하다. 

- Self-Consistency
  모델 temperature를 다르게 설정하여 CoT를 여러번 수행하고 가장 빈번하게 반환된 응답을 선택하는 방식도 있다.

## ReAct


## Etc.

- Step-Back Prompting
  복잡한 문제를 해결하기 전에 먼저 관련된 일반적인 질문으로 시작하는 방법. 이를 통해 관련 분야 혹은 필드에 대한 지식을 활성화하고 이후 구체적인 작업을 수행한다.

- 



# Reference

> https://kirenz.github.io/generative-ai/prompting/prompting-delimiters.html?utm_source=chatgpt.com

> https://jonbishop.com/an-entire-post-about-delimiters-in-ai-prompts/?utm_source=chatgpt.com
