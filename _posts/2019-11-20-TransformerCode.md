---
title: "__CODE__ Transformer(ChatBot)"
category: Natural Language Processing
tag: NLP
---
**Transformer 실습 코드: [https://github.com/finddme/Finddme_Blog_Code/blob/master/NLP_Code/2021_Transformer(v).ipynb](https://github.com/finddme/Finddme_Blog_Code/blob/master/NLP_Code/2021_Transformer(v).ipynb)**  








* 목차
{:toc}












## Transformer Architecture

- Attention : 고정 길이의 context vecetor로 입력 sequence 정보를 압축하여 정보 손실이 발생하는 seq2seq model의 단점을 개선하기 위해 사용됨.
- Transformer : RNN계열의 모델을 사용하지 않고 encoder와 decoder를 Attention으로만 만든 모델. 

## Transformer Architecture | Positional Encoding

Transformer는 RNN계열 모델을 사용하지 않기 때문에 sequence의 위치 정보를 가지지 못한다. 그래서 Embedding vector에 따로 위치정보를 줘야 한다. 이걸 Positional Encoding이라고 한다. Positional Encoding은 sine과 cosine으로 계산된다.


```python
import numpy as np
import tensorflow as tf

# 1.차원과 문장 길이를 받아온다.
# 2. pos를 10000의 (2 * i / dim)승으로 나눈 것을 array로 해서 encoding vector를 만든다.
#    pos는 문장 길이만큼을 돌면서 하나씩 들어가는 값이다. 
#    즉, sentence에서 몇 번째 단어인지 그 값을 가져오는 것이다.
#    i는 차원만큼 돌면서 하나씩 들어가는 값이다. 여기에서 차원은 embedding vetor의 차원 수이다.
#    즉, embedding vector의 index를 가져오는 것이다. 
#    embedding vetor의 차원은 모든 층의 출력차원으로 사용된다. 
# 3. encoded_vectorization에서 짝수는 싸인으로 계산하고,
# 4. 홀수는 코싸인으로 계산한다.
# 5. encoded_vectorization을 상수로 만들어서 reshape해준다.

def positional_encoding(dim, sentence_length): # 1
    encoded_vectorization = np.array([pos / np.power(10000, 2 * i / dim) # 2
                                      for pos in range(sentence_length) 
                                      for i in range(dim)])
    encoded_vectorization[::2] = np.sin(encoded_vectorization[::2])
    encoded_vectorization[1::2] = np.cos(encoded_vectorization[1::2])
    
    return tf.constant(encoded_vectorization.reshape([sentence_length, dim]),
                       dtype=tf.float32)

# 반복문을 돌면서 encoding된 vector에서 짝수는 싸인, 홀수는 코싸인으로 계산하면 
# 해당 embedding vector 내에서 상대적인 위치정보를 가지게 된다.
```

## Transformer Architecture | Layer Normalization

나중에 tensor의 마지막 차원에 대해서 평균과 분산을 구하고, 정규화를 해야 한다. 정규화를 하면 모델 학습이 더 잘된다. 정규화 과정에서 사용할 함수를 만든다.


```python
# 1. epsilon값은 엄청 작은 값으로 한다
# 2. tensor의 차원을 알기 위해 get_shape를 한 후 [-1:]에 해당하는 정보를 feature_shape에 넣는다.
# 3. input의 평균값을 계산한다. axis는 -1, 차원 유지는 True로 한다.
# 4. input의 표준편차(Standard deviation)를 구한다. axis는 -1, 차원 유지는 True로 한다.
# 5. feature_shape 차원으로 모든 원소가 0인 텐서를 만든다.(즉, 0으로 초기화된 feature_shape)
# 6. feature_shape 차원으로 모든 원소가 1인 텐서를 만든다.(즉, 1로 초기화된 feature_shape)
# 7. input값에서 평균 값을 뺀 값을 1로 초기화된 feature_shape과 곱한 후, 표준편차값으로 나눠준다.
#    그런데 표준편차가 0일 수 있으니까 처음에 설정한 epsilon값을 좀 더해주고, 
#    거기에 0으로 초기화된 feature_shape을 더해준다.
# 이러면 feature_shape과 동일한 차원을 유지하며 layer 정규화가 된다.

def layer_normalization(inputs, eps = 1e-8): # 1
    feature_shape = inputs.get_shape()[-1:] # 2
    mean = tf.keras.backend.mean(inputs,[-1],keepdims=True) # 3
    std = tf.keras.backend.std(inputs,[-1],keepdims=True) # 4
    beta = tf.Variable(tf.zeros(feature_shape), trainable=False) # 5
    gamma = tf.Variable(tf.ones(feature_shape),trainable=False) # 6
    
    return gamma * (inputs - mean) / (std + eps) + beta
```


```python
# 각 층에 대해 한 번에 정규화하고 dropout하는 함수를 만든다.
def sublayer_connection(inputs, sublayer, dropout=0.2):
    outputs = layer_normalization(inputs + 
                                  tf.keras.layers.Dropout(dropout)(sublayer))
    return outputs
```

## Transformer Architecture | Attention

Transformer에 사용되는 Attention은 두 종류이다:

- Multi head Attention: decoder가 가지는 차원을 나눠서 병렬로 Attention을 수행한다. 이렇게 병렬로 수행한 Attention에서 나온 각 head들을 쭉 연결한다. 이러면 다양한 시각에서 정보를 수집할 수 있다.

- Self Attention: 기존의 Attention에서는 모든 시점의 encoder hidden state와 특정 시점의 decoder hidden state로 attention을 수행하는데, 이는 input sequence전체랑 target sequence 내의 token하나 간의 attention이 진행되는 것이다. 반면 Self Attention은 input sequence의 token끼리 attention을 수행한다. 그래서 'Self' Attention이다.

### Transformer Architecture | Attention | Scaled dot product attention
attention score function은 scaled dot product방식을 사용한다. Scaled dot product는 dot product attention으로 도출된 attention score를 k벡터 차원 크기의 루트값으로 나눠 scaling을 해주는 것이다. 


```python
# 1. 받아온 key값의 shape을 list형태로 바꿔서 마지막 값만 가져온다. -> key의 차원
# 2. key값을 transpeose한다. (transpose 기본은 [2, 1, 0]. 여기서는 차원 순서를 0, 2, 1로)
# 3. key와 query행렬을 곱한 것을 key의 차원값에 루트씌운 것으로 나누다.
# 4. defalt parameter로 masked를 False로 해놨는데 만약 True라면, masking할 영역을 정의해야 한다.
# 5. outputs의 [0,:,:]랑 같은 형태를 가지는 텐서를 1로 초기화시킨다.
# 6. tensorflow의 linear algebra에서 하삼각행렬에 앞서 1로 초기화한 텐서를 넣어준다. 
#    삼각행렬 밑에는 채우고, 위에는 패딩처리한다.
# 7. tril에 대해 axis=0의 차원을 하나 늘려주고, 
#    그것의 axis=0에 해당하는 요소는 outputs의 shape의 인덱스 0만큼 이어붙이고,
#    axis=1과 2는 각각 1번만 붙인다. 이러면 mask부분이 만들어진다.
# 8. 이제 masked된 부분을 아주 작은 음수값으로 만들어 padding처리한다.
# 9. masks가 0과 같다면, padding값을 사용하고, 아니면 outputs로 사용한다.
# 10. 그리고 softmax를 통과시킨다. 이러면 masking영역이 걸러진다.
# 11. attention_map과 value를 곱한 값을 반환하다.

def scaled_dot_product_attention(query, key, value, masked=False):
    key_dim_size = float(key.get_shape().as_list()[-1]) # 1
    key = tf.transpose(key, perm=[0, 2, 1]) # 2
    
    outputs = tf.matmul(query, key) / tf.sqrt(key_dim_size) # 3
    
    if masked: # 4
        diag_vals = tf.ones_like(outputs[0, :, :]) # 5
        tril = tf.linalg.LinearOperatorLowerTriangular(diag_vals).to_dense() # 6
        masks = tf.tile(tf.expand_dims(tril, 0), [tf.shape(outputs)[0], 1, 1]) # 7
        paddings = tf.ones_like(masks) * (-2 ** 30) # 8
        outputs = tf.where(tf.equal(masks, 0), paddings, outputs) # 9
    
    attention_map = tf.nn.softmax(outputs) # 10
    
    return tf.matmul(attention_map, value) # 11
```

### Transformer Architecture | Attention | Multi-head attention

Multi-head attention은 query, key, value를 받아서 각각을 행렬을 만들고, 행렬들의 head에 해당하는 수만큼 분리한다. 그리고 분리된 행렬들에 대해서 각각 attention을 수행한다. 수행결과를 연결하면 최종 attention값이 된다.


```python
# 요약: 
# query, key, value를 Dense layer로 만든 다음에 head만큼 분리시키고, 0번축을 기준으로 concat.
# 그리고나서 이것들을 scaled_dot_product시킨다. 이러면 attention map이 만들어진다.
# attention map을 head만큼 분리시키고 concat한다. 이걸 Dense를 씌워서 묶는다.

# 1. num_units는 Dense layer통과 후 출력되는 값의 크기
# 2. query를 Dense layer에 통과시켜 num_units크기로 출력시켜 그걸 다시 query로 만든다.
#    key랑 value도 마찬가지로 해준다.
# 3. query를 heads만큼 axis=-1으로 split하고 
#    가장 높은 차원을 기준으로(axis=0) concat한다.
# 4. 아까 만든 scaled_dot_product에 이 query, key, value를 넣어준다.
# 5. attention_map을 head만큰 쪼개서 가장 낮은 차원을 기준으로(axis=-1) concat한다.
# 6. 그리고 concat한 거를 Dense로 묶어준다.

def multi_head_attention(query, key, value, num_units, heads, masked=False): # 1
    query = tf.keras.layers.Dense(num_units, activation=tf.nn.relu)(query) # 2
    key = tf.keras.layers.Dense(num_units, activation=tf.nn.relu)(key)
    value = tf.keras.layers.Dense(num_units, activation=tf.nn.relu)(value)
    
    query = tf.concat(tf.split(query, heads, axis=-1), axis=0) # 3
    key = tf.concat(tf.split(key, heads, axis=-1), axis=0)
    value = tf.concat(tf.split(value, heads, axis=-1), axis=0)
    
    attention_map = scaled_dot_product_attention(query, key, value, masked) # 4
    
    attention_outputs = tf.concat(tf.split(attention_map, heads, axis=0), axis=-1) # 5
    attention_outputs = tf.keras.layers.Dense(num_units, activation= tf.nn.relu)(attention_outputs)
    
    return attention_outputs
```

## Transformer Architecture | Position wise Feed Forward Neural Netwok


```python
def feed_forward(inputs, num_units):
    feature_shape = inputs.get_shape()[-1]
    inner_layer = tf.keras.layers.Dense(num_units, activation=tf.nn.relu)(inputs)
    outputs = tf.keras.layers.Dense(feature_shape)(inner_layer)
    
    return outputs
```

## Transformer Architecture | Encoder

encoder는 하나의 multi head attention을 사용한다.


```python
# 일단 layer수만큼 만들어야 하니까 모듈을 먼저 만든다.
# 1. input값과 
#    multi_head_attention의 q, k, v로 inputs를, uum_unit으로는 model_dim을 넣은 값을 
#    아까 만든 sublayer_connection에 넣어서 normalization, dropout해준다.
#    (encoder에서는 q, k, v 다 inputs로 넣는다.)
# 2. self_attention을 input으로, num_unit은 받아온 ffnn_dim으로 feed_foeward에 넣고
#    그 결과를 sublayer_connection의 sublayer로, 
#    input은 앞서 만든 self_attention으로 넣어서 output을 만든다.
def encoder_module(inputs, model_dim, ffnn_dim, heads):
    self_attention = sublayer_connection(inputs, 
                                         multi_head_attention(inputs, inputs, inputs,
                                                             model_dim, heads)) # 1
    outputs = sublayer_connection(self_attention, feed_forward(self_attention,
                                                              ffnn_dim)) # 2
    return outputs
```


```python
# 이제 encoder를 만든다.
# 1. inputs로 받아온 겂을 outputs로 넘겨준다.
# 2. 레이어의 수만큼 반복하면서 outputs에 대해 encoder_module을 수행한다.
def encoder(inputs, model_dim, ffnn_dim, heads, num_layers):
    outputs = inputs # 1
    
    for i in range(num_layers): # 2
        outputs = encoder_module(outputs, model_dim, ffnn_dim, heads)
        
    return outputs
```

## Transformer Architecture | Decoder

Decoder에는 두 가지 Attention이 사용된다:
- Masked decoder self attention: decoder는 순차적으로 결과를 뱉어내는 구간이다. 순차적으로 예측을 수행하는데 예측 시점 이후에 위치한 곳에는 attention을 할 수 없도록 masking처리를 해야 한다. 그래서 masked attention이다.
- Encoder-decoder self attention: encoder의 multi head attention과 같은 거다.

따라서 Decoder는 위 두 Attention과 position wise Feed Forward Nueral Network로 구성된다. 


```python
# decoder도 마찬가지로 module을 만들어준다.
# 1. multi head attention의 q, k, v에 inputs를 넣어주고, 
#    decoder니까 masked를 True로 설정한다.
#    sublayer_connection에 위 결과를 sublayer로 넣어 dropout을 수행하고
#   input에는 받아온 inputs이랑 더헌 후 정규화한다.
# 2. 앞서 만든 masked_self_attention를 q로, 
#    encoder_outputs를 k와 v로 multi_head_attention을 수행한다.
#    그리고 그 결과를 sublayer로 sublayer_connection에 넣고, 
#    input으로는 masked_self_attention을 넣어서 연결해준다.
# 3. 그리고 feed_forward에 self_attention결과를 넣어 dropout한 것과 
#    self_attention을 이어서 정규화한다.
def decoder_module(inputs, encoder_outputs, model_dim, ffnn_dim, heads):
    masked_self_attention = sublayer_connection(inputs, 
                                                multi_head_attention(inputs, inputs, inputs,
                                                                    model_dim, heads,
                                                                    masked=True)) # 1
    self_attention = sublayer_connection(masked_self_attention, 
                                         multi_head_attention(masked_self_attention,
                                                             encoder_outputs, encoder_outputs,
                                                             model_dim, heads)) # 2
    outputs = sublayer_connection(self_attention,feed_forward(self_attention,
                                                             ffnn_dim)) # 3
    
    return outputs
```


```python
# 1. encoder만들 때와 유사한데, encoder_output을 받아온다는 점이 다르다.
# 2. inputs로 받아온 겂을 outputs로 넘겨준다.
# 3. layer수 만큼 반복하면서 outputs에 대해 
#    decoder_module을 수행하고 다신 outputs에 넣어주는 작업을 반복한다.
def decoder(inputs, encoder_outputs, model_dim, ffnn_dim, heads, num_layers): # 1
    outputs = inputs # 2
    
    for i in range(num_layers): # 3
        outputs = decoder_module(outputs, encoder_outputs, model_dim, ffnn_dim, heads)
    
    return outputs
```

## Chat Bot

앞서 Transformer 구성을 만들었으니까 이것을 사용하여 ChatBot을 만들어보겠다.  

## Chat Bot | Data Preprocessing


```python
import re
import tensorflow as tf

filters = "([~.,!?\"':;)(])" # 불필요한 기호들을 제거하기 위해 fliter로 등록해 놓는다.

PAD = '<PADDING>' # token으로 사용할 거 만들어 줌.
STD = '<START>'
END = '<END>'
UNK = '<UNKNOWN>'

PAD_INDEX = 0 # index로 사용할 거 만들어 줌.
STD_INDEX = 1
END_INDEX = 2
UNK_INDEX = 3

MARKER = [PAD, STD, END, UNK] # 토큰들 만든거 marker로 정의해 두고 필요할 때 불러서 사용.
CHANGE_FILTER = re.compile(filters) # 걸러낼 목록 complie
```

## Data Load


```python
from sklearn.model_selection import train_test_split
import pandas as pd

# 데이터 불러올 함수 정의.
# 1. 데이터 읽는다
# 2. 나중에 데이터 쓸 데이터를 보면 Q, A, label로 구성되어 있다. 
#    거기에서 Q랑 A를 각각 list로 받아와서 question과 answer에 담아준다.
# 3. input과 label을 분리한다. 비율은 8:2(question 8은 train_input, question 2는 answer)

def load_data(data_file):
    data_df = pd.read_csv(data_file, header=0) # 1
    question, answer = list(data_df['Q']), list(data_df['A']) # 2
    
    train_input, eval_input, train_label, eval_label = train_test_split(question,
                                                                       answer,
                                                                       test_size=0.2,
                                                                       random_state=111) # 3
    return train_input, eval_input, train_label, eval_label
```

## Create Vocabulary


```python
from konlpy.tag import Mecab
# 1. 형태소 분석기는 Mecab을 사용한다. 빠르고 성능이 좋다.
# 2. 형태소 분석 결과를 담을 리스트를 준비한다.
# 3. data에서 sequence를 한 줄씩 뽑고 거기에서 공백을 없앤 후에 형태소 분석을 한다. 
#    그리고 분석 결과를 공백을 기준으로 합친다.
# 4. 그걸 아까 만든 리스트에 담는다.

def prepro_like_morph(data):
    morph_analyzer = Mecab(dicpath=r"C:\mecab\mecab-ko-dic") # 1
    result_data = list() # 2
    
    for seq in data:
        fin_morphanalysis_sequence = " ".join(morph_analyzer.morphs(seq.replace(" ",""))) # 3  
        result_data.append(fin_morphanalysis_sequence) # 4
    return result_data
```


```python
# 1. 단어들을 담을 리스트를 만든다.
# 2. data를 돌면서 한 줄씩 특수문자들을 없앤다.
# 3. 특수문자가 제거된 문장을 공백을 기준으로 나눠 for문을 돌며 한 단어씩 words에 넣는다.
# 4. 리스트 형태로 반환한다.
def data_tokenizer(data):
    words = [] # 1
    for sentence in data:
        sentence = re.sub(CHANGE_FILTER,"",sentence) # 2
        
        for word in sentence.split(): # 3
            words.append(word)
    return [word for word in words if word] # 4
```


```python
import pandas as pd 

# 1. Data Load할 때 했던 것처럼 questino과 answer를 리스트로 각각 담는다.
# 2. 형태소분석 함수 prepro_like_morph에 question을 넣어 형태소 분석을 한다.
# 3. data담을 리스트를 만들어서 
#    어차피 모든 vocab이 들어가야 하니까 question, answer 구분 없이 다 넣는다.
# 4. tokenize한다.
# 5. tokenize한 걸 리스트 형태로 만든다.
# 6. 아까 만든 marker token들을 맨뒤에 추가한다. 그래야 특정 기능을 하는 토큰들도 vocab에 들어가니까.
# 7. 단어를 해당 인덱스로 변환하는거랑 인덱스를 해당하는 단어로 바꾸는거.

def load_vocab(data_file):
    data_df = pd.read_csv(data_file, encoding='utf-8')
    question, answer = list(data_df['Q']), list(data_df['A']) # 1
    
    if tokenize_as_morph: # 2
        question = prepro_like_morph(question)
        answer = prepro_like_morph(answer)
    
    data = [] # 3
    data.extend(question)
    data.extend(answer)
    
    words = data_tokenizer(data) # 4
    words = list(set(words)) # 5
    words[:0] = MARKER # 6
    
    char2idx = {char : idx for idx, char in enumerate(words)} # 7
    idx2char = {idx : char for idx, char in enumerate(words)}
    
    return char2idx, idx2char, len(char2idx)
```

## Encoder Processing


```python
# 1. 형태소문석을 해야 하면 아까 만든 형태소분석 함수에 value를 통과시킨다.
# 2. 형태소분석된 value를 하나씩 돌면서 특수문자를 제거한다.
# 3. 특수문자가 제거된 seq을 공백으로 기준으로 split해서 word에 하나씩 담는다.
# 4. get(딕셔너리 key값으로 value를 반환받는 함수)를 이용해 받아온 dictionary에서
#    word에 해당하는 index값이 dictionary에 있다면 sequence_index리스트를 확장해서
#    해당 인덱스를 넣는다.
# 5. 만약 없다면, unknown token을 넣어준다.
# 6. 만약 현재 sequence_index리스트의 길이가 max_length보다 크면 sequence_length의 값을 
#    max_len의 길이에 맞춰서 거기까지 잘라버려서 max_len길이에 맞춘다.
# 7. sequence_index의 길이를 sequence_length 리스트에 더해준다.
# 8. max_len에서 sequence_index의 길이를 뺀 값을 padding token을 곱해서 sequence_index에 넣어준다.
#    이렇게 하면 max_len의 길이가 sequence_length랑 같아서 뺀 값이 0이면 seqeunce_index에 넣을게 따로 없는 것이고,
#    sequence_index길이가 max_len보다 작으면 mex_len만큼 padding을 해주는 것이다.
def encoder_processing(value, dictionary):
    sequence_input_index = []
    sequences_length = []
    
    if tokenize_as_morph: # 1
        value = prepro_like_morph(value)
        
    for seq in value:
        seq = re.sub(CHANGE_FILTER,"",seq) # 2
        
        seqence_index = []
        
        for word in seq.split(): # 3
            if dictionary.get(word) is not None: # 4
                seqence_index.extend([dictionary[word]])
            else: # 5
                sequence_index.extend([dictionary[UNK]])
        
        if len(seqence_index) > max_len: # 6
            seqence_index = seqence_index[:max_len] 
        
        sequences_length.append(len(seqence_index)) # 7
        seqence_index += (max_len - len(seqence_index)) * [dictionary[PAD]] # 8
        sequence_input_index.append(seqence_index)
    
    return np.asarray(sequence_input_index), sequences_length
```

## Decoder Processing


```python
# 전반적으로 encoder_processing이랑 비슷하다.
# 1. dictionary에 start token을 넣고 seq를 공백을 기준으로 나눈 것의 단어들을 dictionary에 넣는다.
#    이러면 문장 맨 앞에 start token이 들어가게 된다.

def decoder_output_processing(value, dictionary):
    sequence_output_index = []
    sequences_length = []
    
    if tokenize_as_morph:
        value = prepro_like_morph(value)
        
    for seq in value:
        seq = re.sub(CHANGE_FILTER,"",seq)
        
        seqence_index = []
        seqence_index = [dictionary[STD]] + [dictionary[word] for word in seq.split()] # 1     
        
        if len(seqence_index) > max_len:
            seqence_index = seqence_index[:max_len]
        
        sequences_length.append(len(seqence_index))
        seqence_index += (max_len - len(seqence_index)) * [dictionary[PAD]]
        sequence_output_index.append(seqence_index)
    
    return np.asarray(sequence_output_index), sequences_length
```


```python
# target이니까 length는 계산하지 않아도 된다.
# 1.seqence_index의 길이가 max_len 이상이면, max_len 뒤에 하나를 잘라서
#   END token을 넣어준다.
# 2. 만약 seqence_index의 길이가 max_len보다 작으면 max_len-1하지 말고 그냥 바로 END token을 넣어준다.


def decoder_target_processing(value, dictionary):
    sequence_target_index = []
    
    if tokenize_as_morph:
        value = prepro_like_morph(value)
        
    for seq in value:
        seq = re.sub(CHANGE_FILTER,"",seq)
        seqence_index = [dictionary[word] for word in seq.split()]
        
        if len(seqence_index) >= max_len: # 1
            seqence_index = seqence_index[:max_len -1] + [dictionary[END]]
        else: # 2
            seqence_index += [dictionary[END]]
        
        seqence_index += (max_len - len(seqence_index)) * [dictionary[PAD]]
        sequence_target_index.append(seqence_index)
    
    return np.asarray(sequence_target_index)
```

## Input Function

모델에 데이터를 효율적으로 넣을 수 있게 input function을 만든다.


```python
# 데이터를 변형시켜주는 함수이다.
# 1. 'input'은 받아온 input1이고, 'output'은 받아온 output1이다.
def rearrange(input1, output1, target1):
    features1 = {'input': input1, 'output': output1} # 1
    
    return features1, target1
# 이렇게 하면 features1과 target1에 따라서 map에서 input이랑 output결과를 변형해준다.
```

### Input Function | Train


```python
# 1. 데이터셋을 만든다.
# 2. 데이터셋을 섞어준다. buffer_size(train_input_encoder의 갯수)만큼 셔플한다.
# 3. batch 구분한다.
# 4. 데이터셋 전체에 함수를 mapping하는 map함수 사용해서 rearrange한다.
#    아까 만든 rearrange 함수를 기반으로 데이터를 계속 변형해준다.
# 5. iterator객체를 생성한다.
# 6. dataset1에 대해 생성한 iterator객체를 return한다.

def train_input_function(train_input_encoder, train_output_encoder,train_target_decoder, batch_size):
    dataset1 = tf.compat.v1.data.Dataset.from_tensor_slices((train_input_encoder,train_output_encoder,train_target_decoder))  # 1   
    dataset1 = dataset1.shuffle(buffer_size=len(train_input_encoder)) # 2
    dataset1 = dataset1.batch(batch_size) # 3
    dataset1 = dataset1.map(rearrange) # 4
    dataset1 = dataset1.repeat()
    iterator1 = dataset1.make_one_shot_iterator() # 5
    
    return iterator1.get_next() # 6
```

### Input Function | Evaluation


```python
def evaluation_input_function(eval_input_encoder, eval_output_encoder, eval_target_decoder, batch_size):
    dataset1 = tf.compat.v1.data.Dataset.from_tensor_slices((eval_input_encoder,eval_output_encoder,eval_target_decoder))
    dataset1 = dataset1.shuffle(buffer_size=len(eval_input_encoder))
    dataset1 = dataset1.batch(batch_size)
    dataset1 = dataset1.map(rearrange)
    dataset1 = dataset1.repeat(1) # 이 부분 빼고 train_input_function이랑 똑같
    iterator1 = dataset1.make_one_shot_iterator()
    
    return iterator1.get_next()
```

## Predict results to string

모델의 예측은 배열로 생성되기 때문에 그걸 문자열로 만들어줘야 한다.


```python
# value를 돌면서 index를 가져오고, dictionary에 그 index를 string에서 바꿔주고
# 바꿔준 string에 endtoken이 나오면 끝내고, padding이나 end token이 아니면 answer에 추가한다.
# 1. 끝이 아니면
# 2. value를 반복하면서 dictionary에서 해당 index에 대한 단어를 sentence_string에 넣어준다.
# 3. 문자열을 넣을 객체를 만든다.
# 4. sentence_string안에 word에 END token이 나오면 끝내라
# 5. 만약 word가 padding token이나 end token이 아니라면 answer에 넣어주고
# 6. 그 뒤에 공백도 하나 넣어준다.
def predict2string(value, dictionary):
    sentence_string = []
    
    is_finished = False # 1
    #print(value)
    
    for v in value: # 2
        #print(v['indexes'])
        sentence_string = [dictionary[index] for index in v['indexes']]
    
    answer = "" # 3
    
    for word in sentence_string:
        if word == END: # 4
            is_finished = True
            break
            
        if word != PAD and word != END: # 5
            answer += word
            answer += " " # 6
    #print(answer)
    return answer, is_finished
```

## Prepare Data


```python
# 이제 학습시킬 데이터를 데려오자

# !pip install Korpora
import pandas as pd 
# from Korpora import Korpora, KoreanChatbotKorpus

tokenize_as_morph = True # 토큰화한다.

# data = KoreanChatbotKorpus() 
# data = Korpora.load('korean_chatbot_data') # 이렇게 로드해오면 되는데... 안되서 다운받았다
# https://github.com/songys/Chatbot_data
data = './ChatbotData.csv'

char2idx, idx2char, len_vocab = load_vocab(data) 

train_input, eval_input, train_label, eval_label = load_data(data) # 데이터 불러와서 split한다. 
```

## Encoder + Decoder

앞에서 정의한 Transformer model의 encoder와 decoder를 합쳐서 모델을 만든다. 


```python
# Estimator params는 모델 정의할 때 설정할 것이다.
# 1. 모드를 정의한다.
# 2. 위치정보 encoding.
# 3. 만약 Estimator parameter가 사비에르면, emdedding initializer를 글로롯으로.
# 4. 아니면 유니폼 분포로해준다.
# 5. input의 embedding.
# 6. output의 embedding.
# 7. 아까 만든 encoder함수를 사용해서 encoder_outputs를 만든다.
# 8. decoder함수를 사용해서 decoder_outputs를 만든다. 여기에는 encoder_outptus가 들어간다.
# 9. decoder outputs를 Dense에 통과시켜 vocab size로 출력한다.
# 10. 현재 logits에 대한 argmax 값을 predict에 넣는다.
# 11. 현재 모드가 PREDICT면 indexes는 predict, logits는 logits. 그리고 이걸 EstimatorSpec에 넣어준다.
# 12. 만약 모드가 PREDICT가 아니면 vocab size만큼 one hot vector를 만든다.
# 13. loss 계산.
# 14. 만약 evaluate 모드면 EstimatorSpec에 loss값이랑 accuracy넣어준다.
# 15. train mode면 아래 코드를 따른다.
def e_d_model(features, labels, mode, params):
    TRAIN = mode == tf.estimator.ModeKeys.TRAIN # 1
    EVAL = mode == tf.estimator.ModeKeys.EVAL
    PREDICT = mode == tf.estimator.ModeKeys.PREDICT
    
    position_encode = positional_encoding(params['embedding_size'],
                                         params['max_len']) # 2
    
    if params['xavier_initializer']: # 3
        embedding_initializer = 'glorot_normal'
    else: # 4
        embedding_initializer = 'uniform'
    
    embedding = tf.keras.layers.Embedding(params['len_vocab'],params['embedding_size'],embeddings_initializer=embedding_initializer)
    
    x_embedded_matrix = embedding(features['input']) + position_encode # 5
    y_embedded_matrix = embedding(features['output']) + position_encode # 6
    
    encoder_outputs = encoder(x_embedded_matrix, 
                              params['model_hidden_size'],
                              params['ffnn_hidden_size'],
                              params['attention_head_size'],params['layer_size']
                             ) # 7
    decoder_outputs = decoder(y_embedded_matrix,
                              encoder_outputs,
                              params['model_hidden_size'],
                              params['ffnn_hidden_size'],
                              params['attention_head_size'],params['layer_size']
                             ) # 8
    logits = tf.keras.layers.Dense(params['len_vocab'])(decoder_outputs) # 9
    predict = tf.argmax(logits, 2) # 10
    
    if PREDICT: # 11
        predictions = {'indexes' : predict, 'logits' : logits}
        return tf.estimator.EstimatorSpec(mode, predictions=predictions)
    
    label_s = tf.one_hot(labels, params['len_vocab']) # 12
    loss = tf.reduce_mean(tf.compat.v1.nn.softmax_cross_entropy_with_logits_v2(logits=logits,
                                                                              labels=label_s)) # 13
    accuracy = tf.compat.v1.metrics.accuracy(labels=labels, predictions=predict)
    
    metrics = {'accuracy' : accuracy}
    tf.summary.scalar('accuracy', accuracy[1])
    
    if EVAL: # 14
        return tf.estimator.EstimatorSpec(mode, loss=loss, eval_metric_ops=metrics)
    assert TRAIN # 15
    
    optimizer = tf.compat.v1.train.AdamOptimizer(learning_rate=params['learning_rate'])
    train_op = optimizer.minimize(loss, global_step=tf.compat.v1.train.get_global_step())
    
    return tf.estimator.EstimatorSpec(mode, loss=loss, train_op=train_op)
```

## Model Train


```python
# parameter정의.
max_len = 25
epoch = 5000
batch_size = 256
embedding_size = 100
model_hidden_size =100
ffnn_hidden_size = 100 
attention_head_size = 100
lr = 0.001
layer_size = 3
xavier_initializer = True
```


```python
train_input_encoder, train_input_encoder_length = encoder_processing(train_input, char2idx)
train_output_decoder, train_output_decoder_length = decoder_output_processing(train_label,char2idx)
train_target_decoder = decoder_target_processing(train_label, char2idx)

eval_input_encoder, eval_input_encoder_length = encoder_processing(eval_input, char2idx)
eval_output_decoder, eval_output_decoder_length = decoder_output_processing(eval_label,char2idx)
eval_target_decoder = decoder_target_processing(eval_label, char2idx)
```

### Model Train | Estimator


```python
transformer = tf.estimator.Estimator(model_fn=e_d_model, 
                                     params= {'embedding_size':embedding_size,
                                              'model_hidden_size': model_hidden_size,
                                              'ffnn_hidden_size' : ffnn_hidden_size,
                                              'attention_head_size' : attention_head_size,
                                              'learning_rate' : lr,
                                              'len_vocab' : len_vocab,
                                              'layer_size' : layer_size,
                                              'max_len' : max_len,
                                              'xavier_initializer' : xavier_initializer})
```

    INFO:tensorflow:Using default config.
    WARNING:tensorflow:Using temporary folder as model directory: C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x
    INFO:tensorflow:Using config: {'_model_dir': 'C:\\Users\\yein4\\AppData\\Local\\Temp\\tmpfwak6o6x', '_tf_random_seed': None, '_save_summary_steps': 100, '_save_checkpoints_steps': None, '_save_checkpoints_secs': 600, '_session_config': allow_soft_placement: true
    graph_options {
      rewrite_options {
        meta_optimizer_iterations: ONE
      }
    }
    , '_keep_checkpoint_max': 5, '_keep_checkpoint_every_n_hours': 10000, '_log_step_count_steps': 100, '_train_distribute': None, '_device_fn': None, '_protocol': None, '_eval_distribute': None, '_experimental_distribute': None, '_experimental_max_worker_delay_secs': None, '_session_creation_timeout_secs': 7200, '_service': None, '_cluster_spec': ClusterSpec({}), '_task_type': 'worker', '_task_id': 0, '_global_id_in_cluster': 0, '_master': '', '_evaluation_master': '', '_is_chief': True, '_num_ps_replicas': 0, '_num_worker_replicas': 1}
    

### Model Train | Training


```python
transformer.train(input_fn=lambda:train_input_function(train_input_encoder,
                                                       train_output_decoder,
                                                       train_target_decoder,batch_size),steps=epoch)

evaluate_result = transformer.evaluate(input_fn=lambda:evaluation_input_function(eval_input_encoder,
                                                                                 eval_output_decoder,
                                                                                 eval_target_decoder,batch_size))
print("accuracy: {accuracy: 0.3f}".format(**evaluate_result))
```

    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Create CheckpointSaverHook.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-5000
    WARNING:tensorflow:From C:\Users\yein4\Anaconda3\lib\site-packages\tensorflow\python\training\saver.py:1077: get_checkpoint_mtimes (from tensorflow.python.training.checkpoint_management) is deprecated and will be removed in a future version.
    Instructions for updating:
    Use standard file utilities to get mtimes.
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 5000...
    INFO:tensorflow:Saving checkpoints for 5000 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 5000...
    INFO:tensorflow:loss = 0.0047673294, step = 5000
    INFO:tensorflow:global_step/sec: 0.343296
    INFO:tensorflow:loss = 0.0046072374, step = 5100 (291.306 sec)
    INFO:tensorflow:global_step/sec: 0.349986
    INFO:tensorflow:loss = 0.004611254, step = 5200 (285.715 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 5207...
    INFO:tensorflow:Saving checkpoints for 5207 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 5207...
    INFO:tensorflow:global_step/sec: 0.348822
    INFO:tensorflow:loss = 0.0035499462, step = 5300 (286.688 sec)
    INFO:tensorflow:global_step/sec: 0.349588
    INFO:tensorflow:loss = 0.0037042585, step = 5400 (286.052 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 5417...
    INFO:tensorflow:Saving checkpoints for 5417 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 5417...
    INFO:tensorflow:global_step/sec: 0.346493
    INFO:tensorflow:loss = 0.0036789172, step = 5500 (288.644 sec)
    INFO:tensorflow:global_step/sec: 0.349283
    INFO:tensorflow:loss = 0.0027340073, step = 5600 (286.251 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 5626...
    INFO:tensorflow:Saving checkpoints for 5626 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 5626...
    INFO:tensorflow:global_step/sec: 0.348573
    INFO:tensorflow:loss = 0.004733313, step = 5700 (286.894 sec)
    INFO:tensorflow:global_step/sec: 0.346052
    INFO:tensorflow:loss = 0.18285072, step = 5800 (289.012 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 5835...
    INFO:tensorflow:Saving checkpoints for 5835 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 5835...
    INFO:tensorflow:global_step/sec: 0.346912
    INFO:tensorflow:loss = 0.03131983, step = 5900 (288.220 sec)
    INFO:tensorflow:global_step/sec: 0.350446
    INFO:tensorflow:loss = 0.009304149, step = 6000 (285.398 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 6045...
    INFO:tensorflow:Saving checkpoints for 6045 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 6045...
    INFO:tensorflow:global_step/sec: 0.347993
    INFO:tensorflow:loss = 0.0062782015, step = 6100 (287.315 sec)
    INFO:tensorflow:global_step/sec: 0.349831
    INFO:tensorflow:loss = 0.0051150527, step = 6200 (285.852 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 6254...
    INFO:tensorflow:Saving checkpoints for 6254 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 6254...
    INFO:tensorflow:global_step/sec: 0.346949
    INFO:tensorflow:loss = 0.0039754366, step = 6300 (288.264 sec)
    INFO:tensorflow:global_step/sec: 0.349037
    INFO:tensorflow:loss = 0.00579759, step = 6400 (286.499 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 6463...
    INFO:tensorflow:Saving checkpoints for 6463 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 6463...
    INFO:tensorflow:global_step/sec: 0.347168
    INFO:tensorflow:loss = 0.0037765538, step = 6500 (287.997 sec)
    INFO:tensorflow:global_step/sec: 0.349615
    INFO:tensorflow:loss = 0.0033530355, step = 6600 (286.042 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 6673...
    INFO:tensorflow:Saving checkpoints for 6673 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 6673...
    INFO:tensorflow:global_step/sec: 0.346191
    INFO:tensorflow:loss = 0.0055715824, step = 6700 (288.848 sec)
    INFO:tensorflow:global_step/sec: 0.348305
    INFO:tensorflow:loss = 0.0037296661, step = 6800 (287.149 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 6882...
    INFO:tensorflow:Saving checkpoints for 6882 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 6882...
    INFO:tensorflow:global_step/sec: 0.34715
    INFO:tensorflow:loss = 0.0023188188, step = 6900 (288.027 sec)
    INFO:tensorflow:global_step/sec: 0.348935
    INFO:tensorflow:loss = 0.0021582637, step = 7000 (286.574 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 7091...
    INFO:tensorflow:Saving checkpoints for 7091 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 7091...
    INFO:tensorflow:global_step/sec: 0.34363
    INFO:tensorflow:loss = 0.0034080148, step = 7100 (291.010 sec)
    INFO:tensorflow:global_step/sec: 0.345016
    INFO:tensorflow:loss = 0.0028917706, step = 7200 (289.842 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 7299...
    INFO:tensorflow:Saving checkpoints for 7299 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 7299...
    INFO:tensorflow:global_step/sec: 0.348249
    INFO:tensorflow:loss = 0.0021909499, step = 7300 (287.150 sec)
    INFO:tensorflow:global_step/sec: 0.349246
    INFO:tensorflow:loss = 0.0037510972, step = 7400 (286.342 sec)
    INFO:tensorflow:global_step/sec: 0.348261
    INFO:tensorflow:loss = 0.0019954366, step = 7500 (287.140 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 7508...
    INFO:tensorflow:Saving checkpoints for 7508 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 7508...
    INFO:tensorflow:global_step/sec: 0.347798
    INFO:tensorflow:loss = 0.002015908, step = 7600 (287.564 sec)
    INFO:tensorflow:global_step/sec: 0.349053
    INFO:tensorflow:loss = 0.0026525368, step = 7700 (286.437 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 7717...
    INFO:tensorflow:Saving checkpoints for 7717 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 7717...
    INFO:tensorflow:global_step/sec: 0.347468
    INFO:tensorflow:loss = 0.003251753, step = 7800 (287.807 sec)
    INFO:tensorflow:global_step/sec: 0.349765
    INFO:tensorflow:loss = 0.0018762568, step = 7900 (285.906 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 7927...
    INFO:tensorflow:Saving checkpoints for 7927 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 7927...
    INFO:tensorflow:global_step/sec: 0.347687
    INFO:tensorflow:loss = 0.002360595, step = 8000 (287.608 sec)
    INFO:tensorflow:global_step/sec: 0.347661
    INFO:tensorflow:loss = 0.004806663, step = 8100 (287.643 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 8134...
    INFO:tensorflow:Saving checkpoints for 8134 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 8134...
    INFO:tensorflow:global_step/sec: 0.339416
    INFO:tensorflow:loss = 0.14340438, step = 8200 (294.668 sec)
    INFO:tensorflow:global_step/sec: 0.349256
    INFO:tensorflow:loss = 0.015976168, step = 8300 (286.280 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 8343...
    INFO:tensorflow:Saving checkpoints for 8343 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 8343...
    INFO:tensorflow:global_step/sec: 0.345206
    INFO:tensorflow:loss = 0.006903084, step = 8400 (289.683 sec)
    INFO:tensorflow:global_step/sec: 0.338898
    INFO:tensorflow:loss = 0.00508093, step = 8500 (295.075 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 8547...
    INFO:tensorflow:Saving checkpoints for 8547 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 8547...
    INFO:tensorflow:global_step/sec: 0.330048
    INFO:tensorflow:loss = 0.0040152133, step = 8600 (302.982 sec)
    INFO:tensorflow:global_step/sec: 0.335605
    INFO:tensorflow:loss = 0.003243609, step = 8700 (298.010 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 8746...
    INFO:tensorflow:Saving checkpoints for 8746 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 8746...
    INFO:tensorflow:global_step/sec: 0.330533
    INFO:tensorflow:loss = 0.0035721273, step = 8800 (302.503 sec)
    INFO:tensorflow:global_step/sec: 0.338775
    INFO:tensorflow:loss = 0.0020588979, step = 8900 (295.220 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 8946...
    INFO:tensorflow:Saving checkpoints for 8946 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 8946...
    INFO:tensorflow:global_step/sec: 0.306206
    INFO:tensorflow:loss = 0.0024026365, step = 9000 (326.530 sec)
    INFO:tensorflow:global_step/sec: 0.329742
    INFO:tensorflow:loss = 0.002946375, step = 9100 (303.277 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 9138...
    INFO:tensorflow:Saving checkpoints for 9138 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 9138...
    INFO:tensorflow:global_step/sec: 0.336301
    INFO:tensorflow:loss = 0.0028443641, step = 9200 (297.353 sec)
    INFO:tensorflow:global_step/sec: 0.338942
    INFO:tensorflow:loss = 0.0025432128, step = 9300 (295.036 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 9341...
    INFO:tensorflow:Saving checkpoints for 9341 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 9341...
    INFO:tensorflow:global_step/sec: 0.319086
    INFO:tensorflow:loss = 0.004946366, step = 9400 (313.397 sec)
    INFO:tensorflow:global_step/sec: 0.300351
    INFO:tensorflow:loss = 0.0017211923, step = 9500 (332.942 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 9523...
    INFO:tensorflow:Saving checkpoints for 9523 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 9523...
    INFO:tensorflow:global_step/sec: 0.303654
    INFO:tensorflow:loss = 0.0022283166, step = 9600 (329.323 sec)
    INFO:tensorflow:global_step/sec: 0.299626
    INFO:tensorflow:loss = 0.0020181546, step = 9700 (333.786 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 9705...
    INFO:tensorflow:Saving checkpoints for 9705 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 9705...
    INFO:tensorflow:global_step/sec: 0.322727
    INFO:tensorflow:loss = 0.0015971982, step = 9800 (309.826 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 9898...
    INFO:tensorflow:Saving checkpoints for 9898 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 9898...
    INFO:tensorflow:global_step/sec: 0.314953
    INFO:tensorflow:loss = 0.0016723077, step = 9900 (317.494 sec)
    INFO:tensorflow:Calling checkpoint listeners before saving checkpoint 10000...
    INFO:tensorflow:Saving checkpoints for 10000 into C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt.
    INFO:tensorflow:Calling checkpoint listeners after saving checkpoint 10000...
    INFO:tensorflow:Loss for final step: 0.00173588.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Starting evaluation at 2021-08-29T23:29:58Z
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Inference Time : 14.30937s
    INFO:tensorflow:Finished evaluation at 2021-08-29-23:30:12
    INFO:tensorflow:Saving dict for global step 10000: accuracy = 0.8347061, global_step = 10000, loss = 1.8139505
    INFO:tensorflow:Saving 'checkpoint_path' summary for global step 10000: C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    accuracy:  0.835
    


```python
# 1. encoding한다.
# 2. decoder의 output을 processing하고
# 3. max_len만큼 for문을 돌면서 만약에 i가 0보다 크면 docoder_output_processing[answer]를 채워준다.
# 4. i가 0이하이면 predict해준다.
# 5. predict2string에서 answer를 만든다. 이걸 계속 반복.
# 6. 끝났으면 끝냄
# 7. 만들어진 answer를 반환한다.
def chatbot(user_question):
    predict_input_encoder, predict_input_encoder_length = encoder_processing([user_question],char2idx) # 1
    predict_output_decoder, predict_output_decoder_length = decoder_output_processing([""], char2idx) # 2
    predict_target_decoder = decoder_target_processing([""], char2idx)
    
    for i in range(max_len): # 3
        if i > 0:
            predict_output_decoder, predict_output_decoder_length = decoder_output_processing([answer], char2idx)
            predict_target_decoder = decoder_target_processing([answer], char2idx)
        
        predictions = transformer.predict(input_fn=lambda:evaluation_input_function(predict_input_encoder,predict_output_decoder,predict_target_decoder,1))  # 4   
        
        answer, finished = predict2string(predictions, idx2char) # 5
        
        if finished: # 6
            break
            
    return answer # 7
        
```


```python
chatbot("안녕")
```

    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    




    '안녕 하 세요 '




```python
chatbot("밥 먹었어?")
```

    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    




    '저 는 배터리 가 밥 이 예요 '




```python
chatbot("이름이 뭐야?")
```

    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    




    '위 로 봇 '




```python
chatbot("너 똑똑해?")
```

    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    




    '제 가 풀 어 드릴게요 '




```python
chatbot("나는 누구야?")
```

    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    




    '저 도 궁금 하 네요 '




```python
chatbot("배 안 고파?")
```

    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    




    '뭐 좀 챙겨 드세요 '




```python
chatbot("너도 목 말라?")
```

    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    




    '항상 '




```python
chatbot("제일 잘하는게 뭐야?")
```

    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    




    '멍 때리 고 있 죠 '




```python
chatbot("나 핸드폰 새로 샀다.")
```

    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    




    '좋 은 결과 있 을 거 예요 '




```python
chatbot("저녁 뭐 먹을래?")
```

    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    




    '맛있 는 거 드세요 '




```python
chatbot("너 커피 좋아해?")
```

    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    INFO:tensorflow:Calling model_fn.
    INFO:tensorflow:Done calling model_fn.
    INFO:tensorflow:Graph was finalized.
    INFO:tensorflow:Restoring parameters from C:\Users\yein4\AppData\Local\Temp\tmpfwak6o6x\model.ckpt-10000
    INFO:tensorflow:Running local_init_op.
    INFO:tensorflow:Done running local_init_op.
    




    '저 도 커피 좋 아 해요 '





