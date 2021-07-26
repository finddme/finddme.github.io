---
title: Python | Calculation
category: ETC.
tag: ETC.
---










* 목차
{:toc}














## 연산(calculation)

### 연산 | 사칙연산


```python
'''
a + b에서 
a와 b는 피연산자, 
+는 연산자이다.
'''

a = 5
b = 2
print("a + b =", a + b)
print("a - b =", a - b)
print("a * b =", a * b)
print("a / b =", a / b)
print("(몫만 구하고 싶다) ","a // b =", a // b)
print("(나머지만 구하고 싶다) ","a % b =", a % b)
```

    output: a + b = 7
            a - b = 3
            a * b = 10
            a / b = 2.5
            (몫만 구하고 싶다)  a // b = 2
            (나머지만 구하고 싶다)  a % b = 1
    

### 연산 | 비교연산

비교연산자로는 >, >=, <, <=와 같은 것들이 있다.

여러개의 비교연산을 수행할 때에는 and와 or과 같은 논리연산자를 이용해야 한다.

예를 들어 score가 90미만 80이상이라는 조건을 표현하고 싶을 때 '90 > score >= 80'로 입력하면 안된다. 이러한 조건은 'score < 90 and score >= 80(score가 90 미만이고 그리고 80 이상이다)'로 표현해야 한다.


```python
score = 87

print(score < 90 and score >= 80)
```

    output: True
    

### 연산 | 복소수연산


```python
a = (3 + 9j)
b = (6 + 7j)
print(a * b)
```

    output: (-45+75j)
    

### 연산 | shift연산


```python
'''
0 0 0 0 0 0 0 1
| | | | | | | |
     16 8 4 2 1
'''
a = 2 # 2는 내부적으로 00000010으로 표현된다.
print(a << 2) # 00000010에서 왼쪽으로 2번 shift하면 00001000 == 8

# 왼쪽으로 1번 shift할 때마다 2를 곱하는 것만큼 증가.
# 2에서 왼쪽으로 2번 shift했으니까 2 * (2 ** 2)

# 오른쪽으로 shift하면 반대로 2의 배수만큼 나누기되는 것.
```

    output: 8
    


```python
print(a << 3) # 2 * (2 ** 3)
```

    output: 16
    


```python
print(a >> 1) # 2 / (2 ** 1)
```

    output: 1
    


```python
print(a >> 3) # 오른쪽으로 더이상 이동할 수 없을 때 0이 출력된다.
```

    output: 0
    

### 연산 | 거듭제곱 연산


```python
a = 2
b = 4
print(a ** b) # 거듭제곱은 **를 통해 수행할 수 있다. 해당 예제의 경우 2의 4제곱이 연산된다.
```

    output: 16
    

## 연산자

### 기본 연산자
- +(add)
- -(sub)
- *(mul)
- / (div)
- % (mod(나머지 연산 / 모듈러 연산))


```python
# 문자열 + 문자열
a = "Hey "
b = "World"
print(a + b)
```

    output: Hey World
    


```python
#숫자 + 숫자
a1 = 20
b1 = 30
print(a1 + b1)
```

    output: 50
    


```python
# 문자역 + 숫자는 안됨.
print(a + a1)
```


    ---------------------------------------------------------------------------

    TypeError                                 Traceback (most recent call last)

    <ipython-input-11-13969a388522> in <module>
          1 # 문자역 + 숫자는 안됨.
    ----> 2 print(a + a1)
    

    TypeError: can only concatenate str (not "int") to str


### 연산자 | 할당 연산자


```python
'''
할당연산자는 등호(=)이다. 
컴퓨터에서 등호는 등호를 기준으로 오른쪽에 있는 값을 왼쪽에 있는 변수에 할당하겠다는 의미를 가진다.
''' 
a = 4 # 4라는 값을 a에 할당

'''
컴퓨터에서 '같다'는 등호를 두번연속 입력한 것이다(==).
'''
print(a == 9)

```

    output: False
    

### 연산자 | 증감연산자

어떤 변수의 값을 증가 혹은 감소시키는 과정을 축약한 형태이다.

+=, -=, \*=, /= 의 형태를 가진다.


```python
''' 
a = 10
a = a + 10  # a에 10만큼 더해주는 이 과정을 아래와 같이 축약할 수 있다.
'''

a = 10
a += 10
print(a)

b = 8
b *= 2
print(b)
```

    output: 20
            16
    

### 연산자 | 관계연산자

값을 비교하여 관계를 알아내는 목적으로 사용할 수 있는 연산자이다.


```python
'''
관계연산자는 숫자와 문자 모두 적용 가능하다.
'''
a = 10
b = 20

c = "안녕"
d = "안 안녕"
```

#### 연산사 | 관계연산자 | ==


```python
a == b  # a와 b가 같은지 판별한다. 

# a = b는 b라는 변수에에 들어있는 값을 a라는 변수에 넣어주겠다는 것. 즉, 등호(=)는 '할당'을 의미.
```




    output: False




```python
c == d
```




    output: False



#### 연산자 | 관계연산자 | !=


```python
a != b # a와 b가 다른지 판별.
```




    output: True




```python
c != d
```




    output: True



#### 연산자 | 관계연산자 | <, =<, >, =>


```python
a > b # a가 b보다 크냐
```




    output: False




```python
c > d # 문자열을 비교할 때는 사전순으로 비교한다. 사전상에서 먼저 나온 문자가 더 작은 것이다.
```




    output: True




```python
a < b # a가 b보다 작냐
```




    output: True




```python
c < d
```




    output: False



### 연산자 | 논리연산자

여러개의 수식을 논리적으로 연산할 수 있게 한다.

and, or, not이 있다.


```python
a = True
b = False
```

#### 연산자 | 논리연산자 | and


```python
'''
and는 말 그대로 '그리고'라는 의미이다.
'''
a and b # a그리고 b 모두 참(True)이다.
```




    output: False




```python
'''
or은 말 그대로 '혹은'이라는 의미이다.
'''
a or b # a혹은 b중 하나라도 참이 있다.
```




    output: True




```python
'''
not은 거짓(False)인지 확인한다.
'''

not a # a는 거짓이다.
```




    output: False




```python
'''
논리연산자와 관계연산자는 반복문이나 조건문에서 자주 사용된다.
'''
if 3 > 5 or 9 < 11:  # 3이 5보다 작거나 9가 11보다 작거나 둘 중 하나라도 맞으면 True.
    print("둘 중 하나는 맞음")
```

    output: 둘 중 하나는 맞음
    


