---
title: " 언젠가 만들어 보고 싶은 귀여운 세상🚶‍➡Generative Agents: Interactive Simulacra of Human Behavior"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}











<center><img width="800" src="https://github.com/user-attachments/assets/4123131e-1800-43c4-8165-85a87b662378"></center>
<center><em style="color:gray;">https://arxiv.org/pdf/2304.03442</em></center><br>

# Generative Agent
최근 LLM을 통한 generative AI의 발전으로 single point에서의 인간 행동 시뮬레이션에는 많은 진전이 있었지만, 장기간에 걸친 복잡한 상호작용을 시뮬레이션하는 연구는 많이 진행되지 않았다. 본 논문은 Google과 Stanford University가 공동 연구한 논문으로, 복잡한 task에서 인간의 행동을 시뮬레이션할 수 있는 generative agent를 주제로 한다.

Google-Stanford team은 독립적으로 작동하는 또 다른 LLM을 구축하는 것과 달리, 환경과 능동적으로 상호작용하는 generative agent 개발에 집중했다. 여기에서 generative agent란, 자신과 다른 에이전트, 환경에 대해 다양한 추론을 도출할 능력을 지는 agent이다. 간단히 말하면 그냥 일상 생활을 하는 하나의 인간을 agent로 만들어 시뮬레이션 하는 것이다. 예를 들어 아침 식사 준비 중 계란이 다 익으면 가스레인지를 끄고, 산책을 하던 중 귀여운 강아지를 발견하면 잠시 인사하고, 출근한 후 대화하고 싶은 동료를 만나면 대화를 하는 것이다. generative agent들의 사회에서는 새로운 관계가 형성되고, 정보가 확산되며, agent들 간의 조정이 이루어지는 등 다양한 사회적 현상들이 관찰될 수 있다. 

# Smallville
연구진들은 agent simulation 환경을 심즈 세상처럼 만들었다. 이 환경에서 "Smallville"은 캐릭터들이 서로 상호작용하고, 다양한 활동을 수행할 수 있는 작은 마을이다. 본 연구에서는 Smallville에 25명의 avatar identity가 등장한다. Smallville 안에는 카페, 바, 공원, 학교, 집, 상점 등 의 agent들의 행동을 유도하는 여러 affordance들이 설계되어 있고, 이러한 환경의 하위 영역(e.g. 집 안에는 부엌, 학교 안에는 교실 등)을 정의하고, 하위 영역 내의 object(e.g. 침실 안에는 침대, 옷장 등)을 정의한다.

agent들은 Smallville을 돌아다니며 건물에 들어갔다 나가고, 지도를 탐색하고, 다른 agent들에게 접근한다. agent의 움직임은 generative agent architecture와 sandbox game engine가 제안한다. model이 agent가 특정 위치로 이동해야한다고 판단하면 Smallville환경 내에서 목적지까지의 도보 경로가 계산되고, agent가 움직이기 시작한다. 

사용자가 직접 Smallville에서 활동하는 agent가 될 수도 있다. 

아래 그림은 Smallville 주민들의 하루 일과이다. generative agent인 John Lin은 오전 6시에 기상해 양치 - 샤워 - 아침식사 등 아침 루틴을 수행한다. 아침 일과를 마친 후에는 아내 Mei, 아들 Eddy와 잠시 대화를 나눈 후 외출한다. 

<center><img width="800" src="https://github.com/user-attachments/assets/5c0eaa80-c44a-4776-b56a-e67f8d5fe92a"></center>
<center><em style="color:gray;">https://arxiv.org/pdf/2304.03442</em></center><br>

# 새로운 행동 출현 
이 연구에서 매우 흥미로운 점은 시뮬레이션 환경 안에서 새로운 행동이 출현된다는 것이다. 오랜 시간 상호작용을 통해 관계를 형성한 agent들은 이 관계를 기억하기 시작했고, 또한 소문을 퍼뜨리거나 서로의 행동을 조율할 수 있게 되었다. 아래 그림은 Valentine’s party를 계획할 때 agent들이 보인 행동들이다. 

<center><img width="800" src="https://github.com/user-attachments/assets/d3348ca3-3db0-40a6-989f-347a8ca082d3"></center>
<center><em style="color:gray;">https://arxiv.org/pdf/2304.03442</em></center><br>

시뮬레이션을 시작할 때 agent들은 발렌타인데이 파티를 조직하려는 의도로 초기화된다. agent가 의도에 따라 행동하지 않거나 다른 사람에게 알리는 것을 기억하니 못하는 등 일련의 이벤트에서 실패할 수 있는 지점은 많지만 여러 agent들이 모여 상호작용하면서 파티가 성공적으로 열린다. 

# Generative Agent Architecture

generative agent는 다른 agent들과 상호작용하면서 환경 변화에 반응할 수 있도록 설계되었다. 이런한 **agent들의 행동은 현재 환경과 과거 경험을 입력받아 생성된다.** 이를 위해 agent들의 architecture는 LLM과 관련 정보를 합성하고 검색하는 메커니즘이 결합된 방식으로 구현되어 있다. 이 architecture는 LLM의 출력을 조절하고, agent의 과거 경험을 바탕으로 반응을 생성하고, 장기적인 일관성을 유지하도록 설계되어 있다.

