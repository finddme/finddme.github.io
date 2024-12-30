---
title: "Semantic Entropy: Summary of Two Papers on LLM <span style='font-weight: bold; font-family: Computer Modern;'>Hallucination Detection</span> 😱"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}










# [1st Paper] Detecting hallucinations in large language models using semantic entropy

본 논문에서는 entropy-based uncertainty estimators를 통해 model이 hallucination을 얼마나 반환하는 model인지 감지하는 방법을 제안한다. 

이때 불확실성은 의미 수준에서 계산되어야 한다. 서로 다른 token sequence도 동일한 의미를 갖는 경우가 있기 때문에 출력된 token 수준에서 불확실성을 계산하는 것은 적합하지 않다. 예를 들어 "Paris", "It's Paris", "The capital of France is Paris"라는 답변은 모두 동일한 의미를 내포하는데 이를 고려하지 않는다면 이 세 문장을 출력한 모델의 불확실성은 높게 측정될 것이기 때문이다. 따라서 본 논문문에서는 generation들을 의미적으로 clustering한 이후 의미적 공간에서 불확실성을 추정하는 semantic entropy (SE)를 제안했다.

즉, 모델이 자신 있게 대답하지만 표현은 다양하게 할 수 있는 부분에서는 불확실성을 낮게 보고, 답변의 의미 자체가 여러 가지로 해석될 수 있는 부분에서는 불확실성을 높게 평가하는 방식이다.

## 1. Semantic Entropy

모델의 generation에는 아래와 같은 두 가지 불확실성이 있다:

- Lexical and Syntactic Uncertainty: 어휘 및 구문적 불확실성이다. 이는 문장을 어떤 단어로 어떻게 구성할지와 관련된 불확실성이다.
- Semantic Uncertainty: 의미적 불확실성이다. 이는 생성된 문장이 내포하는 의미와 관련된 불확실성이다.

본 논문에서는 두 불확실성을 정확히 구분해야한다고 강조하며 Semantic Entropy를 제안하였다. Semantic Entropy는 LLM이 생성하는 텍스트에서 발생하는 의미적 불확실성을 정량적으로 측정하는 방법이다.

