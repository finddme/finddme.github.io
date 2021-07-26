---
title: Python | Conditional/Iterative Structure
category: ETC.
tag: ETC.
---










* 목차
{:toc}














## 조건문

조건문은 주어진 조건에 따라 프로그램의 실행 방향을 결정해주는 문법이다.

### 조건문 | if


```python
'''
# 기본구조(if)

if 조건식/연산식:   # -라면 (해당 조건식/연산식이 True값을 가진다면)
   수행동작        # 이것을 수행하고 (동일한 들여쓰기 안에 포함된 동작이 한번에 실행됨.)

                 # 조건에 충족하지 않으면 실행되지 x
'''

'''
# 들여쓰기
조건문은 들여쓰기를 기준으로 동작이 수행된다. 동일한 들여쓰기 안에 포함된 구문들이 한번에 실행된다.
들여쓰기는 조건문, 반복문 등의 문법에서 명령어의 종료를 알리는 콜론(:) 이후의 다음 줄부터 적용된다.
동일한 명령에 대한 수행동작은 동일한 들여쓰기를 유지해야 한다.
'''
```


```python
score = 85
if score >= 80:    # score가 80이상이면
    print("good")  # "good"를 출력해라
```

    output: good
    


```python
# 조건문에서 연산자는 and와 or 등을 통해 여러번 사용될 수 있다. 
# 즉, 여러개의 수식이 조건으로 사용될 수 있다.

b = int(input("점수: ")) # input()을 통해 사용자가 입력한 값은 문자열로 보관되기 때문에 
                        # 숫자로 바꿔준다.

if b < 90 and b >= 80:  # b가 90미만이고 80이상이면
    print("good")       # "good"를 출력
```

    output: 점수: 88
            good
    


```python
# 리스트 안에 어떤 원소가 포함되었는지 알고 싶을 때, 조건문을 사용할 수 있다.

list1 = [1, 2, 3, 4]
if 3 in list1:
    print("3 있다")
```

    output: 3 있다
    

### 조건문 | if, else


```python
'''
# 기본구조(if, else)
else를 통해 조건문에 충족하지 않았을 경우에 수행할 동작을 입력할 수 있다.

if 조건식/연산식:   # -라면 (해당 조건식/연산식이 True값을 가진다면)
   실행명령        # 이것을 수행하고 (동일한 들여쓰기 안에 포함된 동작이 한번에 실행됨.)
else:             # 아니면, 즉 해당 조건을 만족하지 못한다면
   실행명령        # 이것을 수행한다.
'''
```


```python
a=(1, 2, 10)

if 10 in a:
  print("있다")
else:
  print("없다")
```

    output: 있다
    


```python
b = int(input("score: ")) # input()을 통해 사용자가 입력한 값은 문자열로 보관되기 때문에 
                          # 숫자로 바꿔준다.
    
if b >= 80:            # 만약 b가 80이상이면
    print("good")      # "good"을 출력하고
else:                  # 아니면
    print("try again") # "try again"을 출력
```

    output: score: 77
            try again
    

### 조건문 | if, else, elif

조건을 연쇄적으로 달고 싶을 때 elif를 사용한다.


```python
a = int(input("score: "))

if a >= 80:
    print("good")
elif a >= 70:
    print("not bad")
else:
    print("try again")
```

    output: score: 77
            not bad
    


```python
a = int(input("score: "))

if a >= 90:
    print("very good")
elif a < 90 and a >= 80:
    print("good")
elif a < 80 and a >= 70:
    print("not bad")
else:
    print("try again")
```

    output: score: 99
            very good
    

## 반복문(iterative 구문)


```python
'''
반복문에는 for문과 while문 등이 있다.

반복문은 조건을 충족했을 경우 특정 명령어를 반복적으로 수행하도록 하는 문법이다.

조건문과 비슷한데 조건문은 계단형으로 쭉쭉 내려가는 느낌이라면, 
반복문은 조건을 만족하는 범위라면 쭉쭉쭉 명령을 수행하다가
다시 올라와서 또 다른 값으로 같은 명령을 수행한다.
'''

'''
# 기본구조(for문)

for 변수명 in 반복범위  # 일반적으로 변수명은 i가 쓰인다. i는 index의 줄임말이다.
                     # 반복범위 자리에는 range, list, 문자열 등 대부분의 자료형이 들어갈 수 있다.
    수행동작
'''
```

### 반복문 | range(시작, 끝)

반복문에서 숫자범위를 표현할 때 range()함수를 통해 반복문의 반복 범위를 정할 수 있다. 


```python
for i in range(1,7): # 1부터 6까지의 범위에 걸쳐 차례대로 하나씩 i에 넣어 명령을 수행해라
                     # 배열은 0부터 시작하니까 1부터 6까지 출력하려면 
                     # 배열 0부터 7까지 출력해야 한다.
    print(i)
```

    output: 1
            2
            3
            4
            5
            6
    


