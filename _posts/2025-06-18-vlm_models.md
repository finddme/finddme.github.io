---
title: "VLM : Models Summary (unfinished post: 0618 update)"
category: LLM / Multimodal
tag: Multimodal
---







* 목차
{:toc}










# OpenVLM Leaderboard

[https://huggingface.co/spaces/opencompass/open_vlm_leaderboard](https://huggingface.co/spaces/opencompass/open_vlm_leaderboard)

# InternVM3
- OpenGVLab에서 개발한 MLLM 시리즈 모델 중 하나
- 2.5 버전에 비해 멀티 모달 인시, 추론 능력이 향상되었고, tool use도 지원한다.

## 모델 구조
- ViT-MLP-LLM 3-stack: InternVL3는 이전 버전과 동일한 "ViT-MLP-LLM" 구조로 구성된다.
  - ViT (Vision Encoder)는 InternViT-300M-448px-V2.5 or InternViT-6B-448px-V2.5 를 사용
  - LLM Backborn은 Qwen2.5를 사용
  - MLP: Multi-Layer Perceptron. 1번 Modality vector를 2번 Modality Model이 받을 수 있는 형태로 변환하는 역할. Modality 간의 번역기라고 생각하면 쉬움 
    ```
    Vision Transformer (ViT) → MLP → Language Model (LLM)
         ↓                      ↓              ↓
       이미지 처리           형태 변환        텍스트 생성
        [512 dim]       [512→1024→2048]       [2048]
    ```
- 픽셀 Unshuffle 작업을 적용하여 시각 토큰 수를 원본의 1/4로 축소하였다.
  - 448×448 이미지를 16×16 패치로 나누면 → 28×28 = 784개의 패치(토큰)
  - 각 패치가 하나의 토큰이 되어 언어모델이 처리해야 함
    ```
    원본 이미지: 448×448
    패치 분할: 16×16 패치로 나누면 28×28 = 784개 토큰
    
    Unshuffle 적용:
    1. 2×2 패치를 하나로 합치기
    2. 28×28 → 14×14 = 196개 토큰 (1/4로 축소)
    3. 각 토큰은 더 큰 영역의 정보를 담게 됨
    ```
- 기존 멀티 모달 모델들은 LLM을 먼저 만들어 놓고 추가 modality에 LLM을 adaptive 시키는 방식으로 만들어졌는데 InternV3은 처음부터 여러 모달들에 대해 동시에 학습했다.
  - 기존 학습 방식:
    ```
    1단계: 언어 모델만 학습
       텍스트 데이터만 사용 → GPT, LLaMA 등의 순수 언어모델 완성
    
    2단계: 비전 모듈 추가
       이미지 인코더를 언어모델에 연결
    
    3단계: 멀티모달 적응
       이미지-텍스트 쌍으로 추가 학습하여 두 모달리티 연결
    ```
    - 기존 학습 방식은 각 모달리티가 따로 학습되기 때문에 모달리티 간의 alignment문제가 있었다.
  - InernVL3
    ```
    처음부터 한 번에:
    텍스트 + 이미지-텍스트 + 비디오-텍스트를 모두 섞어서 동시 학습
    
    학습 데이터 예시:
    [순수 텍스트] "Python은 프로그래밍 언어다"
    [이미지+텍스트] <이미지: 고양이> "이 사진은 고양이를 보여준다"
    [순수 텍스트] "머신러닝은 AI의 한 분야다"
    [비디오+텍스트] <비디오: 요리> "이 영상은 파스타 만드는 과정이다"
    ```
    - 처음부터 두 모달리티가 자연스럽게 융합되어 학습된다.
    - 별도의 정렬 과정이 불필요하다

## 학습 
- 학습 데이터 구성:
  1) text only (40%)
  2) 이미지-텍스트 쌍 (35%) 
  3) 비디오-텍스트 쌍 (15%)
  4) 멀티이미지-텍스트 (10%)

