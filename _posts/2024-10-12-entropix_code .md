---
title: "Entropix (with code)⚡(작성 중)"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}










# Attention Entropy

Attention Entropy는 Entropix에서 attentino이 다양한 token에 걸쳐 얼마나 분산되어 있는지, 즉 얼마나 불확실한지 정량화하는 지표이다. 이는 attention probability를 활용하 계산된다.

```python
attention_probs = jax.nn.softmax(attention_scores, axis=-1)
attn_entropy = -jnp.sum(attention_probs * jnp.log2(jnp.clip(attention_probs, 1e-10, 1.0)), axis=-1)

```

> **Attention**은 transformer model에서 일반적으로 multi-head attention으로 구현된다. multi-head의 의미는 attention mechanism이 병력적으로 적용된다는 것이다. 이와 같이 attnetion을 병렬적으로 수행함으로써 모델이 입력을 다양한 측면으로 분석할 수 있게 한다.<br>
> Multi-head Attention을 구성하는 Attention head는 self-attention을 수행하는 유닛으로, 입력된 token과 다른 token들 간의 연관성을 계산하고 그 연관성을 기반으로 중요한 정보를 추출하는 역할을 한다. <br>
> > decoder 기반 모델에서 사용되는 masked attention의 경우, 다음 token을 예측하는 task를 수행하기 때문에 현재 step 이후의 token에 대한 정보는 차단한다. 차단 방법은 attention score를 매우 큰 음수 혹은 무한대로 설정하여 softmax 연산에서 해당 값들이 거의 0에 가깝도록 처리한다. 예를 들어 현재 step이 세 번째일때, 앞의 두 token만 참고하여 세 번째 token을 예측한다. -> 이거 학습 시의 multi head attention 작동 방식이다. <br>
> > 학습과 추론 시의 masked attention 작동 방법이 살짝 다르다.
> > ```
> > **학습**
> >  - 병렬처리: 전체 sequence가 이미 주어졌기 때문에 한번에 sequence 전체를 처리할 수 있도록 병렬처리를 한다.
> >
> > **추론**
> >  - 순차적 처리: 모델이 아직 없는 token을 새롭게 생성해야 하기 때문에 순차적으로 처리되어야 한다. (따라서 한 문장에 대한 처리가 학습할 때보다 느리다.)
> >  - masking X: 현재 time step에서 아직 생성되지 않은 이후의 token들은 없기 때문에 masking할 것이 없다. 따라서 매 단계마다 masking할 것은 따로 없고 그냥 이전 token들을 참조하여 self-attention만 수행하면 된다.
> > ```
