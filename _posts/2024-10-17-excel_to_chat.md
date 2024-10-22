---
title: "Excel to Chat 작성 중"
category: Dev Log
tag: Development
---







* 목차
{:toc}











# Git Repository

[https://github.com/finddme/Excel_to_Chat](https://github.com/finddme/Excel_to_Chat)

# 개발 목적

- LLM을 사용하여 text-to-sql task 수행해 보기
- 적절한 prompting으로 복잡한 join문 생성하기
- python으로 RDB접근하여 data 다뤄보기
   
# 개발물 요약

- 두 가지 버전 개발
  - custom data(xslx, csv) 입력하는 version
  - 사전에 저장된 DB에 qeury하는 vertion
- 일반적인 자연어 qeury를 입력 받아 DB query가 가능한 sql문 생성
- 생성된 sql문으로 검색된 data를 prompt와 함께 LLM에 입력하여 답변 생성

# Process

<center><img width="500" src="https://github.com/user-attachments/assets/0edcbc70-682a-4c05-9a7a-c81f63bc6c8d"></center>
<center><em style="color:gray;">Illustrated by the author</em></center><br>

1. `--- File Processing ---` : xslx/csv 파일을 입력 받아 처리 (다중 파일/폴더 입력 가능)

2. `--- File already exists ---`, `./assets/mock.csv` : 전에 처리 했던 데이터인지 확인
   
   처음 처리하는 데이터면 `--- File saved ---`
  
3. `--- MySQL Database connection successful ---` : db 접속
   
4. `--- mock already exists ---` : 입력된 파일명으로 저장된 db table이 있는지 확인
   
5. `--- Table 'mock' has been successfully deleted. ---` : table 중복 등 오류 방지를 위해 이미 있는 데이터의 경우 그에 해당하는 table 삭제 후 입력된 데이터로 다시 저장
    
6. `--- Imported {file_name} to table {table_name} ---` : table 저장 (table_name은 확장자 제거한 파일명)
    
7. `--- MySQL connection is closed after fetching schema for mock ---` : 저장한 table 접속
    
8. `--- together model execute ---` : sql문 생성, 생성된 sql문으로 query해서 data 받아옴
    
9. `--- MySQL connection is closed ---` : db 접속 닫고

10. `--- together model execute ---` : user query, sql 결과 입력하여 답변 생성

# Demo





