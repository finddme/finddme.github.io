---
title: Python | Data Type
category: Python Basic Syntax
tag: Python Basic Syntax
---


**파이썬 자료형 개요 실습 코드: [https://github.com/finddme/Python/blob/master/Python_DataType.ipynb](https://github.com/finddme/Python/blob/master/Python_DataType.ipynb)**









* 목차
{:toc}














## 자료형 | 숫자 | 정수, 실수


```python
'''
파이썬에서는 int와 float을 따로 명시하지 않아도 자동으로 정수와 실수를 알아서 맞게 처리한다.
정수와 실수를 더하면 자동으로 실수로 처리된다.(정수는 실수에 포함되는 개념이다.)
그래서 정수형과 실수형을 같이 사용할 수 있다.
'''
# 정수형끼리 연산
a = 10
b = 20
print(a + b)
```

    output: 30
    


```python
a = 10 # 정수와
b = 20.4 # 실수의 연산
print(a + b) # 정수가 실수처리 됨. 10.0 + 20.4 이렇게
```

    output: 30.4
    


```python
'''
문자열과 실수의 연산은 불가능. 문자열을 int()나 float()를 통해 숫자로 바꾼 후에 연산해야 한다.
'''
a = "10"
b = 4
c = 3.7
d = int(a) # 왜인지 모르겠지만 파이토치와 코랩에서는 되는데 주피터에서는 안된다...
# d = float(a)
print(b + c + d)


# e = 10.9
# f = int(e)
# 는 당연히 안된다. 10.9는 정수가 아니니까. 정수 변환이 안됨.
```

    output: 17.7
    

## 자료형 | 숫자 | 16진수


```python
'''
16진수는 앞에 0x를 붙인다. x는 hexadecimal(16진수)를 의미.
'''
a = 0x00000001
b = 0x00000010
c = 0x0000000F # 16진수에서 F는 15.
d = 0xFFFFFFFF
print(a)
print(b)
print(c)
print(d) # 16진수에서 문자 하나는 4비트. 
         # 4비트가 8개니까 32비트. 32비트로 표현할 수 있는 가장 큰 숫자가 출력됨.
```

    output: 1
            16
            15
            4294967295
    

## 자료형 | 시퀀스 | 문자열, 리스트, 튜플


```python
string1 = "Hey World"
list1 = ['H', 'e', 'y', ' ', 'W', 'o', 'r', 'l', 'd']
tuple1 = ('H', 'e', 'y', ' ', 'W', 'o', 'r', 'l', 'd')
```

### 자료형 | 시퀀스 | Slicing

시퀀스 자료형은 순서를 가지며, 원소에 indexing이 되기 때문에 slicing이 가능하다.


```python
print(string1[0:3])
print(list1[0:3])
print(tuple1[0:3])
```

    output: Hey
            ['H', 'e', 'y']
            ('H', 'e', 'y')
    

### 자료형 | 시퀀스 | 개별 원소 | 접근

시퀀스 자료형의 경우, 개별 원소에 접근할 수 있다.


```python
# 반복문을 사용하여 개별 원소에 특정 변수가 접근할 수 있다.

for i in string1:
    print(i)

print("--------")
    
for i in list1:
    print(i)

print("--------")
    
for i in tuple1:
    print(i)
```

    output: H
            e
            y
     
            W
            o
            r
            l
            d
            --------
            H
            e
            y
     
            W
            o
            r
            l
            d
            --------
            H
            e
            y
     
            W
            o
            r
            l
            d
    

### 자료형 | 시퀀스 | 연산

연산자 사용도 가능하다.


```python
string2 = " 세상아"
print(string1 +string2)
```

    output: Hey World 세상아
    

### 자료형 | 시퀀스 | in

in을 사용하여 시퀀스 자료형에 해당 원소가 있는지 찾을 수 있다.


```python
print('H' in string1)
print('H' in list1)
print('H' in tuple1)
```

    output: True
            True
            True
    


```python
# 조건문을 통해서도 찾을 수 있다.
if 'o' in string1:
    print("오 있다")

print("--------")
    
if 'o' in list1:
    print("오 있다")
    
print("--------") 

if 'o' in tuple1:
    print("오 있다")
```

    output: 오 있다
            --------
            오 있다
            --------
            오 있다
    

### 자료형 | 시퀀스 | 함수 | len()

len()함수를 이용해서 자료의 길이를 구할 수 있다. 


```python
print(len(string1))
print(len(list1))
print(len(tuple1))
print(len(string1 +string2))
```

    output: 9
            9
            9
            13
    


