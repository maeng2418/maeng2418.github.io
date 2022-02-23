---
title: 'Node.js 디버깅'
date: 2021-5-23 09:47:12
category: 'Node.js'
draft: false
---

## **VSCODE-NodeJS 디버깅**

1. **vscode의 디버깅 탭에서 create a launch.json file을 클릭한다.**

   .vscode 폴더에 launch.json 파일이 생성된다.<br/><br/>

   ![](./images/debugging/1.png)<br/><br/>

2. **break 포인트를 건다.**

   ![](./images/debugging/2.png)<br/><br/>

3. **디버깅 시작**

   F5 버튼을 누르면 디버깅을 시작한다.<br/><br/>

4. **VARIABLES와 WATCH, CALL STACK을 확인할 수 있다.**

   ![](./images/debugging/3.png)

   → **watch**를 이용해서 디버깅을 진행하면서 breakpoint로 디버깅이 멈춘 라인의 상태에서 내가 원하는 변수의 값이나 상태 등을 확인 할 수 있다.

## **Chrome-NodeJS 디버깅**

1. **크롬을 열고 F12를 눌러 개발자 도구를 엽니다.**

   ![https://github.com/woowa-techcamp-2020/maeng2418-brightchul-0407chan-learn-node/raw/master/NodeStudy/img/%ED%98%84%EC%9E%AC%ED%8E%98%EC%9D%B4%EC%A7%80_%EA%B5%AC%EC%84%B1%ED%8C%8C%EC%9D%BC.png](https://github.com/woowa-techcamp-2020/maeng2418-brightchul-0407chan-learn-node/raw/master/NodeStudy/img/%ED%98%84%EC%9E%AC%ED%8E%98%EC%9D%B4%EC%A7%80_%EA%B5%AC%EC%84%B1%ED%8C%8C%EC%9D%BC.png)<br/><br/>

2. **Sources 탭을 클릭합니다.**

   ![https://github.com/woowa-techcamp-2020/maeng2418-brightchul-0407chan-learn-node/raw/master/NodeStudy/img/%ED%81%AC%EB%A1%AC_%EA%B0%9C%EB%B0%9C%EC%9E%90%EB%8F%84%EA%B5%AC.png](https://github.com/woowa-techcamp-2020/maeng2418-brightchul-0407chan-learn-node/raw/master/NodeStudy/img/%ED%81%AC%EB%A1%AC_%EA%B0%9C%EB%B0%9C%EC%9E%90%EB%8F%84%EA%B5%AC.png)<br/><br/>

3. 여**기서 디버깅 하고싶은 js파일을 선택해 디버깅을 진행 할 수 있습니다.**

   ![](./images/debugging/4.png)
