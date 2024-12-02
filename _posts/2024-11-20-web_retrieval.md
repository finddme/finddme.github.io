---
title: "Page Auto crawling + Retrieval 🌐♾️ (개발 중)"
category: Dev Log
tag: Development
---







* 목차
{:toc}












# Git Repository

[https://github.com/finddme/AutoCrawl_Retrieval](https://github.com/finddme/AutoCrawl_Retrieval)

- web auto crawling 모듈 개발 완료
- db 저장, RAG 적용 개발 전

# 개발 계획 / 개요

- input: 메인 page url
  - 탭 및 하위 페이지 자동 crawling
  - ~~text 정보 수집~~ -> text 정보 수집 + 각종 자료 다운로드(pdf, docx, hwp, image, video, excel ...)
  - DB 저장 -> 다운로드된 자료들에 대한 추가 처리 파이프라인 개발 필요
    - video: [https://github.com/finddme/Video_Retrieval](https://github.com/finddme/Video_Retrieval)의 데이터 처리 방식 적용
    - image: [https://github.com/finddme/Video_Retrieval](https://github.com/finddme/Video_Retrieval)의 영상 캡쳐 이미지 처리 방식 적용
    - pdf, docx, hwp: pymupdf4llm 라이브러리를 통해 일괄 처리
    - excel: [https://github.com/finddme/Excel_to_Chat](https://github.com/finddme/Excel_to_Chat)의 데이터 처리 방식 적용
- output: 답변 출처 url + 사용자 질문에 대한 답변(LLM 생성)

+ blog search box를 serverless 형식으로 바꾸는 작업에도 적용 예정[https://github.com/finddme/Function_calling_ReAct/blob/main/func_react_stream_serverless/README.md](https://github.com/finddme/Function_calling_ReAct/blob/main/func_react_stream_serverless/README.md)
+ blog search box를 serverless 형식으로 바꾸는 이유: 컴퓨터를 항상 켜 두는 것이 부담스럽다. gcp, aws는 돈이 많이 나간다.............
