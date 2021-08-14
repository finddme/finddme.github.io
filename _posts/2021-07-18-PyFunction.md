---
title: Python | Function
category: Python Basic Syntax
tag: Python Basic Syntax
---

**함수 실습 코드: [https://github.com/finddme/Python/blob/master/Python_Function.ipynb](https://github.com/finddme/Python/blob/master/Python_Function.ipynb)**









* 목차
{:toc}














## 함수(Function)

특정 동작을 수행하는 소스코드를 묶어서 언제든지 사용할 수 있게 하는 것. 

> 내장 함수: 라이브러리에 이미 만들어져 있는 함수.

> 사용자 정의 함수: 사용자가 직접 정의해서 사용하는 함수.


```python
'''
함수는 프로그램 내에서 입력(매개변수)를 받아 명령을 수행하여 결과를 출력하는 모듈이다.
'''
```

### 함수 | 정의

def(define. 정의한다)라는 키워드를 통해 함수를 정의. 반복되는 소스코드를 함수로 정의해 놓으면 소스코드의 반복을 줄여 효율적인 코드를 만들 수 있다. 함수는 간결하게 정의할 수록 좋다.


```python
'''
함수 정의 방법:

def 함수명(매개변수):     # def 뒤에 함수 이름을 적는다. 매개변수(전달할 값)를 넣는다. colon(:)을 찍는다.
    명령문              # 명령문을 쓴다.
    .  
    .  
    .  
    return 값          # return을 통해 함수 수행 결과를 반환한다.

# 매개변수는 해당 함수 안에서만 처리된다. 함수 동작에 필요 없으면 안 적어도 된다.
# 반환할 값이 없으면 retrun문이 없어도 된다.

# 매개변수와 반환값은 여러개일 수 있다.
'''
```


```python
def hey_world(): # hey_world라는 함수를 정의한다.
  print("Hey") # hey_world라는 이름의 함수가 수행할 동작은 Hey World를 출력하는 것이다.
  print("World")

hey_world()
```

    output: Hey
            World
    


```python
'''
1. a_b_sum이라는 함수를 정의한다. 이 함수가 실행될 때 매개변수 b를 받도록 한다. 
   (어떤 변수를 받아 그 변수를 b에 넣는다.)
2. 이 함수는 변수 a와 b를 합해 변수 c에 넣는 동작을 수행한다.
3. 변수 c를 반환한다.
4. 7을 해당 함수에 매개변수로 넣어 처리된 값을 출력한다.(7은 변수 b에 넣어진다.)
'''


a = 10
def a_b_sum(b):   # 1
  c = a + b       # 2
  return(c)       # 3

print(a_b_sum(7)) # 4
```

    output: 17
    


```python
# 함수 안에서 바로 출력하도록 만들 수 있다.
def add(a,b):
  c = a + b
  return c

print(add(3,5))

print("--------")

# return구문이 없을 수도 있다. 함수 안에서 출력까지 진행될 수 있다.
def sum(a,b):
  c = a + b 
  print(c) # 이렇게 함수 안에서 바로 출력하도록 만들면 된다.

sum(3,5)
```

    output: 8
            --------
            8
    


```python
# return의 값으로는 값과 수식 모두 들어갈 수 있다.
# 함수가 간결해진다. 함수는 간결할 수록 좋다.

def add2(a,b):
  return a + b 

print(add2(3,4))

print("--------")

def add3(a,b):
  print(a + b)

add3(3,4)
```

    output: 7
            --------
            7
    

### 함수 | 호출

정의한 함수는 '함수명(매개변수)'를 통해 호출할 수 있다. 

> 매개변수는 '전달할 값'으로, 함수에 전달할 값이 없으면 함수 정의 시 공란으로 두면 된다. 그러면 호출할 때도 매개변수가 요구되지 않는다.

> 함수 호출 시 입력하는 매개변수의 개수는 함수 정의 시 제시한 매개변수의 개수와 동일해야 한다.**굵은 텍스트**


```python
def add_3_1(a, b, c):
  d = a + b + c 
  return d

print(add_3_1(1,2,3))
```

    output: 6
    


```python
def add_3_2(a, b, c):
  return a + b +c

print(add_3_2(1,2,3))
```

    output: 6
    


```python
def add_3_3(a, b, c):
  d = a + b + c
  print(d)

add_3_3(1,2,3)
```

    output: 6
    

### 함수 | 가변인자

함수의 매개변수가 가변적일 수 있을 때 가변인자가 사용된다.

즉, 매개변수가 1개일 수도, 4개일 수도 있을 때 가변인자를 매개변수로 사용한다.


```python
'''
가변인자는 포인터기호(*)를 사용하여 표기한다.

가변인자로 다수의 매개변수가 입력될 경우, 
해당 입력은 함수 내에서 튜플형태로 처리된다.
'''
```


```python
# 어떤 데이터가 들어왔을 때 그것을 그대로 출력하는 함수를 만들어보자.
def Variable_factor(*data):
    print(data)

Variable_factor(1,2,3,4,5) 
# 가변인자로 들어간 매개변수가 튜플형태로 처리된 것을 확인할 수 있다.
```

    output: (1, 2, 3, 4, 5)
    

### 함수 | 지역변수, 전역변수

> 지역변수: [함수 안에 있는 변수] 사용자가 정의한 함수 내에서 선언한 변수. 해당 함수가 실행되는 동안에만 유효하다. 함수가 끝나면 없어지는 변수.

> 전역변수: [함수 밖에 있는 변수] 프로그램 내에서 항상 사용 가능한 변수.


```python
a = 10 # -> a: 전역 변수. 함수 밖에 있으니까. 
       # 프로그램 전체에서 사용 가능.
def square(): # -> b는 지역변수. 함수 안에 있으니까. 함수가 종료되면 유효하지 않은 변수.
  b = a * a 
  return(b) 
c = 30 + square() # -> c는 전역변수
print(c)
```

    output: 130
    


```python
'''
지역변수는 함수가 종료되면 유효하지 않다.
따라서 add의 매개변수로 a가 들어가 함수 내부에서 2 + 5가 수행되었다고 해도
함수를 벗어나면 a는 그대로 2이기 때문에 a를 출력하면 2가 출력된다.
'''
def add(a):  # 여기 있는 a는 지역변수
    a = a + 5  # 여기 있는 a는 지역변수

a = 2  # 여기 있는 a는 전역변수
add(a) # 여기 있는 a는 지역변수
print(a) # 여기 있는 a는 전역변수
```

    output: 2
    


```python
'''
함수 내부에서 처리된 a를 반환해보면 2 + 5가 수행된 값이 출력된다.
그리고 함수 외부의 a는 여전히 2이다.
'''
def add(a):  
    a = a + 5
    print("함수 내부 a: ", a)

a = 2  
add(a)
print("함수 외부 a: ", a)
```

    output: 함수 내부 a:  7
            함수 외부 a:  2
    

### 함수 | global

함수 내에서 전역변수를 불러와 사용하고 싶다면 global 키워드를 사용하면 된다.


```python
def add():
    global a  # global을 통해 a라는 전역변수를 사용하겠다고 명시.
    a = a + 5
    print(a)

a = 2
add() # 외부의 변수를 끌어다 쓰기 때문에 매개변수 없이 함수 수행 가능.
```

    output: 7
    

### 함수 | 복수 반환

함수의 반환값은 여러개일 수 있다. 

반환값이 여러개일 경우 tuple형태로 반환된다.


```python
def multiple_return(): # 하나의 함수가
    a = 1
    b = [3, 4, 5]
    c = (8, 9)
    d = "여러개"
    return a, b, c, d  # 여러개의 값을 한번에 반환할 경우

print(multiple_return()) # 반환값은 튜플형태가 된다.

# 해당 함수의 반환값을 각각 뽑아보고 싶을 때는 
# 콤마(,)로 각 값을 담을 변수를 초기화하여
# 차례대로 첫 번째 반환값은 첫 번째 변수에, 
# 두 번째 반환값은 두 번째 변수에 담긴다.
v, d, t, b= multiple_return()

print(v) # 위에서 담은 변수를 출력해보면 함수의 반환값들이 출력된다.
print(d)
print(t)
print(b)
```

    output: (1, [3, 4, 5], (8, 9), '여러개')
            1
            [3, 4, 5]
            (8, 9)
            여러개
    

## 람다(lambda)

람다는 함수의 형태를 더 간결하게 쓸 수 있게하는 문법이다.

```python
'''
람다식은 lambda 키워드를 이용하여 매개변수를 지정하고, 그 결과를 설정하는 형식을 지닌다

lambda 매개변수 : 수행동작
'''
```

```python
# add라는 변수에 lambda식을 할당한다. 
# 이 lambda식은 매개변수 x, y를 받아서 x + y동작을 수행한다.
add = lambda x, y : x + y 
print(add(4,9)) # lambda식이 할당된 add라는 변수는 함수로 기능한다.
````
    
    output: 13
    

### 람다 | map(lambda식이 담긴 변수, 리스트, 리스트)

map()함수를 통해 다수의 원소를 가진 자료형이 lambda식으로 만들어진 함수의 매개변수로 사용될 수 있다.

map()함수는 각 자료형 내의 특정 인덱스에 해당하는 각 원소들끼리 lambda의 수행동작을 수행하도록 한다.

결과는 map객체로 반환한다. 리스트로 받으려면 list()함수를 써야한다.

```python
'''
list1 = [1, 2, 3, 4]
         |  |  |  |
list2 = [5, 6 ,7, 8]

인덱스 짝꿍끼리 동작수행
'''
```

```python
list1 = [1, 2, 3, 4]
list2 = [5, 6 ,7, 8]

# add_list라는 변수에 a, b를 매개변수로 받아 a + b를 수행하는 람다식을 담아준다.
add_list = lambda a, b: a + b
# 다수의 원소를 가진 자료형에 해당 함수를 적용하기 위해 map()함수를 쓴다.
# list1과 list2의 각 원소에 add_list함수를 적용해서 수행 결과를 M이라는 변수에 넣는다.
M = map(add_list, list1, list2)
# M에 담긴 결과는 map object이기 때문에 list()함수를 사용해서 리스트 형태로 만든다
M_list = list(M) 
print(M_list)
```

    output: [6, 8, 10, 12]
