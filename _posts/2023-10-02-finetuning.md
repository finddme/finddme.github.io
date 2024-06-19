---
title: "About Fine-tuning"
category: LLM / Multimodal
tag: NLP
---







* 목차
{:toc}









Fine-tuning은 일종의 transfer learning으로, Pre-trained Model를 특정 task에 적합하도록 model에 관련 지식을 주입하는 과정이다. Fine-tuning 시에는 model의 network architecture는 그대로 두고 모델의 weight만 업데이트시킨다. 매우 많은 비용이(방대한 학습 데이터, 컴퓨터 자원, 학습 시간 등) 소요되는 full pre-training과 달리 fine-tuning은 full pre-trained 된 모델을 활용하여 비교적 효율적으로 모델을 원하는 task에 맞게 학습시킬 수 있다.

# 1. Fine-tuning Data

## 1) Data collection and selection

데이터의 품질과 적합성은 tuning 결과에 주요한 영향을 미치기 때문에 데이터 선정은 매우 중요한 과정이다. 학습의 목적에 따라 적합한 데이터는 모두 상이하다. 학습의 목적이 [Domain adaptation](https://finddme.github.io/natural%20language%20processing/2022/11/29/DAPT/)인 경우에는 해당 domain과 관련 있는 un-labelled data가 필요하다. 학습의 목적이 특정 task를 수행하는 모델 개발인 경우에는 task에 적합한 labeled data가 필요하다. labeled data의 내용과 형식은 task에 따라 달라진다.

labeled data는 un-labelled data에 비해 수집에 많은 비용이 들고, 높은 품질의 labeled dataset을 구축하기도 어렵다. 최근에는 LLM을 사용하여 labeled data를 수집하는 방법도 크게 유행하고 있다. 이와 같은 방법은 human-labeling보다 비용이 적게 들고, 시간도 적게 소요된다는 장점이 있다.

> LLM pre-training 시에는 web-crawling data가 일반적으로 사용된다. 

## 2) Data pre-processing

1. Quality-related pre-processing(데이터 품질 관련 전처리)
  - 형식 구조화, 중복 제거, 개인정보 제거 
2. Basic pre-processing in NLP (기본적인 자연어 전처리)
  - normalization: 문장 내 과도한 공백 혹은 과도한 emoji 등(노이즈)을 제거
  - tokenization: text를 token으로 변환 
  - embedding: token을 모델이 처리할 수 있는 embedding 값으로 변환
  - chunking, splitting ...

# 2. Training

Tranformers 계열의 모델은 label이 없는 데이터에 대해서도 supervised learning을 한다. 이는 un-labeled data를 입력 받아 모델 내부에서 각 모델마다 설정된 task에 맞게 데이터를 처리하여 학습에 사용하기 때문이다. 예를 들어 BERT는 입력 문장의 일부를 masking 처리하여 자체적으로 masking한 부분을 예측하며 학습을 수행하고, GPT의 경우에는 현재 시점 이후의 token들을 보지 않고 다음 token들을 예측해 나가며 학습을 수행한다. 이와 같이 알고리즘이 자체적으로 스스로 통제/감독하며 학습하는 방식을 self-supervised learning이라고 한다. 

학습은 기본적으로 loss function을 최적화 하는 model weight를 찾는 것을 목표로 한다. Pre-training 과정을 예를 들어 설명하겠다. GPT계열(decoder based model)은 학습 시 일반적으로 Causal Language Modeling(CLM, =Standard Language Modeling = Original Language Modeling)을 사용하는데, CLM 수행 시 모델은 vocabulary의 모든 token에 대한 예측 확률을 ground truth값과 비교하여 loss를 계산한다.(이때 prediction값은 1.0의 확률을 가진 sparse vector이다.) loss function은 모델의 세부 architecture에 따라 다를 수 있지만 일반적으로 cross-entropy 혹은 perplexity loss를 많이 사용한다. 모델이 loss function을 최적화하는 방식은 loss를 최소화 하는 방향으로 weight를 조정해나가는 것이다. loss를 계속 최소화하기 위해 매 iteration마다 backpropagation 과정에서 경사 하강(gradient descent)을 수행한다.

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/d9babebd-88a4-4367-bc58-f6b1b1e71314"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

> **Backpropagation, Gradient Descent**
>> neural network의 weight를 학습시킬 때 사용되는 알고리즘으로, 역으로(출력에서 입력 방향으로) 오류를 전파하여 가중치를 업데이트하는 방법이다. Backpropagation 과정은 간략하게 아래와 같다:<br>
>> 1. **Forward Pass (순전파)**: Backpropagation을 위해서는 예측값이 있어야 하니까 우선 순전파로 모델의 예측값을 구한다.
>> 2. **Loss 계산**: loss function을 통해 예측값과 실제값 간의 오를 계산한다. (cross-entropy, perplexity loss 등을 사용)<br>
>>                (오차함수(error function) = 손실함수(loss function) = 비용함수(cost function))
>> 3. **Backward Pass (역전파)**: 손실함수를 통해 산출된 전체 에러값($E$)을 출력층->입력층으로 전파하며 각 layer마다의 weight가 전체 에러값 $E$에 얼마나 영향을 미쳤는지 그 기여도를 구하하고 그걸 경사하강법에 대입하여 가중치를 업데이트 한다.
>>    1) 산출된 오차값을 출력층->입력층으로 전파하여 각 layer의 weight가 전체 오차에 얼마나 영향을 주었는지 그 기여도 Chain Rule을 통해 구한다. 이 값은 해당 layer의 weight에 대한 기울기이다.<br>
>>    2) 가중치 업데이트 공식에 산출된 기울기와 Learning Rate를 넣어 가중치를 업데이트한다. 이때 사용되는 가중치 업데이트 공식이 경사하강법이다.<br>
>>       Learning Rate는 얼마나 빨리 학습시킬지 정하는 것인데 일반적으로 0.1보다 낮은 값으로 직접 설정한다.<br>

