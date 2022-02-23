---
title: 'MySQL'
date: 2021-5-23 21:09:47
category: 'Development'
draft: false
---

## MySQL

- MySQL은 오픈소스 RDMBS 중 가장 점유율이 높다.
- Linux OS와 그 위에서 돌아가는 MysQL을 설치하고 관리할 수 있는 능력은 백엔드 개발자의 기본 소양이라고 할 수 있다.

## Install - MacOS

`$ brew update`

`$ brew install mysql` ← MySQL 최신버젼 설치

`$ brew list` ← brew로 설치한 목록 확인

`$ mysql.server start` ← MySQL 서버 실행

`$ mysql.server stop` ←MySQL 서버 종료

`$ mysql_secure_installation` ← MySQL 설정<br/><br/>

**비밀번호 가이드 설정에 대한 질문입니다.**

```
**"Would you like to setup VALIDATE PASSWORD component?
 Press y|Y for Yes, any other key for No"**
```

**Yes - 복잡한 비밀번호 설정 (조합형 비밀번호를 설정하여야 합니다.)**

**No - 쉬운 비밀번호 설정 (ex. "1234"처럼 쉬운 비밀번호를 설정할 수 있습니다.)**
<br/><br/>

**사용자 설정을 묻는 질문입니다.**

```
**"Remove anonymous users? (Press y|Y for Yes. any other key for No)"**
```

**Yes - 접속하는 경우 "mysql -uroot"처럼 -u 옵션 필요**

**No - 접속하는 경우 "mysql"처럼 -u 옵션 불필요**
<br/><br/>

**다른 IP에서 root 아이디로 원격접속을 설정하는 질문입니다.**

```
**"Disallow root login remotely? (Press y|Y for Yes, any other key for No)"**
```

**Yes - 원격접속 불가능**

**No - 원격접속 가능**
<br/><br/>

**Test 데이터베이스를 설정하는 질문입니다.**

```
**"Remove test database and access to it? (Press y|Y for Yes, any other key for No)"**
```

**Yes - Test 데이터베이스 제거**

**No - Test 데이터베이스 유지**
<br/><br/>

**변경된 권한을 테이블에 적용하는 설정에 대한 질문입니다.**

```
**"Reload privilege tables now? (Press y|Y for Yes, any other key for No)"**
```

**Yes - 적용시킨다.**

**No - 적용시키지 않는다.**
<br/><br/>

`$ mysql -uroot -p` ← 로그인<br/><br/>

[macOS MySQL 설치 및 설정 사용법](https://whitepaek.tistory.com/16)

[SequelPro 로컬호스트 접속 에러 처리](https://github.com/sequelpro/sequelpro/issues/2908)
