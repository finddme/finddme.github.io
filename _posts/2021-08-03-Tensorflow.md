---
title: CODE = TRUE | Tensorflow
category: Python Basic Syntax
tag: Python Basic Syntax
---

**텐서플로우 실습 코드: [https://github.com/finddme/Python/blob/master/ML_Tensorflow1.ipynb](https://github.com/finddme/Python/blob/master/ML_Tensorflow1.ipynb)**









* 목차
{:toc}
















## Tensorflow

텐서플로우는 머신러닝 라이브러리이다. 머신러닝 구현을 간단하게 만들어준다.

(본 게시물에서는 텐서플로우 1.x버전을 사용하였다.)


```python
import tensorflow.compat.v1 as tf # 텐서플로우를 불러온다.
tf.disable_v2_behavior()
```


```python
# 버전1이 잘 돌아가는지 확인해보자
hey1 = tf.constant("Hey World")
sess1 = tf.Session()
print(sess1.run(hey1))
# 잘 돌아간다.
```

    output: b'Hey World'
    

### Tensorflow | Session

텐서플로우는 방향그래프를 기반으로하는 기계학습 라이브러리로, 이름처럼 텐서와 그의 흐름을 통해 동작한다. 내부적으로 그래프에 데이터 플로우가 형성되어 동작한다고 한다.
수행할 식을 정의한 후에 그 식에 데이터를 흘려보내는 방식으로 동작한다고 생각하면 쉽다. 


```python
a = tf.constant(20.8) # a라는 변수에 20.8이 담긴 배열(텐서)를 담아준다
b = tf.constant(18.2) # b라는 변수에 18.2가 담긴 배열(텐서)를 담아준다

c = tf.add(a, b) # c에 a와 b를 더한 값을 넣는다.
```


```python
'''
# print(c)
c를 결과를 출력하기 위해서 print(c)를 하면 그냥 텐서객체가 출력된다. 
텐서플로우의 데이터 처리 단위는 텐서이다.
c 자체는 텐서객체이기 때문에 c를 출력하면 텐서가 그대로 출력되는 것이다.
c는 add()연산을 하는 함수를 담고 있지만 아직 연산이 실행되기 전의 배열이다.
그러니까 c는 그냥 식(그래프)를 정의한 것만 담고 있는 것이다. 

c에 정의된 연산을 수행하기 위해서는 데이터의 흐름을 만들어줘야 한다.
즉, 식(그래프)는 데이터가 흐를 물길 개념인데 거기에 데이터를 흘려보내줄 역할이 필요한 것이다.

흐름을 만드는 것은 Session()이 수행한다.
'''
```


```python
# 수식을 실행하도록 하는 세션을 만든다.
sess1 = tf.Session() # 세션 객체를 만들고
sess1.run(c) # 그 세션객체가 연산식을 수행시킬 수 있도록 run을 해준다.
# run()은 살짝 방류 트리거 느낌이랄까 뭐 그런거다
```




    output: 39.0



### Tensorflow | 상수(constant)

상수는 변하지 않는 값을 의미한다. 텐서플로우에서는 constant()함수를 통해 상수를 정의할 수 있다.

constant()는 하나의 텐서자료형을 반환한다. 텐서 자료형은 일종의 배열이라고 생각하면 된다. 


```python
# a라는 변수에 하나의 텐서를 넣어준다. 
# (1이라는 원소를 가진 배열(텐서)을 변수 a에 담아준다.)
a = tf.constant(1) 
b = tf.constant(2) # 2라는 원소를 가진 배열(텐서)을 b라는 변수에 담아준다.

# add()함수를 이용해 a와 b를 더한 텐서값을 c라는 변수에 담아준다.
c = tf.add(a, b)

# 수식을 실행하도록 하는 세션을 만든다.
sess2 = tf.Session() # 세션 객체를 만들고
sess2.run(c) # 만든 Session을 이용해서 정의한 연산을 수행해준다.
```




    output: 3



### Tensorflow | 변수

상수와 크게 다르지 않은데, 변수는 변하는 값이기 때문에 변수에 대한 흐름은 초기화가 필요하다.

그래서 초기화 과정이 추가된 것 이외에는 상수와 다 똑같다.

초기화에는 global_variable_initializer()를 사용한다. 말 그대로 변수 초기화


```python
a = tf.Variable(2) # a라는 변수를 만들고 그 값을 2로 초기화해 준다.
b = tf.Variable(3) # b라는 변수를 만들고 그 값을 3으로 초기화해 준다.
c = tf.multiply(a, b) # c에는 a와 b를 곱하는 연산 식을 담아준다
# a, b, c는 아직 그냥 텐서 자료형만 가지고 있다. 아무런 연산이 진행되지 않았다.

# 세션으로 흘려보낼 데이터가 변수라면, 초기화를 해줘야 한다.
init1 = tf.global_variables_initializer()
sess3 = tf.Session() # 세션 객체를 만들고

sess3.run(init1) # 세션을 초기화해주고 
sess3.run(c) # 세션을 통해 연산을 수행한다.
```




    output: 6




```python
# 위에서 정의한 a는 변수이기 때문에 값을 바꿀 수 있다.
a = tf.Variable(8) # a라는 변수에 있는 값을 8로 초기화해주고
c = tf.multiply(a, b) # a와 b를 곱하는 연산식을 세우고

# 변수 값이 바뀌었으니까 세션을 초기화할 변수를 만들어주고
init1 = tf.global_variables_initializer() 
sess3.run(init1) # 세션을 초기화시킨 다음에
sess3.run(c) # 다시 c라는 텐서를 수행하도록 한다.
```




    output: 24



### Tensorflow | placeholder

placeholder는 다른 텐서를 할당하기 위해 사용된다.그리고 다른 텐서를 할당하는 것을 fedding이라고 한다. 그래서 placeholder로 다른 텐서를 할당 받을 준비가 된 변수는 run()을 수행할 때 feed_dict라는 속성으로 다른 텐서를 할당 받는다.

placeholder를 그릇이라고 생각하면 간단하다. 데이터를 담을 그릇

텐서 자체는 다차원 배열과 같기 때문에 placeholder로 사용할 수 있는 값도 배열이어야 한다.

- placeholder 속성:  
  placeholder(datatype, shape, name)
  
  
- feed_dicht 형태:   
  {placeholder : placeholder에 할당할 텐서}


```python
input1 = [1, 2, 3, 4, 5] # input값을 정의한다.

# x를 placeholder로 정의한다. datatype에는 float형태로 들어갈 수 있도록 한다.
x = tf.placeholder(dtype=tf.float32) 
y = x + 5 # 그래프(식)을 정의한다

# 위와 같이 입력 값과 설계된 수식을 완전히 분리함으로써 
# 보다 간단하게 데이터를 학습시키고 관리할 수 있다.

sess1 = tf.Session() # 세션을 만들고
#세션을 돌린다. y라는 수식의 x부분을 input1로 초기화를 하겠다고 feeding해준다.
# x라는 placeholder에 실질적인 값으로 input1을 넣겠다고 하는 것이다.
sess1.run(y, feed_dict={x : input1}) 
```




    output: array([ 6.,  7.,  8.,  9., 10.], dtype=float32)




```python
score1 = [70, 80, 88, 90, 97] # score1에 5팀의 첫 번째 점수를 넣는다.
score2 = [82, 94, 71, 85, 70] # score2dp 5팀의 두 번째 점수를 넣는다.

# 두 개의 placeholder를 만들어준다.
x1 = tf.placeholder(dtype = tf.float32)
x2 = tf.placeholder(dtype = tf.float32)
y = (x1 + x2) / 2 # 수식을 정의한다.

sess1 = tf.Session() # 세션을 만들고
# 실행한다. y라는 수식을 실행하는데, x1에는 score1로, x2에는 score2로 입력값을 초기화해준다.
sess1.run(y, feed_dict={x1 : score1, x2 : score2})
```




    output: array([76. , 87. , 79.5, 87.5, 83.5], dtype=float32)



