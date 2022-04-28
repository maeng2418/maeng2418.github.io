---
title: '비동기 프로그래밍'
date: 2021-5-23 09:47:12
category: 'Javascript'
draft: false
---

## 들어가기

- 자바스크립트는 싱글스레드로 동작한다. (작업을 순차적으로 처리한다.)
- database나 file에 접근하거나, 네트워크 통신이 필요한 경우 등의 작업이 필요하다면, 비동기 처리를 통해서 blocking하지 않고 효과적으로 처리할 수 있다.

## **동기(synchronous)**

```jsx
const baseData = [1, 2, 3];

baseData.forEach((v, i) => {
  console.log('sync ', v);
});

baseData.forEach((v, i) => {
  console.log('sync 2', v);
});
```

동기적인 흐름은 순서대로 실행될 뿐이다. 원활한 프로그램 흐름을 유지해야 함으로 순서가 바뀔 수 없다.

```
**출력결과:**
sync  1
sync  2
sync  3
sync 2 1
sync 2 2
sync 2 3
```

## **4. callstack & callback queue**

Javascript의 엔진과 외부의 런타임 환경들이 조합된 모습
![Javascript의 엔진과 외부의 런타임 환경들이 조합된 모습](https://cdn-images-1.medium.com/max/1600/1*FA9NGxNB6-v1oI2qGEtlRQ.png)

- **메모리힙 :** 메모리 할당을 담당하는 곳.
- **콜스택 :** 코드가 호출되면서 스택으로 쌓이는 곳.
- **Web API :** 브라우저에서 자체 지원하는 API.
  → DOM 이벤트, Ajax, setTimeout 등의 비동기 작업들을 수행하도록 API를 지원합니다.
- **콜백 큐(테스트 큐) :** Web API에서 비동기 작업들이 실행된 후 호출되는 콜백함수들이 기다리는 공간
- **이벤트루프 :** 이벤트 발생 시 호출되는 콜백 함수들을 관리하여 테스크 큐에 전달하고, 테스크 큐에 담겨 있는 콜백 함수들을 콜스택에 넘겨줍니다.
  → 테스크 큐에서 콜스택으로 콜백함수를 넘겨주는 작업은 콜스택에 쌓여있는 함수가 없을 때만 가능

## **call stack**

```jsx
const foo = () => {
  bar();
  console.log('foo');
};
const bar = () => {
  console.log('bar');
};
foo();
console.log('foo and bar');
```

**콜스택 순서**

```
1. foo 함수 실행
2. foo 함수 내부에서 bar 함수 실행
3. console.log(‘bar’) 실행 후 콜스택에서 제거
4. bar 함수 모두 실행되었으니 제거
5. foo 함수로 돌아와서 console.log(‘foo’) 실행 후 콜스택에서 제거
6. foo 함수 모두 실행되었으니 제거
7. console.log(‘foo and bar’)가 콜스택에 추가, 실행 후 제거
```

## 예시1)

```jsx
function plus() {
  let a = 1;
  setTimeout(() => console.log(++a), 1000);
  return a;
}

const result = plus();
console.log('result :', result);
```

```
**출력결과:**
result : 1
2
```

## 예시2)

```jsx
const baseData = [1, 2, 3, 4, 5, 6, 100];

const asyncRun = (arr, fn) => {
  for (var i = 0; i < arr.length; i++) {
    setTimeout(() => fn(i), 1000);
  }
};

asyncRun(baseData, (idx) => console.log(idx));
```

자바스크립트의 `var` 키워드로 선언된 변수는 블록이 아닌 함수 스코프를 지닌다. 따라서 for문에서 `var i = 0` 으로 선언된 `i`는 전역변수로 선언되고, `setTimeout()` 내부에서 사용되는 `i` 역시 전역변수를 참조한다.

```
**출력결과:**
7
7
7
7
7
7
7
```

콜백 함수들이 콜백 큐에 쌓이고 콜 스택에서 i가 실행이 끝나고 콜 스택이 비어질 때까지 기다렸다가 이벤트 루프가 콜백 큐에서 콜 스택으로 보내고 실행이 되면서 출력 결과가 다음과 같이 나타난다.

## 예시3)

```jsx
const baseData = [1, 2, 3, 4, 5, 6, 100];

const asyncRun = (arr, fn) => {
  arr.forEach((v, i) => {
    setTimeout(() => fn(i), 1000);
  });
};
asyncRun(baseData, (idx) => console.log(idx));
```

예시 2와 다른 점은 i의 값을 즉시 실행 함수로 전달한다.

```
**출력결과:**
0
1
2
3
4
5
6
```

## 예시4)

```jsx
const baseData = [1, 2, 3, 4, 5, 6, 100];

function sync() {
  baseData.forEach((v, i) => {
    console.log('sync ', i);
  });
}

const asyncRun = (arr, fn) => {
  arr.forEach((v, i) => {
    setTimeout(() => fn(i), 1000);
  });
};

function sync2() {
  baseData.forEach((v, i) => {
    console.log('sync 2 ', i);
  });
}

asyncRun(baseData, (idx) => console.log(idx));
sync();
sync2();
```

```
**출력결과:**
sync 0
sync 1
sync 2
sync 3
sync 4
sync 5
sync 6
sync2 0
sync2 1
sync2 2
sync2 3
sync2 4
sync2 5
sync2 6
0
1
2
3
4
5
6
```

## 예시5)

```jsx
const baseData = [1, 2, 3, 4, 5, 6, 100];

const asyncRun = (arr, fn) => {
  arr.forEach((v, i) => {
    setTimeout(() => {
      setTimeout(() => {
        console.log('cb 2');
        fn(i);
      }, 1000);
      console.log('cb 1');
    }, 1000);
  });
};

asyncRun(baseData, (idx) => console.log(idx));
```

```
cb 1
cb 1
cb 1
cb 1
cb 1
cb 1
cb 1
cb 2
0
cb 2
1
cb 2
2
cb 2
3
cb 2
4
cb 2
5
cb 2
6
```

## 이벤트 중심 개발

자바스크립트는 이벤트 중심으로 많이 개발한다.

```jsx
//브라우저 이벤트 등록
document.body.addEventListener('click', () => console.log('body clicked'));

//node.js 에서 Event Emitter를 활용한 이벤트 등록
myEmitter.on('event', () => console.log('A'));
```

## 콜백

자바스크립트 비동기 처리 방식에 의해 야기될 수 있는 문제들을 해결

```jsx
function getData(callbackFunc) {
  $.get('https://domain.com/products/1', function (response) {
    callbackFunc(response); // 서버에서 받은 데이터 response를 callbackFunc() 함수에 넘겨줌
  });
}

getData(function (tableData) {
  console.log(tableData); // $.get()의 response 값이 tableData에 전달됨
});
```

일종의 식당 자리 예약과 같습니다. 일반적으로 맛집을 가면 사람이 많아 자리가 없습니다. 그래서 대기자 명단에 이름을 쓴 다음에 자리가 날 때까지 주변 식당을 돌아다니죠. 만약 식당에서 자리가 생기면 전화로 자리가 났다고 연락이 옵니다. 그 전화를 받는 시점이 여기서의 콜백 함수가 호출되는 시점과 같습니다. 손님 입장에서는 자리가 날 때까지 식당에서 기다리지 않고 근처 가게에서 잠깐 쇼핑을 할 수도 있고 아니면 다른 식당 자리를 알아볼 수도 있습니다. ⇒ 전화번호를 줌!

[자바스크립트 비동기 처리와 콜백 함수](https://joshua1988.github.io/web-development/javascript/javascript-asynchronous-operation/#%EC%BD%9C%EB%B0%B1-%ED%95%A8%EC%88%98%EB%A1%9C-%EB%B9%84%EB%8F%99%EA%B8%B0-%EC%B2%98%EB%A6%AC-%EB%B0%A9%EC%8B%9D%EC%9D%98-%EB%AC%B8%EC%A0%9C%EC%A0%90-%ED%95%B4%EA%B2%B0%ED%95%98%EA%B8%B0)

## 콜백 지옥 (Callback hell)

콜백 지옥은 비동기 처리 로직을 위해 콜백 함수를 연속해서 사용할 때 발생하는 문제입니다. 아마 아래와 같은 코드를 본 적이 있을 겁니다.

```jsx
$.get('url', function (response) {
  parseValue(response, function (id) {
    auth(id, function (result) {
      display(result, function (text) {
        console.log(text);
      });
    });
  });
});
```

웹 서비스를 개발하다 보면 서버에서 데이터를 받아와 화면에 표시하기까지 인코딩, 사용자 인증 등을 처리해야 하는 경우가 있습니다. 만약 이 모든 과정을 비동기로 처리해야 한다고 하면 위와 같이 콜백 안에 콜백을 계속 무는 형식으로 코딩을 하게 됩니다. 이러한 코드 구조는 가독성도 떨어지고 로직을 변경하기도 어렵습니다. 이와 같은 코드 구조를 콜백 지옥이라고 합니다.

**해결법**

- 중첩해서 선언했던 콜백 익명함수를 각각의 함수로 구분
- Promise
- Async와 Await

## Promise

콜백을 개선

```jsx
function runAsync(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('서버에서 온 사람입니다');
    }, time);
  });
}

function runAsync2(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('3명입니다');
    }, time);
  });
}

const cb1 = (result) => {
  console.log('누구세요? :', result);
  return runAsync2(3000);
};

const cb2 = (result2) => {
  console.log('몇명이에요? :', result2);
};

function main() {
  const asyncObj = runAsync(1000);
  asyncObj.then(cb1).then(cb2);
  console.log('함수는 종료');
}

main();
```

**실행순서** : main() → runAsync ⇒ cb1 → runAsync2 ⇒ cb2

```
함수는 종료
누구세요? : 서버에서 온 사람입니다
몇명이에요? : 3명입니다
```

```jsx
function getData(callback) {
  // new Promise() 추가
  return new Promise(function (resolve, reject) {
    $.get('url 주소/products/1', function (response) {
      // 데이터를 받으면 resolve() 호출
      resolve(response);
    });
  });
}

// getData()의 실행이 끝나면 호출되는 then()
getData().then(function (tableData) {
  // resolve()의 결과 값이 여기로 전달됨
  console.log(tableData); // $.get()의 reponse 값이 tableData에 전달됨
});
```

**프로미스의 3가지 상태(states)**

프로미스를 사용할 때 알아야 하는 가장 기본적인 개념이 바로 프로미스의 상태(states)입니다. 여기서 말하는 상태란 프로미스의 처리 과정을 의미합니다. `new Promise()`로 프로미스를 생성하고 종료될 때까지 3가지 상태를 갖습니다.

- Pending(대기) : 비동기 처리 로직이 아직 완료되지 않은 상태
- Fulfilled(이행) : 비동기 처리가 완료되어 프로미스가 결과 값을 반환해준 상태
- Rejected(실패) : 비동기 처리가 실패하거나 오류가 발생한 상태

**Pending(대기)**

먼저 아래와 같이 `new Promise()` 메서드를 호출하면 대기(Pending) 상태가 됩니다.

```
new Promise();
Js
Copy

```

`new Promise()` 메서드를 호출할 때 콜백 함수를 선언할 수 있고, 콜백 함수의 인자는 `resolve`, `reject`입니다.

```jsx
new Promise(function(resolve, reject) {
// ...});

```

**Fulfilled(이행)**

여기서 콜백 함수의 인자 `resolve`를 아래와 같이 실행하면 이행(Fulfilled) 상태가 됩니다.

```jsx
new Promise(function (resolve, reject) {
  resolve();
});
```

그리고 이행 상태가 되면 아래와 같이 `then()`을 이용하여 처리 결과 값을 받을 수 있습니다.

```jsx
function getData() {
  return new Promise(function (resolve, reject) {
    var data = 100;
    resolve(data);
  });
}

// resolve()의 결과 값 data를 resolvedData로 받음getData().then(function(resolvedData) {
console.log(resolvedData); // 100});
```

※ 프로미스의 '이행' 상태를 좀 다르게 표현해보면 '완료' 입니다.

**Rejected(실패)**

`new Promise()`로 프로미스 객체를 생성하면 콜백 함수 인자로 `resolve`와 `reject`를 사용할 수 있다고 했습니다. 여기서 `reject`를 아래와 같이 호출하면 실패(Rejected) 상태가 됩니다.

```jsx
new Promise(function (resolve, reject) {
  reject();
});
```

그리고, 실패 상태가 되면 실패한 이유(실패 처리의 결과 값)를 `catch()`로 받을 수 있습니다.

```jsx
function getData() {
  return new Promise(function (resolve, reject) {
    reject(new Error('Request is failed'));
  });
}

// reject()의 결과 값 Error를 err에 받음getData().then().catch(function(err) {
console.log(err); // Error: Request is failed});
```

**예제)**

```jsx
function getData() {
  return new Promise(function (resolve, reject) {
    $.get('url 주소/products/1', function (response) {
      if (response) {
        resolve(response);
      }
      reject(new Error('Request is failed'));
    });
  });
}

// 위 $.get() 호출 결과에 따라 'response' 또는 'Error' 출력
getData()
  .then(function (data) {
    console.log(data); // response 값 출력
  })
  .catch(function (err) {
    console.error(err); // Error 출력
  });
```

**여러개의 Promise 연결하기**

```jsx
new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve(1);
  }, 2000);
})
  .then(function (result) {
    console.log(result); // 1
    return result + 10;
  })
  .then(function (result) {
    console.log(result); // 11
    return result + 20;
  })
  .then(function (result) {
    console.log(result); // 31
  });
```

[자바스크립트 Promise 쉽게 이해하기](https://joshua1988.github.io/web-development/javascript/promise-for-beginners/)

## Async & Await

async와 await는 자바스크립트의 비동기 처리 패턴 중 가장 최근에 나온 문법입니다. 기존의 비동기 처리 방식인 콜백 함수와 프로미스의 단점을 보완하고 개발자가 읽기 좋은 코드를 작성할 수 있게 도와주죠.

```jsx
async function main() {
  const str1 = await runAsync(1000);
  cb1(str1);

  const str2 = await runAsync2(1000);
  cb2(str2);
  console.log('함수는 종료');
}
```

async 함수도 promise객체를 반환한다.따라서 then 메서드를 사용하거나, 또 다른 async함수를 사용해야 한다.

**작동 X → 비동기**

```jsx
function logName() {
  var user = fetchUser('domain.com/users/1');
  if (user.id === 1) {
    console.log(user.name);
  }
}
```

**콜백 혹은 Promise를 이용해 개선**

```jsx
function logName() {
  // 아래의 user 변수는 위의 코드와 비교하기 위해 일부러 남겨놓았습니다.
  var user = fetchUser('domain.com/users/1', function (user) {
    if (user.id === 1) {
      console.log(user.name);
    }
  });
}
```

**async & await을 이용해 개선**

```jsx
// async & await 적용 후
async function logName() {
  var user = await fetchUser('domain.com/users/1');
  if (user.id === 1) {
    console.log(user.name);
  }
}
```

[자바스크립트 async와 await](https://joshua1988.github.io/web-development/javascript/js-async-await/)<br/><br/>

**참고자료**

[Javascript 동작원리 (Single thread, Event loop, Asynchronous)](https://medium.com/@vdongbin/javascript-%EC%9E%91%EB%8F%99%EC%9B%90%EB%A6%AC-single-thread-event-loop-asynchronous-e47e07b24d1c)

[What the heck is the event loop anyway? | Philip Roberts | JSConf EU](https://www.youtube.com/watch?v=8aGhZQkoFbQ&feature=youtu.be)

[[JS] setTimeout 문제 - Steemit](https://steemit.com/js/@huna/js-settimeout)
