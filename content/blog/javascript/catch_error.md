---
title: 'try-catch와 .catch'
date: 2021-8-15 11:46:12
category: 'Javascript'
draft: false
---

## 개요

회사 코드를 살펴보던 중 Redux 부분을 살펴보는데 saga를 통해 API를 호출하고 데이터를 받아오는 과정에서 API요청을 `.then.catch` 을 사용해서 받아오고 API를 랩핑하는 함수는 `try-catch` 을 사용하고 있었다. 그러다 이 둘로 구분한 이유와 `try-catch`문의 중첩에 관해서 궁금증이 생겼다.

먼저 다음 코드는 redux-saga에서 사용된 `.then.catch` 와 `try-catch` 의 혼합버젼(?)이다.

```jsx
const funcAPI = (payload) => {
	return API.defaultAPI
    .get("/...", {
      params: {
        ...
      },
    })
    .then((res) => res.data.data)
    .catch((err) => {
      if (err.response.status !== 200) {
        return {
          error: {
            code: err.response.status,
            description: err.response.statusText,
          },
        };
      }
      throw err;
    });

function* funcProcess(action) {
  try {
		const result = yield call(funcAPI, actions.payload);
    if (result.error) {
      if (action.payload.onError) {
        yield call(
          action.payload.onError,
          result.error.status.code
        );
      }
    } else {
      if (action.payload.onSuccess) {
        yield call(action.payload.onSuccess, result);
      }
    }
  } catch (err) {
    console.log("from saga", err);
  }
}
```

여기서 생기는 궁금증은 funcProcess에서 과연 result에서 error를 받았는데 왜 catch로 안떨어지고 저렇게 try문 안에 따로 result.error를 만든 이유가 무엇일까? 어떻게 동작하는거지? 에 대한 의문점이 들었고 한번 파악해 보도록 했다.

## 동작원리

먼저 동작원리를 파악하기 위해 다음과 같은 심플한 코드를 작성해보았다.<br/><br/>

**데이터를 성공적으로 받아오는 경우**

```jsx
const promiseA = () =>
  new Promise((resolve, reject) => {
    resolve('Success');
    /* reject(new Error("Error1")) */
  });

const funcA = () =>
  promiseA()
    .then((data) => data)
    .catch((err) => {
      throw err;
    });

const resultA = async () => {
  try {
    const data = await funcA();
    console.log(`success: ${data}`);
  } catch (err) {
    console.log(`fail: ${err}`);
  }
};

resultA();
```

1. resultA 함수를 호출하면 funcA함수를 호출하게 되고 funcA함수는 promiseA를 호출하게 된다.
2. promiseA에서 성공 값을 넘겨주는 resolve를 실행시키면 resolve안의 "Success"라는 데이터를 넘겨준다.
3. 따라서 funcA에서는 promiseA에서 에러 없이 값을 전달받아 then 구문이 실행되고 funcA는 "Success"라는 데이터를 리턴해준다.
4. 최종적으로 resultA는 "Success" 메시지를 받아 "success: Success" 라는 메시지가 콘솔에 찍히게 된다.
   <br/><br/>

**데이터를 성공적으로 받아오지 못한 경우**

```jsx
const promiseA = () =>
  new Promise((resolve, reject) => {
    reject(new Error('Error1'));
  });

const funcA = () =>
  promiseA()
    .then((data) => data)
    .catch((err) => {
      throw err;
    });

const resultA = async () => {
  try {
    const data = await funcA();
    console.log(`success: ${data}`);
  } catch (err) {
    console.log(`fail: ${err}`);
  }
};

resultA();
```

