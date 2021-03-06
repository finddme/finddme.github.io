---
title: Transfer Learning, Multi-task Learning
category: Natural Language Processing
tag: NLP
---

Transfer Learning과 Multi-task Learning은 둘 다 Task1과 Task2의 low level feature가 연관이 있을때 사용된다. 그리고 주로 P1을 설명하는 샘플데이터는 많은데 P2에 대한샘플 데이터가 부족할 경우에 사용된다.


## Transfer Learning

Transfer Learning은 Task1에 대해 학습한 parameter A를 Task2 학습에 도움이 된다는 가정 하에 이를 적용하여 학습하는 것이다. 예를 들어 인간 이미지를 인식하도록 학습한 parameter를 부분적으로 인간 X-ray 이미지를 인식하는 것에 사용하는 것이다. 이러한 전이학습은 edge, corner, contour 등을 감지하는 low level feature로 인해 가능하다. Task1에서 이미지의 구조를 인식하는 법을 학습한 것을 가지고 Task2의 이미지를 파악하는데 사용하는 것이다.

### Transfer Learning 적용 방법: 


1. Task1에 대해 학습한 모델의 마지막 output layer와 해당 layer의 parameter, weight 그리고 bias를 삭제하고 나머지 layer의 parameter는 고정시켜 재학습에 다시 사용한다. (새로운 Task에 적용할거니까 기존 output과 관련된 것은 지우고 학습한 내용만 빼 가는 거.)  
2. 마지막 layer를 새로 만들고 weight와 bias에 random값을 준다.
3. dataset(x, y)에는 새로운 Task와 관련된 data를 넣는다.
4. 새로운 dataset으로 NN을 다시 학습시킨다.

(Transfer Learning을 하는데 새로운 Task에 대한 dataset이 충분할 경우에는 Task1에 대해 학습한 것을 Pre-training한다고 하고, 이후 Task2에 대해 학습하는 것을 Fine Tuning한다고 한다.)

## Multi-task Learning

앞서 살펴본 Transfer Learning은 Task1과 Task2를 순차적으로 학습했다. 반면 Multi-task Learning은 Task1과 2, 3, 4…를 동시에 학습한다. 예를 들어 자율주행 자동차를 만들 경우, 여기에 사용되는 모델은 우리가 운전 할 때 운전 상황을 동시다발적으로 인지하는 것과 마찬가지로 이미지 하나가 들어왔을 때 pedestrians, cars, stop signs, traffic lights 등을 동시에 인식해야 한다. 따라서 이러한 모델을 그림으로 표현하면 아래와 같다:

<center><img width="571" alt="2021-03-06" src="https://user-images.githubusercontent.com/53667002/110192326-aa16f400-7e70-11eb-99c9-1d8cf13f07ff.png"></center>

위 그림은 $y$값을 예측하기 위해 input $x$로 output $y$ ̂을 구하는 과정을 도식화한 것인데 pedestrians, cars, stop signs, traffic lights을 동시에 인식하는 Multi-task Learning의 경우 $\hat{y}$ ̂이 4x1 vector가 된다.


(4개의 task를 각각 학습시켜 합치는 것도 가능하지만 하나의 NN을 학습시켜 4가지 Task를 수행하도록 하는 것이 성능면에서 뛰어나다고 한다.)


## Reference

> Coursera:Deep Learning Specialization(Lecture3:Structuring Machine Learning Projects)
