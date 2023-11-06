---
title: LLM instruction tuning + Chatbot api
category: Development
tag: Development
---







* 목차
{:toc}










# DATA

(**총 923,590개** 한국어 dolly 데이터)

## Dolly data 형식

{"instruction":instruction, "context": context, "response":response, "category": category}
    
## Dolly data로 변환한 데이터 목록

- **KoVicuna data**
    - 구성 : ko_dataset_chatgpt(2개), ko_alpaca_style_dataset
    - KoVicuna data to Dolly data:
      - gpt → instruction
      - human→ response
      - category → open_qa
      
    - KoVicuna Data 예시(1세트) → gpt와 human 대화
    - KoVicuna Data 형식:
      <pre>
      {'id': 'QWJhYvA_0',
                   'conversations': [{'from': 'human',
                     'value': '고객을 위해 이러한 전략과 전술을 구현하는 성장 마케팅 대행사와 관련하여 Jeff Walker의 제품 출시 공식의 주요 아이디어를 글머리 기호로 요약하세요...'},
                    {'from': 'gpt',
                     'value': '다음은 성장 마케팅 대행사가 고객을 위해 적용할 수 있는 제프 워커의 제품 출시 공식의 주요 아이디어입니다:\r\n\r\n1. 타겟 고객과 그들의 니즈를 파악합니다: 제품이나 서비스의 이상적인 고객을 파악하고 이들에게 공감을 불러일으킬 수 있는 메시지를 작성합니다.\r\n2. 사전 출시: 입소문을 만들고, 사용 후기 및 사례 연구를 수집하고, 소셜 미디어를 사용하여 인지도를 높여 출시에 대한 기대감과 흥미를 조성합니다.\r\n3. 출시: 잘 짜여진 출시 시퀀스를 사용하여 판매와 전환을 극대화하세요. 여기에는 보너스 제공, 희소성 창출, 마감일을 사용하여 긴박감을 조성하는 것이 포함될 수 있습니다.\r\n4. 출시 후: 고객과 후속 조치를 취하고, 피드백을 수집하고, 지속적으로 가치를 제공하여 고객의 참여와 충성도를 유지하세요.\r\n5. 제품군을 만듭니다: 초기 제품이 성공하면 동일한 고객의 다른 요구 사항을 해결하는 추가 제품 또는 서비스를 만들어 제품을 확장합니다.\r\n6. 지속적인 최적화: 출시 프로세스와 제품군을 지속적으로 모니터링하고 최적화하여 결과를 개선합니다.\r\n7. 커뮤니티 구축: 출시 프로세스를 사용하여 제품에 대한 열정이 있고 널리 알리는 데 도움을 줄 수 있는 고객 커뮤니티를 구축하세요.\r\n8. 자동화를 활용하세요: 기술 및 자동화를 사용하여 출시 프로세스를 간소화하고 효율성을 개선하세요.'}, ...
      </pre>



      
- **Alpaca data**

  - Alpaca data to Dolly data:
    - instruction → instruction
    - output→ response
    - input → context
    - category → open_qa
    
  - Alpaca 데이터 예시(1세트) → instruction, input, output
 
<html>     
<details>
<summary>Alpaca data sample</summary>
<div>
  {'instruction': '다음 국가와 관련된 역사적 사건 3가지를 나열하십시오.',
  <br>'input': '캐나다',
  <br>'output': '치푸아츠(Fort Chippewyan)는 캐나다 알버타주의 따뜻한 해안에 위치한 미국 원주민 지역에 근접한 유일한 유럽인 거주지입니다. 캐나다 프랑스 식민지로 건설되었으며, 나스강을 따라 서부 지역으로 확장된 유일한 유럽인 거주지입니다. 1778 년 새로 지어진 건물에 현재는 휴게소가 있습니다. 시티오브 에드먼튼에서 선퍼드 언덕스를 향해 북쪽으로 4.5시간 떨어진 곳에 있습니다.'}
</div>
</details>
</html>
                

- **Korquad 2.0**
  - Korquad 2.0 data to Dolly data:
    - Q → instruction
    - A → response
    - context → context
    - category → open_qa
    
  - Korquad 2.0 data 예시(1세트) → Q, A, context
 
    <html>
    <details>
    <summary>Korquad 2.0 data sample</summary>
    <div markdown="1">
              {'version': 'KorQuAD_2.0_train',
                'data': {'title': '예고범',
               'url': 'https://ko.wikipedia.org/wiki/예고범',
               'context': '<!DOCTYPE html>\n<html>\n<head>\n<meta>\n<title>예고범 - 위키백과, 우리 모두의 백과사전</title>\n\n\n<link>\n\n<meta>\n<link>\n<meta>\n<meta>\n<meta>\n<meta>\n<link>\n<link>\n<link>\n<link>\n<link>\n<link>\n<link>\n<link>\n<link>\n<link>\n<link>\n\n</head>\n<body>\n<div></div>\n<div></div>\n<div>\n<a></a>\n<div></div>\n<div>\n</div>\n<h1>예고범</h1>\n<div>\n<div>위키백과, 우리 모두의 백과사전.</div>\n<div></div>\n<div></div>\n<a>둘러보기로 가기</a>\n<a>검색하러 가기</a>\n<div><div><p>《<b>예고범</b>》(<span><a>일본어</a>: </span><span>予告犯</span>)은, 츠츠이 테츠야의 <a>만화</a> 작품이다.\n</p>\n<div><input><div><h2>목차</h2><span><label></label></span></div>\n<ul>\n<li><a><span>1</span> <span>개요</span></a></li>\n<li><a><span>2</span> <span>등장인물</span></a>\n<ul>\n<li><a><span>2.1</span> <span>예고범 그룹</span></a></li>\n<li><a><span>2.2</span> <span>경찰 관계자</span></a></li>\n<li><a><span>2.3</span> <span>타깃이 된 인물·기업·단체</span></a></li>\n<li><a><span>2.4</span> <span>그 외</span></a></li>\n</ul>\n</li>\n<li><a><span>3</span> <span>서지 정보</span></a></li>\n<li><a><span>4</span> <span>스핀오프 작품</span></a>\n<ul>\n<li><a><span>4.1</span> <span>예고범-THE COPYCAT-</span></a></li>\n<li><a><span>4.2</span> <span>예고범-THE CHASER-</span></a></li>\n</ul>\n</li>\n<li><a><span>5</span> <span>영화</span></a>\n<ul>\n<li><a><span>5.1</span> <span>캐스트</span></a></li>\n<li><a><span>5.2</span> <span>스태프</span></a></li>\n</ul>\n</li>\n<li><a><span>6</span> <span>텔레비전 드라마</span></a>\n<ul>\n<li><a><span>6.1</span> <span>캐스트</span></a></li>\n<li><a><span>6.2</span> <span>스태프</span></a></li>\n<li><a><span>6.3</span> <span>방송 일자</span></a></li>\n</ul>\n</li>\n<li><a><span>7</span> <span>외부 링크</span></a></li>\n</ul>\n</div>\n<h2><span></span><span>개요</span><span><span>[</span><a>편집</a><span>]</span></span></h2>\n<p>《점프 카이》 (<a>슈에이샤</a>)에서 <a>2011년</a>부터 <a>2013년</a> 9호까지 연재되었다. 단행본은 전 3권.\n</p>\n<h2><span></span><span>등장인물</span><span><span>[</span><a>편집</a><span>]</span></span></h2>\n<h3><span></span><span>예고범 그룹</span><span><span>[</span><a>편집</a><span>]</span></span></h3>\n<dl><dt>게이츠/오쿠다 히로아키</dt>\n<dd>예고범 그룹 〈신분시〉의 주범격.</dd>\n<dt>칸사이/카사이 토모히코</dt>\n<dd><a>오사카</a> 출신.</dd>\n<dt>메타보/테라하라 신이치</dt>\n<dd><a>후쿠오카</a> 출신.</dd>\n<dt>노비타/키무라 코이치</dt>\n<dd><a>미야기</a> 출신.</dd></dl>\n<h3><span></span><span>경찰 관계자</span><span><span>[</span><a>편집</a><span>]</span></span></h3>\n<dl><dt>요시노 에리카</dt>\n<dd><a>경시청</a> 사이버 범죄 대책과 반장.</dd>\n<dt>오카모토 다이키</dt>\n<dd>경시청 사이버 범죄 대책과 소속 형사.</dd>\n<dt>이치카와 마나부</dt>\n<dd>경시청 사이버 범죄 대책과 소속 형사.</dd>\n<dt>마츠모토 신이치</dt>\n<dd>경시청 사이버 범죄 대책과 과장.</dd>\n<dt>아라가키</dt>\n<dd>고속대 대원.</dd></dl>\n<h3><span></span><span>타깃이 된 인물·기업·단체</span><span><span>[</span><a>편집</a><span>]</span></span></h3>\n<dl><dt>식품 가공 회사</dt>\n<dd><a>이시카와현</a> K시에 있는 식품 가공 업자.</dd>\n<dt>부시키 슈야</dt>\n<dd>모 외식점의 전 아르바이트 점원.</dd>\n<dt>세키 슈지</dt>\n<dd>R대학의 전 학생.</dd>\n<dt>이케하타 마사요시</dt>\n<dd>모 넷 서비스 기업에 근무하는 회사원.</dd>\n<dt>시가디안</dt>\n<dd><a>고래잡이</a> 반대 운동 등을 행하고 있는 해외의 환경 보호 단체.</dd>\n<dt>시타라기 타다시</dt>\n<dd>현직 <a>중의원</a> 의원.</dd></dl>\n<h3><span></span><span>그 외</span><span><span>[</span><a>편집</a><span>]</span></span></h3>\n<dl><dt>마스야마 쇼타</dt>\n<dd><a>토치기 현</a> U시에 사는 중학생.</dd>\n<dt>호리이</dt>\n<dd>게이츠가 과거에 근무했던 IT 회사의 사장.</dd>\n<dt>노모토 청소의 사장과 사장 부인</dt>\n<dd>빌딩 외벽 청소를 사업으로 하는 청소 회사.</dd>\n<dt>효로/넬슨 카토 리카르테</dt>\n<dd><a>필리핀</a> 출신의 <a>일본계 외국인</a>.</dd>\n<dt>이시다 키요시</dt>\n<dd>게이츠 등 5인이 먹고 자며 육체 노동을 하던 때의 현장 감독.</dd>\n<dt>카에데</dt>\n<dd><a>이와테현</a> K시에 있는 <a>라멘</a> 가게에서 일하는 여성 점원.</dd>\n<dt>아오야마 유이치</dt>\n<dd><a>인터넷 카페</a> 〈피트 보이〉에서 일하는 점원.</dd></dl>\n<h2><span></span><span>서지 정보</span><span><span>[</span><a>편집</a><span>]</span></span></h2>\n<ul><li>츠츠이 테츠야 《예고범》 <a>슈에이샤</a> 〈영 점프 코믹스〉 전 3권\n<ol><li>2012년 4월 10일 발매, <a>ISBN</a>\xa0<a>978-4-08-879310-8</a></li>\n<li>2012년 12월 10일 발매, <a>ISBN</a>\xa0<a>978-4-08-879495-2</a></li>\n<li>2013년 9월 10일 발매, <a>ISBN</a>\xa0<a>978-4-08-879680-2</a></li></ol></li></ul>\n<h2><span></span><span>스핀오프 작품</span><span><span>[</span><a>편집</a><span>]</span></span></h2>\n<h3><span></span><span>예고범-THE COPYCAT-</span><span><span>[</span><a>편집</a><span>]</span></span></h3>\n<p>《<b>예고범 -THE COPYCAT-</b>》은, 스핀오프 만화 작품이다.\n</p><p>〈신분시〉의 <a>모방범</a> (카피캣)을 하는 고교생 그룹의 스토리.\n</p>\n<h3><span></span><span>예고범-THE CHASER-</span><span><span>[</span><a>편집</a><span>]</span></span></h3>\n<p>《<b>예고범 -THE CHASER-</b>》는, 스핀오프 <a>소설</a> 작품이다.\n</p><p>요시노 에리카와 경시청 사이버 범죄 대책과의 그 후 활동을 그린다.\n
                 ...
               'raw_html': '<!DOCTYPE html>\n<html class="client-nojs" dir="ltr" lang="ko">\n<head>\n<meta charset="utf-8"/>\n<title>예고범 - 위키백과, 우리 모두의 백과사전</title>\n<script>document.documentElement.className=document.documentElement.className.replace(/(^|\\s)client-nojs(\\s|$)/,"$1client-js$2");RLCONF={"wgCanonicalNamespace":"","wgCanonicalSpecialPageName":!1,"wgNamespaceNumber":0,"wgPageName":"예고범","wgTitle":"예고범","wgCurRevisionId":21882503,"wgRevisionId":21882503,"wgArticleId":1142341,"wgIsArticle":!0,"wgIsRedirect":!1,"wgAction":"view","wgUserName":null,"wgUserGroups":["*"],"wgCategories":["일본어 표기를 포함한 문서","일본의 만화","추리 만화","범죄를 소재로 한 작품","테러를 소재로 한 작품","일본의 영화 작품","일본의 범죄 영화","테러리즘을 소재로 한 영화","만화를 바탕으로 한 영화"],"wgBreakFrames":!1,"wgPageContentLanguage":"ko","wgPageContentModel":"wikitext","wgSeparatorTransformTable":["",""],"wgDigitTransformTable":["",""],"wgDefaultDateFormat":"ko","wgMonthNames":["","1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],\n"wgMonthNamesShort":["","1","2","3","4","5","6","7","8","9","10","11","12"],"wgRelevantPageName":"예고범","wgRelevantArticleId":1142341,"wgRequestId":"XRp8LgpAICMAABjkVugAAADP","wgCSPNonce":!1,"wgIsProbablyEditable":!0,"wgRelevantPageIsProbablyEditable":!0,"wgRestrictionEdit":[],"wgRestrictionMove":
      ...
                 "author":{"@type":"Organization","name":"\\uc704\\ud0a4\\ubbf8\\ub514\\uc5b4 \\ud504\\ub85c\\uc81d\\ud2b8 \\uae30\\uc5ec\\uc790"},"publisher":{"@type":"Organization","name":"Wikimedia Foundation, Inc.","logo":{"@type":"ImageObject","url":"https:\\/\\/www.wikimedia.org\\/static\\/images\\/wmf-hor-googpub.png"}},"datePublished":"2014-08-18T02:23:47Z","dateModified":"2018-07-26T21:45:50Z"}</script>\n<script>(RLQ=window.RLQ||[]).push(function(){mw.config.set({"wgBackendResponseTime":153,"wgHostname":"mw1333"});});</script>\n</body>\n</html>\n',
               'qas': [{'answer': {'text': '나카무라 요시히로, 히라바야시 카츠토시, 사와다 메구미',
                  'html_answer_start': 21842,
                  'html_answer_text': '나카무라 요시히로, 히라바야시 카츠토시, 사와다 메구미',
                  'answer_start': 6302},
                 'question': '드라마 예고범의 감독은 누구일까?',
                 'id': '8089'}]}}
    </div>
    </details>
    </html>
            
- **Korquad 1.0**
  
  - Korquad 1.0 data to Dolly data:
    - Q → instruction
    - A → response
    - context → context
    - category → open_qa
    
  - Korquad1.0 데이터  예시(1세트) → Q, A, context
 
    <html>     
    <details>
    <summary>Korquad 1.0 data sample</summary>
    <div markdown="1">
          {'qas': [{'question': '다테 기미코가 최초로 은퇴 선언을 한게 언제지',
             'answers': [{'answer_start': 260, 'text': '1996년 9월 24일'}],
             'id': '9_f2_wiki_2822-1'}],
           'context': "재팬 오픈에서 4회 우승하였으며, 통산 단식 200승 이상을 거두었다. 1994년 생애 최초로 세계 랭킹 10위권에 진입하였다. 1992년에는 WTA로부터 '올해 가장 많은 향상을 보여준 선수상'(Most Improved Player Of The Year)을 수여받았으며, 일본 남자 패션 협회(Japan Men's Fashion Association)는 그녀를 '가장 패셔너블한 선수'(Most Fashionable)로 칭했다. 생애 두 번째 올림픽 참가 직후인 1996년 9월 24일 최초로 은퇴를 선언하였다. 이후 12년만인 2008년 4월에 예상치 못한 복귀 선언을 하고 투어에 되돌아왔다. 2008년 6월 15일 도쿄 아리아케 인터내셔널 여자 오픈에서 복귀 후 첫 우승을 기록했으며, 2009년 9월 27일에는 한국에서 열린 한솔 코리아 오픈 대회에서 우승하면서 복귀 후 첫 WTA 투어급 대회 우승을 기록했다. 한숨 좀 작작 쉬어!"}
    </div>
    </details>
    </html>

# MODEL

## Fine-tuning에 사용된 사전 학습 모델 목록 및 Fine-tuning 결과

(alpaca와 dolly 공개한 곳에서 5.8B이상 거대 모델 Full Finetune 시 사용한 gpu: A100 4개)

- EleutherAI/Polyglot (모델 세부 정보 :[https://songys.github.io/2023Langcon/data/kevinko.pdf](https://songys.github.io/2023Langcon/data/kevinko.pdf))
    
    
    | 모델 크기 | 시도 여부 | 추론 품질(최대 5점) |
    | --- | --- | --- |
    | 1.3b | ○ [Full Finetune] | 3 |
    | 3.8b | ○ [LoRA] | 1 |
    | 5.8b | ○ [LoRA] | 1 |
    | 12.8b | ○ [LoRA] | 1 |
  
- **beomi/KoAlpaca-Polyglot**(EleutherAI/Polyglot을 lora 없이 학습시킨 모델 : EleutherAI/Polyglot-1.3b를 학습시킨 것과 동일한 방법)  
→ **사용 이유 : 현재 Polyglot을 Full Fine tune 할 수 없어서 해당 모델로 Full Fine tune과 유사한 결과를 만들어 봄. (dolly fine tune 전 후 LLM 추론 비교 자료는 아래 첨부함)**
    
    
    | 모델 크기 | 시도 여부 | 추론 품질(최대 5점) |
    | --- | --- | --- |
    | 5.8B | ○ [LoRA] | 3.5 |
    | 12.8b | ○ [LoRA] | 4 |
  
- **decapoda-research/llama-13b-hf**
    
    
    | 모델 크기 | 시도 여부 | 추론 품질(최대 5점) |
    | --- | --- | --- |
    | 13b | ○ [LoRA] | 2 |
  
- **openlm-research/open_llama_13b**
    
    
    | 모델 크기 | 시도 여부 | 추론 품질(최대 5점) |
    | --- | --- | --- |
    | 13b | ○ [LoRA] | 2 |
  

⇒ 위 모델들 모두 Full Finetune하면 보다 좋은 결과가 나올 것으로 사료됨 [https://arxiv.org/pdf/2304.08109.pdf](https://arxiv.org/pdf/2304.08109.pdf)

## Base LLM과 Dolly 추론 결과 비교

- **Base LLM (Fine Tune 하지 않은 LLM 자체 추론 결과)**
    - **Polyglot 12.8**
        <center><img width="800" src="https://github.com/lm-sys/FastChat/assets/53667002/9ff6e9bf-bcfb-4f93-99a7-1ef86ca4e1d4"></center>
        
        
    - **Polyglot 1.3**
        
        <center><img width="800" src="https://github.com/lm-sys/FastChat/assets/53667002/2e51d16b-9aff-459d-b7b6-c5bf119293ff"></center>
        
    - + Fastchat 적용하지 않았을 때 추론 속도 약 5초 (아래 예시는 Fine tune하지 않은 **Polyglot 5.8**)
        
        <center><img width="400" src="https://github.com/lm-sys/FastChat/assets/53667002/df69fc75-3cee-4f67-858d-05e5c788f4b6"></center>
        
- **Dolly(Polyglot 12.8 Fine-tune(Lora))**
    
    <center><img width="640" src="https://github.com/lm-sys/FastChat/assets/53667002/8f771fc8-1b20-4c33-924a-1fd9e8a37a25"></center>
    

## ChatGPT vs Dolly Chat

<center><img width="640" src="https://github.com/lm-sys/FastChat/assets/53667002/c63ee341-f6b9-460d-ac34-52f3830da7f3"></center>

<center><img width="900" src="https://github.com/lm-sys/FastChat/assets/53667002/20ab63f4-e8aa-4196-8860-cb7d3a2d9169"></center>

## 기타 예시

<center><img width="800" src="https://github.com/lm-sys/FastChat/assets/53667002/d0c538a7-4ed3-4f69-a199-415ecee3431a"></center>

<center><img width="640" src="https://github.com/lm-sys/FastChat/assets/53667002/44605f44-2706-4204-966a-80678ee6ceab"></center>
<center><img width="900" src="https://github.com/lm-sys/FastChat/assets/53667002/41d254d8-566b-4512-a1fe-a2e1eea1bf1a"></center>
<center><img width="900" src="https://github.com/lm-sys/FastChat/assets/53667002/fd58e7fb-0145-4ba3-99f4-8c4ef1996103"></center>
