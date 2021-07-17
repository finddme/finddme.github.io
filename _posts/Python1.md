```python
pip install nbconvert
```

    Requirement already satisfied: nbconvert in c:\users\yein4\anaconda3\lib\site-packages (6.0.7)
    Requirement already satisfied: entrypoints>=0.2.2 in c:\users\yein4\anaconda3\lib\site-packages (from nbconvert) (0.3)
    Requirement already satisfied: testpath in c:\users\yein4\anaconda3\lib\site-packages (from nbconvert) (0.4.4)
    Requirement already satisfied: traitlets>=4.2 in c:\users\yein4\anaconda3\lib\site-packages (from nbconvert) (5.0.5)
    Requirement already satisfied: defusedxml in c:\users\yein4\anaconda3\lib\site-packages (from nbconvert) (0.7.1)
    Requirement already satisfied: pygments>=2.4.1 in c:\users\yein4\anaconda3\lib\site-packages (from nbconvert) (2.8.1)
    Requirement already satisfied: jupyterlab-pygments in c:\users\yein4\anaconda3\lib\site-packages (from nbconvert) (0.1.2)
    Requirement already satisfied: bleach in c:\users\yein4\anaconda3\lib\site-packages (from nbconvert) (3.3.0)
    Requirement already satisfied: pandocfilters>=1.4.1 in c:\users\yein4\anaconda3\lib\site-packages (from nbconvert) (1.4.3)
    Requirement already satisfied: nbclient<0.6.0,>=0.5.0 in c:\users\yein4\anaconda3\lib\site-packages (from nbconvert) (0.5.3)
    Requirement already satisfied: nbformat>=4.4 in c:\users\yein4\anaconda3\lib\site-packages (from nbconvert) (5.1.3)
    Requirement already satisfied: jupyter-core in c:\users\yein4\anaconda3\lib\site-packages (from nbconvert) (4.7.1)
    Requirement already satisfied: jinja2>=2.4 in c:\users\yein4\anaconda3\lib\site-packages (from nbconvert) (2.11.3)
    Requirement already satisfied: mistune<2,>=0.8.1 in c:\users\yein4\anaconda3\lib\site-packages (from nbconvert) (0.8.4)
    Requirement already satisfied: MarkupSafe>=0.23 in c:\users\yein4\anaconda3\lib\site-packages (from jinja2>=2.4->nbconvert) (1.1.1)
    Requirement already satisfied: jupyter-client>=6.1.5 in c:\users\yein4\anaconda3\lib\site-packages (from nbclient<0.6.0,>=0.5.0->nbconvert) (6.1.12)
    Requirement already satisfied: async-generator in c:\users\yein4\anaconda3\lib\site-packages (from nbclient<0.6.0,>=0.5.0->nbconvert) (1.10)
    Requirement already satisfied: nest-asyncio in c:\users\yein4\anaconda3\lib\site-packages (from nbclient<0.6.0,>=0.5.0->nbconvert) (1.5.1)
    Requirement already satisfied: python-dateutil>=2.1 in c:\users\yein4\anaconda3\lib\site-packages (from jupyter-client>=6.1.5->nbclient<0.6.0,>=0.5.0->nbconvert) (2.8.1)
    Requirement already satisfied: tornado>=4.1 in c:\users\yein4\anaconda3\lib\site-packages (from jupyter-client>=6.1.5->nbclient<0.6.0,>=0.5.0->nbconvert) (6.1)
    Requirement already satisfied: pyzmq>=13 in c:\users\yein4\anaconda3\lib\site-packages (from jupyter-client>=6.1.5->nbclient<0.6.0,>=0.5.0->nbconvert) (20.0.0)
    Requirement already satisfied: pywin32>=1.0 in c:\users\yein4\anaconda3\lib\site-packages (from jupyter-core->nbconvert) (227)
    Requirement already satisfied: jsonschema!=2.5.0,>=2.4 in c:\users\yein4\anaconda3\lib\site-packages (from nbformat>=4.4->nbconvert) (3.2.0)
    Requirement already satisfied: ipython-genutils in c:\users\yein4\anaconda3\lib\site-packages (from nbformat>=4.4->nbconvert) (0.2.0)
    Requirement already satisfied: attrs>=17.4.0 in c:\users\yein4\anaconda3\lib\site-packages (from jsonschema!=2.5.0,>=2.4->nbformat>=4.4->nbconvert) (20.3.0)
    Requirement already satisfied: pyrsistent>=0.14.0 in c:\users\yein4\anaconda3\lib\site-packages (from jsonschema!=2.5.0,>=2.4->nbformat>=4.4->nbconvert) (0.17.3)
    Requirement already satisfied: importlib-metadata in c:\users\yein4\anaconda3\lib\site-packages (from jsonschema!=2.5.0,>=2.4->nbformat>=4.4->nbconvert) (3.10.0)
    Requirement already satisfied: setuptools in c:\users\yein4\anaconda3\lib\site-packages (from jsonschema!=2.5.0,>=2.4->nbformat>=4.4->nbconvert) (52.0.0.post20210125)
    Requirement already satisfied: six>=1.11.0 in c:\users\yein4\anaconda3\lib\site-packages (from jsonschema!=2.5.0,>=2.4->nbformat>=4.4->nbconvert) (1.15.0)
    Requirement already satisfied: packaging in c:\users\yein4\anaconda3\lib\site-packages (from bleach->nbconvert) (20.9)
    Requirement already satisfied: webencodings in c:\users\yein4\anaconda3\lib\site-packages (from bleach->nbconvert) (0.5.1)
    Requirement already satisfied: typing-extensions>=3.6.4 in c:\users\yein4\anaconda3\lib\site-packages (from importlib-metadata->jsonschema!=2.5.0,>=2.4->nbformat>=4.4->nbconvert) (3.7.4.3)
    Requirement already satisfied: zipp>=0.5 in c:\users\yein4\anaconda3\lib\site-packages (from importlib-metadata->jsonschema!=2.5.0,>=2.4->nbformat>=4.4->nbconvert) (3.4.1)
    Requirement already satisfied: pyparsing>=2.0.2 in c:\users\yein4\anaconda3\lib\site-packages (from packaging->bleach->nbconvert) (2.4.7)
    Note: you may need to restart the kernel to use updated packages.
    


