---
title: Python | Exeption Handling
category: ETC.
tag: ETC.
---










* 목차
{:toc}














## 예외처리(Exeption Handling)

예외처리를 통해 특정 구문에 나타난 오류를 깔끔하게 확인할 수 있다.


```python
'''
# 기본구조

try:
    동작
except:
    동작
    
-> try구문에서 어떠한 동작을 실행해보고 
   오류가 발생하면 except구문이 실행된다.
'''
```


```python
try:                             # 5를 0으로 나누려고 해본다
    print(5 / 0)
except:                          # try구문에서 오류가 발생하면 except구문을 실행한다.
    print("0으로는 나눌 수 없다")
```

    0으로는 나눌 수 없다
    

### 예외처리 | else 추가

예외가 발생하지 않았을 때 else구문을 추가해서 예외가 발생하지 않았다는 메세지를 달아줄 수 있다.


```python
a = int(input("나누어질 값: "))
b = int(input("나눌 값: "))

try:
    print(a / b)
except:
    print("나눌 수 없습니다.")
else:
    print("예외 발생 X")
```

    나누어질 값: 5
    나눌 값: 0
    나눌 수 없습니다.
    

### 예외처리 | finally 추가

finally구문은 예외 발생 여부와 무관하게 무조건 실행되는 부분이다. 


```python
a = int(input("나누어질 값: "))
b = int(input("나눌 값: "))

try:
    print(a / b)
except:
    print("나눌 수 없습니다.")
else:
    print("예외 발생 X")
finally:
    print("예외처리 종료") # 예외 발생 여부와 상관 없이 예외처리가 종료되었다는 것을 알려라
```

    나누어질 값: 4
    나눌 값: 2
    2.0
    예외 발생 X
    예외처리 종료
    

### 예외처리 | Exeption

파이썬이 제공하는 Exeption 객체를 통해 오류메세지를 받아볼 수 있다.


```python
a = int(input("나누어질 값: "))
b = int(input("나눌 값: "))

try:
    print(a / b)
except Exception as c: # 오류메세지를 c라는 변수에 담아서
    print(c)           # 출력해라
```

    나누어질 값: 3
    나눌 값: 0
    division by zero
    


```python

```
