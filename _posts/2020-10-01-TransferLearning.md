---
title: Transfer Learning, Multi-task Learning, End-to-End deep learning
category: Deep Learning
tag: Deep Learning
---

Transfer Learning과 Multi-task Learning은 둘 다 Task1과 Task2의 low level feature가 연관이 있을때 사용된다. 그리고 주로 P1을 설명하는 샘플데이터는 많은데 P2에 대한샘플 데이터가 부족할 경우에 사용된다.


## Transfer Learning

Transfer Learning은 Task1에 대해 학습한 parameter A를 Task2 학습에 도움이 된다는 가정 하에 이를 적용하여 학습하는 것이다. 예를 들어 인간 이미지를 인식하도록 학습한 parameter를 부분적으로 인간 X-ray 이미지를 인식하는 것에 사용하는 것이다. 이러한 전이학습은 edge, corner, contour 등을 감지하는 low level feature로 인해 가능하다. Task1에서 이미지의 구조를 인식하는 법을 학습한 것을 가지고 Task2의 이미지를 파악하는데 사용하는 것이다.

### Transfer Learning 적용 방법: 


1. Task1에 대해 학습한 모델의 마지막 output layer와 해당 layer의 parameter, weight 그리고 bias를 삭제하고 나머지 layer의 parameter는 고정시켜 재학습에 다시 사용한다. (새로운 Task에 적용할거니까 기존 output과 관련된 것은 지우고 학습한 내용만 빼 가는 거.)  
2. 마지막 layer를 새로 만들고 weight와 bias를 Random initialization한다.
3. dataset(x, y)에는 새로운 Task와 관련된 data를 넣는다.
4. 새로운 dataset으로 NN을 다시 학습시킨다.

(Transfer Learning을 하는데 새로운 Task에 대한 dataset이 충분할 경우에는 Task1에 대해 학습한 것을 Pre-training한다고 하고, 이후 Task2에 대해 학습하는 것을 Fine Tuning한다고 한다.)

## Multi-task Learning

앞서 살펴본 Transfer Learning은 Task1과 Task2를 순차적으로 학습했다. 반면 Multi-task Learning은 Task1과 2, 3, 4…를 동시에 학습한다. 예를 들어 자율주행 자동차를 만들 경우, 여기에 사용되는 모델은 우리가 운전 할 때 운전 상황을 동시다발적으로 인지하는 것과 마찬가지로 이미지 하나가 들어왔을 때 pedestrians, cars, stop signs, traffic lights 등을 동시에 인식해야 한다. 따라서 이러한 모델을 그림으로 표현하면 아래와 같다:

<center><img width="571" alt="2021-03-06" src="https://user-images.githubusercontent.com/53667002/110192326-aa16f400-7e70-11eb-99c9-1d8cf13f07ff.png"></center>

위 그림은 $y$값을 예측하기 위해 input $x$로 output $y$를 구하는 과정을 도식화 한 것인데 pedestrians, cars, stop signs, traffic lights를 동시에 인식하는 Multi-task Learning의 경우 $\hat{y}$가 4x1 vector가 된다.


(4개의 task를 각각 학습시켜 합치는 것도 가능하지만 하나의 NN을 학습시켜 4가지 Task를 수행하도록 하는 것이 성능면에서 뛰어나다고 한다.)

## End-to-End deep learning

End-to-End deep learning은 기존의 Pipeline방식으로 여러 단계를 거치던 것을 하나의 NN으로 실현한 방식으로, 최근 크게 발전하고 있는 deep learning방식이다. 예를 들어 Pipeline방식을 통해 음성인식을 학습할 경우, input x에 대해 feature를 직접 추출한 후 머신러닝 모델로 음소를 추출하고 그 음소를 단어형태로 만들고 그 단어들로 문장을 만들었다. 하지만 deep learning에서는 End-to-End 방식을 적용하여 하나의 NN을 학습시켜 위 과정을 한번에 진행할 수 있게 한다. 


이러한 End-to-End는 모델의 설계를 간소화시켜 시간을 단축하게 해주는 반면 feature를 직접 추출하지 않기 때문에 x->y 매핑에 필요한 데이터가 충분히 필요하다. 따라서 기존의 방식에서 사용되는 data보다 훨씬 더 많은 양의 data를 필요로 한다는 단점이 있다. 그렇기 때문에 data의 양이 적다면 hand-designed feature를 뽑아서 머신러닝을 돌리는게 더 낫다. 그리고 feature 추출에 관여할 수 없기 때문에 학습하고자 하는 x->y매핑 데이터 선택에 있어 신중해야 한다. 즉, 모델을 통해 얻고자하는 바가 무엇인지 정확히 파악하고 그에 맞는 데이터를 사용해야 한다는 것이다.



## Reference

> Coursera:Deep Learning Specialization(Lecture3:Structuring Machine Learning Projects)
