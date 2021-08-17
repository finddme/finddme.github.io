---
title: [CODE] Regular Expression
category: Natural Language Processing
tag: NLP
---
**Regular Expression 실습 코드: [https://github.com/finddme/Finddme_Blog_Code/blob/master/NLP_Code/2021NLP1_RegularExpression.ipynb](https://github.com/finddme/Finddme_Blog_Code/blob/master/NLP_Code/2021NLP1_RegularExpression.ipynb)**  








* 목차
{:toc}










## String 다루기 | 영어


```python
'''
string에 substring이 있는지 확인하기
'''
#string1 = "I play the violin when I'm thinking and sometimes I don't talk for days on end."
string1 = "It's good news for breathing."
'good' in string1 # string1에 'good'이라는 substring이 있냐
```




    True




```python
'''
spilt 함수 를 사용하여 공백을 기준으로 나누기
'''
string1.split()
```




    ["It's", 'good', 'news', 'for', 'breathing.']




```python
'''
split한 결과에서 특정 단어가 어느 인덱스에 있는지 찾기
'''
string1.split().index('good')
```




    1




```python
'''
slicing으로 특정 인덱스의 문자에 접근
'''
string1[-7:]
```




    'athing.'




```python
'''
split한 결과에서의 특정 인덱스에 있는 단어가 뭐냐
'''
string1.split()[4]
```




    'breathing.'




```python
string1.split()[3][::-1] # split한 결과의 3번째 인덱스에 있는 단어를 reverse해라
```




    'rof'



## String 다루기 | 한국어


```python
'''
파이썬은 유니코드를 지원하기 때문에 별도의 처리 없이 한글을 다룰 수 있다.
'''
string2 = '호떡 먹고 싶다 호떡 호떡'

'호떡' in string2
```




    True




```python
string2.split()
```




    ['호떡', '먹고', '싶다', '호떡', '호떡']




```python
string2.split()[0] # split한 결과의 0번째 인덱스에 있는 원소가 뭐냐
```




    '호떡'



## 정규화


```python
'''
텍스트에 존재하는 단어들의 통일성에 신경을 써야 처리가 편하다. 
코퍼스의 전반적인 정규화/변환과정은 자연어를 처리할 때 꼭 필요하다.
'''
# s1 = 'I can always predict the fortune cookies 12 34 56'
s1 = 'The UK leant towards the US proposal.'
# UK와 US를 풀어쓰는 방식으로 바꿔주자.
s1_1 = s1.replace("UK", "United Kingdom").replace("US", "Untitled.ipynbnited States")
print(s1_1)
```

    The United Kingdom leant towards the Untitled.ipynbnited States proposal.
    

## 정규표현식(Regular Expression)

정규표현식을 통해 특정 문자드을 편하게 지정할 수 있고, 지정한 것을 통해 텍스트에 추가 혹은 삭제 처리를 할 수 있다.코퍼스 전처리 단계에서 정규표현식이 많이 사용된다. 예를 들어 텍스트에 번호가 포함되어 있는지 알아보는 등에 쓰인다.

> 정규 표현식 문법
  
| 특수문자 | 설명 |
| - | - |
| `.` | . 앞의 문자 1개가 있냐 |
| `?` | ? 앞의 문자 1개가 있냐(하지만 그 문자가 존재할 수도, 존재하지 않을 수도 있음) |
| `*` | * 앞의 문자가 0개 이상 존재하냐 |
| `+` | + 앞의 문자가 최소 1개 이상 있냐 |
| `^` | ^ 뒤의 문자로 문자열이 시작하냐 |
| `\$` | '$` 앞의 문자로 문자열이 끝나냐 |
| `\{n\}` | `n`번만큼 반복 |
| `\{n1, n2\}` | `n1` 이상, `n2` 이하만큼 반복하냐 (n2를 지정하지 않을 경우, `n1` 이상만 반복하냐) |
| `\[ abc \]` | 대괄호 안의 문자 중 한 개의 문자와 매치되냐(a-z처럼 범위도 지정 가능) |
| `\[ ^a \]` | 대괄호 안의 문자를 제외하고 매치 |
| `a\|b` | `a` 또는 `b`(파이프라인 (\|)은 일반적으로 '또는'의 의미로 사용된다) |



> 역슬래시(\\)를 이용한 정규 표현식 문자 규칙

| 문자 | 설명 |
| - | - |
| `\\` | 역슬래시 그자체 |
| `\d` | digit. 모든 숫자(= [0-9]) |
| `\D` | 숫자를 제외한 모든 문자(= [^0-9]) |
| `\s` | space. 공백(= [ \t\n\r\f\v]) |
| `\S` | 공백을 제외한 모든 문자(= [^ \t\n\r\f\v]) |
| `\w` | word. 문자와 숫자(= [a-zA-Z0-9]) |
| `\W` | 문자와 숫자를 제외한 다른 문자(= [^a-zA-Z0-9]) |

### 정규표현식 | match | 영어


```python
import re # 정규표현식ㅇ르 사용할 때 re 라이브러리를 불러와야 한다.

check1 = 'ab.'
# ab. -> ab하고 '.'부분에 문자가 하나라도 오냐
print("about 'abc': ", re.match(check1, 'abc')) 
print("about 'abc': ", re.match(check1, 'abcd')) 
print("about 'c': ", re.match(check1, 'c'))
print("about 'ab': ", re.match(check1, 'ab'))
```

    about 'abc':  <re.Match object; span=(0, 3), match='abc'>
    about 'abc':  <re.Match object; span=(0, 3), match='abc'>
    about 'c':  None
    about 'ab':  None
    

### 정규표현식 | match | 한국어


```python
import re
check2 = '[ㄱ-ㅎ]+' # ㄱ부터 ㅎ까지의 한글 자음이 나오고 그 뒤로 문자가 최소 하나 이상 오냐

# check2에 등록한 정규표현식에 걸리는 애를 찾아라
print(re.match(check2, 'ㅎ안녕'))
print(re.match(check2, '안녕ㅎ'))
# ㄱ-ㅎ에 걸리는 'ㅎ 안녕'에서 ㅎ이 걸렸다.
# 걸린게 없다
```

    <re.Match object; span=(0, 1), match='ㅎ'>
    None
    

### 정규표현식 | compile | 영어

re 라이브러리의 compile을 사용하면 정규표현식을 사용할 때마다 정의하지 않고 한번 정의한 후에 불러오는 방식으로 쓸 수 있어서 빠르고 편리하다.


```python
'''
compile을 쓴 버전과 안 쓴 버전의 속도 차를 확인해보자
'''
import re 
import time # 시간을 체크하기 위해 time을 불러온다.

text1 = 'abc def abg'

normal_start = time.time() # 시작
r1 = 'ab.'
for i in range(1001): # i를 1001번 돌린다.
    re.match(r1, text1) # text1이 ab어쩌고인지 확인해라
print("compile 안 쓴 버전: ", time.time() - normal_start) # 끝시간 - 시작시간

compile_start = time.time() # 시작
r2 = re.compile('ab.') # compile
for i in range(1001): # i를 1001번 돌린다.
    result = r2.match(text1) # re가 아니라 re.compile한 객체를 불러온다
print('compile 쓴 버전: ', time.time() - compile_start)
```

    compile 안 쓴 버전:  0.0010042190551757812
    compile 쓴 버전:  0.0009706020355224609
    

### 정규표현식 | search | 영어

match는 문자열 처음에 해당 표현이 없으면 바로 끝나고

search는 문자열 전체를 검사해서 해당 표현에 매칭되는게 있는지 찾아낸다.


```python
r1 = re.compile('ab.')

print("a에 대해 search: ",r1.search('a euosblkg abc'))
print("a에 대해 match: ",r1.match('a euosblkg abc'))

print("abhey에 대해 search: ",r1.search('jigdas abhey'))
print("abhey에 대해 match: ",r1.match('jigdas abhey'))

print("heyab에 대해 search: ",r1.search('det sryh heyab'))
print("heyab에 대해 match: ",r1.match('det sryh heyab'))
```

    a에 대해 search:  <re.Match object; span=(11, 14), match='abc'>
    a에 대해 match:  None
    abhey에 대해 search:  <re.Match object; span=(7, 10), match='abh'>
    abhey에 대해 match:  None
    heyab에 대해 search:  None
    heyab에 대해 match:  None
    

### 정규표현식 | search | 한국어


```python
check2 = '[ㄱ-ㅎ | ㅏ-ㅣ]+'
print(re.search(check2, 'ㅎ안녕'))
print(re.match(check2, 'ㅎ안녕'))
print(re.search(check2, '안녕ㅎ'))
# match는 앞에서부터 차례로 체크하는데 처음부터 걸린게 없어서 None이 반환된다.
print(re.match(check2, '안녕ㅎ')) 
```

    <re.Match object; span=(0, 1), match='ㅎ'>
    <re.Match object; span=(0, 1), match='ㅎ'>
    <re.Match object; span=(2, 3), match='ㅎ'>
    None
    

### 정규표현식 | split | 영어

split에 정규표현식을 사용하여 정규표현식에 해당하는 문자열을 기준으로 문자열을 나눌 수 있다.


```python
s1 = 'abc 1 d5ef 3 ccb 2 ca2d'
r1 = re.compile(' ') # compile을 사용하여 공백을 표현
print(r1.split(s1)) # 문자열 s1을 compile한 결과가 담긴 객채를 통해 split해준다.
# 공백을 기준으로 split될 결과가 반환된다.
```

    ['abc', '1', 'd5ef', '3', 'ccb', '2', 'ca2d']
    


```python
r2 = re.compile('c')
print(r2.split(s1)) # 'c'를 기준으로 나눈다
```

    ['ab', ' 1 d5ef 3 ', '', 'b 2 ', 'a2d']
    


```python
r3 = re.compile('[0-9]')
print(r3.split(s1)) # 0-9 사이의 숫자를 기준으로 나눈다
```

    ['abc ', ' d', 'ef ', ' ccb ', ' ca', 'd']
    

### sub | 영어

정규표현식으로 걸린 부분을 다른 문자열로 대체하는 함수이다.

replace라고 생각하면 된다.


```python
s2 = '457758'
print(re.sub('[a-z]', '1', s1)) # s1에서 a-z에 포함된 것들을 모두 1로 바꿔라
print(re.sub('[a-z]', '1', s2)) # s2에서 a-z에 포함된 것들을 모두 1로 바꿔라
```

    111 1 1511 3 111 2 1121
    457758
    


```python
print(re.sub('[^a-z]', '1', s1)) # s1에서 a-z에 포함되지 않은 것들을 모두 1로 바꿔라
print(re.sub('[^a-z]', '1', s2)) # s2에서 a-z에 포함되지 않은 것들을 모두 1로 바꿔라
```

    abc111d1ef111ccb111ca1d
    111111
    

### sub | 한국어


```python
# [가-힣]는 모든 한글 자모 조합을 표현하는 정규표현이다.
# '안녕안녕'에서 해당 정규 표현식에 걸리는 게 있으면 다 1로 바꿔라
print(re.sub('[가-힣]', '1', '안녕안녕')) 
# '안녕안녕'에서 [가-힣]에 포함되지 않는 것만 1로 바꿔라
print(re.sub('[^가-힣]', '1', '안녕안녕')) 
```

    1111
    안녕안녕
    

### findall

정규표현식에 해당하는 모든 문자열을 찾아서 리스트에 담아 반환한다.


```python
print(re.findall('[\d]',s1)) # s1에서 숫자를 다 뽑아내라
# 해당 문자열에서 문자나 숫자가 아닌 걸 다 뽑아내라
print(re.findall('[\W]','1#sjspoen@%$^%&95736')) 
```

    ['1', '5', '3', '2', '2']
    ['#', '@', '%', '$', '^', '%', '&']
    

### finditer

find한 결과를 iterator객체로 반환하는 함수이다.
iterator객체에 담겨있기 때문에 하나씩 빼주는 작업을 통해 결과를 하나씩 확인할 수 있다.


```python
iter1 = re.finditer('[\d]',s1) # s1에서 숫자를 다 뽑아내라
print("iter1: ", iter1) # iter1을 출력해보면 iterator객체에 담겨있다고 나온다

for i in iter1: # iter1에 한번씩 방문하여 들어있는 걸 꺼내서 출력하자
    print("iter1에서 찾은 결과: ",i)

```

    iter1:  <callable_iterator object at 0x0000021C924383C8>
    iter1에서 찾은 결과:  <re.Match object; span=(4, 5), match='1'>
    iter1에서 찾은 결과:  <re.Match object; span=(7, 8), match='5'>
    iter1에서 찾은 결과:  <re.Match object; span=(11, 12), match='3'>
    iter1에서 찾은 결과:  <re.Match object; span=(17, 18), match='2'>
    iter1에서 찾은 결과:  <re.Match object; span=(21, 22), match='2'>
    


```python
iter2 = re.finditer('[\W]', 'nkisdb3845$$^%&#')
print("iter2: ", iter2)

for i in iter2:
    print(i)
```

    iter2:  <callable_iterator object at 0x0000021C92438688>
    <re.Match object; span=(10, 11), match='$'>
    <re.Match object; span=(11, 12), match='$'>
    <re.Match object; span=(12, 13), match='^'>
    <re.Match object; span=(13, 14), match='%'>
    <re.Match object; span=(14, 15), match='&'>
    <re.Match object; span=(15, 16), match='#'>
    


```python
from konlpy.tag import Mecab
```


