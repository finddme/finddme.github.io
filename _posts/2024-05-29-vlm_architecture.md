---
title: "Vision Language Model : Architecture (작성 중)"
category: Multimodal
tag: Multimodal
---







* 목차
{:toc}









Vision Language Model(VLM)은 visual data와 text data를 동시에 학습하여 두 modality 정보를 모두 활용할 수 있는 모델이다. VLM의 종류는 다양하지만 image와 text를 입력 받아 text 생성하는 모델이 가장 일반적이다. 이와 같은 모델은 vision model과 language model을 융합(fusion)시켜 만들어진다. 이때 융합(fusion)은 모델이 visual 정보와 그에 해당하는 text 정보를 입력 받아 두 modality의 정보를 연관/연동 시키는 방법을 학습함으로써 이루어질 수 있다. 

<center><img width="800" src="https://github.com/finddme/finddme.github.io/assets/53667002/800c5d79-5816-4a6f-979c-2b00fef6dd38"></center>
<center><em style="color:gray;">Edited by author</em></center><br>

Vision Language Model에는 one-size-fits-all architecture가 딱히 없다. vision language model의 구조는 task나 output에 따라 달라질 수 있다. task별 input과 output은 본 블로그 [Vision Language Model : Applications](https://finddme.github.io/multimodal/2024/05/28/vlm_task/) 게시물에서 확인 가능하다. 가장 일반적인 task는 아래 그림과 같이 input으로 image와 그와 관련된 text를 입력 받아 두 입력이 요구하는 정답을 text로 반환하는 것이다.

<center><img width="1000" src="https://github.com/finddme/finddme.github.io/assets/53667002/a630e86f-3544-4b8e-a110-4f96e0195cca"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

위 그림과 같이 두 유형의 data를 입력 받은 후 각 modality에 적합한 encoder를 거친 후 각각의 encoder에서 나온 embedding 결과를 융합시키기 위한 fusion layer를 거치고 마지막으로 fused representation 결과를 출력시킬 output block을 통해 최종 결과가 반환된다. 따라서 Vision Language Model은 크게 Vision Encoder, Language Encoder, Fusion Block, Output Block으로 구성된다.

# 1. Vision Encoder 

Vision Encoder는 visual input을 처리한다. 해당 부분에서는 visual data로부터 meaningful representation을 추출하여 이를 vector representation로 변환한다. 2024년 5월 기준 CLIP, ViT 등의 모델이 VLM model의 vision encoder로 많이 사용되고 있다. huggingface의 [OpenVLM Leaderboard](https://huggingface.co/spaces/opencompass/open_vlm_leaderboard)에서 동향을 확인할 수 있다.

# 2. Language Encoder

Language Encoder는 textual input을 처리한다. 해당 부분에서는 text data의 semantic information이 잘 포함된 embedding을 생성한다. Language Encoder가 text data의 seqence를 잘 파악할 수록 VLM의 성능이 올라간다.



