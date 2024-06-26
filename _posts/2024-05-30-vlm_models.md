---
title: "VLM : Models Summary(unfinished post)"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}










# OpenVLM Leaderboard

[https://huggingface.co/spaces/opencompass/open_vlm_leaderboard](https://huggingface.co/spaces/opencompass/open_vlm_leaderboard)

# LLAVA

관련 포스트 : [LLaVA : Visual Instruction Tuning](https://finddme.github.io/llm%20/%20multimodal/2024/05/11/llava/)

# Idefics2

[https://huggingface.co/blog/idefics2](https://huggingface.co/blog/idefics2)

[Fine-tune-IDEFICS-Vision-Language-Model](https://github.com/NSTiwari/Fine-tune-IDEFICS-Vision-Language-Model?tab=readme-ov-file)

8B모델로, Idefics1보다 OCR 성능이 향상되었고, VAQ benchmark에서 공개 당시 최고 성능을 기록했다. 

학습데이터는 webdocuments (Wikipedia,OBELICS), image-caption pairs (Public Multimodal Dataset, LAION-COCO), OCR data (PDFA (en), IDL and Rendered-text, image-to-code data (WebSight)) 등을 혼합하여 사용했다. 

# Florence-2

# Gemini

Gemini는 Google에서 공개한 multi-modal large language model로, 모델 사이즈에 따라 Ultra, Pro, Nano 버전이 있다. Ultra 버전은 세 버전 중 모델 사이즈가 가장 큰 버전으로, 복잡한 multimodal task를 위해 개발되었다. Pro는 중간 사이즈의 모델로, performance와 scalability의 균형을 잘 맞춘 모델이다. 마지막으로 Nano 버전은 세 버전 중 가장 작은 모델이다. 

버전에 상관 없이 해당 모델은 vision과 language 뿐만 아니라 audio와 video도 처리할 수 있다. 
 

# BLIP-2

Bootstrapping Language-Image Pre-training with Frozen Image Encoders and Large Language Models(BLIP)

BLIP에서는 lightweight Querying Transformer(Q-Former)로 vision과 language modality를 연결한다. Q-Former는 아래와 같이 두 단계의 사전 학습 과정을 거치는데, 이를 통해 vision-language alignment를 모델에 효과적으로 학습시켜 high-quality text output 생성을 가능하도록 한다.  

1. frozen image encoder로부터 visual feature를 추출하여 vision-language representation 학습
2. frozen language model과 연결하여 vision-to-language 생성 학습

BLIP-2는 기존의 모델들보다 적은 trainable parameter로 다양한 vision-language task에 대해 좋은 성능을 보인다는 점에서 주목 받았다.

# CLIP

Contrastive Language-Image Pre-training(CLIP)

웹 페이지에서 크롤링한 약 4억 개의 image-text pair dataset을 학습한 모델. 

두 modality encoder 간의 연결이 dot product로만 되어 있어 복잡한 task 수행에는 최근 나오는 모델들에 비해 추론 품질이 좋지는 않다고 한다. 
