---
title: CODE = TRUE | Tokenization
category: Natural Language Processing
tag: NLP
---
**Tokenization 실습 코드: [https://github.com/finddme/Finddme_Blog_Code/blob/master/NLP_Code/2021NLP1_Tokenization.ipynb](https://github.com/finddme/Finddme_Blog_Code/blob/master/NLP_Code/2021NLP1_Tokenization.ipynb)**  








* 목차
{:toc}











## Tokenization(토큰화)

토큰화는 말 그대로 문자열을 토큰들로 분리하는 작업이다. 자연어처리에서 토큰화는 중요한 과정이다. 예를 들어 'United Kingdom'을 분리하면 전혀 다른 의미가 되기 때문에 두 단어는 붙여서 처리해야 한다. 즉, 토큰화 대상에서 제외해야 한다. 단어들의 의미를 고려한 토큰화를 지향해야 해당 데이터를 이용한 학습의 결과가 좋아진다.

### 토큰화 | 단어 | 영어


```python
# sentence1 = 'I can always predict the fortune cookies'
sentence1 = "I play the violin when I'm thinking and sometimes I don't talk for days on end."
tokens = sentence1.split(' ')
print(tokens)
print(type(tokens))

# sentence1을 공백을 기준으로 split한 결과를 리스트에 담아준다. 이렇게도 가능
tokens1 = [x for x in sentence1.split(' ')] 
print(tokens1)
print(type(tokens1))
```

    ['I', 'play', 'the', 'violin', 'when', "I'm", 'thinking', 'and', 'sometimes', 'I', "don't", 'talk', 'for', 'days', 'on', 'end.']
    <class 'list'>
    ['I', 'play', 'the', 'violin', 'when', "I'm", 'thinking', 'and', 'sometimes', 'I', "don't", 'talk', 'for', 'days', 'on', 'end.']
    <class 'list'>
    

### 토큰화 | 단어 | Mecab

한국어는 띄어쓰기를 준수하지 않아도 의미가 전달되기 때문에 띄어쓰기가 지켜지지 않는 경우가 많다. 그래서 공백을 기준으로 토큰화를 하면 데이터에 문제가 생길 수 있다. 그리고 한국어의 형태소는 영어의 형태소와 개념이 다르기 때문에 추가적으로 고려할 사항들이 있다.

한국어의 특성을 고려하여 잘 구축된 konlpy라는 라이브러리를 이용하면 처리가 간편하다.형태소분석기는 Mecab을 추천한다. 빠르고 정확하다. 토큰화는 Mecab이라는 형태소분석기를 사용한 결과에서 토큰 결과만 반환받는 설정을 해주면 된다.

> 윈도우 Mecab설치 방법:  
https://cleancode-ws.tistory.com/97  
https://hong-yp-ml-records.tistory.com/91


```python
from konlpy.tag import Mecab
```


```python
import MeCab
kor_sentence = '이게 무슨 일이냐고 여름에는 호떡을 안 파냐고'
kor_tagger = Mecab(dicpath=r"C:\mecab\mecab-ko-dic") # Mecab을 사용할 객체를 만든다
kor_tagger.pos(kor_sentence) # tagger를 통해 pos tagging을 해보자
```




    [('이게', 'NP+JKS'),
     ('무슨', 'MM'),
     ('일', 'NNG'),
     ('이', 'VCP'),
     ('냐고', 'EC'),
     ('여름', 'NNG'),
     ('에', 'JKB'),
     ('는', 'JX'),
     ('호떡', 'NNG'),
     ('을', 'JKO'),
     ('안', 'MAG'),
     ('파', 'VV'),
     ('냐고', 'EC')]




```python
# 태거를 통해 morph만 뽑아보자(형태소 분석 결과에서 토큰화 결과만 출력.)
kor_tagger.morphs(kor_sentence) 
```




    ['이게', '무슨', '일', '이', '냐고', '여름', '에', '는', '호떡', '을', '안', '파', '냐고']




```python
# 명사만 추출해보자
kor_tagger.nouns(kor_sentence) 
```




    ['이게', '일', '여름', '호떡']



### 토큰화 | 단어 | NLTK

NLTK(Natural Language Tool Kit)이라는 패키지의 tokenizer모듈을 활용하여 tokenize해줄 수 있다. 단어 토큰화는 word_tokenize()함수를 이용한다.


```python
import nltk # nltk를 불러오고
nltk.download('punkt') # nltk에서 토큰화를 위해 punkt를 다운받는다.
from nltk.tokenize import word_tokenize
```

    [nltk_data] Downloading package punkt to
    [nltk_data]     C:\Users\yein4\AppData\Roaming\nltk_data...
    [nltk_data]   Package punkt is already up-to-date!
    


```python
# word_tokenize에 문장을 넣어주면 토큰화를 해준다. 
# 앞서 split을 통해 공백을 기준으로 split한 결과보다 낫다.
tokenizer1 = word_tokenize(sentence1)
print(tokenizer1)
```

    ['I', 'play', 'the', 'violin', 'when', 'I', "'m", 'thinking', 'and', 'sometimes', 'I', 'do', "n't", 'talk', 'for', 'days', 'on', 'end', '.']
    

### 토큰화 | 문장

여러 문장들이 있을 때 문장들을 나눠주는 토큰화 방식도 있다.


```python
sentences1 = "Quiet. \n Calm. \n Peaceful. \n Isn't it hateful."

sentence_tokens = [x for x in sentences1.split('\n')] # 개행을 기준으로 문장을 split
print(sentence_tokens)
```

    ['Quiet. ', ' Calm. ', ' Peaceful. ', " Isn't it hateful."]
    

### 토큰화 | 문장 | NLTK


```python
from nltk.tokenize import sent_tokenize

sent_tokenize1 = sent_tokenize(sentences1)
print("개행 표시 있는 문장: ", sent_tokenize1)

sentences2 = "Quiet. Calm. Peaceful. Isn't it hateful." # 문장 사이 개행표시 삭제
sent_tokenize1 = sent_tokenize(sentences2)
print("개행 표시 없는 문장:", sent_tokenize1)
```

    개행 표시 있는 문장:  ['Quiet.', 'Calm.', 'Peaceful.', "Isn't it hateful."]
    개행 표시 없는 문장: ['Quiet.', 'Calm.', 'Peaceful.', "Isn't it hateful."]
    

### 토큰화 | 문장 | kss(Korean sentence spliter)

한국어 문장 토큰화는 kss라는 라이브러리를 사용하여 수행한다.(이걸 사용해도 한국어 자연어 처리에는 고려할 사항이 많아서 토큰화가 잘 안된다.)


```python
# !pip install kss
```

    Collecting kss
      Downloading kss-2.6.0-py3-none-any.whl (67 kB)
    Installing collected packages: kss
    Successfully installed kss-2.6.0
    


```python
import kss
print(kss.split_sentences(kor_sentence))
# 잘 안 된다.
```

    ['이게 무슨 일이냐고 여름에는 호떡을 안 파냐고']
    

### 토큰화 | NLTK | RegexpTokenizer | 영어

nltk의 tokenize의 RegexpTokenizer(Regular Expression Tokenizer)를 사용하여 토큰화할 수 있다.

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


```python
from nltk.tokenize import RegexpTokenizer

sentence1 = "I play the violin when I'm thinking and sometimes I don't talk for days on end."

# '문자와 숫자가 최소 한개 이상'이라는 패턴에 해당하는 것들만 토큰화한다.
# 즉, 문자나 숫자로 된 것만 tokenize하는 tokenizer를 객체에 담아준다.
reg_tokenizer1 = RegexpTokenizer("[\w]+") 
# 객체를 이용하여 문장을 토큰화한다.
tokens1 = reg_tokenizer1.tokenize(sentence1)
print(tokens1)
# 특수문자를 빼고 처리되었다.
```

    ['I', 'play', 'the', 'violin', 'when', 'I', 'm', 'thinking', 'and', 'sometimes', 'I', 'don', 't', 'talk', 'for', 'days', 'on', 'end']
    


```python
from nltk.tokenize import regexp_tokenize

print(regexp_tokenize(sentence1, "[\w]+"))
```

    ['I', 'play', 'the', 'violin', 'when', 'I', 'm', 'thinking', 'and', 'sometimes', 'I', 'don', 't', 'talk', 'for', 'days', 'on', 'end']
    


```python
# gaps=True를 이용하여 해당 정규표현식을 토큰화 기준으로 설정할 수 있다.
# 공백을 기준으로 토큰화를 한다.
reg_tokenizer2 = RegexpTokenizer("[\s]+", gaps= True)
tokens2 = reg_tokenizer2.tokenize(sentence1)
print(tokens2)
# 위 코드에서 gaps=True를 없애면 공백만 나온다. 공백만 토큰화하라는 말이 되니까.
```

    ['I', 'play', 'the', 'violin', 'when', "I'm", 'thinking', 'and', 'sometimes', 'I', "don't", 'talk', 'for', 'days', 'on', 'end.']
    

### 토큰화 | NLTK | RegexpTokenizer | 한국어


```python
# 해당 정규표현식에 걸린 것들만 토큰화한다
kor_tokenizer = RegexpTokenizer("[가-힣]+")
kor_tokens = kor_tokenizer.tokenize(kor_sentence)
kor_tokens
```




    ['이게', '무슨', '일이냐고', '여름에는', '호떡을', '안', '파냐고']




```python
# 마찬가지로 gaps=True를 이용하여 해당 정규표현식을 토큰화 기준으로 설정할 수 있다.
# 공백을 기준으로 토큰화를 한다.
kor_tokenizer2 = RegexpTokenizer("[\s]+", gaps= True)
kor_tokens2 = kor_tokenizer2.tokenize(kor_sentence)
kor_tokens2
```




    ['이게', '무슨', '일이냐고', '여름에는', '호떡을', '안', '파냐고']



### 토큰화 | Keras | 영어

딥러닝 프레임워크인 keras를 이용하여 토큰화를 하는 방법도 있다.


```python
from tensorflow import keras
# text_to_word_sequence라는 모듈에서 tokenizer를 제공한다.
from tensorflow.keras.preprocessing.text import text_to_word_sequence
```


```python
# 공백을 기준으로 토큰화한다.
text_to_word_sequence(sentence1)
```




    ['i',
     'play',
     'the',
     'violin',
     'when',
     "i'm",
     'thinking',
     'and',
     'sometimes',
     'i',
     "don't",
     'talk',
     'for',
     'days',
     'on',
     'end']



 ### 토큰화 | Keras | 한국어


```python
text_to_word_sequence(kor_sentence)
```




    ['이게', '무슨', '일이냐고', '여름에는', '호떡을', '안', '파냐고']



### 토큰화 | TextBlob | 영어


```python
# !pip install textblob
from textblob import TextBlob
```


```python
blob_tokenizer = TextBlob(sentence1)
blob_tokenizer.words
```




    WordList(['I', 'play', 'the', 'violin', 'when', 'I', "'m", 'thinking', 'and', 'sometimes', 'I', 'do', "n't", 'talk', 'for', 'days', 'on', 'end'])



### 토큰화 | TextBlob | 한국어


```python
kor_blob_tokenizer = TextBlob(kor_sentence)
kor_blob_tokenizer.words
```




    WordList(['이게', '무슨', '일이냐고', '여름에는', '호떡을', '안', '파냐고'])





