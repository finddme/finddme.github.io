---
title: "__CODE__ Seq2Seq"
category: Natural Language Processing
tag: NLP
---
**Seq2Seq 실습 코드: [https://github.com/finddme/Finddme_Blog_Code/blob/master/NLP_Code/2021_seq2seq_v2.ipynb](https://github.com/finddme/Finddme_Blog_Code/blob/master/NLP_Code/2021_seq2seq_v2.ipynb)**  








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
    
    2021-08-22  오후 11:15    <DIR>          .
    2021-08-22  오후 11:15    <DIR>          ..
    2021-08-22  오후 09:35    <DIR>          .ipynb_checkpoints
    2021-08-22  오후 11:16             1,441 _about.txt
    2021-08-21  오후 02:35            33,336 2021_Attention.ipynb
    2021-08-22  오후 11:07            37,814 2021_seq2seq(v).ipynb
    2021-08-22  오후 11:15            36,238 2021_seq2seq(v2).ipynb
    2021-08-22  오후 11:14            26,822 2021_seq2seq.ipynb
    2021-08-22  오후 04:49            47,142 2021_seq2seq_with_pytorch.ipynb
    2021-08-22  오후 11:16        37,686,235 deu.txt
    2021-08-22  오후 11:16         9,079,830 deu-eng.zip
                   8개 파일          46,948,858 바이트
                   3개 디렉터리  270,119,485,440 바이트 남음
    


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

    ['e', 'ü', 'û', 'Z', 'l', '?', 'Ö', '4', 'Ü', 'ű', 'H', 'a', 'I', '\u200b', 'G', '\u202f', 'ö', '“', '1', 'O', '3', 'L', 't', '%', 'y', '’', 'd', 'á', 'u', ' ', '—', 'r', 'i', 'v', '$', '\xad', 'Y', 'P', '6', '2', 'z', 'p', 'Ä', '8', '-', 's', 'ū', 'E', 'J', 'n', 'm', 'B', '7', 'ß', '0', 'R', 'C', 'M', ',', 'b', 'f', 'F', 'T', 'h', 'V', 'k', "'", 'U', 'q', 'ñ', 'S', 'Q', '9', '„', 'j', ':', '.', 'ä', 'w', 'ˋ', 'g', 'c', '"', 'W', '5', '–', 'A', '\xa0', 'D', '+', 'é', 'o', 'X', 'x', '!', 'ō', 'K', 'N']
    ['e', 'Z', 'l', '?', '4', 'H', 'a', '\t', '/', 'I', 'G', '1', 'O', '3', 'L', 't', '%', 'y', 'd', 'u', ' ', 'r', 'i', 'v', '$', 'Y', 'P', '6', '2', 'z', 'p', '8', '-', 's', 'E', 'J', 'ï', 'n', 'm', 'B', '7', '0', 'R', 'C', 'M', ',', 'b', 'f', 'F', 'T', 'h', 'V', 'k', "'", 'q', 'U', 'ñ', 'S', 'Q', '9', 'j', ':', '.', 'w', 'g', 'c', '"', 'W', '5', 'A', 'D', '+', 'é', '\n', 'o', 'x', '€', '!', 'K', 'N']
    




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

## Train(Encoder + Decoder)


```python
from tensorflow.keras.models import Model
# encoder에 들어갈 입력과 decoder의 입력을 넣어주고, output을 디코더에서 나온 결과
model1 = Model([encoder_input_s, decoder_input_s],decoder_output_s)
# model을 compile시킨다. 모델의 파라미터를 설정하고 학습을 진행한다
model1.compile(optimizer='adam', loss='categorical_crossentropy')
# 이제 학습시킨다.
model1.fit(x=[encoder_input,decoder_input], 
           y=decoder_target, 
           batch_size=128, 
           epochs=25,
           validation_split=0.2)
```

    Epoch 1/25
    500/500 [==============================] - 869s 2s/step - loss: 1.8648 - val_loss: 1.8967
    Epoch 2/25
    500/500 [==============================] - 877s 2s/step - loss: 1.3198 - val_loss: 1.6912
    Epoch 3/25
    500/500 [==============================] - 866s 2s/step - loss: 1.1841 - val_loss: 1.5349
    Epoch 4/25
    500/500 [==============================] - 802s 2s/step - loss: 1.0749 - val_loss: 1.4196
    Epoch 5/25
    500/500 [==============================] - 755s 2s/step - loss: 1.0072 - val_loss: 1.3638
    Epoch 6/25
    500/500 [==============================] - 749s 1s/step - loss: 0.9532 - val_loss: 1.2925
    Epoch 7/25
    500/500 [==============================] - 746s 1s/step - loss: 0.9116 - val_loss: 1.2855
    Epoch 8/25
    500/500 [==============================] - 746s 1s/step - loss: 0.8727 - val_loss: 1.2265
    Epoch 9/25
    500/500 [==============================] - 755s 2s/step - loss: 0.8398 - val_loss: 1.1811
    Epoch 10/25
    500/500 [==============================] - 745s 1s/step - loss: 0.8125 - val_loss: 1.1380
    Epoch 11/25
    500/500 [==============================] - 747s 1s/step - loss: 0.7847 - val_loss: 1.1965
    Epoch 12/25
    500/500 [==============================] - 18482s 37s/step - loss: 0.7655 - val_loss: 1.1166
    Epoch 13/25
    500/500 [==============================] - 832s 2s/step - loss: 0.7437 - val_loss: 1.0580
    Epoch 14/25
    500/500 [==============================] - 795s 2s/step - loss: 0.7252 - val_loss: 1.0496
    Epoch 15/25
    500/500 [==============================] - 785s 2s/step - loss: 0.7108 - val_loss: 1.0511
    Epoch 16/25
    500/500 [==============================] - 791s 2s/step - loss: 0.6935 - val_loss: 1.0401
    Epoch 17/25
    500/500 [==============================] - 788s 2s/step - loss: 0.6809 - val_loss: 1.0374
    Epoch 18/25
    500/500 [==============================] - 790s 2s/step - loss: 0.6670 - val_loss: 1.0241
    Epoch 19/25
    500/500 [==============================] - 788s 2s/step - loss: 0.6585 - val_loss: 1.0057
    Epoch 20/25
    500/500 [==============================] - 908s 2s/step - loss: 0.6477 - val_loss: 1.0221
    Epoch 21/25
    500/500 [==============================] - 856s 2s/step - loss: 0.6369 - val_loss: 1.0021
    Epoch 22/25
    500/500 [==============================] - 835s 2s/step - loss: 0.6331 - val_loss: 0.9920
    Epoch 23/25
    500/500 [==============================] - 939s 2s/step - loss: 0.6287 - val_loss: 1.0302
    Epoch 24/25
    500/500 [==============================] - 864s 2s/step - loss: 0.6190 - val_loss: 0.9958
    Epoch 25/25
    500/500 [==============================] - 651s 1s/step - loss: 0.6059 - val_loss: 0.9851
    




    <tensorflow.python.keras.callbacks.History at 0x14319e77188>



## Predict

- 예측할 때 index 하나씩 예측을 한다. 예측한 인덱스를 저장하고, 다시 입력으로 사용해서 종료 토큰이 나올 때까지 반복한다.
- 예측한 index들을 사전을 통해 단어로 변환해서 sequence를 얻는다.


```python
encoder_model = Model(inputs= encoder_input_s, outputs= encoder_states)

# 예측에 사용될 decode의 hidden state
decoder_hidden_states_input = Input(shape=(256))
decoder_cell_states_input = Input(shape=(256))
decoder_states_inputs = [decoder_hidden_states_input, decoder_cell_states_input]

decoder_output_s, hidden_state, cell_state = decoder_lstm(decoder_input_s, 
                                                          initial_state=decoder_states_inputs)
decoder_states = [hidden_state, cell_state]

decoder_output_s = decoder_softmax_layer(decoder_output_s)

# 예측 모델
decoder_model = Model(inputs=[decoder_input_s] + decoder_states_inputs, 
                      outputs= [decoder_output_s] + decoder_states)
```


```python
# index를 단어로 바꿔줄 사전을 만든다.
idx2src = dict((i, char) for char, i in src2idx.items())
idx2tar = dict((i, char) for char, i in tar2idx.items())
```


```python
# 예측하는 함수를 정의한다
def decode_sequence(input_seq):
    states_value = encoder_model.predict(input_seq)
    
    # target_seq을 초기화시킨다. 크기는 tar_vocat_size로
    target_seq = np.zeros((1, 1, tar_vocab_size))
    # tar2idx로 \t
    target_seq[0, 0, tar2idx['\t']] = 1.
    
    stop = False # 안 멈추고 계속 반복한다
    
    decoded_sentence = ""
    
    while not stop:
        # encoder model통과하고 나온 값을 target_seq와 함께 디코더에 넣어준다
        output_tokens, hidden, cell = decoder_model.predict([target_seq] + states_value)
        
        sampled_token_index = np.argmax(output_tokens[0, -1, :])
        sampled_char = idx2tar[sampled_token_index]
        decoded_sentence += sampled_char
        
        if sampled_char == '\n' or len(decoded_sentence) > max_tar_len:
            stop = True
        
        target_seq = np.zeros((1, 1, tar_vocab_size))
        target_seq[0, 0, sampled_token_index] = 1.
        
        states_value = [hidden, cell]
        
    return decoded_sentence
```


```python
import numpy as np

for seq_idx in [1073, 7538, 50784]:
    input_seq = encoder_input[seq_idx : seq_idx+1][::-1]
    decoded_sentence = decode_sequence(input_seq)
    
    print(f"input: {lines1.src[seq_idx]}")
    print(f"target: {lines1.tar[seq_idx][1 : len(lines1.tar[seq_idx])-1]}")
    print("translate: ", decoded_sentence[:len(decoded_sentence)-1], '\n')
```

    input: Halte hier.
    target: Stop here.
    translate:  Don't let me do it. 
    
    input: Warte bis sechs.
    target: Wait till six.
    translate:  Why don't you get one? 
    
    input: Sie können Tom nicht ändern.
    target: You can't change Tom.
    translate:  She is a good student. 
    
    


결과가 많이 이상하다. 이 코드에 Attention을 추가하니까 좀 나아졌다. -> [Add Attention](https://finddme.github.io/natural%20language%20processing/2019/11/12/AttentionCode/)