## 2.1 Training Strategies

- Supervised Fine-tuning : labeled data로 모델 학습
- Unsupervised Fine-tuning : un-labled data로 모델 학습
- Transfer Learning : pre-trained model을 freeze 시키고 마지막 layer만 pre-trained model이 학습한 task와 동일한 task에 대해 다른 데이터로 학습시키는 것.<br>
                      (Fine-tuning은 pre-trained model을 가져와서 model parameter 전체를 작은 Learning Rate로 학습시킴)

## 2.2 Hyperparameter

- Learning Rate : 학습 시 weight update 속도를 결정하는 값으로, 매 iteration마다 weight가 얼마나 크게 조정될지를 결정하는 요소이다. 예를 들어 Learning Rate가 0.01이라면, 매 iteration마다 weight가 변화하는 양은 0.01배로 조정다.
  - Learning Rate 값이 작을 때는 모델이 천천히 학습한다. 수렴하는 데 시간이 오래 걸리지만, 최적의 값을 찾을 가능성이 높다.
  - Learning Rate 값이 클 때는 모델이 빠르게 학습한다. 하지만 너무 크면 최적의 값을 지나쳐 버리거나 학습이 불안정해질 수 있다.

- Batch Size : 모델이 학습할 때 한 번에 처리하는 데이터 샘플의 개수이다.
  - Batch Size가 작으면 한 번에 적은 양의 데이터를 처리한다. 메모리 사용량은 적지만 느리게 학습될 가능성이 높다.
  - Batch Size가 크면 한 번에 많은 데이터를 처리한다. 학습이 빠를 수 있지만 메모리 사용이 많다는 문제가 있다.

- Epochs : 모델이 전체 데이터셋을 보는 횟수이다.
  
- Warm-up Steps : 훈련 초기에 Learning Rate 점진적으로 증가시켜 안정성을 높이는 요소이다.

## 2.3 Regularization Techniques

모델 학습 시 overfitting(과적합) 방지를 위해 몇 가지 정규화 기법이 사용된다.

- Dropout : 학습 시 일 neuron을 랜덤하게 비활성화하는 기법. 이를 통해 특정 뉴런에 모델이 너무 의존하지 않도록 할 수 있고, 다양한 neuron 조합을 학습하게 되어 모델의 일반화 능력을 향상시킬 수 있다.
  예를 들어 Dropout 비율이 0.5라면, 학습 중 각 학습 단계마다 neuron의 절반을 무작위로 비활성화한다.

- Weight Decay : weight에 작은 패널티를 부과하여 weight 값이 너무 커지지 않도록 하는 방법이다. 예를 들어 Weight Decay 값이 0.01이라면, 가중치 업데이트 시 가중치 값의 1%가 패널티로 추가된다. 

- Early Stopping : validation set에서 성능 개선, 즉 loss 가 더이상 떨어지지 않을 때 학습을 중단시킨다.

## 2.4 Evaluation Metrics