- 학습 예시 (이미지-텍스트)
  ```
  - Input: 
     - 이미지: [강아지가 공원에서 뛰노는 사진]
     - 텍스트 프롬프트: "이 이미지를 설명해주세요"
  
  - Target Output (정답):
     "공원에서 골든리트리버가 즐겁게 뛰어다니고 있습니다. 
      배경에는 나무들과 잔디밭이 보입니다."
  
  - 학습 과정:
     모델이 예측한 답과 정답을 비교하여 오차 계산 → 가중치 업데이트
  ```
- Mixed Preference Optimization (MPO)
  - 3가지 Loss 함수의 조합 결과를 최소화 하는 방향으로 학습 진행
    ```
    MPO Loss = wp × Preference Loss + wq × Quality Loss + wg × Generation Loss
    ```
    1. Preference Loss (선호도 학습): DPO (Direct Preference Optimization) 사용
       ```
        - 예시 상황:
        질문: [수학 문제 이미지] "이 방정식을 풀어주세요"
        
        좋은 답변 (Chosen): 
        "단계별로 풀어보겠습니다.
        1) 먼저 양변에서 3을 빼면: 2x + 3 - 3 = 9 - 3
        2) 2x = 6이 됩니다
        3) 양변을 2로 나누면: x = 3
        따라서 답은 x = 3입니다."
        
        나쁜 답변 (Rejected):
        "x = 3이다"
        
        - 학습 목표: 
        모델이 좋은 답변을 나쁜 답변보다 선호하도록 학습
       ```
    2. Quality Loss (품질 학습): BCO (Binary Classification Optimization) 사용 -> 각 답변에 품질 점수 부여
    3. Generation Loss (생성 학습): 기존 Language Model Loss
  - 학습 과정
    ```
    1단계: 기본 SFT로 모델 학
    2단계: MMPR 데이터로 MPO 적용
       - Preference Loss: 좋은 답변 vs 나쁜 답변 학습
       - Quality Loss: 답변 품질 점수 학습  
       - Generation Loss: 기본 언어 능력 유지
    3단계: 모든 loss를 가중합으로 동시 최적화
    ```
## 추론
- 영상 추론 예시
  ```
  - User Input:
     - 비디오: [축구 경기 하이라이트 30초]
     - 프롬프트: "이 경기에서 골이 어떻게 나왔는지 설명해주세요"
  
  - Model Output:
     "좌측 윙어가 크로스를 올리자 페널티박스 안의 스트라이커가
      헤딩으로 골을 성공시켰습니다. 골키퍼가 반응했지만
      공의 각도가 너무 정확했습니다."
  ```

# Qwen2.5-VL
-Alibaba Cloud의 Qwen 팀이 개발한 멀티모달 모델

## 모델 구조
- Dynamic-Resolution ViT + Qwen 2.5 LLM
  - Window Attention을 ViT에 구현하여 훈련과 추론 속도를 향상시킴. 
- MRoPE (Multi-Resolution Rotary Position Embedding)
  - 텍스트, 이미지, 영상 등 다양한 입력 모달리티의 위치 정보를 효과적으로 통합해서 모델의 멀티모달 이해 능력을 향상시키는 기술이다.
  - 기존의 RoPE(Rotary Position Embedding)는 주로 text sequence의 상대적 위치를 인코딩하는 데 사용되었는데 이를 확장해서 3D 위치 인코딩을 도입
    - 1D
      - text 위치 정보 encoding.
      - 전통적인 1D RoPE와 유사하게 각 token의 위치를 sine/cosine으로 인코딩하여 상대적 위치 정보를 파악
    - 2D
      - 이미지 2D 공간 정보
      - 각 패치의 높이(height)와 너비(width)에 해당하는 2D 위치 ID를 할당하여 공간적 관계를 파악
    - 3D
      - 영상의 시간-공간 정보
      - 각 프레임에 대해 시간적 위치 ID를 부여하며, 프레임 간의 실제 시간 간격을 반영하여 정확한 시간 정렬을 유지
    - 위 세 가지를 각각 독립적으로 encoding하고 이를 결합하여 멀티모달 데이터를 처리한다.
  - 장점
    - 정확한 시간 정렬: 비디오의 경우, 프레임 간의 실제 시간 간격을 반영하여 이벤트의 정확한 타이밍을 파악할 수 있다.
    - 해상도 독립성: 동적 해상도 처리를 통해 다양한 해상도의 이미지와 비디오를 효과적으로 처리할 수 있다.
    - 모달리티 간 일관성: 텍스트, 이미지, 비디오 간의 위치 정보를 일관되게 처리하여 멀티모달 이해 능력을 향상시
