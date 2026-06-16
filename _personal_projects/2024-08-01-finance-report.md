---
title: "금융 리포트 생성 system 개발"
date: 2025-01-01
thumbnail: 
link:
summary: "Deployment of LLM Service within LLMOPS (Report Generation)"
---

- **프로젝트 정의**
    
    주식 관련 금융 리포트 생성 system 개발
    
- **개발 목적**
    - 최근 회사에 model tuning이 요구되는 사업이 진행되지 않아
        
        동료와 함께 toy project를 기획하여 최신 모델 tuning + merge + task 수행 시스템 개발
        
- **개발 단계**
    1.  model tuning이 필요한 특수 task, domain 설정
        - domain: 금융
        - task:
            - 크롤링한 json 형식의 금융 데이터에서 주요 금융 정보를 선별하여 금융 리포트 생성
            - 생성된 금융 리포트에 대한 시각 자료  생성
    2. task에 필요한 모델 개발
        - json summary model
        - text to html model
    3. 모델 학습 데이터 수집
        - **json summary model train data**:
            - 숫자연산 기계독해 데이터(https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=data&dataSetSn=71568&ref=blog-ko.allganize.ai) 내 숫자 정보가 담긴 text를 LLM을 활용하여 json data 생성
            - text에 대한 json data가 있는 train data 구축
            - input: json data
                
                output: text
                
            - 예시:
            
            ```json
            {
            "instruction": "Using the provided data, generate sentences in an article format with numerical details.",
            "input": "{'R&D인건비 등 비용인정범위 확대': '39.3%', '엄격한 지원요건 완화': '25.4%', '지원대상기술 범위를 네거티브 방식으로 전환': '22.2%', '고용 창출·유지 기업에 대한 세제지원 확대': '52.9%', '중소기업 특별세액감면 등 직접적 세감면 확대': '30.3%', '사업재편 및 구조조정 관련 세제지원 확대': '9.9%', '중소기업 결손금 소급공제 기간 확대': '6.9%'}",
            "output": "국가전략기술·신성장기술 관련 세제지원제도와 관련해서는 'R&D인건비 등 비용인정범위 확대'(39.3%)를 가장 중요하다고 응답했고 '엄격한 지원요건 완화'(25.4%), '지원대상기술 범위를 네거티브 방식으로 전환'(22.2%)도 필요하다고 답했다.\n코로나19 피해회복 지원을 위해 새 정부가 가장 중점적으로 추진해야 하는 정책에 대해선 '고용 창출·유지 기업에 대한 세제지원 확대'(52.9%)를 가장 많이 꼽았다. 다음으로 '중소기업 특별세액감면 등 직접적 세감면 확대'(30.3%), '사업재편 및 구조조정 관련 세제지원 확대'(9.9%), '중소기업 결손금 소급공제 기간 확대'(6.9%) 순이었다.\n대한상의는 “CEO 다수가 조세정책방향 1순위를 경제성장 지원으로 꼽은 만큼, 같은 맥락에서 일자리 창출 지원을 가장 효과적인 코로나 피해회복 지원 방법으로 보는 것”이라고 설명했다.",
            }
            ```
            
        - **text to html model train data**:
            - 기술과학 문서 기계독해 데이터(https://aihub.or.kr/aihubdata/data/view.do?currMenu=&topMenu=&aihubDataSe=data&dataSetSn=71533) 내 html 형식의 표 데이터에 대한 요약문을 LLM을 활용하여 생성
            - text에 대한 html형식의 표 데이터가 있는 train data 구축
            - input: text
                
                output: html table
                
            - 예시:
            
            ```json
            {
            "instruction": "Please create the original source data in paragraph form to generate the following HTML table data. Analyze the table structure well to restore the source data.  None of the information in the table data should be omitted(think about it multiple times). The source data should consist solely of the content contained within the table, without using modifiers like 'this table...' and similar expressions.",
            "input": "인천봉화초등학교 다목적교실 조성공사 시방서(건축) <table><tbody><tr><td>바탕의 종류</td><td>도장 종류</td><td>공법</td></tr><tr><td rowspan='3'>목재면, 플라스터면, 모르타르면, 콘크리트면</td><td>1종</td><td>부분 퍼티 처리</td></tr><tr><td>2종</td><td>전면 퍼티 처리</td></tr><tr><td>3종</td><td>이음새 퍼티 처리</td></tr><tr><td rowspan='3'>철재면</td><td>1종</td><td>인산염(인산염)처리를 할 때</td></tr><tr><td>2종</td><td>금속바탕 처리용 프라이머를 칠할 때</td></tr><tr><td>3종</td><td>보통의 금속</td></tr><tr><td rowspan='3'>아연도금면</td><td>1종</td><td>금속바탕 처리용 프라이머를 칠할 때</td></tr><tr><td>2종</td><td>황산아연의 수용액을 칠할 때</td></tr><tr><td>3종</td><td>옥외로서 풍우에 접할 때</td></tr><tr><td rowspan='2'>경금속 및 동 합금면</td><td>1종</td><td>인산염처리를 할 때</td></tr><tr><td>2종</td><td>금속바탕 처리용 프라이머를 칠할 때</td></tr></tbody></table>",
            "output": "\n목재면, 플라스터면, 모르타르면, 콘크리트면의 바탕에는 세 가지 도장 종류가 적용됩니다. 1종은 부분 퍼티 처리, 2종은 전면 퍼티 처리, 3종은 이음새 퍼티 처리 공법을 사용합니다.\n\n철재면에도 세 가지 도장 종류가 있습니다. 1종은 인산염(인산염)처리를 할 때, 2종은 금속바탕 처리용 프라이머를 칠할 때, 3종은 보통의 금속에 적용됩니다.\n\n아연도금면 역시 세 가지 도장 종류로 나뉩니다. 1종은 금속바탕 처리용 프라이머를 칠할 때, 2종은 황산아연의 수용액을 칠할 때, 3종은 옥외로서 풍우에 접할 때 사용됩니다.\n\n경금속 및 동 합금면에는 두 가지 도장 종류가 있습니다. 1종은 인산염처리를 할 때, 2종은 금속바탕 처리용 프라이머를 칠할 때 적용됩니다."
            }
            ```
            
    4. 모델 학습
    5. 두 모델 merge
        - merge yml
        
        ```yaml
        models:
          - model: **json summary model path**
            parameters:
              weight: 1
          - model: **text to html model path**
            parameters:
              weight: 1
          - model: meta-llama/Meta-Llama-3-8B-Instruct
            parameters:
              weight: 1
        merge_method: task_arithmetic
        base_model: meta-llama/Meta-Llama-3-8B-Instruct
        parameters:
          normalize: true
          int8_mask: true
        dtype: float16
        ```
        
    6. 금융 정보 crawling 모듈 개발
    7. merge한 모델을 통해 아래 pipeline 구축
        - 금융 정보 crawling 정보 → summary
            - 예시
            
            !image.png
            
        - summary → table
            - 예시
                
                ```json
                {"Q": "Using the following data, create a table in HTML format that utilizes any numeric information.: \n 국내 증시가 4일 상승
                마감했다 미국 연방준비제도(Fed)의 금리 인하에 따른 달러 약세가 국내 증시에 긍정적인 영향을 미쳤다.\n이날 코스피는 전일 대비 6.88포인트(0.27%) 내린 2,568.53에 거래를 마쳤다 코스닥은
                3.58포인트(0.49%) 오른 736.78에 장을 마쳤다 코스피200은 2.27포인트(0.66%) 내린 341.42를 기록했다.\n국내 종목은 KODEX 200선물인버스2X(2,300,+35,+1.55%),
                오가닉티코스메틱(94,+7,+8.05%), 삼성전자(63,000,-1,400,-2.17%), 우리기술(2,550,+110,+4.51%), KODEX 인버스(4,475,+30,+0.67%),
                SDN(1,703,+170,+11.09%), KODEX 코스닥150선물인버스(3,840,-40,-1.03%), KODEX 코스닥150레버리지(8,320,+150,+1.84%),
                영풍제지(1,569,+264,+20.23%), 현대약품(5,330,+595,+12.57%), 이스트아시아홀딩스(66,-1,-1.49%), 골드앤에스(600,+58,+10.70%), KODEX
                레버리지(16,065,-305,-1.86%), 드래곤플라이(274,+5,+1.86%), TIGER 200선물인버스2X(2,425,+30,+1.25%) 등이 상승 마감했다 반면 삼성전자, KODEX
                코스닥150선물인버스 등은 하락 마감했다.\n이날 주요 금융 뉴스로는 '재수생 케이뱅크부터 백종원의 더본코리아까지…IPO시장 되살아나나', '고려아연 경영권 분쟁 핵심은 대항 공개매수·영풍정밀', '설마 했는데
                ‘빅컷’…환율 1320원대 지지력 테스트[외환브리핑]', '美, 금리인하 개시…코스피, 바이오·금융 주목'[굿모닝 증시]', '美금리 ‘통큰 인하’에도 주가 왜 떨어짐? 오늘 코스피·코스닥도?' [투자360] 등이
                있었다.,", "A": " <table>
                    <tbody>
                        <tr>
                            <td>종목</td>
                            <td>전일대비</td>
                            <td>전일대비%</td>
                            <td>거래량</td>
                        </tr>
                        <tr>
                            <td>KODEX 200선물인버스2X</td>
                            <td>+35</td>
                            <td>+1.55%</td>
                            <td>1,111</td>
                        </tr>
                        <tr>
                            <td>오가닉티코스메틱</td>
                            <td>+7</td>
                            <td>+8.05%</td>
                            <td>1,111</td>
                        </tr>
                        <tr>
                            <td>삼성전자</td>
                            <td>-1,400</td>
                            <td>-2.17%</td>
                            <td>1,111</td>
                        </tr>
                        <tr>
                            <td>우리기술</td>
                            <td>+110</td>
                            <td>+4.51%</td>
                            <td>1,111</td>
                        </tr>
                        <tr>
                            <td>KODEX 인버스</td>
                            <td>+30</td>
                            <td>+0.67%</td>
                            <td>1,111</td>
                        </tr>
                        <tr>
                            <td>SDN</td>
                            <td>+170</td>
                            <td>+11.09%</td>
                            <td>1,111</td>
                        </tr>
                        <tr>
                            <td>KODEX 코스닥150선물인버스</td>
                            <td>-40</td>
                            <td>-1.03%</td>
                            <td>1,111</td>
                        </tr>
                        <tr>
                            <td>KODEX 코스닥150레버리지</td>
                            <td>+150</td>
                            <td>+1.84%</td>
                            <td>1,111</td>
                        </tr>
                        <tr>
                            <td>영풍제지</td>
                            <td>+264</td>
                            <td>+20.23%</td>
                            <td>1,111</td>
                        </tr>
                        <tr>
                            <td>현대약품</td>
                            <td>+595</td>
                            <td>+12.57%</td>
                            <td>1,111</td>
                        </tr>
                        <tr>
                            <td>이스트아시아홀딩스</td>
                            <td>-1</td>
                            <td>-1.49%</td>
                            <td>1,111</td>
                        </tr>
                        <tr>
                            <td>골드앤에스</td>
                            <td>+58</td>
                            <td>+10.70%</td>
                            <td>1,111</td>
                        </tr>
                        <tr>
                            <td>KODEX 레버리지</td>
                            <td>-305</td>
                            <td>-1.86%</td>
                            <td>1,111</td>
                        </tr>
                        <tr>
                            <td>드래곤플라이</td>
                            <td>+5</td>
                            <td>+1.86%</td>
                            <td>1,111</td>
                        </tr>
                        <tr>
                            <td>TIGER 200선물인버스2X</td>
                            <td>+30</td>
                            <td>+1.25%</td>
                            <td>1,111</td>
                        </tr>
                    </tbody>
                </table>"}
                ```
                
- **사용 기술**
    1. data collect, data processing
    2. data generation
    3. LLM tuning
    4. model merge
- **개발 언어**
    
    python