- Accuracy : 전체 예측 중에서 맞게 예측한 비율을 나타내는 지표
  - $\text{Accuracy} = \frac{\text{맞게 예측한 샘플 수}}{\text{전체 샘플 수}}$
  - 분류 문제에서 자주 사용된다. 하지만 class 불균형이 있는 경우 성능을 제대로 반영하지 못한다는 한계점이 있다.

- F1 Score : precision과 recall의 조화 평균으로, Precision과 Recall의 균형을 잡아주기 때문에 불균형 데이터셋 평가에 유용하다.
  - $\text{F1 Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$

- BLEU Score : 번역 과제 평가에 많이 사용된다. 번역된 텍스트와 target 텍스트 간의 n-gram 일치를 측정한다. 

- Perplexity : 언어 모델의 예측 성능을 평가하는 지표로, 낮을수록 모델의 예측이 정확함을 의미한다.
  - $PPL = e^{-\frac{1}{N} \sum_{i=1}^{N} \log p(w_i)}$
  - 언어 모델의 생성 품질이나 자연스러운 언어생성 평가는 어렵다.

# 3. Supervised Fine-Tuning (SFT)

Pre-training 과정에서는 앞서 언급한 CLM과 같이 단순히 다음 token을 예측하는 task를 수행하며 학습이 진행된다. 하지만 보다 task/domain specific한 모델을 만들기 위해서는 supervised fine-tuning(SFT) 접근 방식 필요하다. SFT는 일반적으로 pre-trained Model에 대해 labeled data를 학습시키는 과정으로 진행된다. 예를 들어 CLM으로 학습된 모델로 conversation 혹은 instruction following 과제를 잘 수행하는 모델을 만들기 위해 이와 같은 target application을 잘 나타내는 dataset을 학습시킨다. 이렇게 학습한 모델은 특수한 요구사항 혹은 과제에 더 적합한 답변을 생성할 수 있다. 

## 3.1 Full Fine-Tuning

Pre-trained Model에 대해 Pre-trained Model이 학습한 데이터셋보다 작은 데이터로 모델 전체 layer를 다시 훈련 시키는 것이다. 즉, 모델 전체 parameter를 업데이트시키는 것이다. Full Fine-Tuning에는 몇 가지 문제점이 있다. 

1. model의 전체 layer를 학습시키기 위해서는 많은 계산비용이 요구되는데 이는 곧 긴 훈련 시간과 큰 컴퓨터 자원 요구로 이어진다.
2. Catastrophic forgetting문제 발생 가능성이 있다. 이는 모델이 모델이 새로운 task에 대해 학습하는 동안 pre-training 과정에서 배운 general knowledge를 잊어버리는 문제이다. 이는 잘 학습된 사전학습 모델을 무쓸모로 만든다.
3. 모델의 전체 wight가 업데이트되기 때문에 사전학습 모델과 동일한 크기의 모델이 서버에 또 저장되기 때문에 용량 문제가 생길 수 있다.

위와 같은 문제를 완화하기 위해 Parameter-Efficient Fine-Tuning와 같은 대안들이 많이 연구되고 있다.

## 3.2 Parameter-Efficient Fine-Tuning (PEFT)

[Parameter-Efficient Finetuning (PEFT) methods](https://finddme.github.io/llm%20/%20multimodal/2023/10/04/lora/)

## 3.3 Representation Fine-tuning (ReFT)

Pre-trained Model의 가중치는 frozen시키고, Model의 representation의 일부를 조작하여 downstream task를 해결하도록 하는 방법이다. ReFT의 종류 중 하나인 Low-rank Linear Subspace(LoReFT)는 PEFT보다 10배에서 50배 더 parmeter를 효율적으로 사용한다고 한다. 

# 4. Fine-tuning variations : RLHF/PPO, DPO, ORPO

[Fine-tuning variations : RLHF/PPO, DPO, ORPO](https://finddme.github.io/llm%20/%20multimodal/2024/04/04/finetuning_variations/)

# Reference
> https://medium.com/@aipapers/reft-representation-finetuning-for-language-models-4e804753e886
>
> https://levelup.gitconnected.com/the-5-prompt-engineering-techniques-ai-engineers-need-to-know-a208af13d8e4
>
> https://towardsdatascience.com/different-ways-of-training-llms-c57885f388ed
>
> https://medium.com/@animeshchaturvedi007/fine-tuning-large-language-models-a-comprehensive-guide-0446975dc40e
> 
> https://towardsdatascience.com/stepping-out-of-the-comfort-zone-through-domain-adaptation-a-deep-dive-into-dynamic-prompting-4860c6d16224