구현 코드는 [https://github.com/jlko/semantic_uncertainty/blob/master/semantic_uncertainty/uncertainty/uncertainty_measures/semantic_entropy.py](https://github.com/jlko/semantic_uncertainty/blob/master/semantic_uncertainty/uncertainty/uncertainty_measures/semantic_entropy.py)에 깔끔하게 정리되어 있다.

Semantic Entropy계산은 크게 3 step으로 진행된다.

### 1.1 Generation
   - 이 단계에서는 input에 대해 [different random seed(sampling parameter)](https://finddme.github.io/llm%20/%20multimodal/2024/08/06/hallucination_detect/#additional-information-sampling-parameters)로 여러 output을 생성한다. 주로 temperature, top-K sampling을 사용했다.
   - 생성된 각 output에 대한 확률도 함께 기록한다.
     
### 1.2 Semantic Clustering
   - 이 단계에서는 비슷한 의미를 가진 문장들을 clustering한다.  

   - $s_a$와 $s_b$라는 문장이 있을 때 두 문장이 양방향으로 서로 함의한다면 두 문장은 동일한 의미를 전달한다고 가정한다. 이러한 가정 하에 서로 함의 관계에 놓은 문장들을 하나의 cluster로 묶는다.
   - 우선 여러개의 문장을 LLM으로부터 생성하고 이들을 의미적으로 clustering한 후 각 cluster들의 발생 확률을 계산한다. (실험 시에는 Monte Carlo 방식으로 N개의 문장을 sampling하고 이에 대한 cluster를 생성하여 진행한다.)
   - cluster 확률은 해당 cluster에 속한 모든 generation $s$의 확률을 합한 값이다. generation $s$의 확률은 input $x$가 주어졌을 때 생성된 token들($t_1$,...$t_n$)이 지닌 확률 값의 곱이된다.

### 1.3 Semantic Entropy Estimation
   > entropy는 정보 이론에서 주어진 확률 분포의 불확실성을 측정하는 지표이다.
   
   - 이 단계에서는 의미적 불확실성을 계산한다.
   - model이 다양한 의미를 생성할수록 불확실성은 커진다. 생성된 문장에 대한 불확실성이 클수록 모델이 hallucination을 낼 가능성이 높다.
   - input $x$에 대한 LLM의 generation들의 의미가 얼마나 불확실한지 정량화한다.
   - 우선 여러개의 문장을 LLM으로부터 생성하고 이들을 의미적으로 clustering한 후 각 cluster들의 발생 확률을 계산한다. cluster 발생 확률은 cluster에 속한 문장들의 확률의 합이다.
   - semantic cluster $C$의 발생 확률 기반으로 각 cluster의 불확실성을 측정하는데 이때 사용되는 것이 entropy이다. cluster들이이 얼마나 골고룰 분포되는지에 따라 entropy의 값이 달라진다.

## 2. Entailment estimator

Entailment estimator는 앞서 기술한 Semantic Entropy계산 과정 중 Semantic Clustering에 사용된다. 의미적으로 문장을 clustering하기 위해서는 각 문장들이 서로 entailment([함의](https://finddme.github.io/linguistik%20%7C%20germanistik/2020/12/13/Pragmatik/#--implikationen%ED%95%A8%EC%9D%98)) 관계에 있는지 알아야 한다.

함의 감지 방법은 두 가지이다.:

### 2.1 Instruction-tuned LLM 사용
  LLaMA 2, GPT-3.5 (Turbo 1106), GPT-4와 같은 언어 모델을 사용하여 두 답변 사이의 함의를 예측한다. 사용된 promot는 아래와 같다. 질무에 대한 두 답변을 제시하고 두 답변의 관계를 묻는다. 두 답변의 관계는 entailment(함의), contradiction(모순), neutral(중립) 중 하나로 선택하도 요청한다.

  ```
  We are evaluating answers to the question {question}
  Here are two possible answers:
  Possible Answer 1: {text1}
  Possible Answer 2: {text2}
  Does Possible Answer 1 semantically entail Possible Answer 2?
  Respond with entailment, contradiction, or neutral.
  ```

### 2.2  embedding similarity 측정 방식 사용

embedding similarity를 기반으로 두 문장이 얼마나 비슷한지 판단하는 task를 활용하는 방법니다. 본 논문에서는 MNLI dataset을 학습한 DeBERTa-large model을 통해 Q-A1, Q-A2 사이에 함의가 있는지 확인한다. 해당 방법은 LLM을 사용한 벙법보다 성능이 낮다.


## 3. Experiment

본 논문에서는 두 가지 task에 대해 실험을 진행했다.

### 3.1 QA and math task
  - dataset:
    - BioASQ: 생명과학 분야의 QA dataset
    - SQuAD: 위키피디아에서 문맥을 기반으로 질문에 답하는 dataset
    - TriviaQA: 퀴즈 형식의 질문-답변 dataset
    - SVAMP: 수학적 추론이 필요한 초등학교 수준의 단어 문제 dataset
    - NQ-Open: 구글 검색에서 추출된 실제 질문들을 다룬 dataset
  - model: FalconInstruct (7B/40B), LLaMA 2 Chat(7B/13B/70B), Mistral Instruct (7B)
  - Entailment estimator: LLM
  - method: model에게 context 없이 답변하도록 요청하여 hallucination을 한 후 불확실성 예측 실험 진행.
  - result:
    <center><img width="600" src="https://github.com/user-attachments/assets/cdf6f747-c52b-4b8f-bfdd-23b9c9583040"></center>
    <center><em style="color:gray;">paper</em></center><br>

### 3.2 biography-generation task
  - dataset: FactualBio(실존 인물들의 전기를 담은 dataset)
  - Entailment estimator: DeBERTa
  - method:
    1. specific factual claim을 기준으로 dataset을 분해. 이때 사용된 prompt는 아래와 같다:
      ```
      "Please list the specific factual propositions included in the answer above. Be complete and do not leave any factual claims out. Provide each claim as a separate sentence in a separate bullet point."
      ```
    2. 분해된 사실적 주장에 대해 해당 문장들이 생성될 수 있는 질문 6개를 생성
    3. 모델에 질문을 입력하고 답변을 3번 생성
      ```    
      "You see the sentence: {proposition}. Generate a list of three questions, that might have generated the sentence in the context of the preceding original text."
      ```
    4. semantic entropy 계산-> 답변 3개 + original factual claim에 대해 semantic entropy를 계산
  - result:
    <center><img width="600" src="https://github.com/user-attachments/assets/a0cdb4cb-e6f2-416f-9cbb-f8d926cd8391"></center>
    <center><em style="color:gray;">paper</em></center><br>
    

# [Additional Information] Sampling Parameters

Semantic Entropy계산 과정 중 Generateion 단계에 등장한 "different random seed(sampling parameter)" 부분의 이해를 돕기 위해 해당 내용을 정리한 부분이다. 

Sampling Parameter로는 대표적으로 Temperature가, Top-K, Top-P가 있는데 이들은 LLM의 출력을 제어하는 parameter이다. 해당 parameter를 통해 모델 출력의 일관성<->다양상 정도를 조절할 수 있다.

## Temperature

Temperature는 log probability를 조정하여 예측 신뢰도를 조절하는 parameter이다. 즉, log probability scaling을 통해 model prediction에 대한 무작위성<->신뢰성의 정도를 조절할 수 있는 parameter이다. Temperature의 값이 낮을수록 더 집중적이고 예측 가능한 답변을 한다.

- 1 이하의 Temperature
  - 모델이 특정 token을 더 확신 있게 예측하여 확률 분포가 매우 극명하게 나타나게 된다.
  - temperature가 낮을수록 next token으로 예측한 token의 probability mass가 집중된다.
  - 이 경우, 더 일관성 있는 output 생성은 가능하지만 다양성과 창의성이 떨어질 수 있다.

- 1 이상의 Temperature
  - 모델의 확신이 감소한다. 따라서 next token으로 예측한 token들에 대한 확률 질량이 고르게 퍼져 확률 분포가 평탄해진다.
  - 이 경우, 모델이 다양한 token을 sampling하기 때문에 다양한 output 생성이 가능하다.
  - 하지만 temperature가 너무 높으면 문맥에 맞지 않는 문장을 생성할 수도 있다. 

- Temperature scaling 작동 과정:
  1. model은 model이 사용하는 tokenizer의 vocab에 있는 token을 현재 time step에 대한 next token으로 예측한다. 이때 각 token들에게는 정규화 되지 않은 log probability score가 부여된다.
  2. 이 log probability score를 설정된 Temperature 값으로 나눈다. $log_prob_scaled = log_prob / temperature$
  3. 위 결과, Temperature가 1 이하일 경우에는 log probability가 극단적으로 변한다. 즉, 예측값이 높았던 애들은 더 높아지고 낮았던 애들은 더 낮아진다. 이와 같이 높은 확률과 낮은 확률 값의 차이를 증폭시켜 가능성 높은 몇몇 token에 확률을 더 집중시킨다.
  4. Temperature가 1 이상일 경우에는 반대로 log probability가 평탄하게 변하여 대부분 0에 가까워진다. 이를 통 token간의 log probability를 줄여 비교적 낮은 확률을 가진 token들에게도 기회를 주게 된다.
  5. Temperature scaling 이후 softmax 함수를 통과시켜 scaling된 log probability의 합이 1이 되도록 한다.


## Top-K

token을 예측하는 각 step마다 모델이 예측한 결과에 대해 확률을 기준으로 상위 k개의 token 안에서 출력한 token을 선택하도록 제한하는 것이다. 이와 같이 모델의 vocab을 제한함으로써 비논리적이거나 무의미한 출력을 제어할 수 있다. 

K=5인 경우:
- 모델 예측 token의 확률 분포에서 상위 5개의 token으로 vocab을 제한
- 5개의 token에 대해 확률을 re-normalize하여 각 token에 대한 확률값의 합이 1이 되도록 한다.
- 재정규화된 분포에서 다음 단어를 sampling한다.

## Top-P (Nucleus sampling)

간단하기 말하자면 sampling된 token들이 지닌 확률값의 합에 대해 threshold를 거는 것이다. 예를 들어 아래와 같은 token이 있을 때 Top-P가 0.8이면 (갈비찜, 통태전, 잡채) 중에 다음 단어를 sampling하는 것이다. 

```
갈비찜: 0.4
잡채: 0.1
통태전: 0.3
떡갈비: 0.05
```

## Sampling Parameter 작동 방식

> 이 parameter를 잘 조정하기 위해 Greedy Sampling과 Random Sampling 개념을 복기하는 것이 도움된다.<br>
> - Greedy Sampling<br>
> <br>
> 가장 높은 확률의 것을 선택하는 방법이다. 이 경우는 `Top-K=1, Temperature=1.0`이다. 이는 모델이 다음 token으로 예측한 것 중 가장 높은 확률인 것을 선택한다. 이와 같은 방법은 모델 출력의 일관성은 유지할 수 있지만 창의성 혹은 다양성을 기대하기 어렵다. <br>
> <br>
> - Random Sampling<br>
> <br>
> 말 그대로 무작위 선택이다. 이 경우는 `Top-K=50~100, Temperature=1.5~2.0`이다. 이는 모델이 예측한 token 중 확률 값을 기준으로 top 50~100 사이의 token을 무작위로 선택하는 방법이다.<br>

```
Temperature=0.8, Top-K=40, Top-P=0.8
```

1. model이 전체 vocab에 대해 정규화되지 않은 log probability를 계산한다. (vocab 전체에 대해 확률값이 할당됨.)
2. Temperature 적용
   - 모든 token들의 log probability를 0.8로 나누어 scaling한다.
   - 1보다 작은 값으로 나누었기 때문에 극단적인 확률 분포가 된다.
3. Top-K 적용
   - temperatuer scaling 적용된 확률중 상위 40개의 token을 선택한다.
4. Top-P 적용
   - 선택된 40개의 token에 대해 상위 확률 token부터 합산하여 확률 질량이 80%이 되는 token까지만 sample token에 포함시킨다.
5. 위 scaling 과정을 모두 거친 후 남은 tokend 20개라고 가정한다면, 20개의 token들에 대한 log probability를 renormalize하여 확률이 1이 되도록 만든다.
6. 이 확률분포에서 next token을 sampling한다.

# [2nd Paper] Semantic Entropy Probes: Robust and Cheap Hallucination Detection in LLMs

Farquhar et al.의 논문과 동일하게 token 수준이 아닌 의미 수준에서의 불확실성을 측정하지만 Farquhar et al.이 제안한 방법은 input query에 대해 여러번의 model generation 결과를 요구하는데 일반적으로 5-10번 사이의 generation 결과가 필요하다. 이는 5-10배의 계산 비용이 추가로 발생함을 의미하기 때문에 실용적이지 않다. 따라서 본 논문에서는 보다 실용적인 LLM hallucination detection 방식을 제안한다.

본 논문에서 제안하는 방법론의 핵심은 다음과 같다:

- hidden state에서 semantic entropy를 포착하도록 학습된 linear probe Semantic Entropy Probes (SEPs)를 제안한다.
- semantic entropy가 single model generation의 hidden sate 상태에 encoding되어 있으며, 이를 linear probe를 통해 추출 가능함을 입증한다.
- ablation study를 통해 다양한 model, task, layer, token position에 대해 SEP 선능을 실험한다. 결과적으로, 모델 내부 state들이 token을 생성하기 전에도 의미적 불확실성을 암묵적으로 포착하는 것을 확인하였다고 한다.
- SEP가 hallucination을 예측하는데 사용될 수 있으며, 이전 연구(Farquhar et al.)에서 제안된 probe보다 더 정확하고 실용적인 방법이다.

## 1.  Semantic Entropy Probes

앞서 설명한 Semantic Entropy(Farquhar et al.)는 computational cost가 높다는 단점이 있다. 이를 해결하기 위해 본 논문에서는 선형 회귀 모델(Linear Probes)을 사용하여 hidden state를 분석하여 의미적 Entropy를 예측한다. 이는 hidden state단에서 해결되기 때문에 multiple response sampling이 요구되지 않아 계산 비용이 줄어든다.

### 2.1 Training SEPs

SE probs를 학습시키기 위해 model generation의 hidden state와 semantic entropy 쌍의 dataset $(h_p^l(x), H_SE(x))$를 수집한다. 이때 $x$는 input이고, $h_p^l(x) \in \mathbb{R}^d$은 input $x$에 대한 출력을 생성할 때의 token들의 위치 $p$와 layer $l$이고($d$는 hidden state dimension), $H_SE(x)\in \mathbb{R}$은 semantic entropy이다. dataset 수집 시, input $x$에 대한 high-likelihood model response들을 greedy sampling하고 각 layer와 token position에 해당하는 hidden state들을 저장한다. high temperature (T = 1)인 상태에서 sample(N=10)을 model로부터 생성하여 $H_SE(x)$를 산출한다. 

위와 같이 수집된 dataset은 logistic regression classifier를 학습하는데 사용된다. Semantic entropy score는 real number인데 어떻게 classifier 학습에 사용될까? binary 과정을 거친 후에 학습에 사용된다. real number인 entropy score를 이진화하기 위해 threshold $\gamma$를 기준으로 높은 entropy, 낮은 entropy로 분류하였다. 

### 2.2 Probing Locations

본 논문에서는 LLM의 어느 layer($l$)에서 어느 token position $p$의 hidden state가 semantics entropy를 가장 잘 나타내는지 연구했다. 이때 두 가지 위치가 주요하게 사용된다.

- TBG (Token Before Generating): 입력 문장의 마지막 token
- SLT (Second Last Token): 모델이 생성하는 응답에서 마지막 token의 직전 token

(TBG는 모델이 generation을 만들기 전에 불확실성을 측정할 수 있기 때문에 계산비용을 더 절감할 수 있다고 한다.)

## 3. Experiment

### 3.1 Task

- short-form task:
  - 모델에게 가능한 한 짧게 답변하도록 요청한다.
  - 생성 모델로는 Llama-2 7B, 70B, Mistral 7B, Phi-3 Mini를 사용하고 DeBERTaLarge로 entailment(함의)를 예측한다.
- long-form task:
  - 완전한 문장을 생성하도록 요청하여 긴 답변을 반환하도록 요청한다.
  - 생성 모델로는 Llama-2-70B, Llama-3-70B를 사용하고 GPT-3.5를 통해 의미론적 불확실성을 예측한다.

short-form setting의 경우 SQuAD F1 스코어로 모델 정확도를 평가하고, long-form setting의 경우 GPT-4를 사용해 entailment(함의)를 예측한다.

### 3.2 Linear Probe

- scikit-learn의  logistic regression model을 사용.
  - regularization: default hyperparameters for L2
  - optimizer: LBFGS

### 3.3 Evaluation

평가에는 두 가지 기준이 적용된다.

1. Semantic Entropy를 잘 예측하는지
2. model hallucination을 잘 예측하는지

두 기준 모두 area under the receiver operating characteristic curve (AUROC)값으로 평가하며, AUROC가 높을수록 의미적 불확실성을 잘 파악한다는 것이다.

## 4.  LLM Hidden States Implicitly Capture Semantic Entropy

### 4.1 Hidden States Capture Semantic Entropy

model의 hidden state가 semantic entropy를 잘 포착하는가? 

-> 일반적으로, 모델의 후반부 레이어에서 AUROC 값이 증가하는 것으로 확인된다. 이는 **모델 후반부 layer가 semantic entropy를 잘 파악**한다는것을 의미한다.

<center><img width="600" src="https://github.com/user-attachments/assets/38dbc1ab-af8e-43a2-aa47-4835d448e76d"></center>
<center><em style="color:gray;">paper</em></center><br>

### 4.2 Semantic Entropy Can Be Predicted Before Generating

output을 생성하기 전에 semantic entropy를 예측할 수 있는가?

-> 결론: 예측할 수 있다. 아래 표는 TBG location, 즉 output을 생성하기 직전 입력 문장의 마지막 token을 처리할 때의 AUROC score이다. 보면 전반적으로 높은 점수가 나와 해당 시점에서도 semantic entropy를 예측할 수 있을 것으로 확인된다.

<center><img width="600" src="https://github.com/user-attachments/assets/7a0b7620-c672-40bc-bdf0-6a5183cdaace"></center>
<center><em style="color:gray;">paper</em></center><br>

### 4.3 Long-Form Generations and Layer Dynamics

long form generation task에 대해서 semantic entropy를 얼마나 잘 포착하는가?

-> long form generation task를 처리할 때 model의 중간 layer에서 AUROC score가 높아지는 경향이 나타났다. 논문의 저자는 마지막 layer에 가까워질수록 model이 의미적인 것보다 문법적, 어휘적 요소에 더 고려하여 다음 token을 예측하기 때문이라고 기술하였다.

### 4.4 Counterfactual Context Addition Experiment

context가 model의 semantic entropy에 영향을 미치는가?

-> 결론: 미친다. 

- context 추가 전: 문맥 없이 입력에 대한 output을 생성할 때 SEP의 semantic entropy가 매우 높아지는 것을 확인했다. semantic entropy가 높다는 것은 답을 생성할 때 의미적 불확실성이 높다는 의미이다.
- context 추가 후: 문맥 추가 후에는 model의 accuracy도 추가 전인 26%보다 현저히 높은 78%로 측정되었고 그와 동시에 SEP가 예측한 semantic entropy도 감소하였다.

위와 같은 결과는 모델에게 답변 시 도움이 되는 문맥을 추가해주면 의미적 불확실성이 줄어든다는 것을 의미한다. (RAG이 hallucination 감소에 영향을 준다는 증거가 될 수 있겠다.)

<center><img width="200" src="https://github.com/user-attachments/assets/7a2af6b1-7334-4d11-82e4-0fcda6202444"></center>
<center><em style="color:gray;">paper</em></center><br>


# Reference

> Detecting hallucinations in large language models using semantic entropy <br>
> [https://www.nature.com/articles/s41586-024-07421-0](https://www.nature.com/articles/s41586-024-07421-0)<br>
> [https://github.com/jlko/semantic_uncertainty](https://github.com/jlko/semantic_uncertainty)<br>
> [https://github.com/jlko/long_hallucinations](https://github.com/jlko/long_hallucinations)<br>
> Semantic Entropy Probes: Robust and Cheap Hallucination Detection in LLMs