```python
jupyter nbconvert --to markdown Python1.ipynb
```


      File "<ipython-input-7-77bb438ae44b>", line 1
        jupyter nbconvert --to markdown Python1.ipynb
                        ^
    SyntaxError: invalid syntax
    


## Print(출력)



```python
print("Hello") # 문자열은 큰따옴표로 감싸줘야함
```

    Hello
    

일반적으로 특정 값을 변수에 넣어 변수를 출력한다.


```python
a = "Hello" 
print(a)
```

    Hello
    

## 변수(Variable)

- 변수(variable): 변하는 값. 값이 교체될 수 있는 하나의 공간 개념
- 상수(constant): 변하지 않는 값. 한번 값이 고정되면 변하지 않는 데이터 개념


```python
# c와 d라는 변수를 만들어 두 변수의 합을 출력. c와 d는 변수, 10은 상수.
c = 10
d = 10  
print(a + b)
```

    20
    


```python
# c 변수 값을 바꾸어 변수 c와 d의 합을 출력
c = 30
print(a + b)
```

    40
    

## 연산(arithmetic operation)

### 기본 연산자
- +(add)
- -(sub)
- *(mul)
- / (div)
- % (mod(나머지 연산 / 모듈러 연산))



```python
# 문자열 + 문자열
e = "Hey "
f = "World"
print(e + f)
```

    Hey World
    


```python
#숫자 + 숫자
g = 20
h = 30
print(g + h)
```

    50
    


```python
# 문자역 + 숫자는 안됨.
print(e + g)
```

## input()

프로그램은 사용자와의 상호작용이 가능해야 한다. input()을 통해 사용자로부터 값을 입력 받을 수 있다.


```python
i = input("숫자를 입력하세요") # "숫자를 입력하세요"창에 숫자를 입력하면, 입력한 숫자가 i에 들어간다.
print(i) # i에 들어간 숫자를 출력
```

    숫자를 입력하세요40
    40
    


```python
j = input("j: ")
k = input("k: ")
print(j + k) # 문자열로 들어간다.
```

    j: 3
    k: 4
    34
    

## 함수(Function)

특정 동작을 수행하는 소스코드를 묶어서 언제든지 사용할 수 있게 하는 것. 

- 내장 함수: 라이브러리에 이미 만들어져 있는 함수.
- 사용자 정의 함수: 사용자가 직접 정의해서 사용하는 함수.


### 함수 | 정의

