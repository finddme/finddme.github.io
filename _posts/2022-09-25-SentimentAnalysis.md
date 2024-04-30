---
title: Sentiment Analysis
category: Dev Log
tag: Development
---







* 목차
{:toc}









## 1\. Dev summary
<html>
  <head>
    <style type="text/css">
      .line{border-bottom: 1px solid #BDB8C1;}
      .line2{border-bottom: 2px solid #BDB8C1;}
      .line3{border-bottom: 1px solid #BDB8C1; background-color: #F7F7F7;}
      .line4{border-bottom: 2px solid #BDB8C1; background-color: #F7F7F7;}
      table, th, td {
         border:1px solid #BDB8C1;
         background-color: #FFFFFF;
       }
    </style>
   </head>
   <body>
     <table style="border-collapse:collapse">
       <tr>
         <th class="line4" bgcolor="#F8F7F9">Project</th>
         <th class="line2">Summary of the project</th><th class="line2">Related Pages</th>
       </tr>
       <tr>
         <td class="line3"><strong>Sentiment Analysis</strong></td>
         <td class="line">
           <li>base model: 
             <ul>
               <li>BERT</li>
               <li>ELECTRA</li>
             </ul>
           </li>
           <li>class num: 
             <ul>
               <li>34 / 7 / 3</li>
             </ul>
           </li>
           <li>applied domains: 
             <ul>
               <li>General</li>
               <li>Literature</li>
             </ul>
            </li>
         </td>
         <td class="line">
           <li><a href="https://finddme.github.io/development/2022/09/25/SentimentAnalysis/">Project Details</a></li>
<!--            <li><a href="https://github.com/finddme/Sentiment_analysis">SA Code</a></li> -->
           <li><a href="https://finddme.github.io/natural%20language%20processing/2019/11/22/Bert/">Related Paper Review (BERT)</a></li>
           <li><a href="https://finddme.github.io/natural%20language%20processing/2022/11/30/LMsummary/#electra--efficiently-learning-an-encoder-that-classifies-token-replacements-accurately">ELECTRA</a></li>
         </td>
       </tr>
   </table>
 </body>
</html>

## 2\. Sentiment analysis code

[https://github.com/finddme/Sentiment_analysis](https://github.com/finddme/Sentiment_analysis)

## 3\. Sentiment_analysis
- Emotion class를 예측하는 classification fine-tune task

## 4\. model information

- [KoElectra](https://github.com/monologg/KoELECTRA/tree/024fbdd600e653b6e4bdfc64ceec84181b5ce6c4)(version: KoELECTRA-Base-v3)
- [KoBERT](https://github.com/monologg/KoBERT-Transformers)

## 5\. Environment
- ubuntu 20.04
- python 3.9.12
- docker image
```
docker pull ayaanayaan/ayaan_nv
```

## 6\. Requirements
- pytorch 1.10
- pymongo 4.1.1


## 7\. Train/Test
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

## 8\. API
```
python main.py --op api --target_gpu (0/1/2) --load_ck (ck_path) --port (port)
```
