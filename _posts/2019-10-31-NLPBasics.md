---
title: "NLP Basics;with code"
category: Natural Language Processing
tag: NLP
---
**NLP Basics 실습 코드: [https://github.com/finddme/Finddme_Blog_Code/blob/master/NLP_Code/2021NLP1_NLP_Basics.ipynb](https://github.com/finddme/Finddme_Blog_Code/blob/master/NLP_Code/2021NLP1_NLP_Basics.ipynb)**  








* 목차
{:toc}











## N-Gram

토큰을 연속하는 n개로 분류하여 출연 횟수를 추출하는데 쓰인다.

n = 1일 때는 unigram, n = 2일 때는 bigram, n = 3일 때는 trigram...

bigram이 가장 많이 사용된다.

### N-Gram | NLTK


```python
from nltk import ngrams
sentence1 = 'I can always predict the fortune cookies'
# n-gram모듈에 sentence1을 split한 것을 넣고, 2개씩 묶어서 나눈다.
bigram1 = list(ngrams(sentence1.split(), 2))
print(bigram1)
```

    [('I', 'can'), ('can', 'always'), ('always', 'predict'), ('predict', 'the'), ('the', 'fortune'), ('fortune', 'cookies')]
    

### N-Gram | TextBlob


```python
from textblob import TextBlob
ngram_blob = TextBlob(sentence1)
# TextBlob에 있는 ngrams함수를 사용한다.
# n=2로 넣어서 bigram으로 만든다.(default는 trigram으로 설정되어 있다)
ngram_blob.ngrams(n=2)
```




    [WordList(['I', 'can']),
     WordList(['can', 'always']),
     WordList(['always', 'predict']),
     WordList(['predict', 'the']),
     WordList(['the', 'fortune']),
     WordList(['fortune', 'cookies'])]




```python
ngram_blob.ngrams()
```




    [WordList(['I', 'can', 'always']),
     WordList(['can', 'always', 'predict']),
     WordList(['always', 'predict', 'the']),
     WordList(['predict', 'the', 'fortune']),
     WordList(['the', 'fortune', 'cookies'])]



## POS(Part of Speech) tagging

POS tagging은 품사태깅이다. 문장 내의 단어들에 대해 품사를 부착해주는 것이다.

### POS | NLTK


```python
import nltk
nltk.download('punkt')
from nltk import word_tokenize
```

    [nltk_data] Downloading package punkt to
    [nltk_data]     C:\Users\yein4\AppData\Roaming\nltk_data...
    [nltk_data]   Package punkt is already up-to-date!
    


```python
# 먼저 tokenize해준다.
tokenize_result = word_tokenize(sentence1)
tokenize_result
```




    ['I', 'can', 'always', 'predict', 'the', 'fortune', 'cookies']




```python
nltk.download('averaged_perceptron_tagger') # tagger를 다운로드한다.
```

    [nltk_data] Downloading package averaged_perceptron_tagger to
    [nltk_data]     C:\Users\yein4\AppData\Roaming\nltk_data...
    [nltk_data]   Package averaged_perceptron_tagger is already up-to-
    [nltk_data]       date!
    




    True




```python
nltk.pos_tag(tokenize_result) # nltk의 pos_tag이라는 함수를 사용하여 태깅해준다.
```




    [('I', 'PRP'),
     ('can', 'MD'),
     ('always', 'RB'),
     ('predict', 'VB'),
     ('the', 'DT'),
     ('fortune', 'NN'),
     ('cookies', 'NNS')]




```python
# tokenize와 pos tagging을 한번에
nltk.pos_tag(word_tokenize(sentence1))
```




    [('I', 'PRP'),
     ('can', 'MD'),
     ('always', 'RB'),
     ('predict', 'VB'),
     ('the', 'DT'),
     ('fortune', 'NN'),
     ('cookies', 'NNS')]



> POS Tag List(영어기준. 한국어와 맞지 않는 품사도 있음)

| Number | Tag | Description | 설명 |
| -- | -- | -- | -- |
| 1 | `CC` | Coordinating conjunction |
| 2 | `CD` | Cardinal number |
| 3 | `DT` | Determiner | 한정사
| 4 | `EX` | Existential there |
| 5 | `FW` | Foreign word | 외래어 |
| 6 | `IN` | Preposition or subordinating conjunction | 전치사 또는 종속 접속사 |
| 7 | `JJ` | Adjective | 형용사 |
| 8 | `JJR` | Adjective, comparative | 헝용사, 비교급 |
| 9 | `JJS` | Adjective, superlative | 형용사, 최상급 |
| 10 | `LS` | List item marker |
| 11 | `MD` | Modal |
| 12 | `NN` | Noun, singular or mass | 명사, 단수형 |
| 13 | `NNS` | Noun, plural | 명사, 복수형 |
| 14 | `NNP` | Proper noun, singular | 고유명사, 단수형 |
| 15 | `NNPS` | Proper noun, plural | 고유명사, 복수형 |
| 16 | `PDT` | Predeterminer | 전치한정사 |
| 17 | `POS` | Possessive ending | 소유형용사 |
| 18 | `PRP` | Personal pronoun | 인칭 대명사 |
| 19 | `PRP$` | Possessive pronoun | 소유 대명사 |
| 20 | `RB` | Adverb | 부사 |
| 21 | `RBR` | Adverb, comparative | 부사, 비교급 |
| 22 | `RBS` | Adverb, superlative | 부사, 최상급 |
| 23 | `RP` | Particle |
| 24 | `SYM` | Symbol | 기호
| 25 | `TO` | to |
| 26 | `UH` | Interjection | 감탄사 |
| 27 | `VB` | Verb, base form | 동사, 원형 |
| 28 | `VBD` | Verb, past tense | 동사, 과거형 |
| 29 | `VBG` | Verb, gerund or present participle | 동사, 현재분사 |
| 30 | `VBN` | Verb, past participle | 동사, 과거분사 |
| 31 | `VBP` | Verb, non-3rd person singular present | 동사, 비3인칭 단수 |
| 32 | `VBZ` | Verb, 3rd person singular present | 동사, 3인칭 단수 |
| 33 | `WDT` | Wh-determiner |
| 34 | `WP` | Wh-pronoun |
| 35 | `WP$` | Possessive wh-pronoun |
| 36 | `WRB` | Wh-adverb |


## 불용어(Stop words) 제거

분석에 불필요한 전치사, 접속사, 저빈도 단어 등을 제거해 주면 정확한 분석 결화를 얻을 수 있다.

불용어를 제거해주는 도구들이 있지만 데이터에 따라 불용어로 취급되는 것들이 다를 수 있기 때문에 불용어 사전을 직접 만들어 제거해주는 것이 좋다.


```python
sentence2 = "I play the violin when I'm thinking and sometimes I don't talk for days on end."

stop_words = "on the" # "on 과 the"를 불용어로 취급한다
# 불용어 사전에 등록한 단어들을 공백을 기준으로 나눠 리스트에 담는다
stop_words = stop_words.split(' ') 

sentence2 = sentence2.split(' ') # 문장을 토큰화한다.

except_stop_words = [] # 불용어를 제거한 문장을 담을 리스트를 준비한다.
for word in sentence2: # 토큰화된 문장의 단어들을 하나씩 방문해서
    if word not in stop_words: # 해당 단어가 불용어 사전에 없으면
        except_stop_words.append(word) # 미리 만든 리스트에 넣어라

except_stop_words
# on과 the가 빠진 것을 확인할 수 있다.
```




    ['I',
     'play',
     'violin',
     'when',
     "I'm",
     'thinking',
     'and',
     'sometimes',
     'I',
     "don't",
     'talk',
     'for',
     'days',
     'end.']



### 불용어 제거 | NLTK


```python
import nltk
nltk.download('stopwords')
from nltk import word_tokenize
from nltk.corpus import stopwords

# nltk에서 불러온 stopwords라는 불용어 사전의 words를 가져온다. 언어는 영어.
stop_words1 = stopwords.words('english') 
print(stop_words1)
```

    [nltk_data] Downloading package stopwords to
    [nltk_data]     C:\Users\yein4\AppData\Roaming\nltk_data...
    

    ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"]
    

    [nltk_data]   Unzipping corpora\stopwords.zip.
    


```python
sentence2 = "I play the violin when I'm thinking and sometimes I don't talk for days on end."
s2_tokenize = word_tokenize(sentence2)
except_stop_words1 = []
for w in s2_tokenize:
    if w not in stop_words1:
        except_stop_words1.append(w)
except_stop_words1
# the, when, and, do, for, on이 불용어로 처리되어 빠졌다.
```




    ['I',
     'play',
     'violin',
     'I',
     "'m",
     'thinking',
     'sometimes',
     'I',
     "n't",
     'talk',
     'days',
     'end',
     '.']



## 철자교정

텍스트의 오탈자를 고쳐준다


```python
# !pip install autocorrect
from autocorrect import Speller # Speller 모듈을 불러온다

spell1 = Speller('en') # 영어 철자를 검사할 수 있게 객체를 생성한다.

print(spell1('spelleerr')) # 철자가 틀린 단어를 넣어본다
```

    speller
    


```python
wrong_sentence1 = 'I caan alwayss predicta the fortunie cookiess'
s1_tokenize = word_tokenize(wrong_sentence1)

 # s1_tokenize 리스트 안에 있는 단어를 하나씩 돌면서 spell1객체에 통과시켜 철자를 확인하고
# 단어 사이에 공백을 넣어 join한다.
check_spell = ' '.join([spell1(s) for s in s1_tokenize])
print(check_spell)
# caan, alwayss, predicta, fortunie, cookiess 다 잘 고쳐졌다
```

    I can always predict the fortune cookies
    

## 단수화 복수화


```python
from textblob import TextBlob

sentence1 = 'I can always predict the fortune cookies'
textblob1 = TextBlob(sentence1) # 문장을 토큰화한다.
print(textblob1.words) # 토큰화 결과
print(textblob1.words.singularize()) # 토큰화한 것을 단수화한 결과
# always에서 s를 빼버렸다... 복수로 인식했나보다...
print(textblob1.words.pluralize())
# 그냥 다 s를 붙여버리네
```

    ['I', 'can', 'always', 'predict', 'the', 'fortune', 'cookies']
    ['I', 'can', 'alway', 'predict', 'the', 'fortune', 'cookie']
    ['we', 'cans', 'alwayss', 'predicts', 'thes', 'fortunes', 'cookiess']
    

## Stemming(어간추출)


```python
import nltk

# nltk에서 제공하는 어간추출 라이브러리 중 가장 많이 사용된다.
stemmer = nltk.stem.PorterStemmer() 
stemmer.stem('stemming') # 어간을 추출해보자
```




    'stem'



## Lemmatization(표제어 추출)


```python
import nltk
nltk.download('wordnet')
from nltk.stem.wordnet import WordNetLemmatizer

lemmatizer1 = WordNetLemmatizer()

lemmatizer1.lemmatize('holds')
```

    [nltk_data] Downloading package wordnet to
    [nltk_data]     C:\Users\yein4\AppData\Roaming\nltk_data...
    [nltk_data]   Package wordnet is already up-to-date!
    




    'hold'



## NER(Named Entity Recognition, 개채명 인식)

고유명사와 같은 개체의 이름을 인식한다.


```python
import nltk
from nltk import word_tokenize
nltk.download('maxent_ne_chunker') # max named entity chunker를 다운받는다
nltk.download('words')

sentence1 = 'The name\'s Sherlock Holmes and the address is 221B Baker Street.'

s1_pos_tok = nltk.pos_tag(word_tokenize(sentence1)) # tokenize, pos tagging을 해준다

s1_named = nltk.ne_chunk(s1_pos_tok, binary=True)
print(s1_named)
```

    (S
      The/DT
      name/NN
      's/POS
      (NE Sherlock/NNP Holmes/NNP)
      and/CC
      the/DT
      address/NN
      is/VBZ
      221B/CD
      Baker/NNP
      Street/NNP
      ./.)
    

    [nltk_data] Downloading package maxent_ne_chunker to
    [nltk_data]     C:\Users\yein4\AppData\Roaming\nltk_data...
    [nltk_data]   Package maxent_ne_chunker is already up-to-date!
    [nltk_data] Downloading package words to
    [nltk_data]     C:\Users\yein4\AppData\Roaming\nltk_data...
    [nltk_data]   Package words is already up-to-date!
    

## Lexical Ambiguity(단어 중의성 해소)


```python
import nltk
from nltk.wsd import lesk

ambiguous_sentence1 = 'I went to the bank of the river'
ambiguous_sentence2 = 'I went to the bank to deposit some money'

print(lesk(word_tokenize(ambiguous_sentence1), 'bank')) # 이건 잘 파악하지 못했지만
print(lesk(word_tokenize(ambiguous_sentence2), 'bank')) # 얘는 잘 파악했다
```

    Synset('bank.v.07')
    Synset('savings_bank.n.02')
    

## BOS(Bag of Words)


```python
# 벡터 개수 세는 라이브러리를 불러온다.
from sklearn.feature_extraction.text import CountVectorizer 

bos_sentence = ['betty bought a bit of better butter to make her bitter butter better']

count_words1 = CountVectorizer() # vector 세어줄 라이브러리를 담은 객체를 생성한다
bow1 = count_words1.fit_transform(bos_sentence) # 문장에 fit_transform해준다


print(bow1.toarray()) # 벡터 센 결과를 리스트 형태로 출력한다.
print(count_words1.vocabulary_) # 결과에서 어떤 단어에 대한 카운트가 어느 인덱스에 있는지 출력한다.
```

    [[2 1 1 1 1 2 1 1 1 1]]
    {'betty': 1, 'bought': 4, 'bit': 2, 'of': 8, 'better': 0, 'butter': 5, 'to': 9, 'make': 7, 'her': 6, 'bitter': 3}
    


```python
# 불용어는 제거하고 카운트를 셀 수 있다.
count_words2 = CountVectorizer(stop_words='english')
bow2 = count_words2.fit_transform(bos_sentence)

print(bow2.toarray())
print(count_words2.vocabulary_)
# of, to, her이 불용어로 처리되어 제거됐다.
```

    [[2 1 1 1 1 2 1]]
    {'betty': 1, 'bought': 4, 'bit': 2, 'better': 0, 'butter': 5, 'make': 6, 'bitter': 3}
    


```python
# 보기 편하게 DataFrame으로 바꾸자

import pandas as pd
from pandas import DataFrame

bos_index = count_words2.vocabulary_
bos_result = bow2.toarray()
bos_list = [] # column이 될 것들을 추출해서 넣을 리스트를 만든다.(딕셔너리의 key값.)

# 딕셔너리를 정렬 시키고 key값으로는 for문을 돌며 들어온 원소의 인덱스 1, 
# 즉 딕셔너리의 value값을 key로 보고 그것을 기준으로 정렬한다.
# 이렇게하면 index 순으로 정렬된다.
for k, v in sorted(bos_index.items(), key= lambda i : i[1]):
    bos_list.append(k) # 리스트에 순서대로 담는다

# 데이터프레임을 만든다. data는 baw_result, column은 방금 만든 리스트
bos_df = DataFrame(bos_result, columns= bos_list)

bos_df
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>better</th>
      <th>betty</th>
      <th>bit</th>
      <th>bitter</th>
      <th>bought</th>
      <th>butter</th>
      <th>make</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>2</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
</div>



### BOS | 한국어


```python
kor_bos_sentence = ['내가 어제 호떡을 먹고 싶어서 사 온 건데 나를 빼고 다 먹었더라고']

count_words1 = CountVectorizer()
kor_bow = count_words1.fit_transform(kor_bos_sentence)

print(kor_bow.toarray())
print(count_words1.vocabulary_)
# 한국어는 띄어쓰기를 기준으로 나뉜 벡터를 세면 부정확하다.
```

    [[1 1 1 1 1 1 1 1 1]]
    {'내가': 2, '어제': 7, '호떡을': 8, '먹고': 3, '싶어서': 6, '건데': 0, '나를': 1, '빼고': 5, '먹었더라고': 4}
    


```python
from konlpy.tag import Mecab
```


```python
import re
import MeCab
kor_bos_sentence2 = '내가 어제 호떡을 먹고 싶어서 사 온 건데 나를 빼고 다 먹었더라고.'
kor_tagger = Mecab(dicpath=r"C:\mecab\mecab-ko-dic")
# 온점은 없애고 형태소 분석한 결과를 kor_tokens에 넣는다
kor_tokens = kor_tagger.morphs(re.sub('(\.)', "", kor_bos_sentence2))
print(kor_tokens)
```

    ['내', '가', '어제', '호떡', '을', '먹', '고', '싶', '어서', '사', '온', '건데', '나', '를', '빼', '고', '다', '먹', '었', '더라고']
    


```python
kor_vocab = {} # 토큰화된 단어들을 {토큰:인덱스}형태로 저장할 딕셔너리를 만든다
kor_bow2 = [] # bow결과를 저장할 리스트를 만든다

for tok in kor_tokens: # 토큰화된 것을 하나씩 돌면서
    if tok not in kor_vocab.keys(): # kor_vocab이라는 딕셔너리의 key값에 tok이 없으면
         # 딕셔너리 key값으로 tok을 하나 넣고 그의 value값은 딕셔너리의 길이, 즉 원소 개수
        kor_vocab[tok] = len(kor_vocab)
        # 그리고 리스트 kor_bow에는 '딕셔너리 길이 -1'인덱스 자리에 1을 넣는다
        kor_bow2.insert(len(kor_vocab)-1, 1)
    else: # kor_vocab이라는 딕셔너리의 key값에 tok이 있으면
        index1 = kor_vocab.get(tok) # 딕셔너리에서 key값으로 tok을 가지는 것의 value값을 index1에 넣는다.
        # 리스트에서 가져온 인덱스 값에 해당하는 것에 1을 더한다. 
        kor_bow2[index1] = kor_bow2[index1] + 1
print(kor_bow2)
print(kor_vocab)
```

    [1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    {'내': 0, '가': 1, '어제': 2, '호떡': 3, '을': 4, '먹': 5, '고': 6, '싶': 7, '어서': 8, '사': 9, '온': 10, '건데': 11, '나': 12, '를': 13, '빼': 14, '다': 15, '었': 16, '더라고': 17}
    


```python
import pandas as pd
from pandas import DataFrame

kor_bow2_1 = [kor_bow2]

kor_bow_list = [] # column이 될 것들을 추출해서 넣을 리스트를 만든다.(딕셔너리의 key값.)

# 딕셔너리를 정렬 시키고 key값으로는 for문을 돌며 들어온 원소의 인덱스 1, 
# 즉 딕셔너리의 value값을 key로 보고 그것을 기준으로 정렬한다.
# 이렇게하면 index 순으로 정렬된다.
for k, v in sorted(kor_vocab.items(), key= lambda i : i[1]):
    kor_bow_list.append(k)

kor_dtm_df = DataFrame(kor_bow2_1, columns= kor_bow_list)

#kor_dtm_df = DataFrame(kor_bow2, index= kor_bow_list)

kor_dtm_df
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>내</th>
      <th>가</th>
      <th>어제</th>
      <th>호떡</th>
      <th>을</th>
      <th>먹</th>
      <th>고</th>
      <th>싶</th>
      <th>어서</th>
      <th>사</th>
      <th>온</th>
      <th>건데</th>
      <th>나</th>
      <th>를</th>
      <th>빼</th>
      <th>다</th>
      <th>었</th>
      <th>더라고</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>2</td>
      <td>2</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
</div>



## DTM(Document Term Matrix, 문서 단어 행렬)

문서에 등장하는 단어들의 빈도를 기반으로 행렬을 표현하는 것이다. 즉, 문서에 대한 BOW를 행렬로 표현하는 것이다. 


```python
from sklearn.feature_extraction.text import CountVectorizer 

doc1 = ["Crime is common.", " Logic is rare.", "Therefore it is upon the logic rather than upon the crime that you should dwell."]

count_words1 = CountVectorizer()
doc_bow = count_words1.fit_transform(doc1)

print(doc_bow.toarray()) # 각 행은 문서 하나, 열은 해당 문서의 단어를 나타낸다.
print(count_words1.vocabulary_) # 인덱스
```

    [[1 1 0 1 0 0 0 0 0 0 0 0 0 0 0]
     [0 0 0 1 0 1 1 0 0 0 0 0 0 0 0]
     [0 1 1 1 1 1 0 1 1 1 1 2 1 2 1]]
    {'crime': 1, 'is': 3, 'common': 0, 'logic': 5, 'rare': 6, 'therefore': 12, 'it': 4, 'upon': 13, 'the': 11, 'rather': 7, 'than': 9, 'that': 10, 'you': 14, 'should': 8, 'dwell': 2}
    


```python
# 보기 편하게 DataFrame으로 바꾸자

import pandas as pd
from pandas import DataFrame

index2 = count_words1.vocabulary_
bow_result = doc_bow.toarray()
dtm_list = [] # column이 될 것들을 추출해서 넣을 리스트를 만든다.(딕셔너리의 key값.)

# 딕셔너리를 정렬 시키고 key값으로는 for문을 돌며 들어온 원소의 인덱스 1, 
# 즉 딕셔너리의 value값을 key로 보고 그것을 기준으로 정렬한다.
# 이렇게하면 index 순으로 정렬된다.
for k, v in sorted(index2.items(), key= lambda i : i[1]):
    dtm_list.append(k) # 리스트에 순서대로 담는다

# 데이터프레임을 만든다. data는 baw_result, column은 방금 만든 리스트
dtm_df = DataFrame(bow_result, columns= dtm_list)

dtm_df
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>common</th>
      <th>crime</th>
      <th>dwell</th>
      <th>is</th>
      <th>it</th>
      <th>logic</th>
      <th>rare</th>
      <th>rather</th>
      <th>should</th>
      <th>than</th>
      <th>that</th>
      <th>the</th>
      <th>therefore</th>
      <th>upon</th>
      <th>you</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>0</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>2</td>
      <td>1</td>
      <td>2</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
</div>



## TF-IDF(Term Frequency - Inverse Document Frequency)

문서에 등장한 단어를 단순히 count하는 방법이 아니라 다른 문서에 비해 더 많이 나온 단어를 알아보기 위한 방법이다. 다른 문서보다 특정 문서에서 더 많이 등장한 단어가 해당 문서의 핵심어일 가능성이 높다는 가정 하에 만들어진 방법이다.

TF-IDF는 Term Frequency * Inverse Document Frequency로 계산된다. Term Frequency (앞서 다룬 DTM이랑 같다. 특정 문서에 나온 단어들의 빈도수), Inverse Document Frequency({전체문서 수}/{특정 단어가 들어있는 문서의 개수 + 1}에 로그를 씌워준 것)

scikit-learn에서 tfidfvectorizer를 사용하여 구현할 수 있다.


```python
from sklearn.feature_extraction.text import TfidfVectorizer

tfidf1 = TfidfVectorizer().fit(doc1) # doc1에 대해 tf-idf를 fit시킨다.

print(tfidf1.transform(doc1).toarray())
print(tfidf1.vocabulary_)
```

    [[0.72033345 0.54783215 0.         0.42544054 0.         0.
      0.         0.         0.         0.         0.         0.
      0.         0.         0.        ]
     [0.         0.         0.         0.42544054 0.         0.54783215
      0.72033345 0.         0.         0.         0.         0.
      0.         0.         0.        ]
     [0.         0.18177122 0.2390073  0.14116156 0.2390073  0.18177122
      0.         0.2390073  0.2390073  0.2390073  0.2390073  0.47801461
      0.2390073  0.47801461 0.2390073 ]]
    {'crime': 1, 'is': 3, 'common': 0, 'logic': 5, 'rare': 6, 'therefore': 12, 'it': 4, 'upon': 13, 'the': 11, 'rather': 7, 'than': 9, 'that': 10, 'you': 14, 'should': 8, 'dwell': 2}
    


```python
import pandas as pd 

tfidf_index = tfidf1.vocabulary_
tfidf_result = tfidf1.transform(doc1).toarray()
tfidf_list = [] # column이 될 것들을 추출해서 넣을 리스트를 만든다.(딕셔너리의 key값.)

# 딕셔너리를 정렬 시키고 key값으로는 for문을 돌며 들어온 원소의 인덱스 1, 
# 즉 딕셔너리의 value값을 key로 보고 그것을 기준으로 정렬한다.
# 이렇게하면 index 순으로 정렬된다.
for k, v in sorted(tfidf_index.items(), key= lambda i : i[1]):
    tfidf_list.append(k) # 리스트에 순서대로 담는다

# 데이터프레임을 만든다. data는 baw_result, column은 방금 만든 리스트
tfidf_df = DataFrame(tfidf_result, columns= tfidf_list)

tfidf_df
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>common</th>
      <th>crime</th>
      <th>dwell</th>
      <th>is</th>
      <th>it</th>
      <th>logic</th>
      <th>rare</th>
      <th>rather</th>
      <th>should</th>
      <th>than</th>
      <th>that</th>
      <th>the</th>
      <th>therefore</th>
      <th>upon</th>
      <th>you</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0.720333</td>
      <td>0.547832</td>
      <td>0.000000</td>
      <td>0.425441</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.425441</td>
      <td>0.000000</td>
      <td>0.547832</td>
      <td>0.720333</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
    </tr>
    <tr>
      <th>2</th>
      <td>0.000000</td>
      <td>0.181771</td>
      <td>0.239007</td>
      <td>0.141162</td>
      <td>0.239007</td>
      <td>0.181771</td>
      <td>0.000000</td>
      <td>0.239007</td>
      <td>0.239007</td>
      <td>0.239007</td>
      <td>0.239007</td>
      <td>0.478015</td>
      <td>0.239007</td>
      <td>0.478015</td>
      <td>0.239007</td>
    </tr>
  </tbody>
</table>
</div>

