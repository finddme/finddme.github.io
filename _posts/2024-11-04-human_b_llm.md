---
title: "Generative Agents: Interactive Simulacra of Human Behavior 🚶‍➡️(작성 중)"
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
