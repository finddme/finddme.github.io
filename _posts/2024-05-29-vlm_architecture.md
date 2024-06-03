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