## memory issues

agent들이 LLM을 사용하여 신뢰성 있게 잘 작동하려면 관련 memory를 저장, 합성, 적용하는 agent architecture가 필요하다. 

GPT-4o와 같이 현재 가장 성능이 뛰어난 LLM을 사용하더라도 장기적인 계획과 일관성을 유지하는 데에 어려움이 있었다. generative agent는 유지해야 할 이벤트와 메모리를 대량으로 생성하기 때문에 이 architecture의 핵심 과제 중 하나는 agent의 메모리에서 가장 관련성 높은 부분을 필요할 때에만 검색하고 합성하는 것이다. 이를 위한 architecture는 아래와 같은 세 가지 구성요소로 이루어져 있다.

<center><img width="800" src="https://github.com/user-attachments/assets/1b1f23de-d7b8-48f4-893f-755506b86dc7"></center>
<center><em style="color:gray;">https://arxiv.org/pdf/2304.03442</em></center><br>

### 1. memory stream
agent의 포괄적인 경험 목록을 자연어로 기록하는 long-term memory module 이다. retrieval model은 관련성, 최근성, 중요성을 통해 현재 행동 생성에 필요한 기록을 찾는다.

agent의 경험은 memory stream에 의해 종합적으로 기록되고 유지/관리된다. 이 stream은 각각의 자연어 설명, 생성 timestamp, 최근 엑세스 timestamp가 포함된 memory object로 구성된다.

가장 기본적인 수준인 "observations"은 agent가 직접 인지한 event로, agent가 직접 수행한 행동이나 agent가 다른 agent/non-agent object를 보는 것이다.

예를 들어 커피숍에서 일하는 이사벨라 로드리게즈는 시간이 지남에 따라 다양한 "observations"을 축적한다. ""observations"에는 다음이 포함됩니다: (1) 이사벨라 로드리게스가 페이스트리를 준비하고 있음, (2) 마리아 로페즈가 커피를 마시면서 화학 시험을 공부하고 있음, (3) 이사벨라 로드리게스와 마리아 로페즈가 홉스 카페에서 발렌타인데이 파티를 계획하는 것에 대해 대화하고 있음, (4) 냉장고가 비어 있음.

<center><img width="800" src="https://github.com/user-attachments/assets/2b971894-b0a4-4bda-aa61-33c5525bc607"></center>
<center><em style="color:gray;">https://arxiv.org/pdf/2304.03442</em></center><br>

### 2. reflection 

연구진들은 reflection이라는 새로운 기억 유형을 도입했다. reflection은 agent가 보다 추상적이고 높은 수준으로 생각할 수 있도록 한다. memory retrieval을 하는 도중에 일어난 "observations"가 함께 반영된다.
agent가 인지한 가장 최신의 event에 대한 중요도 점수가 특정 threshold를 넘기면 reflection이 발현되도록 시스템을 구현하여 주기적으로 reflection이 발현도되록 했다. 이런 구현 방식에서 agent들은 하루에 평균 2번의 reflection을 수행했다.

reflection을 통해 질문을 생성하는 단계:

1) agent들의 memory stream에 있는 가장 최근 기록 100개를 LLM에 query하고, prompt로는 "위 정보만 주어진다면 진술의 주제에 대해 가장 두드러진 상위 질문 3개는 무엇일지?"를 입력하여 질문 3개를 생성한다.
2) 이렇게 생성된 질문 3개를 retreival을 위한 query로 사용하여 각 질문에 대한 관련 기억을 수집한다.
3) 이후 LLM에 "근거가 되는 특정 기록"을 추출하라는 prompt를 입력하여 insight를 추출한다. 

### 3. planning

시간이 지나도 agent가 일관되게 유지도도록 하기 위한 처리이다. planning은 향후 일련의 작업을 설명하는 데 사용되며, 위치-시작시간-기간으로 구성된다.

예를 들어 연구실에서 연구에 몰두 중인 agnet Klaus Mueller가 하루종일 책상에서 연구 논문 초안을 작성하고 있는 상황에서 planning은 다음과 같이 기록될 수 있다: 오크힐 대학 기숙사 Klaus Mueller의 책상에서 - 2023년 2월 12일 오전 9시 - 180분 동안 

planning은 reflection과 함께 memory stream에 저장되며, retrieval processe에 포함된다. 이에 따라 행동 방식이 결정 될 때 이 세 가지가 모두 고려된다. 즉, 현재 환경을 현재의 행동 계획으로 변경하고, 이를 다음 행동 및 반응을 위한 것으로 재귀적으로 변환시킨다. 이와 같은 계획은 다시 memory stream으로 fed back되어 agent의 향후 행동에 영향을 미친다.


# Reference

> [Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/pdf/2304.03442)


