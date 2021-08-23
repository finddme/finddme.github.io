---
title: "**[CODE]** Seq2Seq with Attention"
category: Natural Language Processing
tag: NLP
---
**Attention 실습 코드: [https://github.com/finddme/Finddme_Blog_Code/blob/master/NLP_Code/2021_seq2seq_Attention_v2.ipynb](https://github.com/finddme/Finddme_Blog_Code/blob/master/NLP_Code/2021_seq2seq_Attention_v2.ipynb)**  








* 목차
{:toc}












- seq2seq모델은 sequence를 입력 받아 다른 언어 도메인의 sequence를 출력하는 모델이다. 따라서 many-to-many형태의 모델이라고 할 수 있다. 그러나 일반적으로 many-to-many형태의 모데들의 입력과 출력은 동일한 크기를 가지지만 seq2seq은 그렇지 않다는 특징이 있다.
- seq2seq모델에는 RNN계열 모델을 활용한 encoder와 decoder가 존재한다. 

## Preprocessing


```python
import os
import shutil
import urllib3
import zipfile
import pandas as pd 
```


```python
'''
이 실습에서 사용할 데이터는 영-독 데이터이다. 독일어를 영어로 변환해주는 모델을 만들어보자.
'''
http1 = urllib3.PoolManager()
url1 = "http://www.manythings.org/anki/deu-eng.zip"
filename1 = "deu-eng.zip"
path1 = os.getcwd() # path는 지금 현재 디렉토리.
zipfilename1 = os.path.join(path1, filename1)
```


```python
# 접근해서 http에 request GET방식으로 지정한 url로 가서 읽는 것을 r1이라고 한다.
# 그리고 위에서 지정한 zipfilename1을 write binary로 열고 그걸 out_file1이라고 한다.
# shell util에서 copyfileobject해서 현재 연 url에서 out_file을 복사해 온다.
with http1.request('GET', url1, preload_content=False) as r1, open(zipfilename1, 'wb') as out_file1:
    shutil.copyfileobj(r1, out_file1)
```


```python
# 가져온게 zipfile이니까 압축을 풀어준다. zipfilename1에 대해 read로 열어주고 zip_ref라고 한다.
# 아까 설정한 path에 압축을 풀어준다.
with zipfile.ZipFile(zipfilename1, 'r') as zip_ref:
    zip_ref.extractall(path1)
```


```python
# 디렉토리에 풀린 zip파일을 확인한다.
%ls
# 잘 풀렸다.
```

     C 드라이브의 볼륨: OS
     볼륨 일련 번호: A64A-9C53
    
     C:\Users\yein4\seq2seq_test 디렉터리
    
    2021-08-23  오전 10:02    <DIR>          .
    2021-08-23  오전 10:02    <DIR>          ..
    2021-08-23  오전 10:02    <DIR>          .ipynb_checkpoints
    2021-08-23  오전 10:04             1,441 _about.txt
    2021-08-23  오전 10:02            33,336 2021_Attention.ipynb
    2021-08-22  오후 11:07            37,814 2021_seq2seq(v).ipynb
    2021-08-23  오전 10:00            36,137 2021_seq2seq(v2).ipynb
    2021-08-23  오전 10:02            36,241 2021_seq2seq(v2)_Attention.ipynb
    2021-08-23  오전 10:02            29,907 2021_seq2seq.ipynb
    2021-08-22  오후 04:49            47,142 2021_seq2seq_with_pytorch.ipynb
    2021-08-23  오전 10:04        37,686,235 deu.txt
    2021-08-23  오전 10:04         9,079,830 deu-eng.zip
                   9개 파일          46,988,083 바이트
                   3개 디렉터리  266,440,474,624 바이트 남음
    


```python
# dew.txt를 읽어올 것이다. 
# source language를 독일어로, target language를 영어로 읽어온다.
# 그리고 licence 부분이 있는데 이건 나중에 지운다. 일단 있으니까 이름은 지어준다.
lines1 = pd.read_csv('deu.txt', names=['tar','src','lic'], sep='\t')
```


```python
print(type(lines1))
print(lines1.describe())
```

    <class 'pandas.core.frame.DataFrame'>
                                          tar               src  \
    count                              242586            242586   
    unique                             194650            221045   
    top     Do you want another one of these?  Es geht mir gut.   
    freq                                   36                12   
    
                                                          lic  
    count                                              242586  
    unique                                             242586  
    top     CC-BY 2.0 (France) Attribution: tatoeba.org #2...  
    freq                                                    1  
    


```python
# lic column을 지운다.
del lines1['lic']
print(lines1.describe())
```

                                          tar               src
    count                              242586            242586
    unique                             194650            221045
    top     Do you want another one of these?  Es geht mir gut.
    freq                                   36                12
    


```python
# 데이터 양이 얼마나 되는지 확인하자
len(lines1)
```




    242586




```python
# 연습용이니까 데이터를 조금 줄여서 사용한다.
lines1 = lines1.loc[:,'tar':'src'] # lines1의 src와 tar를 가져온다.
print(lines1)
```

                                                          tar  \
    0                                                     Go.   
    1                                                     Hi.   
    2                                                     Hi.   
    3                                                    Run!   
    4                                                    Run.   
    ...                                                   ...   
    242581  If someone who doesn't know your background sa...   
    242582  If someone who doesn't know your background sa...   
    242583  It may be impossible to get a completely error...   
    242584  I know that adding sentences only in your nati...   
    242585  Doubtless there exists in this world precisely...   
    
                                                          src  
    0                                                    Geh.  
    1                                                  Hallo!  
    2                                              Grüß Gott!  
    3                                                   Lauf!  
    4                                                   Lauf!  
    ...                                                   ...  
    242581  Wenn jemand Fremdes dir sagt, dass du dich wie...  
    242582  Wenn jemand, der nicht weiß, woher man kommt, ...  
    242583  Es ist wohl unmöglich, einen vollkommen fehler...  
    242584  Ich weiß wohl, dass das ausschließliche Beitra...  
    242585  Ohne Zweifel findet sich auf dieser Welt zu je...  
    
    [242586 rows x 2 columns]
    


```python
lines1 = lines1[0:80000] # 그리고 10만개만 사용한다.
```


```python
# target문장의 앞과 뒤에 beginning of sequence(\t) 토큰과 end of sequence(\n)를 넣어준다.
lines1.tar = lines1.tar.apply(lambda x: '\t' + x + '\n')
lines1[:10]
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
      <th>tar</th>
      <th>src</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>\tGo.\n</td>
      <td>Geh.</td>
    </tr>
    <tr>
      <th>1</th>
      <td>\tHi.\n</td>
      <td>Hallo!</td>
    </tr>
    <tr>
      <th>2</th>
      <td>\tHi.\n</td>
      <td>Grüß Gott!</td>
    </tr>
    <tr>
      <th>3</th>
      <td>\tRun!\n</td>
      <td>Lauf!</td>
    </tr>
    <tr>
      <th>4</th>
      <td>\tRun.\n</td>
      <td>Lauf!</td>
    </tr>
    <tr>
      <th>5</th>
      <td>\tWow!\n</td>
      <td>Potzdonner!</td>
    </tr>
    <tr>
      <th>6</th>
      <td>\tWow!\n</td>
      <td>Donnerwetter!</td>
    </tr>
    <tr>
      <th>7</th>
      <td>\tDuck!\n</td>
      <td>Kopf runter!</td>
    </tr>
    <tr>
      <th>8</th>
      <td>\tFire!\n</td>
      <td>Feuer!</td>
    </tr>
    <tr>
      <th>9</th>
      <td>\tHelp!\n</td>
      <td>Hilfe!</td>
    </tr>
  </tbody>
</table>
</div>




```python
!pip install spacy # 토큰화에 사용할 spacy를 install한다.
```


```python
%%capture
!python -m spacy download en_core_web_sm 
!python -m spacy download de_core_news_sm 
```



```python
import spacy

spacy_en = spacy.load('en_core_web_sm') # 영어 토큰화(tokenization)
spacy_de = spacy.load('de_core_news_sm') # 독일어 토큰화(tokenization)

# 중복이 없고 순서가 없는 집합 자료형을 만든다.
src_vocab = set()
tar_vocab = set()


for line in lines1.src: 
    for i in line: 
        L=spacy_de.tokenizer(i)
        src_vocab.add(L.text) 


for line in lines1.tar: # lines1의 src에서 하나씩 읽어 와서 # tokenize한 걸 L에 담아
    for i in line: 
        L=spacy_en.tokenizer(i)# L에 담긴 단어를 하나씩 방문하여
        tar_vocab.add(L.text) 
        

print(list(src_vocab)[:100])
print(list(tar_vocab)[:100])
```

    ['\xad', 'y', 'F', 'Z', ':', 'i', 'x', '4', 'c', 'b', 'ˋ', "'", 'o', 'O', '—', 'G', 'p', '\u200b', '9', 'Ä', 'e', 'u', 'n', '5', 'Ü', '0', '+', 'ß', 'ö', '%', '“', 'ō', 'K', 'V', 'r', '"', 'û', 't', 'w', 'L', 'H', 'M', '8', 'R', 'P', 'B', 'T', ' ', 'Ö', 'C', 'D', 'q', '?', '!', '’', 'm', '2', 'á', 'd', 'ű', 'h', 'z', '6', 'é', ',', 'E', '„', 's', 'ñ', 'Y', '\u202f', '7', '3', 'ä', 'j', 'g', 'l', '–', '\xa0', 'f', 'k', '-', 'S', 'Q', '.', 'I', 'a', 'U', 'N', 'A', 'W', '$', 'ü', 'X', 'v', 'J', 'ū', '1']
    ['y', 'F', 'Z', ':', 'i', 'x', '4', 'c', 'b', "'", 'o', 'O', 'G', 'p', '9', 'e', '\n', 'u', 'n', '5', '0', '+', '%', 'K', 'V', 'r', '"', 'w', 't', 'L', 'H', 'M', '8', 'R', 'P', 'B', 'T', ' ', 'C', 'D', 'q', '?', '!', 'm', '2', 'd', 'h', 'z', '6', 'é', ',', 'E', 's', '€', 'ñ', 'Y', '7', '3', 'ï', 'j', 'g', 'l', 'f', 'k', '-', 'S', 'Q', '.', '/', 'I', 'a', 'U', 'N', 'A', 'W', '$', 'v', '\t', 'J', '1']
    



```python
src_vocab = sorted(list(src_vocab)) # src_vocab를 리스트로 만들고 정렬한다.
tar_vocab = sorted(list(tar_vocab)) # tar_vocab를 리스트로 만들고 정렬한다.

src_vocab_size = len(src_vocab) + 1 # src_vocab의 size를 계산한다.
tar_vocab_size = len(tar_vocab) +1 # tar_vocab의 size를 계산한다.

print(f"src_vocab: {src_vocab[:10]}")
print(f"tar_vocab: {tar_vocab[:10]}")
print(f"src_vocab_size: {src_vocab_size}")
print(f"tar_vocab_size: {tar_vocab_size}")
```

    src_vocab: [' ', '!', '"', '$', '%', "'", '+', ',', '-', '.']
    tar_vocab: ['\t', '\n', ' ', '!', '"', '$', '%', "'", '+', ',']
    src_vocab_size: 99
    tar_vocab_size: 81
    


```python
# 이제 인덱스를 붙여줘야 한다.
# src_vocab과 tar_vocab의 인덱스와 요소값을 하나씩 돌면서 딕셔너리에 넣어주는데, 
# 인덱스값은 0부터 시작하니까 +1을 해준다.
src2idx = dict([(word, i + 1) for i, word in enumerate(src_vocab)])
tar2idx = dict([(word, i + 1) for i, word in enumerate(tar_vocab)])

# 단어별로 인덱스가 붙어서 딕셔너리를 형성됐다.
#print(f"src2idx: {src2idx}\n")
#print(f"tar2idx: {tar2idx}")
```




```python
'''
이제 인코더에 입력될 입력 데이터를 구성해서 문장 내 단어들을 딕셔너리에서 상응되는
인덱스로 변환하여 그걸 리스트로 만든다.
source language는 뒤집어서 들어가는 것이 좋다고 논문에 나와있으니까 뒤집어준다.
'''
# 독일어(Deutsch) 문장을 토큰화한 뒤에 순서를 뒤집는 함수를 만든다
def tokenize_de(text):
    return [token.text for token in spacy_de.tokenizer(text)][::-1]
# 영어(English) 문장을 토큰화 하는 함수를 만든다
def tokenize_en(text):
    return [token.text for token in spacy_en.tokenizer(text)]

# 리스트를 만든다
encoder_input = []
decoder_input = []
decoder_target = []

for line in lines1.src:
    encoder_input.append([src2idx[word] for word in line])
for line in lines1.tar:
    decoder_input.append([tar2idx[word] for word in line])
for line in lines1.tar:
    decoder_target.append([tar2idx[word] for word in line if word != '\t'])



print(f"encoder_input: {encoder_input[:10]}\n")
print(f"decoder_input: {decoder_input[:10]}\n")
print(f"decoder_target: {decoder_target[:10]}")

# NotebookApp.iopub_data_rate_limit 해결: https://seong6496.tistory.com/98
```

    encoder_input: [[29, 53, 56, 10], [30, 49, 60, 60, 63, 2], [29, 66, 87, 80, 1, 29, 63, 68, 68, 2], [34, 49, 69, 54, 2], [34, 49, 69, 54, 2], [38, 63, 68, 74, 52, 63, 62, 62, 53, 66, 2], [26, 63, 62, 62, 53, 66, 71, 53, 68, 68, 53, 66, 2], [33, 63, 64, 54, 1, 66, 69, 62, 68, 53, 66, 2], [28, 53, 69, 53, 66, 2], [30, 57, 60, 54, 53, 2]]
    
    decoder_input: [[1, 32, 65, 12, 2], [1, 33, 59, 12, 2], [1, 33, 59, 12, 2], [1, 43, 71, 64, 4, 2], [1, 43, 71, 64, 12, 2], [1, 48, 65, 73, 4, 2], [1, 48, 65, 73, 4, 2], [1, 29, 71, 53, 61, 4, 2], [1, 31, 59, 68, 55, 4, 2], [1, 33, 55, 62, 66, 4, 2]]
    
    decoder_target: [[32, 65, 12, 2], [33, 59, 12, 2], [33, 59, 12, 2], [43, 71, 64, 4, 2], [43, 71, 64, 12, 2], [48, 65, 73, 4, 2], [48, 65, 73, 4, 2], [29, 71, 53, 61, 4, 2], [31, 59, 68, 55, 4, 2], [33, 55, 62, 66, 4, 2]]
    


```python
# padding을 해서 길이를 맞춰준다. 데이터에서 가장 긴 길이로 맞춘다.
from tensorflow.keras.preprocessing.sequence import pad_sequences

max_src_len = max([len(line) for line in lines1.src])
max_tar_len = max([len(line) for line in lines1.tar])

# padding은 뒷부분에 0을 채우는 방식으로(post) 진행한다.
encoder_input = pad_sequences(encoder_input, maxlen= max_src_len, padding='post')
decoder_input = pad_sequences(decoder_input, maxlen= max_tar_len, padding='post')
decoder_target = pad_sequences(decoder_target, maxlen= max_tar_len, padding='post')

print(encoder_input)
```

    [[29 53 56 ...  0  0  0]
     [30 49 60 ...  0  0  0]
     [29 66 87 ...  0  0  0]
     ...
     [31 51 56 ...  0  0  0]
     [27 57 62 ...  0  0  0]
     [31 51 56 ...  0  0  0]]
    


```python
# to_categorical을 이용하여 one-hot-vector로 바꿔준다.
from tensorflow.keras.utils import to_categorical

encoder_input = to_categorical(encoder_input)
decoder_input = to_categorical(decoder_input)
decoder_target = to_categorical(decoder_target)
```

## Encoder

- encoder는 여러 RNN cell(LSTM)로 구성된다.
- encoder로 들어온 단어들을 embedding해서 LSTM을 거친 후 마지막 hidden state를
  decoder의 첫 번째 hidden state로 넘겨준다(context vector). 즉, encoder는 
  입력 sequence를 고정된 길이의 context vector로 압축해서 decoder에 넘겨주는 것이다.


```python
from tensorflow.keras.layers import Input, LSTM

encoder_input_s = Input(shape=(None, src_vocab_size))
# encoder의 LSTM은 latant state를 반환하여 decoder로 넘겨줘야 하기 때문에
# return_state를 True로 설정해준다.
encoder_lstm = LSTM(256, return_state=True)
encoder_output_s, hidden_state, cell_state = encoder_lstm(encoder_input_s)
encoder_states = [hidden_state, cell_state]
```

## Decoder

- encoder로부터 encoder output과 전체 입력 sequence에 대한 context vector를 받아와서
  sequence를 만들어내는 부분이다.
- encoder와 마찬가지로 여러 개의 lstm으로 구성된다.
- teacher forcing을 위해 정답 데이터가 필요하다.


```python
from tensorflow.keras.layers import Dense

decoder_input_s = Input(shape=(None, tar_vocab_size))
# sequence를 반환해야 하니까 return_sequences를 True로 설정하고,
# state도 반환하도록 설정한다.
decoder_lstm = LSTM(256, return_sequences=True, return_state=True)
# decoder 처음에 들어가는 초기 state값은 encoder에서 받아온 state값을 넣는다
decoder_output_s, _, _ = decoder_lstm(decoder_input_s, initial_state=encoder_states)
decoder_softmax_layer = Dense(tar_vocab_size, activation='softmax')
# decoder output을 정의한다. decoder 결과를 softmax에 통과시켜준다.
decoder_output_s = decoder_softmax_layer(decoder_output_s)
```

## Attention

seq2seq의 결과가 그렇게 좋지는 않다. context vector가 병목현상 비슷한 것을 야기한다. 즉, 하나의 고정 길이 벡터에 모든 정보를 압축하면 정보가 손실될 수밖에 없다. 이러한 문제를 해결하기 위해 encoder의 정보를 하나로 압축하지 않고 그냥 통으로 참조하여 decoder가 예측하는데에 쓴다. 하지만 입력문장 전체를 단순히 참조하지 않고 참조할 가치가 있는 것에 집중하여 그것을 예측에 사용한다. 이것이 Attention Mechanism의 전반적인 개념이다.

과정:

1. encoder의 hidden state값과 decoder의 hidden state값을 내정해서 attention score를 계산하고 softmax로 attention distribution을 구한다. attention distribution을 구하면 어디에 attention을 해야 하는지 알게 된다.  
2. encoder의 attention가중치와 hidden state를 weighted sum해서 attention 값을 구한다.  
3. attention값과 decoder의 t시점 hidden state를 concatenate한다.  


```python
from tensorflow.keras.layers import Input, LSTM

encoder_input_s = Input(shape=(None, src_vocab_size))
encoder_lstm = LSTM(256, return_state=True)

encoder_output_s, h_state, c_state = encoder_lstm(encoder_input_s)
encoder_states = [h_state, c_state]
```


```python
from tensorflow.keras.layers import Dense

decoder_input_s = Input(shape=(None, tar_vocab_size))
decoder_lstm = LSTM(256, return_sequences=True, return_state=True)
decoder_output_s, _, _ = decoder_lstm(decoder_input_s, initial_state=encoder_states)
```


```python
import tensorflow as tf
from tensorflow.keras.layers import Attention

# hidden state와 디코더의 최종 출력을 연결하고 S_에 담는다.
# 형태를 맞추기 위해 축을추가해준다.
S_ = tf.concat([h_state[:, tf.newaxis, :], decoder_output_s[:, :-1, :]], axis=1)

# 이제 Attention layer를 만든다.
attention1 = Attention()
# 방금 concat한 결과랑 encoder의 output들을 넘겨준다. 이러면 context vector가 만들어진다.
context_vector = attention1([S_, encoder_output_s])

concat1 = tf.concat([decoder_output_s, context_vector], axis=-1)

# distribution을 구한다.
decoder_softmax_layer = Dense(tar_vocab_size, activation='softmax')

decoder_output_s = decoder_softmax_layer(concat1)
```

## Train


```python
from tensorflow.keras.models import Model
A_model = Model([encoder_input_s, decoder_input_s], decoder_output_s)
A_model.compile(optimizer='adam', loss= 'categorical_crossentropy')
```


```python
A_model.fit(x=[encoder_input, decoder_input], 
            y=decoder_target,
           batch_size=128,
           epochs=25,
           validation_split=0.2)
```

    Epoch 1/25
    500/500 [==============================] - 535s 1s/step - loss: 1.7177 - val_loss: 1.7280
    Epoch 2/25
    500/500 [==============================] - 536s 1s/step - loss: 1.2183 - val_loss: 1.5738
    Epoch 3/25
    500/500 [==============================] - 525s 1s/step - loss: 1.0842 - val_loss: 1.4406
    Epoch 4/25
    500/500 [==============================] - 566s 1s/step - loss: 0.9884 - val_loss: 1.3354
    Epoch 5/25
    500/500 [==============================] - 507s 1s/step - loss: 0.9185 - val_loss: 1.2610
    Epoch 6/25
    500/500 [==============================] - 519s 1s/step - loss: 0.8748 - val_loss: 2.6678
    Epoch 7/25
    500/500 [==============================] - 515s 1s/step - loss: 0.8686 - val_loss: 1.1741
    Epoch 8/25
    500/500 [==============================] - 531s 1s/step - loss: 0.8376 - val_loss: 1.1696
    Epoch 9/25
    500/500 [==============================] - 567s 1s/step - loss: 0.8001 - val_loss: 1.1158
    Epoch 10/25
    500/500 [==============================] - 511s 1s/step - loss: 0.7781 - val_loss: 1.1215
    Epoch 11/25
    500/500 [==============================] - 503s 1s/step - loss: 0.7567 - val_loss: 1.0880
    Epoch 12/25
    500/500 [==============================] - 511s 1s/step - loss: 0.7258 - val_loss: 1.0769
    Epoch 13/25
    500/500 [==============================] - 516s 1s/step - loss: 0.6929 - val_loss: 1.0089
    Epoch 14/25
    500/500 [==============================] - 516s 1s/step - loss: 0.6664 - val_loss: 1.0241
    Epoch 15/25
    500/500 [==============================] - 484s 968ms/step - loss: 0.6473 - val_loss: 1.0062
    Epoch 16/25
    500/500 [==============================] - 531s 1s/step - loss: 0.6324 - val_loss: 1.0216
    Epoch 17/25
    500/500 [==============================] - 528s 1s/step - loss: 0.6186 - val_loss: 0.9907
    Epoch 18/25
    500/500 [==============================] - 530s 1s/step - loss: 0.6045 - val_loss: 0.9974
    Epoch 19/25
    500/500 [==============================] - 534s 1s/step - loss: 0.5914 - val_loss: 1.0205
    Epoch 20/25
    500/500 [==============================] - 541s 1s/step - loss: 0.5794 - val_loss: 0.9973
    Epoch 21/25
    500/500 [==============================] - 547s 1s/step - loss: 0.5692 - val_loss: 0.9903
    Epoch 22/25
    500/500 [==============================] - 385s 770ms/step - loss: 0.5584 - val_loss: 1.0034
    Epoch 23/25
    500/500 [==============================] - 482s 964ms/step - loss: 0.5497 - val_loss: 1.0115
    Epoch 24/25
    500/500 [==============================] - 546s 1s/step - loss: 0.5394 - val_loss: 1.0061
    Epoch 25/25
    500/500 [==============================] - 540s 1s/step - loss: 0.5316 - val_loss: 1.0153
    




    <tensorflow.python.keras.callbacks.History at 0x22dd4d442c8>



## Predict


```python
# encoder_outputs를 outputs에 추가
encoder_model = Model(inputs= encoder_input_s, 
                      outputs= [encoder_output_s ,encoder_states])

# 이부분 추가
encoder_h_state = Input(shape=(256))
encoder_output_s = Input(shape=(256))

decoder_h_states_input = Input(shape=(256))
decoder_c_states_input = Input(shape=(256))

decoder_states_inputs = [decoder_h_states_input, decoder_c_states_input]

decoder_output_s, h_state, c_state = decoder_lstm(decoder_input_s,
                                                  initial_state=decoder_states_inputs)
decoder_states = [h_state, c_state]

# 축을 추가해서 concat한다.
S_ = tf.concat([encoder_h_state[:, tf.newaxis, :], 
                decoder_output_s[:, :-1, :]], 
                axis=1)

# attention layer에 S_와 encoder output을 넣는다.
context_vector = attention1([S_, encoder_output_s])
decoder_concat = tf.concat([decoder_output_s, context_vector], axis=-1)

# concat한 거를 softmax에 통과시킨다.
decoder_output_s = decoder_softmax_layer(decoder_concat)
# encoder_h_state, encoder_output_s추가
decoder_model = Model(inputs=[decoder_input_s, encoder_h_state, encoder_output_s] 
                      + decoder_states_inputs, 
                      outputs= [decoder_output_s] + decoder_states)
```


```python
idx2src = dict((i, char) for char, i in src2idx.items())
idx2tar = dict((i, char) for char, i in tar2idx.items())
```


```python
def decoder_predict_part(input_seq):
    outputs_input, states_value = encoder_model.predict(input_seq)
    
    target_seq = np.zeros((1, 1, tar_vocab_size))
    target_seq[0, 0, tar2idx['\t']] = 1
    
    stop = False
    
    decoded_sentence = ""
    
    while not stop:
        # states_value 첫 번째꺼([0]), outputs_input 추가
        output_tokens, hidden, context = decoder_model.predict([target_seq, states_value[0], outputs_input] + states_value)
        
        sampled_token_index = np.argmax(output_tokens[0, -1, :])
        sampled_char = idx2tar[sampled_token_index]
        
        decoded_sentence += sampled_char
        
        if sampled_char == '\n' or len(decoded_sentence) > max_tar_len:
            stop = True
        
        target_seq = np.zeros((1, 1, tar_vocab_size))
        target_seq[0, 0, sampled_token_index] = 1.
        
        states_value = [hidden, context]
        
    return decoded_sentence
```


```python
import numpy as np

for seq_idx in [1073, 7538, 50784]:
    input_seq = encoder_input[seq_idx : seq_idx+1]
    decoded_sentence = decoder_predict_part(input_seq)
    
    print("input: ", lines1.src[seq_idx])
    print("target: ", lines1.tar[seq_idx][1 : len(lines1.tar[seq_idx])-1])
    print("translate: ", decoded_sentence[:len(decoded_sentence)-1], '\n')
```

    input:  Halte hier.
    target:  Stop here.
    translate:  Stop that now. 
    
    input:  Warte bis sechs.
    target:  Wait till six.
    translate:  Wait a second. 
    
    input:  Sie können Tom nicht ändern.
    target:  You can't change Tom.
    translate:  You can't stop Tom. 
    
 
Seq2Seq만 썼을 때 보단 괜찮아졌다. -> [Seq2Seq](https://finddme.github.io/natural%20language%20processing/2019/11/11/Seq2SeqCode/)