def(define. 정의한다)라는 키워드를 통해 함수를 정의. 반복되는 소스코드를 함수로 정의해 놓으면 소스코드의 반복을 줄여 효율적인 코드를 만들 수 있다. 함수는 간결하게 정의할 수록 좋다.


```python
# 함수 정의 방법:

# def 함수명(매개변수):     # def 뒤에 함수 이름을 적는다. 매개변수(전달할 값)를 넣는다. colon(:)을 찍는다.
#     명령문                # 명령문을 쓴다.
#     .  
#     .  
#     .  
#     return 값             # return을 통해 함수 수행 결과를 반환한다.

# 매개변수는 해당 함수 안에서만 처리된다. 함수 동작에 필요 없으면 안 적어도 된다.
# 반환할 값이 없으면 retrun문이 없어도 된다.
```


```python
def hey_world(): # hey_world라는 함수를 정의한다.
  print("Hey") # hey_world라는 이름의 함수가 수행할 동작은 Hey World를 출력하는 것이다.
  print("World")

hey_world()
```

    Hey
    World
    


```python
a = 10
def a_b_sum(b): # a_b_sum이라는 함수를 정의한다. 이 함수가 실행될 때 매개변수 b를 받도록 한다. (어떤 변수를 받아 그 변수를 b에 넣는다.)
  c = a + b # 이 함수는 변수 a와 b를 합해 변수 c에 넣는 동작을 수행한다.
  return(c) # 변수 c를 반환한다.

print(a_b_sum(7)) # 7을 해당 함수에 매개변수로 넣어 처리된 값을 출력한다.(7은 변수 b에 넣어진다.)
```

    17
    


```python
# 함수 안에서 바로 출력하도록 만들 수 있다.

def add(a,b):
  c = a + b
  return c

print(add(3,5))

print("--------")

def sum(a,b):
  c = a + b 
  print(c)

sum(3,5)
```

    8
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

    7
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

print(add_3(1,2,3))
```

    6
    


```python
def add_3_2(a, b, c):
  return a + b +c

print(add_3_2(1,2,3))
```

    6
    


```python
def add_3_3(a, b, c):
  d = a + b + c
  print(d)

add_3_3(1,2,3)
```

    6
    

## 지역변수, 전역변수

지역변수: [함수 안에 있는 변수] 사용자가 정의한 함수 내에서 선언한 변수. 해당 함수가 실행되는 동안에만 유효하다. 함수가 끝나면 없어지는 변수.

전역변수: [함수 밖에 있는 변수] 프로그램 내에서 항상 사용 가능한 변수.


```python
a = 10 # -> a: 전역 변수. 함수 밖에 있으니까. 프로그램 전체에서 사용 가능.
def square(): # -> b는 지역변수. 함수 안에 있으니까. 함수가 종료되면 유효하지 않은 변수.
  b = a * a 
  return(b) 
c = 30 + square() # -> c는 전역변수
print(c)
```

    130
    

## 조건문

조건에 따라 동작을 수행하는 코드를 작성할 수도 있다. 


```python
# if 조건:        # 만약 -라면      # if 뒤에 조건이 들어간다. 
#   실행명령                        # 위 조건에 맞으면 수행할 동작을 입력한다.
# else:           # 아니면          # 위 조건에 맞지 않으면,
#   실행명령                        # 수행할 다른 동작을 입력한다.
```


```python
a=(1, 2, 10)

if 10 in a:
  print("있다")
else:
  print("없다")
```

    있다
    

## 자료형 | 문자열(str.character string)

문자열 자료형은 문자를 처리하기 위한 자료형이다.

파이썬은 문자열의 대소문자를 구분한다.


```python
# 문자열 자료형은 큰따옴표("")출력할 수 있다.

print("세상아")
```

    세상아
    

### 자료형 | 문자열 | Escape code


```python
# 문자열의 내용으로 큰따옴표가 존재할 경우, 프로그래밍 언어로 사용되는 큰따옴표와 구분을 위해 앞에 역슬래쉬(\)를 넣어준다.
# 이런 걸 escape code라고 한다.

print("안녕 \"한세계\"")
```

    안녕 "한세계"
    


```python
# \t(탭), \n(줄바꿈)도 있다.

print("안녕 \t 세계야")
```

    안녕 	 세계야
    


```python
print("야 이 \n세계야")
```

    야 이 
    세계야
    

### 자료형| 문자열 | 연산


```python
# 문자열도 연산이 가능하다. 

