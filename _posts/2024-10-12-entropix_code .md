---
title: "Entropix (with code)⚡(작성 중)"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}










# Attention Entropy

Attention Entropy는 Entropix에서 attentino이 다양한 token에 걸쳐 얼마나 분산되어 있는지, 즉 얼마나 불확실한지 정량화하는 지표이다. 이는 attention probability를 활용하 계산된다. 

Attention Entropy가 높으면 불확실성이 높은 거. (모델의 attention이 많은 token들에 걸쳐 분산되어 있다는 거니까.)

Attention Entropy가 낮으면 불확실성이 낮은 거. (모델이 특정 token들이 집중적으로 attention하고 있다는 거니까.)

```python
attention_probs = jax.nn.softmax(attention_scores, axis=-1)
attn_entropy = -jnp.sum(attention_probs * jnp.log2(jnp.clip(attention_probs, 1e-10, 1.0)), axis=-1)

```

> **Attention**은 transformer model에서 일반적으로 multi-head attention으로 구현된다. multi-head의 의미는 attention mechanism이 병력적으로 적용된다는 것이다. 이와 같이 attnetion을 병렬적으로 수행함으로써 모델이 입력을 다양한 측면으로 분석할 수 있게 한다.<br>
> Multi-head Attention을 구성하는 Attention head는 self-attention을 수행하는 유닛으로, 입력된 token과 다른 token들 간의 연관성을 계산하고 그 연관성을 기반으로 중요한 정보를 추출하는 역할을 한다. <br>
> > decoder 기반 모델에서 사용되는 masked attention의 경우, 다음 token을 예측하는 task를 수행하기 때문에 현재 step 이후의 token에 대한 정보는 차단한다. 차단 방법은 attention score를 매우 큰 음수 혹은 무한대로 설정하여 softmax 연산에서 해당 값들이 거의 0에 가깝도록 처리한다. 예를 들어 현재 step이 세 번째일때, 앞의 두 token만 참고하여 세 번째 token을 예측한다. -> 이거 학습 시의 multi head attention 작동 방식이다. <br>
> > 학습과 추론 시의 masked attention 작동 방법이 살짝 다르다.
> > > 
> > > **학습**<br>
> > >  - 병렬처리: 전체 sequence가 이미 주어졌기 때문에 한번에 sequence 전체를 처리할 수 있도록 병렬처리를 한다.
> > >
> > > **추론**<br>
> > >  - 순차적 처리: 모델이 아직 없는 token을 새롭게 생성해야 하기 때문에 순차적으로 처리되어야 한다. (따라서 한 문장에 대한 처리가 학습할 때보다 느리다.)
> > >  - masking X: 현재 time step에서 아직 생성되지 않은 이후의 token들은 없기 때문에 masking할 것이 없다. 따라서 매 단계마다 masking할 것은 따로 없고 그냥 이전 token들을 참조하여 self-attention만 수행하면 된다.
> > >

## Sampling

Attention Entropy가 높으면 sampling 탐색 범위를 넓혀야 한다.

# Attention Agreement

Attention Agreement는 서로 다른 attention head 간의 attention pattern이 얼마나 일관성있는지 측정한 것이다. 각 head의 attention distribution을 평균 attention distribution과 비교하여 계산된다.

낮은 agreement는 각 head들이 각각 다른 측면에 집중하고 있음을 나타낸다. 이것은 모델이 context를 모호하게 받아들이고 있음을 의미한다.

```python
mean_attention = jnp.mean(attention_probs, axis=1)
agreement = jnp.mean(jnp.abs(attention_probs - mean_attention[:, None, :]), axis=(1, 2))
```

## Sampling

Attention Agreement가 낮으면 temperature나 top-k paramerter를 조정해야 한다. 

# Interaction Strength

Interaction Strength는 token 간의 결속력/token 관계의 강도 등을 나타낸다. Interaction Strength은 transformer model의 layer, head, position에서 attention score의 절대값 평균이다. 산출 방법은 아래와 같다:

1. Attention Score 추출

   transformer model의 모든 layer와 head에서 raw attention score롤 추출한다.

2. 절대값 적용

   attention score 값 자체에 집중하기 위해 score의 절대값을 구한다.

3. 평균 계산

   이 절대값들의 평균을 모든 dimension(layers, heads, positions)에 대해서 계산한다.

```python
interaction_strength = jnp.mean(jnp.abs(attention_scores), axis=(1, 2, 3))
```

## Sampling

- Temperature 조정: Interaction Strength가 높다는 것은 token들 간의 관계가, context가 강하게 연결되어 있음을 의미한다. 따라서 더 다양한 출력을 유도하기 위해 temperature가 증가시킬 수 있다.

- Top-k: token 관계의 강도에 따라 후보 token 수를 조정

- 상호작용 강도가 높은 상황에서는 복잡한 token간 관계를 포착하기 위해 sampling 전략으로 더 많은 탐색적으로 parameter 조



