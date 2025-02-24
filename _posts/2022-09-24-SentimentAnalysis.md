---
title: "<span style='font-weight:bold; font-family:CMU Serif Roman;'>Sentiment Analysis</span>"
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
<!--            <li><a href="https://finddme.github.io/development/2022/09/25/SentimentAnalysis/">Project Details</a></li> -->
<!--            <li><a href="https://github.com/finddme/Sentiment_analysis">SA Code</a></li> -->
           <li><a href="https://finddme.github.io/natural%20language%20processing/2019/11/22/Bert/">Related Paper Review (BERT)</a></li>
           <li><a href="https://finddme.github.io/natural%20language%20processing/2022/11/30/LMsummary/#electra--efficiently-learning-an-encoder-that-classifies-token-replacements-accurately">ELECTRA</a></li>
         </td>
       </tr>
   </table>
 </body>
</html>
 

## 2\. Data Collection and Processing

### 2.1 Dataset

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
       <tr><th class="line4" bgcolor="#F8F7F9">출처</th><th class="line4" bgcolor="#F8F7F9">포맷</th><th class="line4" bgcolor="#F8F7F9">수량</th></tr>
       <tr><td class="line">data labeling 업체 수집 데이터(raw data: web crawling data)</td><td class="line">txt</td><td class="line">302,028문장</td></tr>
       <tr><td class="line">data labeling 업체 수집 데이터(raw data: aihub 한국어 SNS, 자유대화 데이터)</td><td class="line">txt</td><td class="line">184,585문장</td></tr>
       <tr><td class="line">aihub data (한국어 단발성 대화 데이터셋: 기쁨, 슬픔, 놀람, 분노, 공포, 혐오, 중립)</td><td class="line">txt</td><td class="line">37,000문장</td></tr>
       <tr><td class="line">aihub data (감성 대화 말뭉치: 기쁨, 당황, 분노, 불안, 상처, 슬픔)</td><td class="line">txt</td><td class="line">28,000문장</td></tr>
       <tr><td class="line3"><strong>total</strong></td><td class="line3"> </td><td class="line3">551,613문장</td></tr>
     </table>
 </body>
 </html>

### 2.2 Data pre-processing
  - 중복 문장 제거
    - 중복 문장 추출 후 분리하여 저장 -> 모델 1차 학습 후 autolabeling을 통해 class tagging
  - 이모티콘 제거. 텍스트 자체만 학습 (특수기호는 제거 x)
  - 데이터 라벨 불균형 완화를 위해 "중립"에 속하는 데이터 일부 제거

### 2.3 Data class
```json
  {
  "부정":{"분노": ["분노", "억울함"],
          "싫음": ["싫음", "지루함", "미워함", "짜증남"],
          "두려움": ["두려움", "창피함", "불안", "당황"],
          "슬픔": ["슬픔", "미안함", "안타까움", "외로움", "실망", "괴로움", "부러움", "후회"]},
  "긍정":{"행복": ["행복", "그리움", "기쁨", "사랑", "황홀함", "감동", "즐거움", "홀가분함", "설렘", "만족", "자신감", "고마움"],
          "놀람": ["놀람"]},
  "중립":{"중립": ["중립", "바람", "무관심"]}
  }
```

### 2.4 Data augmentation method
  - 1차 모델 학습 이후 autolabeling
  
## 3\. Model

### 3.1 Model Architecture
  - BERT
  - Electra 

### 3.2 Fine-tuning Hyperparameter

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
       <tr><th class="line4" bgcolor="#F8F7F9">version</th><th class="line4" bgcolor="#F8F7F9">batch_size</th><th class="line4" bgcolor="#F8F7F9">max_len</th><th class="line4" bgcolor="#F8F7F9">optimizer</th></tr>
       <tr><td class="line3">34 emotion</td><td class="line">64</td><td class="line">64</td><td class="line">Adam</td></tr>
       <tr><td class="line3">8 emotion</td><td class="line">64</td><td class="line">64</td><td class="line">Adam</td></tr>
       <tr><td class="line3">3 emotion</td><td class="line">64</td><td class="line">64</td><td class="line">Adam</td></tr>
     </table>
 </body>
 </html>

## 4\. Train

### 4.1 Training server environment
  - Quadro RTX 8000 x3
  - Ubuntu 20.04

## 5\. Test result

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
       <tr><th class="line4" bgcolor="#F8F7F9">version</th><th class="line4" bgcolor="#F8F7F9">acc</th><th class="line4" bgcolor="#F8F7F9">f1 score</th></tr>
       <tr><td class="line3">34 emotion</td><td class="line">77.559</td><td class="line">0.7756</td></tr>
       <tr><td class="line3">8 emotion</td><td class="line">84</td><td class="line">0.84</td></tr>
       <tr><td class="line3">3 emotion</td><td class="line">79</td><td class="line">0.79</td></tr>
     </table>
 </body>
 </html>

## 6\. Problems and Solutions
  - 데이터 라벨 불균형
    - "중립" 문장 일부 제거
    - 1차 학습 이후 web crawling 데이터 autolabeling 이후 부족한 라벨 보충 -> 예정