l = "어"
m = "안녕"

print(a+b)
```

    어안녕
    


```python
n = a + b

print(n * 2)
```

    어안녕어안녕
    

### 자료형| 문자열 | Indexing

인덱싱은 문자열의 내부 문자를 하나하나에 개별 번호를 부착하는 것이다. 부착된 번호를 index라고 한다.


```python
o = "WHO ARE YOU" # o는 하나의 문자열이 되었다. 

print(o[0]) # a 문자열의 0번째 문자를 출력.

# index는 0부터 출발한다.
# W(0)H(1)O(2) (3)A(4)R(5)E(6) (7)Y(8)O(9)U(10)

# 띄어쓰기에도 인덱스가 붙는다.
print(o[3])
```

    W
     
    


```python
print(o[-2]) # 뒤에서 2번째 인덱스를 출력
```

    O
    

### 자료형 | 문자열 | Slicing

말 그대로 문자열을 여러 부분으로 슬라이싱하는 것이다. 이를 통해 특정 구간 내의 문자열을 확인할 수 있다. 



```python
# print(o[시작인덱스:끝인덱스-1])
print(o[2:6]) # 2부터 5까지 출력된다.
```

    O AR
    


```python
# 특정 인덱스부터 문자열 끝까지 다 출력하고 싶을 때.
print(o[3:])
```

     ARE YOU
    


```python
# 뒤에서부터 앞까지 출력
print(o[:-2])
```

    WHO ARE Y
    

### 자료형 | 문자열 | Slicing | Step

슬라이싱에 스탭을 적용할 수 있다.


```python
# print(o[시작인덱스:끝인덱스:스탭])

print(o[0:9:2]) # 0부터 8까지 출력하는데 2칸씩 띄어가며 출력.

# W(0)H(1)O(2) (3)A(4)R(5)E(6) (7)Y(8)O(9)U(10)
```

    WOAEY
    

### 자료형 | 문자열 | replace()

문자열 내 특정 문자를 변경할 때 replace()함수를 사용한다.

replace("기존 문자", "변경할 문자")


```python
o.replace("WHO","WHERE")
```




    'WHERE ARE YOU'




```python
print(o)  
# 다시 o를 출력해보면 replace가 적용되지 않았다. 
```

    WHO ARE YOU
    


```python
# replace()함수를 통해 새로운 값을 생성하는 것이기 때문에 별도의 변수에 담아야 유지된다.
p = o.replace("WHO","WHERE")
print(p)
```

    WHERE ARE YOU
    

### 자료형 | 문자열 | count()

count()함수를 통해 문자열에 특정 문자가 몇 번 들어갔는지 셀 수 있다.


```python
o.count("O")
```




    2



### 자료형 | 문자열 | find()

find()함수는 특정 문자의 위치를 반환한다.


```python
o.find("RE")
```




    5




```python
# 문자열에 없는 문자를 찾으려고 하면 -1이 반환된다.
o.find("IN")
```




    -1



### 자료형 | 문자열 | upper()

upper()함수를 쓰면 문자열 전체가 대문자로 바뀐다.


```python
q = "do you like it?"
q.upper()
```




    'DO YOU LIKE IT?'



### 자료형 | 문자열 | lower()

lower()함수를 쓰면 문자열 전체가 소문자로 바뀐다.


```python
o.lower()
```




    'who are you'



### 자료형 | 문자열 | split()

split()함수는 하나의 문자열을 여러개로 나누어 나누어진  문자열을 배열 형태로 반환한다.

대용량 코퍼스를 다룰 때 공백을 기준으로 문자열을 나눌 때 많이 쓰인다.


```python
q.split()
```




    ['do', 'you', 'like', 'it?']



### 자료형 | 문자열 | zfill()

자리수 만큼 나머지를 0으로 채운다.

일정한 자리수를 유지할 수 있게해준다.


```python
q.zfill(20)
```




    '00000do you like it?'



### 자료형 | 문자열 | int()

int는 integer(정수)의 줄임말이다. 문자열을 숫자로 바꾼다.


```python
r = "10" # r은 문자열이다.
s = int(r) # 문자열을 숫자로 변환한다.

print(20 + s) # 숫자로 바꿨기 때문에 연산도 가능하다.
```

    30
    


```python

```