1. resultA 함수를 호출하면 funcA함수를 호출하게 되고 funcA함수는 promiseA를 호출하게 된다.
2. promiseA에서 실패하여 reject를 실행시키면 resolve안의 "Error1"이라는 데이터를 넘겨준다.
3. 따라서 funcA에서는 promiseA에서 에러 값 ("Error1")을 전달받아 catch 구문이 실행되고 funcA는 "Error1" 에러를 던진다.
4. 최종적으로 resultA는 "Erro1" 에러를 받아 catch 문을 타고 "fail: Error: Error1" 메시지가 콘솔에 찍히게 된다.

## 궁금점1

> 💡 데이터를 성공적으로 받아오지 못한 경우, 중간 catch문에서 리턴문 실행을 실행하면 어떻게 될까?

```jsx
const promiseA = () =>
  new Promise((resolve, reject) => {
    reject(new Error('Error1'));
  });

const funcA = () =>
  promiseA()
    .then((data) => data)
    .catch((err) => {
      if (true) {
        return `Error2`;
      }
      throw err;
    });

const resultA = async () => {
  try {
    const data = await funcA();
    console.log(`success: ${data}`);
  } catch (err) {
    console.log(`fail: ${err}`);
  }
};

resultA();
```

1. resultA 함수를 호출하면 funcA함수를 호출하게 되고 funcA함수는 promiseA를 호출하게 된다.
2. promiseA에서 실패하여 reject를 실행시키면 resolve안의 "Error1"이라는 데이터를 넘겨준다.
3. 따라서 funcA에서는 promiseA에서 에러 값 ("Error1")을 전달받아 catch 구문이 실행된다.
4. 하지만 funcA catch문에서 'Error2' 값을 리턴해준다.
5. 최종적으로 resultA는 에러를 받지 않고 "Erro2" 라는 메시지 데이터를 받아 catch 문을 타지않고 "successl: Error2" 메시지가 콘솔에 찍히게 된다.

> 👉 **결론**: 아! resultA에서 try-catch를 하는데 funcA를 분리하여 .then.catch를 사용한 이유는 아마도(?) API 호출 에러 발생 시 중간에 미들웨어 개념(?)처럼 혹은 에러에 대한 분기 처리를 위해 사용했던 것 같다.

## 궁금증2

> 💡 근데 왜 하나는 try-catch이고 하는 .then.catch를 사용했지?? 하나로 통일하면 안되나?

```jsx
const promiseA = () =>
  new Promise((resolve, reject) => {
    reject(new Error('Error1'));
  });

const funcA = async () => {
  try {
    const data = await promiseA();
    return data;
  } catch (err) {
    if (true) {
      return `Error2`;
    }
    throw err;
  }
};

const resultA = async () => {
  try {
    const data = await funcA();
    console.log(`success: ${data}`);
  } catch (err) {
    console.log(`fail: ${err}`);
  }
};

resultA();
```

위와 같이 funcA를 try-catch문으로 수정했을때, 아마 자바스크립트에서는 문제가 없을 것이다. 하지만 타입스크립트의 경우, funcA에서 catch문의 err 타입을 지정해주려고 했을때,

`Catch clause variable type annotation must be 'any' or 'unknown' if specified.`

다음과 같은 에러가 떴다.

> 👉 **결론**: 아마 전임자는 에러의 타입을 지정해줄때 .then.catch문의 경우 에러의 타입을 지정해도 에러가 뜨지 않기때문에 저런식으로 코드를 작성했을꺼 같다는 생각이 들었다. 그렇다면 try-catch문에서 에러의 타입을 지정할 수 없을까? 라는 생각에 찾아보았고, [Type Guards](https://typescript.tv/best-practices/error-ts1196-catch-clause-variable-type-annotation/) 라는 해결책을 찾았다.

## 추가 궁금증!

> 💡 async 함수를 사용할 때, try-catch문을 중복해서 사용하는 것에 대한 궁금증도 생겼고, 다음 블로그 포스팅을 통해 해결하였다.

[async 함수와 try-catch](https://velog.io/@vraimentres/async-%ED%95%A8%EC%88%98%EC%99%80-try-catch)
