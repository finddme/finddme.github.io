---
title: LLM Tuning / Merge
category: Dev Log
tag: Development
---







* 목차
{:toc}










# DATA

(**총 923,590개** 한국어 dolly 데이터)

## instruction tuning data 형식

<pre>
{"instruction":instruction, "context": context, "response":response, "category": category}
</pre>

## instruction tuning data로 변환한 데이터 목록

- **KoVicuna data**
    - 구성 : ko_dataset_chatgpt(2개), ko_alpaca_style_dataset
    - KoVicuna data to Dolly data:
      - gpt → instruction
      - human→ response
      - category → open_qa
      
    - KoVicuna Data 예시(1세트) → gpt와 human 대화
    - KoVicuna Data sample:
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
    
  - Alpaca data 예시(1세트) → instruction, input, output
  - Alpaca data sample:
    <pre>
      {'instruction': '다음 국가와 관련된 역사적 사건 3가지를 나열하십시오.',
      <br>'input': '캐나다',
      <br>'output': '치푸아츠(Fort Chippewyan)는 캐나다 알버타주의 따뜻한 해안에 위치한 미국 원주민 지역에 근접한 유일한 유럽인 거주지입니다. 캐나다 프랑스 식민지로 건설되었으며, 나스강을 따라 서부 지역으로 확장된 유일한 유럽인 거주지입니다. 1778 년 새로 지어진 건물에 현재는 휴게소가 있습니다. 시티오브 에드먼튼에서 선퍼드 언덕스를 향해 북쪽으로 4.5시간 떨어진 곳에 있습니다.'}
    </pre>
                

- **Korquad 2.0**
  - Korquad 2.0 data to Dolly data:
    - Q → instruction
    - A → response
    - context → context
    - category → open_qa
    
  - Korquad 2.0 data 예시(1세트) → Q, A, context
  - Korquad 2.0 data sample:
    <pre>
       {'version': 'KorQuAD_2.0_train',
                'data': {'title': '예고범',
               'url': 'https://ko.wikipedia.org/wiki/예고범',
               'context': WIKIPEDIA CONTEXT
                 'qas': [{'answer': {'text': '나카무라 요시히로, 히라바야시 카츠토시, 사와다 메구미',
                  'html_answer_start': 21842,
                  'html_answer_text': '나카무라 요시히로, 히라바야시 카츠토시, 사와다 메구미',
                  'answer_start': 6302},
                 'question': '드라마 예고범의 감독은 누구일까?',
                 'id': '8089'}]}}
    </pre>
      
- **Korquad 1.0**
  
  - Korquad 1.0 data to Dolly data:
    - Q → instruction
    - A → response
    - context → context
    - category → open_qa
    
  - Korquad1.0 데이터  예시(1세트) → Q, A, context
  - Korquad 1.0 data sample:
    <pre>
          {'qas': [{'question': '다테 기미코가 최초로 은퇴 선언을 한게 언제지',
             'answers': [{'answer_start': 260, 'text': '1996년 9월 24일'}],
             'id': '9_f2_wiki_2822-1'}],
           'context': "재팬 오픈에서 4회 우승하였으며, 통산 단식 200승 이상을 거두었다. 1994년 생애 최초로 세계 랭킹 10위권에 진입하였다. 1992년에는 WTA로부터 '올해 가장 많은 향상을 보여준 선수상'(Most Improved Player Of The Year)을 수여받았으며, 일본 남자 패션 협회(Japan Men's Fashion Association)는 그녀를 '가장 패셔너블한 선수'(Most Fashionable)로 칭했다. 생애 두 번째 올림픽 참가 직후인 1996년 9월 24일 최초로 은퇴를 선언하였다. 이후 12년만인 2008년 4월에 예상치 못한 복귀 선언을 하고 투어에 되돌아왔다. 2008년 6월 15일 도쿄 아리아케 인터내셔널 여자 오픈에서 복귀 후 첫 우승을 기록했으며, 2009년 9월 27일에는 한국에서 열린 한솔 코리아 오픈 대회에서 우승하면서 복귀 후 첫 WTA 투어급 대회 우승을 기록했다. 한숨 좀 작작 쉬어!"}
    </pre>