```python
sum = 0
for i in range(3, 7): # 3부터 6까지의 범위를 반복하겠다.
    sum = i + sum     # 3 + 4 + 5 + 6 = 18
print(sum)
```

    output: 18
    


```python
sum = 0
for i in range(3, 10, 2): # 3부터 9까지 스탭2를 뛴다.(3, 5, 7, 9)
    print(i)
    sum = i + sum
print("result: ", sum)
```

    output: 3
            5
            7
            9
            result:  24
    

### 반복문 | 문자열


```python
count = 0
for i in "Hey World": # 해당 문자열을 반복범위로 정하여
                      # 변수 i가 이 범위를, 즉 각 문자를 하나씩 확인하며 동작을 수행한다.
    print(i)          # 띄어쓰기도 하나의 문자로 인식해서 띄어쓰기까지 출력한다. 
```

    output: H
            e
            y
     
            W
            o
            r
            l
            d
    


```python
'''
1. 해당 문자열을 i가 돌면서 하나씩 담아 동작을 수행한다.
2. i가 "o"이면
3. 1을 count해라
4. 대문자 o는 세지 않은 것을 확인할 수 있다. 파이썬은 대소문자를 구분한다.
'''

count = 0
for i in "Hey World, oh octopus's birthday is in October": # 1
    if i == "o":                                           # 2
        count = count + 1                                  # 3
print("o는", count, "개이다.")                              # 4
```

    output: o는 5 개이다.
    


```python
a = input("입력: ") # input에 들어간 값은 문자열로 기록된다.
b = a.split(" ") # 문자열을 공백(" ")을 기준으로 나눈다. 
             # split()함수는 특정 기준으로 문자열을 나눈 뒤 나눈 문자열을 리스트로 저장한다.
print(b)
print(" ")
for i in b:
    print(i)
```

    output: 입력: 식빵 바게트 샌드위치 케잌 도넛
            ['식빵', '바게트', '샌드위치', '케잌', '도넛']
     
            식빵
            바게트
            샌드위치
            케잌
            도넛
    

 ### 반복문 | 리스트


```python
sum = 0
a = [1, 3, 7, 10]
for i in a:   # 변수 i가 해당 리스트의 각 원소를 하나씩 방문하여 명령을 수행한다.
    sum = i + sum
print("result: ", sum)
```

    output: result:  21
    


```python
a = ["안녕", "나비야", "나비야", "이리", "날아", "오너라"]
for i in a:
    print(i)
```

    output: 안녕
            나비야
            나비야
            이리
            날아
            오너라
    

### 반복문 | break, continue

반복문은 continue, break구문과 함께 사용할 수 있다.

- continue구문: 반복문에서 continue를 만나면 더이상 동작을 수행하지 않고 다음 반복을 진행한다. 즉, 반복문을 돌다가 continue를 만나면 건너뛰는 것이다.

- break구문: break를 만났을 때 즉시 반복문을 벗어난다.


```python
'''
# continue구문
'''
# 1부터 10 사이에 있는 짝수들의 합을 구해보자

sum = 0
for i in range(1,11):   # 1부터 10까지의 값을 하나씩 i에 넣어 반복문을 수행한다.
    if i % 2 == 1:      # i의 값을 2로 나눈 나머지가 1이면 홀수.
        continue        # 그러니까 pass. 홀수는 pass. 
                        # 홀수일 경우에는 아래 동작이 수행되지 않음
    print(i)
    sum = i + sum
print("짝수의 합: ", sum)
```

    output: 2
            4
            6
            8
            10
            짝수의 합:  30
    


```python
'''
break구문
'''
sum = 0
for i in range(4,11): # range(4,11)은 4, 5, 6, 7, 8, 9, 10인데
    if i % 2 == 1:    # i가 홀수 일 경우 
        break         # 바로 반복문을 탈출하기 때문에
    print(i)          # i가 4를 담고 반복문을 돈 후 4를 출력하고
                      # 5를 만난 순간 print까지 오지 못하고 반복문을 탈출해버려서 4만 출력됨. 
```

    output: 4
    


```python
list1 = [2, 5, 3]

for i in list1:
    if i % 2 == 0:  # i가 짝수 일 경우 
        break       # 바로 반복문을 탈출하기 때문에
    print(i)        # i가 2를 담자마자 break를 만나 탈출해버려서 출력되는 값이 없음.
```

### 반복문 | while문

반복문에는 for문 외에 while문도 있다. 일반적으로 for문이 더 많이 사용되지만 while문이 for문보다 비교적 간단하기 때문에 알아두면 좋을 것이다.


```python
i = 0
sum = 0

while i <= 8:         # i가 8이하일 때 해당 구문은 반복한다.
    i = i + 1         # 반복문이 실행되면 i에 1을 더한다.
    if i % 2 == 1:    # i가 홀수면 
        continue      # 여기에서 끝내고 다시 돌아간다. 
    sum = i + sum     # 결론적으로 짝수일때만 sum이 수행된다.
print(sum)            # 1부터 8사이에 있는 짝수들의 합이 구해진다.
```

    output: 20
    