- Naive Dynamic Resolution
  - 기존의 비전-언어 모델(VLM)은 입력 이미지의 해상도를 고정하여 처리하는 방식(예: 224×224 픽셀)을 사용. 이는 다양한 해상도의 이미지를 처리하는 데 한계가 있었다. 특히 고해상도 이미지에서 세부 정보 손실이 발생. 
  - Qwen 2.5 VL의 Naive Dynamic Resolution은 기존 처리 방식의 한계를 극복하기 위해 이미지의 해상도와 h*w비에 따라 동적으로 시각 토큰의 수를 조정하는 방식을 채택했다. 이를 통해 모델은 다양한 해상도의 이미지를 보다 효율적으로 처리할 수 있습니다.
  - 동작 방식:
    - 입력 이미지의 해상도에 따라 적절한 수의 시각 토큰을 생성
    - 기존의 고정된 위치 임베딩을 제거하고, 2D-RoPE를 도입하여 이미지 내 각 토큰의 위치 정보를 동적으로 인코딩
    - ViT(Vision Transformer) 이후 간단한 MLP 레이어를 사용하여 인접한 2×2 토큰을 하나의 토큰으로 압축함으로써, 시각 토큰의 수를 줄이고 계산 효율성을 높임 

# Flamingo
- 2022년 DeepMind에서 발표한 80B VLM 모델.
- 70B 파라미터 Chinchilla 언어 모델을 기반으로 구축됨.

## 모델 구조
- Frozen Backbones: 사전학습된 ViT-G/Perceiver IO와 Chinchilla-LM을 고정(frozen) 상태로 사용하여, 99% 이상의 파라미터를 동결하고 새로운 아키텍처 컴포넌트만 학습
- Gated Cross-Attention Layers (GCA): 언어 모델의 self-attention 레이어 사이에 삽입되어 모델이 필요할 때마다 시각적 피처에 선택적으로 주의를 기울일 수 있도록 함 (Falmingo 핵심)
- Perceiver Resampler: 가변 개수의 이미지나 비디오 프레임을 고정된 개수의 시각적 토큰으로 변환하여 모델의 확장성을 향상
- Interleaved 토큰 스트림: 텍스트 중간에 <image> 토큰으로 위치를 표시하고 비전 피처 시퀀스를 동일한 시점에 주입하여 임의로 섞인 시각-텍스트 데이터 처리

## 학습 
- 웹에서 수집한 interleaved image-text 데이터
- 예시:
  ```
  [이미지1] <image> 이것은 고양이 사진입니다. 고양이가 소파에 앉아 있어요. <EOC>
  ```
- 특수 토큰: <image> (이미지 위치 표시), <EOC> (텍스트 청크 끝)
- 입력 이미지는 별도의 비전 파이프라인을 통해 visual tokens로 변환된다.
- 텍스트와 이미지는 Gated Cross-Attention이 텍스트의 <image> 위치에서 해당 visual tokens에 attention을 함으로써 연결된다.
- 주어진 이미지와 텍스트를 보고 다음에 올 텍스트 토큰을 예측하기 위해 위와 같은 데이터에 대해 NLL(Negative Log-Likelihood) 합을 최소화하는 방향으로 학습 진행

