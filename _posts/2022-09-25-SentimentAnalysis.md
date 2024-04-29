---
title: Sentiment Analysis
category: Dev Log
tag: Development
---







* 목차
{:toc}









## 1\. Sentiment analysis code

[https://github.com/finddme/Sentiment_analysis](https://github.com/finddme/Sentiment_analysis)

## 2\. Sentiment_analysis
- Emotion class를 예측하는 classification fine-tune task

## 3\. model information

- [KoElectra](https://github.com/monologg/KoELECTRA/tree/024fbdd600e653b6e4bdfc64ceec84181b5ce6c4)(version: KoELECTRA-Base-v3)
- [KoBERT](https://github.com/monologg/KoBERT-Transformers)

## 4\. Environment
- ubuntu 20.04
- python 3.9.12
- docker image
```
docker pull ayaanayaan/ayaan_nv
```

## 5\. Requirements
- pytorch 1.10
- pymongo 4.1.1


## 6\. Train/Test
```
# Train(Electra)
python main.py --op train --target_gpu (0/1/2) --ck_path (ck_path)

# Train with multi gpu(Electra)
python main.py --op train --target_gpu m --ck_path (ck_path)

# Test(Electra)
python main.py --op test --target_gpu (0/1/2) --load_ck (ck_path)

```

```
# Train(BERT)
python main.py --op train_bert --target_gpu (0/1/2) --ck_path (ck_path)

# Train with multi gpu(BERT)
python main.py --op train_bert --target_gpu m --ck_path (ck_path)

# Test(BERT)
python main.py --op test_bert --target_gpu (0/1/2) --load_ck (ck_path)

```

## 7\. API
```
python main.py --op api --target_gpu (0/1/2) --load_ck (ck_path) --port (port)
```
