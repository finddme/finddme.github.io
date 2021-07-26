---
title: Python | Data Type | Dictionary
category: Python
tag: Python
---

[https://github.com/finddme/Python/blob/master/Python_Dictionary.ipynb](https://github.com/finddme/Python/blob/master/Python_Dictionary.ipynb)









* 목차
{:toc}














## 딕셔너리 자료형


```python
'''
딕셔너리 자료형의 원소는 key와 value의 한쌍으로 이루어진다.

리스트는 중괄호({})안에 key와 value는 콜론(:)으로,
각 원소들은 콤마(,)로 구분하여 값을 할당할 수 있다.

{key:value, key:value, ...}
    |
이거 하나가 원소 하나
'''
```


```python
# 딕셔너리 자료형의 대표적 예시는 사전이다.
dict1 = {} # dict1이라는 이름의 변수에 딕셔너리 자료형이 존재한다고 명시한다.

# 딕셔너리 자료형이 있는 변수에 값을 넣는다.
dict1['안녕'] = 'Hello' # '안녕'이라는 key의 값이 'Hello'이다.
dict1['우주'] = 'Cosmos'
dict1['아침'] = 'morning'

print(dict1) # key와 value를 넣은 딕셔너리 자료형을 가진 변수 dict1을 출력해보자.
```

    output: {'안녕': 'Hello', '우주': 'Cosmos', '아침': 'morning'}
    

### 딕셔너리 자료형 | 개별 원소 | 접근

딕셔너리 자료형도 다른 자료형들처럼 반복문을 통해 개별 원소에 접근할 수 있다.


```python
# 반복문을 사용하여 딕셔너리 자료형의 개별 원소에 접근할 때는 key값을 이용한다.
# 그렇기 때문에 for문에서 i(index)변수와 k(key)변수를 사용해야 한다.
# 그리고 enumerate()함수를 사용해서 내부적으로 딕셔너리 자료형의 개별 원소들에 접근하여 
# i에는 각 원소의 index, k값에는 해당 원소의 key가 할당될 수 있도록 한다.

for i, k in enumerate(dict1):
    print("index:", i, "key:", k)
```

    output: index: 0 key: 안녕
            index: 1 key: 우주
            index: 2 key: 아침
    


```python
# 해당 key값이 가지는 value값은 '해당변수명[k]'으로 불러올 수 있다.
# 즉 해당 변수명에 있는 key값의 값을 보자는 것이다.
for i, k in enumerate(dict1):
    print("index:", i, "한글:", k, "영어:", dict1[k])
```

    output: index: 0 한글: 안녕 영어: Hello
            index: 1 한글: 우주 영어: Cosmos
            index: 2 한글: 아침 영어: morning
    


```python
# 조건문을 통해 개별 원소에 접근하여 특정 'key'값이 있는지 확인할 수 있다.
if '우주' in dict1:
    print("있다")
```

    output: 있다
    

### 딕셔너리 자료형 | 개별 원소 | 변경

다른 자료형들은 변경할 때 index로 변경하고자 하는 원소에 접근했는데,

이와 유사하게 딕셔너리 자료형에서는 key값으로 변경하고자 하는 원소에 접근한다. 


```python
dict1['안녕'] = 'Hi' # '안녕'이라는 key의 value를 'Hi'로 바꾼다.
print(dict1)
```

    output: {'안녕': 'Hi', '우주': 'Cosmos', '아침': 'morning'}
    


```python
'''
# value는 확인 불가

if 'Cosmos' in dict:
    print("있다")
'''
```

### 딕셔너리 자료형 | 개별 원소 | 삭제

del 키워드를 사용하여 개별 원소를 삭제하면 된다.

삭제할 원소는 key값으로 찾는다.


```python
del dict1['안녕'] # '안녕'이라는 key값을 가진 원소를 삭제한다.
print(dict1)
```

    output: {'우주': 'Cosmos', '아침': 'morning'}
    

### 딕셔너리 자료형 | 함수 | clean()

딕셔너리 자료형의 내장함수인 clear()함수를 사용하면 딕셔너리의 모든 원소가 삭제된다.


```python
# clear()함수로 딕셔너리 자료형의 전체 원소가 삭제되고 딕셔너리 껍데기만 남는다.
dict1.clear()
print(dict1)
```

    output: {}
    

### 딕셔너리 자료형 | 함수 | len()

다른 자료형과 마찬가지로 len()함수를 통해 딕셔너리 자료형의 길이를 알 수 있다.

즉, 원소가 몇개인지 알 수 있다.


```python
dict1['안녕'] = 'Hello'
dict1['우주'] = 'Cosmos'
dict1['아침'] = 'morning'

print("dict 길이:", len(dict1))
```

    output: dict 길이: 3
    

### 딕셔너리 자료형 | 함수 | keys()

딕셔너리 자료형에서 key값만 따로 추출하고자 한다면 keys()함수를 사용하면 된다.


```python
key = dict1.keys() # key라는 변수에 dict1의 key값만 추출
print(key)
```

    output: dict_keys(['안녕', '우주', '아침'])
    


```python
# 리스트형태로 뽑고 싶으면 list()함수를 사용,
key_list = list(key)
print(key_list)
```

    output: ['안녕', '우주', '아침']
    

### 딕셔너리 자료형 | 함수 | values()

딕셔너리 자료형의 value값만 따로 추출하고 싶을 때 values()함수를 사용한다.


```python
value_list = list(dict1.values())
print(value_list)
```

    output: ['Hello', 'Cosmos', 'morning']
    

### 딕셔너리 자료형 | 함수 | sorted(딕셔너리)

딕셔너리 자료형은 순서 상관 없이 사용하는 자료형이지만 필요에 따라 sorted()함수를 통해 정렬할 수 있다.

key값을 기준으로 정렬된다.


```python
age = {}
age['가리비'] = 20
age['나비'] = 23
age['다람쥐'] = 29
age['라디오'] = 26

print(age)
```

    output: {'가리비': 20, '나비': 23, '다람쥐': 29, '라디오': 26}
    


```python
# key값을 기준으로 정렬(문자열은 사전순)
# 기본 설정은 오름차순이다.
print(sorted(age))
print(sorted(age, reverse=True)) # 내림차순으로 정렬하려면 reverse속성을 True로 해주면 된다.
```

    output: ['가리비', '나비', '다람쥐', '라디오']
            ['라디오', '다람쥐', '나비', '가리비']
    


```python
# value값을 정렬하고 싶으면 values()함수로 value값을 추출하고 그걸 정렬하면 된다.
print(sorted(age.values()))
```

    output: [20, 23, 26, 29]
    