## 추론 
- Few-shot prompting input 예시:
  ```
  <image>고양이가 소파에 앉아있는 사진<|endofchunk|>
  질문: 이 사진에 몇 마리의 고양이가 있나요?
  답변: 한 마리입니다.<|endofchunk|>
  
  <image>개 두 마리가 공원에서 뛰어노는 사진<|endofchunk|>
  질문: 이 사진에 몇 마리의 개가 있나요?
  답변: 두 마리입니다.<|endofchunk|>
  
  <image>새로운 이미지<|endofchunk|>
  질문: 이 사진에서 무엇을 볼 수 있나요?
  답변:
  ```
- 이미지는 이미지 그대로 들어간다.
  - 처리 과정:
    - 이미지 처리: Vision Encoder (ViT 등)가 실제 이미지 픽셀을 visual features로 변환
    - Perceiver Resampler: 가변 개수의 이미지 특징을 고정된 64개의 visual tokens로 변환
    - 텍스트 토큰화: <image> 토큰은 단순히 "여기에 이미지가 있다"는 위치 표시자
    - Cross-Attention: 언어 모델이 특정 <image> 토큰 위치에서 해당하는 visual tokens에 attention
- 데이터 흐름 예시:
  ```
  실제 입력:
  텍스트: "<image> 질문: 이 사진에 몇 마리의 고양이가 있나요?"
  이미지: [실제 고양이 사진의 픽셀 데이터]
  
  처리 후:
  텍스트 토큰: [<image>, 질문, :, 이, 사진, 에, ...]
  비전 토큰: [v1, v2, v3, ..., v64] (64개의 visual features)
  ```

# ETC.
## CLIP
Contrastive Language-Image Pre-training(CLIP)

### 모델 구조
- Dual Encoder<br>
  Vision Transformer(ViT)나 ResNet과 같은 이미지 인코더 + Transformer 언어 인코더로 구성 
  두 스트림이 완전히 분리되어 동시에 임베딩을 만듦
  
두 modality encoder 간의 연결이 dot product로만 되어 있어 복잡한 task 수행에는 최근 나오는 모델들에 비해 추론 품질이 좋지는 않다고 한다. 

### 학습 
웹 페이지에서 크롤링한 약 4억 개의 image-text pair dataset을 학습한 모델. 

### 추론
- input: 이미지/텍스트/ 이미지+텍스트
- output: embedding vector / 텍스트-이미지 유사도

## BLIP-2

Bootstrapping Language-Image Pre-training with Frozen Image Encoders and Large Language Models(BLIP)

BLIP에서는 lightweight Querying Transformer(Q-Former)로 vision과 language modality를 연결한다. Q-Former는 아래와 같이 두 단계의 사전 학습 과정을 거치는데, 이를 통해 vision-language alignment를 모델에 효과적으로 학습시켜 high-quality text output 생성을 가능하도록 한다.  

1. frozen image encoder로부터 visual feature를 추출하여 vision-language representation 학습
2. frozen language model과 연결하여 vision-to-language 생성 학습

BLIP-2는 기존의 모델들보다 적은 trainable parameter로 다양한 vision-language task에 대해 좋은 성능을 보인다는 점에서 주목 받았다.


## LLAVA

관련 포스트 : [LLaVA : Visual Instruction Tuning](https://finddme.github.io/llm%20/%20multimodal/2024/05/11/llava/)

## Idefics2

[https://huggingface.co/blog/idefics2](https://huggingface.co/blog/idefics2)

[Fine-tune-IDEFICS-Vision-Language-Model](https://github.com/NSTiwari/Fine-tune-IDEFICS-Vision-Language-Model?tab=readme-ov-file)

8B모델로, Idefics1보다 OCR 성능이 향상되었고, VAQ benchmark에서 공개 당시 최고 성능을 기록했다. 

학습데이터는 webdocuments (Wikipedia,OBELICS), image-caption pairs (Public Multimodal Dataset, LAION-COCO), OCR data (PDFA (en), IDL and Rendered-text, image-to-code data (WebSight)) 등을 혼합하여 사용했다. 
