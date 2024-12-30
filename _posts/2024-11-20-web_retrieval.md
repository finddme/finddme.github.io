---
title: "Web Auto crawling + Retrieval 🌐♾️"
category: Dev Log
tag: Development
---







* 목차
{:toc}












# Git Repository

[https://github.com/finddme/AutoCrawl_Retrieval](https://github.com/finddme/AutoCrawl_Retrieval)

[https://github.com/finddme/func_react_stream_light](https://github.com/finddme/func_react_stream_light)

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

+ ~~blog search box를 serverless 형식으로 바꾸는 작업에도 적용 예정 [func_react_stream_light](https://github.com/finddme/func_react_stream_light)~~ **개발 완료**
+ ~~blog search box를 serverless 형식으로 바꾸는 이유: 컴퓨터를 항상 켜 두는 것이 부담스럽다. gcp, aws는 돈이 많이 나간다.............~~

# Auto Crawling

<center><img width="600" src="https://github.com/user-attachments/assets/bb9eb0ed-035f-407e-9dc4-3e9f0d5a4e27"></center>
<center><em style="color:gray;">https://mermaid.live/</em></center><br>

## 입력, 출력, 병렬처리
```python
async def crawl(main_url, max_pages=None,crawling_verbose=False):
    # 메인 URL 입력 받기
    to_crawl = set()
    to_crawl.add(main_url)
    
    results = []
    total_downloaded = []
    visited_urls = set()
    
    while to_crawl and (max_pages is None or len(visited_urls) < max_pages):
        async with AsyncWebCrawler(verbose=crawling_verbose) as crawler: 
            async with aiohttp.ClientSession() as session:
                current_batch = list(to_crawl)[:min(5, len(to_crawl))]  # 처리할 URL들 batch로 묶음
                domain = urlparse(current_batch[0]).netloc
                print(f"Crawling batch of {len(current_batch)} URLs from domain: {domain}")

                tasks = [process_url(url, crawler, domain,visited_urls,session) for url in current_batch] # crawling task 리스트 생성
                
                batch_results = await asyncio.gather(*tasks) # 태스크 병렬 실행 

                all_new_links = set()
                for url, (page_info, downloaded_file, new_link) in zip(current_batch, batch_results):
                    if page_info:
                        results.append(page_info)
                        total_downloaded.extend(downloaded_file)
                        all_new_links.update(new_link)
                    visited_urls.add(url) # 처리된 URL은 visited_urls에 추가하고 to_crawl에서 제거
                    to_crawl.remove(url)
                
                to_crawl.update(all_new_links - visited_urls) # 새로 발견한 링크 중에서 아직 방문 안 한 url을 크롤링 대상에 추가
                
                await asyncio.sleep(1)  
    
    return results
```

## crawling task 수행

```python
async def process_url(url, crawler, domain,visited_urls,session):
    download_dir=f"./sample_result/j_{domain}_site_crawling"
    for dir_type in ['images', 'documents', 'videos']:
        os.makedirs(os.path.join(download_dir, dir_type), exist_ok=True)
    try:
        result = await crawler.arun(url=url) # URL Crawling

        # Crawling 내용 저장
        page_info = {
            'url': url,
            'content': result.markdown,
            'title': result.title if hasattr(result, 'title') else 'No Title',
            'crawled_at': datetime.now().isoformat()
        }

        ############# file extraction 부분 #############
        file_links = set()
        patterns = [
            r'\[([^\]]*)\]\(([^)]+)\)',  
            r'href=["\'](.*?)["\']',      
            r'src=["\'](.*?)["\']'        
        ]

        for pattern in patterns:
            matches = re.findall(pattern, result.markdown)
            for match in matches:
                file_url = match[1] if isinstance(match, tuple) else match
                absolute_url_file = urljoin(url, file_url)
                if get_file_type(absolute_url_file):
                    file_links.add(absolute_url_file)

        download_tasks = [download_file(file_url, session, download_dir) for file_url in file_links] # PDF/Image/Video ... 자료 다운로드
        downloaded_files = await asyncio.gather(*download_tasks)
        downloaded_files = [f for f in downloaded_files if f]
        
        page_info['downloaded_files'] = downloaded_files
            
        ############# link extract 부분 (Crawling 내용에서 URL 추출)#############
        urls = re.findall(r'\[([^\]]*)\]\(([^)]+)\)', result.markdown)
        new_links = set()
        
        for _, found_url in urls:
            absolute_url = urljoin(url, found_url)
            # URL 검증
            if should_crawl(absolute_url, domain,visited_urls):
                new_links.add(absolute_url)
                
        return page_info, downloaded_files, new_links
    except Exception as e:
        print(f"Error crawling {url}: {str(e)}")
        return None, None, set()

```
