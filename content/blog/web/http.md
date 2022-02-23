---
title: 'HTTP'
date: 2021-5-23 09:47:12
category: 'Web'
draft: false
---

## **Web**

- WWW = World Wide Web
- 인터넷에 연결된 사용자들이 서로의 정보를 공유할 수 있는 공간
- 웹과 인터넷은 다름!
- 웹의 3요소: HTTP, HTML, URL

## **HTTP = HyperText Transfer Protocol**

WWW 상에서 정보를 주고받을 수 있는 프로토콜. 주로 HTML 문서를 주고받는 데에 쓰인다. TCP와 UDP를 사용하며, 80번 포트를 사용한다.<br/><br/>
![http://public.codesquad.kr/honux/images/w301.png](http://public.codesquad.kr/honux/images/w301.png)

![http://public.codesquad.kr/honux/images/w3-1.GIF](http://public.codesquad.kr/honux/images/w3-1.GIF)

**클라이언트** : 주로 웹 브라우저로 항상 요청만 한다.

**서버** : 클라이언트의 요청에 대해 적당한 문서를 제공해 준다.

**프록시** : 클라이언트와 서버 사이에 존재. 무언가 일을 해 준다.

       → 캐싱, 필터링, 로드 밸런싱, 인증, 로깅 등의 다양한 기능을 수행

## **HTTP 동작방식**

![http://public.codesquad.kr/honux/images/w302.png](http://public.codesquad.kr/honux/images/w302.png)

- 실제로는 DNS 서버가 개입한다.

## HTTP 특징

### connectionless

- 클라이언트가 요청을 한 후 응답을 받으면 그 연결을 끊어 버리는 특징
- HTTP는 먼저 클라이언트가 request를 서버에 보내면, 서버는 클라이언트에게 요청에 맞는 response를 보내고 접속을 끊는 특성이 있다.
- 헤더에 keep-alive라는 값을 줘서 커넥션을 재활용하는데 HTTP1.1에서는 이것이 디폴트다.
- HTTP가 tcp위에서 구현되었기 때문에 (tcp는 연결지향,udp는 비연결지향) 네트워크 관점에서 keep-alive는 옵션으로 connectionless의 연결비용을 줄이는 것을 장점으로 비연결지향이라 한다.

### stateless

- 통신이 끝나면 상태를 유지하지 않는 특징
- 연결을 끊는 순간 클라이언트와 서버의 통신이 끝나며 상태 정보는 유지하지 않는 특성이 있다.
- 쿠키와 세션은 위의 두 가지 특징을 해결하기 위해 사용한다.
- 예를 들어, 쿠키와 세션을 사용하지 않으면 쇼핑몰에서 옷을 구매하려고 로그인을 했음에도, 페이지를 이동할 때 마다 계속 로그인을 해야 한다.
- 쿠키와 세션을 사용했을 경우, 한 번 로그인을 하면 어떠한 방식에 의해서 그 사용자에 대한 인증을 유지하게 된다.

## **브라우저의 렌더링 과정**

1. 최초에는 HTML 을 가져옴
2. HTML에서 CSS, js, 이미지에 대한 링크 정보를 추출
3. 추출한 정보의 URL을 이용 새로운 요청을 보냄
4. 모든 웹 자원을 받아와서 렌더링 시작

## **URL: Uniform Resource Locator**

**(URI = URL + URN) :** 리소스를 식별하는 주소

![./images/http/1.png](./images/http/1.png)

- **URI (Uniform Resource Identifier) :** 네트워크 상에 존재하는 자원을 구분하는 로서 의미가 강합니다.
  **식별자(ID)**
- **URL (Uniform Resource Locator) :** 네트워크 상에 존재하는 자원의 **위치**를 말합니다. 즉 자원의 어디에 있는지 나타내는 Where의 개념입니다.
- **URN (Uniform Resource Name) :** 자원

### **URL, URN, URI 예시**

- telnet://192.168.0.10:8080/ : 해당 위치로 접근하는 방법인 telnet://을 포함하므로 URL(혹은 URI)로 볼 수 있습니다.
- http://nsinc.tistory.com/ : http:// 때문에 URL 혹은 URI라고 볼 수 있습니다.
- mailto:myname@me.com : mailto 덕분에 URL (URI)으로 볼 수 있습니다.
- urn:isbn:0451450523 : URN으로 1926년에 출간된 the Last Unicorn의 도서식별번호를 가리킵니다.
- urn:oid:2.16.840 : URN으로 미국을 의미하는 OID입니다.

<br/>

> Scheme \*\*\*\*: 사용자이름:비번@호스트:포트/경로;패러미터?쿼리#프래그먼트

```
https://honux77:pw1234@github.com:443/
honux77/MMT?file=sum.py#30
```

- **쿼리**: 편의상 =과 &를 사용한다.
- 프래그먼트: 클라이언트만 사용

## HTTP Status

[HTTP 상태 코드](https://developer.mozilla.org/ko/docs/Web/HTTP/Status)<br/><br/>

**참고자료**

[URL vs URI vs URN](https://nsinc.tistory.com/192)
