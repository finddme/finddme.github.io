---
title: Language Model Summary
category: Natural Language Processing
tag: NLP
---
**Transformer 실습 코드: [https://finddme.github.io/natural%20language%20processing/2019/11/20/TransformerCode/](https://finddme.github.io/natural%20language%20processing/2019/11/20/TransformerCode/)**







* 목차
{:toc}









최근 자연어처리 분야에서는 대용량의 corpus를 학습한 LM 뒤에 downstream task를 붙여 특정 task를 풀 수 있도록 하는 방법론이 많이 사용된다. Language Model(LM)은 대용량의 unlabeled data를 학습하여 언어 자체에 대한 feature를 학습한 모델이다. 최근 LM의 학습에 사용되는 task는 크게 masked language modeling과 language modeling이 있다. 전자의 경우는 입력된 text의 일부 token에 대해 masking처리를 한 후, 앞뒤 문맥을 통해 masking token의 original token을 예측하는 task로, bert계열의 model들이 이러한 방식으로 학습된다. 후자는 token들을 하나씩 집어넣어서 첫 번째 token을 기반으로 다음 token을 예측하고 그 token을 가지고 다음 token을 예측하는 것을 sequence가 끝날 때까지 반복하는 방식으로 학습하는 task이다. 이 방법론은 gpt계열의 model에서 주로 사용된다.
