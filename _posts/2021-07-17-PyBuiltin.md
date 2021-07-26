---
title: Python | Built in function
category: ETC.
tag: ETC.
---










* 목차
{:toc}














## 내장함수

파이썬은 다양한 내장함수를 지원한다. 파이썬의 기본 내장함수를 통해 프로그램을 비교적 간단하게 작성할 수 있다.

문자열, 리스트, 튜플, 딕셔너리 자료형들도 다양한 내장함수를 가진다.

### 내장함수 | input()

사용자로부터 콘솔로 입력을 받을 수 있게 하는 함수이다.

사용자로부터 입력받은 값은 문자열로 처리가 된다.


```python
i = input("숫자를 입력하세요") # "숫자를 입력하세요: "창에 숫자를 입력하면, 입력한 숫자가 i에 들어간다.
print(i) # i에 들어간 숫자를 출력
```

    output: 숫자를 입력하세요: 4
            4
    


```python
j = input("j: ")
k = input("k: ")
print(j + k) # 문자열로 들어간다. 그래서 숫자 연산이 안된다.
```

    output: j: 33
            k: 3
            333
    


```python
user_input = input("정수를 입력하세요: ") # 사용자가 입력한 내용이 user_input에 할당된다.
# input()으로 입력받은 내용은 문자열로 처리되기 때문에 
# 연산을 위해 int()함수를 통해 숫자로 바꿔준다.
print("제곱:", int(user_input) ** 2) 
```

    output: 정수를 입력하세요: 3
            제곱: 9
    

### 내장함수 | int(문자열/실수)

int()함수는 정수 자료형으로 변환해주는 함수이다. 문자열, 실수 등을 정수로 바꿔준다.


```python
a = "123"
b = 12.3 # 실수형을 정수형으로 변경하면 소수점 이하는 탈락된다.
print(int(a), int(b))
```

    output: 123 12
    

### 내장함수 | float(문자열/정수)

문자열, 정수 등을 실수로 바꿔준다.


```python
c = 10
print(float(c))
```

    output: 10.0
    

### 내장함수 | max(시퀀스 자료형), min(시퀀스 자료형)

시퀀스 자료형에 포함된 원소의 최댓값 혹은 최솟값을 구하는 함수이다.


```python
list1 = [2 ,4 ,9, 11, 8, 3, 15] # 시퀀스 자료형 중 하나인 list 자료형을 하나 만든다.
# list자료형의 최댓값과 최솟값을 구한다.
print(" max:", max(list1),"\n","min:", min(list1))
```

     output: max: 15 
            min: 2
    


```python
list2 = ['A', 'B', 'C', 'D', 'E'] # 문자의 경우 사전상 앞에 나올 수록 작은 값이다.
print(" max:", max(list2),"\n","min:", min(list2))
```

     output: max: E 
            min: A
    

### 내장함수 | bin(10진수), hex(10진수)

bin()함수는 10진수를 2진수로 변환할 때 사용되고,

hex()함수는 10수를 16진수로 변환할 때 사용된다.

두 함수의 반환값은 문자열이라는 점 유의.


```python
print(bin(256)) # 256이라는 수를 2진수로 변환
# -> 0b100000000
#     |
#     binary의 약자. 이 값은 2진수라는 것을 알리는 문자이다.
```

    output: 0b100000000
    


```python
print(hex(1000)) # 1000이라는 수를 16진수로 변환
# 0x3e8
#  |
#  hexadecimal의 약자. 이 값은 16진수라는 것을 알리는 문자이다.
```

    output: 0x3e8
    


```python
# 2진수와 16수를 10진수를 변환하려면 int()함수를 써준다.
# int('2진수/16진수 문자',해당 값의 진수)
print(int('0xe6', 16)) # 16진수인 '0xe6'를 10진수로 바꾸겠다.
print(int('0b10000000', 2)) # 2진수인 '0b10000000'를 10진수로 바꾸겠다.
```

    output: 230
            128
    

### 내장함수 | round(실수)

round()함수는 반올림을 해주는 함수이다.


```python
print(round(123.8)) # 123.8을 반올림하겠다
```

    output: 124
    


```python
# round()함수의 두 번째 매개변수를 통해 소수점 몇 번째 자리에서 반올림하겠다고 정할 수 있다.
# 이 매개변수는 0이 기본이다. 입력하지 않으면 소수점 1번째 자리에서 반올림한다.
print(round(123.8, 0))
```

    output: 124.0
    


```python
# 소수점 3번째 자리에서 반올림하겠다.
print(round(123.879, 2))
```

    output: 123.88
    


```python
# -1을 넣으면 소수점 이상 1번째 자리에서 반올림한다.
print(round(123, -1))
```

    output: 120
    

### 내장함수 | type(자료형)

type()함수는 자료형의 종류를 알려주는 함수이다.


```python
# 다양한 자료형을 만들고
i = 1
s = "문자열"
l = ['리', '스', '트']
d = {}
d['안녕'] = 'Hello'

# type()함수에 넣어보자
print("i:", type(i), "s:", type(s), "l:", type(l),"d:", type(d))
```

    output: i: <class 'int'> s: <class 'str'> l: <class 'list'> d: <class 'dict'>
    


