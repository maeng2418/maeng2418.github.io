---
title: 'React 상태관리'
date: 2022-03-11 01:26:12
category: 'React'
draft: false
---

<aside>
💡 <b>등장배경</b> <br/>
초기 웹을 돌아보면, Back-end 서버로부터 웹페이지를 동적으로 렌더링해주어 Front-end에서의 상태관리는 물론 별도의 Front-end 서버도 필요하지 않았다. 하지만 점차 서버의 부하를 줄이고 사용자들에게 원할한 서비스를 제공하기 위해 페이지 렌더링과 UI 작업을 처리하기 위해 Front-end에 서버를 두기 시작해 현재의 Client-Server의 구조가 확대되었고, Front-end와 Back-end의 역할이 명확하게 구분되기 시작했다.

</aside>

## 1. 상태

상태란, 변화하는 데이터 즉, UI에 동적으로 표현되는 데이터, 사용자에 action에 따라서 변경될 수 있는 컴포넌트의 부분, 자바스크립트의 객체로, 웹페이지내에서 눈에 보이는 데이터들(ex. 메뉴, 게시글 제목, 게시글 내용)뿐만 아니라 서버와 주고 받아야하는 데이터를 말한다. 다음은 React에서 말하는 상태(state)이다.

> **Plain Javascript Object hold information influences the output of render**
> 웹 애플리케이션을 렌더(render)하는데 있어 영향을 미칠 수 있는 값

## 2. 상태관리

따라서 상태관리란, 변화하는 데이터를 설계된 UI, UX에 맞게 설계하고 구현하고 서버와 주고 받는 데이터를 관리하는 일이다. 상태관리를 통해 우리는 데이터가 변할 때마다 데이터에 관련된 DOM을 일일히 찾아서 조작하지 않아도 되며 전체 데이터의 형태와 리스트를 한 곳에서 효율적으로 관리할 수 있다.

## 3. React에서의 상태관리

어떤 값이 동적으로 변하며, 동적으로 변화된 값이 DOM에 반영되는 즉, 애플리케이션 렌더링에 영향을 주는 이러한 변하는 값을 React에서는 `useState`와 `useReducer`라는 Hook을 통해 관리할 수 있다.

참고로, 컴포넌트 외부 상수로 참조하거나 또는 `useRef`을 이용하여 참조할 수 있으며, `useRef`로 관리하는 변수는 값이 바뀐다고 해서 리렌더링이 일어나지 않는다.

## 4. 전역상태 관리

React에서 하나의 컴포넌트 내에서 상태를 관리하는 것이 아닌 하나의 상태를 여러 컴포넌트가 공유해야 하는 경우를 말한다. 보통 언어, ui 테마 등과 같이 어플리케이션의 여러 곳에서 사용되는 state를 말하며, 이외에도 서버 state를 전역 스토어에서 관리한다.

<aside>
💡 <b>잠깐? 서버 상태 관리를 왜 전역 스토어에서 관리할까?</b><br/>
- state를 필요로하는 모든 컴포넌트에서 api 호출을 하는 것은 비용 낭비이며, ux 측면에서도 좋지 못하다.
- 여러 컴포넌트에서 state를 공유해야 한다면 prop drilling, composition을 이용해 해결하기는 무리가 있다.
- 전역 스토어에서 관리하면 불필요한 api 호출을 하지 않을 수 있고 접근도 매우 편리하여 효율성이 향상다. 
- 전역 스토어에 저장된 server state를 마치 backend 상태의 cache 처럼 다룰 수 있다는 장점이 있다.

</aside>

## 5. 상태 끌어올리기(Lifting State Up)

여러 컴포넌트들이 공통으로 가지고 있는 부모 컴포넌트에 상태를 선언하는 것을 말한다. 상태를 공유하는 컴포넌트들의 부모 컴포넌트를 찾고 해당 부모 컴포넌트에서 상태를 선언 후 `props` 를 통해 전달하는 방식으로 상태를 관리할 수 있다.

```tsx
// Parent.tsx
import React from 'react';
import Child from './Child';

const Parent: React.FC = () => {
  const [state, setState] = useState<string>('');

  return (
    <div>
      <Child state={state} setState={setState} />
      <Child state={state} setState={setState} />
      ...
    </div>
  );
};
```

하지만 해당 방식은 컴포넌트 갯수가 늘어나고 공유해야 하는 상태가 많아질 경우, 상태값을 전달하고 상태값을 변경하는 함수도 같이 전달하려고 부모-자식 전달 과정을 매번 작성해야하는 과도한 `prop drilling` 가 발생한다. 이는 컴포넌트 수가 많아지고 공유하는 상태 값들이 많아진다면, 어디서 어떻게 상태값이 변하는지, 상태값 업데이트가 어떤 컴포넌트에서 어떻게 변화하였는지, 쉽게 추적하기 어렵다.

![props-drilling.gif](./images/state_management/props-drilling.gif)

## 1. Context API

React에서는 자체적으로 전역 상태 관리를 할 수 있는 `Context API`를 제공한다. `Context API`를 이용하면, 트리 단계마다 명시적으로 props를 넘겨주지 않아도 많은 컴포넌트가 이러한 값을 공유하도록 할 수 있다.

> context를 이용하면 단계마다 일일이 props를 넘겨주지 않고도 컴포넌트 트리 전체에 데이터를 제공할 수 있습니다. (16.3 버전 이후 정식)

```jsx
import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext(null);

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

const UserInfo = () => {
  const { user } = useContext(UserContext);
  if (!user) return <div>사용자 정보가 없습니다.</div>;
  return <div>{user.username}</div>;
};

const Authenticate = () => {
  const { setUser } = useContext(UserContext);
  const onClick = () => {
    setUser({ username: 'velopert' });
  };
  return <button onClick={onClick}>사용자 인증</button>;
};

const App = () => {
  return (
    <UserProvider>
      <UserInfo />
      <Authenticate />
    </UserProvider>
  );
};

export default App;
```

React에서 `Context API`가 도입됨에 따라 전역 상태 관리에 대한 불편함이 어느정도 개선이 되었으나 `Context API`는 성능적인 이슈가 존재한다. 값에 변화가 발생했을 때 `Context`를 구독하고 있는 모든 컴포넌트들의 리렌더링이 발생한다.따라서 반복적이고 복잡한 업데이트와 관련된 부분에서 비효율적이다. 예를 들어 컴포넌트에서 만약 `Context`의 특정 값을 의존하는 경우, 해당 값 말고 다른 값이 변경 될 때에도 컴포넌트에서는 리렌더링이 발생하기 때문이다. 따라서, Context 를 사용하게 될 때에는 관심사의 분리가 중요하다. 서로 관련이 없는 상태라면 같은 `Context` 가 아닌 별도의 Context를 만들어야한다. 이외에도 `Context API`는 여러 `Context`를 구독하기 위해서 여러 `Consumer` 컴포넌트를 중첩해야 하는 불편함도 존재한다.

하지만 `Redux`의 경우에는 자체적으로 리렌더링과 관련된 부분에 최적화가 적용되어 있기 때문에, 부분적으로 리렌더링이 발생한다. 이러한 성능적인 이유는 `useReducer`를 통한 변경 흐름 조절이나 메모이제이션을 활용, 또는 논리적 관점에서 `Provider`를 여러 개로 분리하고, 가능한 그 상태를 필요로 하는 곳 근처에 두는 등 자체적인 최적화가 가능하지만 이러한 과정이 다소 번거롭게 작용할 수 있다.

## 2. Redux

`Redux` 는 **store** 라는 state 저장 공간을 두어, 여러 컴포넌트가 하나의 store를 참조하는 방식으로 전역상태를 관리한다. `Redux`의 경우 자체적으로 리렌더링과 관련된 부분에 최적화가 적용되어 있기 때문에, 부분적인 리렌더링이 발생하며 `Redux`를 사용한다면 `Context API`에선 제공할 수 없는 여러 다양한 기능들을 미들웨어(thunk, saga, devTools...)를 사용해 관리할 수 있다. 또한, 모든 상태 업데이트를 액션으로 정의하고, 액션 정보에 기반하여 Reducer에서 상태를 업데이트하는 이 간단명료한 발상 덕분에, 상태를 더욱 쉽게 예측 가능하게 하여 유지보수 측면에 긍정적인 효과가 있다.

```jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore, combineReducers } from 'redux';
import { Provider, useDispatch, useSelector } from 'react-redux';

// 액션 타입
const OPEN = 'msgbox/OPEN';
const CLOSE = 'msgbox/CLOSE';

// 액션
const open = (message) => ({ type: OPEN, message });

// Initail State
const initialState = {
  open: false,
  message: '',
};

// 리듀서
const msgReducer(state = initialState, action) {
  switch (action.type) {
    case OPEN:
      return { ...state, open: true, message: action.message };
    case CLOSE:
      return { ...state, open: false };
    default:
      return state;
  }
}

// 리듀서 묶기
const rootReducer = combineReducers({
    msgReducer,
});

// 스토어 생성
const store = createStore(rootReducer);

const App = () => {
	const dispatch = useDispatch();
	const { open, message } = useSelector(state => state.msgReducer);

	useEffect(() => {
		dispatch(open("Hello World"));
	},[])

	return open ? <div>{message}</div> : null;
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

"무엇이 일어나는가"와 "어떻게 바꾸는가" `Redux`가 제안하는 요구사항은 `Redux`의 장점이자 단점이다. 무엇이 일어나는지는 `dispatch`를 이용해서 알리며 어떻게 바꿀지는 `reducer`를 이용해서 `state`를 조작한다.

`Flux` 패턴을 이용해서 단방향 흐름으로 안정적인 상태 운용이 가능하지만 원하는 상태와 기능추가를 위해서는 `dispatch`를 위한 `action`, 상태 변화를 위한`reducer`, 컴포넌트에서 `state` 를 가져다 쓰는 부분 모두 손봐야 하기 때문에 너무 장황하다. 이처럼 어플리케이션이 비대화 될수록 이런 상태 관리 사이클 관리를 위한 코드의 복잡도가 심화되어서 확장성도 떨어진다.

이러한 불편함은 Redux Toolkit이라는 라이브러리가 나오면서 많은 부분이 개선되었다. 리듀서, 액션타입, 액션 생성함수, 초기상태를 하나의 함수로 편하게 선언할 수 있게되면서, 기존의 번거롭고 복잡했던 사용방법이 훨씬 간편해졌다.

```jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { combineReducers } from 'redux';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';

// Slice
const messageSlice = createSlice({
  name: "message",
  initialState: {
		open: false,
	  message: '',
	},
  reducers: {
    open: (state, { payload }) => {
			state.open = true;
			state.message = payload;
		};
		close: (state) => {
			state.open = false;
		};
  },
});

// 리듀서 묶기
const rootReducer = combineReducers({
    msgReducer: messageSlice.reducer,
});

// 스토어 생성
const store = configureStore({
	reducer: rootReducer
});

const App = () => {
	const dispatch = useDispatch();
	const { open, message } = useSelector(state => state.msgReducer);

	useEffect(() => {
		dispatch(open("Hello World"));
	},[])

	return open ? <div>{message}</div> : null;
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

위의 코드예시에서는 설명하지 않았지만, 리액트에서 대개 server state를 관리할 경우, Redux에 `redux-thunk` 혹은 `redux-saga` 미들웨어를 붙여 관리할 것이다. 하지만 여기에도 몇 가지 문제점이 있다. 여러 컴포넌트가 동일 API를 호출하는 액션을 dispatch 한다면 중복 API 요청이 발생할 수 있고, 서버로부터 값을 가져와 redux에 저장하기 위해선 특정 시점에 액션이 dispatch되어야 하는데 액션이 dispatch 되는 시점에 캡쳐(capture)된 데이터가 저장되기 때문에 이 시점 이후에 변경된 서버의 값은 액션을 다시 dispatch 하기 전까지 반영되지 않는다. 따라서 server state가 특정 시점의 backend(서버)의 상태일 뿐이라는 것이다. server state와 상관없이 backend 상태는 얼마든지 변할 수 있기때문에 server state를 적절히 다루기 위해서는 다음과 같은 일들이 필요하다.

- **캐싱**
- **동일 데이터에 대한 중복 요청 제거**
- **오래된 데이터 업데이트**
- **데이터 변경 요청 이후 업데이트**

2020년에 `react-query`와 `swr` 라는 라이브러리가 릴리즈되었고 두 라이브러리는 server state에 대한 패칭, 내장 캐싱과 중복 제거 기능을 통한 불필요한 네트워크 요청 생략 및 업데이트뿐 아니라, 요청 상태 처리, 요청 실패시 retry, window focus시 업데이트 등 비동기 요청과 관련된 여러가지 편리한 기능을 제공한다.

## 3. SWR

`SWR`은 Next.js를 만든 Vercel팀에서 만든 것으로, 공식홈페이지의 내용을 보면 다음과 같이 쓰여있다.

> "SWR"이라는 이름은 [HTTP RFC 5861](https://tools.ietf.org/html/rfc5861) 에 의해 알려진 HTTP 캐시 무효 전략인 `stale-while-revalidate`에서 유래되었습니다. SWR은 먼저 캐시(스태일)로부터 데이터를 반환한 후, fetch 요청(재검증)을 하고, 최종적으로 최신화된 데이터를 가져오는 전략입니다.

SWR은 단 한 줄의 코드로 프로젝트 내의 데이터 가져오기 로직을 단순화할 수 있으며, 빠르고, 가볍고, 재사용 가능한 데이터를 가져오고, 내장된 캐시 및 요청 중복을 제거하며, 실시간으로 데이터를 가져올 수 있다. 또한 포커스시 재검증, 네트워크 회복시 재검증과 같이 다양한 기능을 제공한다.

```jsx
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

const Profile = () => {
  const { data, error } = useSWR('/api/user', fetcher);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return <div>hello {data.name}!</div>;
};
```

웹 앱을 구축할 때, UI의 많은 곳에서 데이터를 재사용할 필요가 있는데 SWR을 사용했을 경우 재사용 가능한 데이터 hook을 만드는 것이 매우 쉬우며, 원하는 컴포넌트에 원하는 데이터를 넣는 **선언적** 방식으로 사용할 수 있다.

다만, SWR의 한 가지 아쉬운 점은 fetching 외의 post/patch/put/delete를 통해 서버의 상태를 변형시키는 뮤테이션은 제공하지 않는다. `useSWR()`을 통해 받아온 데이터를 클라이언트 사이드에서 변형시켜 업데이트해 주는 개념으로, 먼저 클라이언트 데이터를 업데이트 후 별도의 API 요청을 하여 서버 데이터를 업데이트 후에 정상적으로 데이터가 업데이트되었는지 확인하는 순서로 수행해야 하는 불편함이 있다.

```jsx
import useSWR, { mutate } from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json());

const Profile () => {
  const { data } = useSWR('/api/user', fetcher)

  return (
    <div>
      <h1>My name is {data.name}.</h1>
      <button onClick={async () => {
        const newName = data.name.toUpperCase()

        // 로컬 데이터를 바로 업데이트한다. 대신 3번째 인자를 false로 두어 재요청을 하지 않는다.
        mutate('/api/user', { ...data, name: newName }, false)

        // 데이터를 업데이트하는 요청을 한다.
        await requestUpdateUsername(newName)

        // 재요청을 한다.
        mutate('/api/user')
      }}>Uppercase my name!</button>
    </div>
  )
}
```

## 4. React-query

이번엔 `react-query`에 대해 알아보자. 공식홈페이지의 내용을 보면 다음과 같이 쓰여있다.

> React Query는 "전역 상태"를 건드릴 일 없이 리액트와 리액트 네이티브 어플리케이션의 데이터를 패치(fetch), 캐시(cache) 그리고 업데이트합니다.

react-query의 경우, SWR과 많은 부분에 있어 유사하지만, devtools 제공, Data Optimization, Auto Garbage Collection 등 \*\*\*\*더 많은 기능을 제공한다.

```jsx
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';

const queryClient = new QueryClient();

const Example = () => {
  const { isLoading, error, data } = useQuery('repoData', () =>
    fetch('https://api.github.com/repos/tannerlinsley/react-query').then((res) => res.json()),
  );

  if (isLoading) return 'Loading...';
  if (error) return 'An error has occurred: ' + error.message;
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong> <strong>✨ {data.stargazers_count}</strong>{' '}
      <strong>🍴 {data.forks_count}</strong>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
};
```

React 상태관리 라이브러리로 redux와 swr과 react-query 에 대한 많은 포스팅 글들이 있는데 글을 읽다보면 다음과 같은 물음이 생긴다.

> **SWR과 React-query로 Redux를 완전히 대체가능한가?**

SWR과 React-query는 기본적으로 server state를 관리하는데 적합한 도구이다. 물론, 이를 응용하여 전역상태관리로서의 역할을 수행하도록 구현할 수도 있다. 하지만, Redux와 SWR, React-query가 처음부터 해결하고자 했던 문제가 다르기 때문에 두 라이브러리가 Redux의 모든 기능을 대체할 수 있으리라고 생각되지 않는다.

그렇다면 서버상태관리를 위해 SWR 혹은 React-query를 사용하고 그외의 전역상태관리를 위해서는 Redux 를 같이 사용하는게 좋을까? 라는 생각이 들던중 `Recoil`이라는 녀석을 접하게되었다.

## 5. Recoil

`Recoil`은 페이스북에서 개발한 전역 상태관리 라이브러리로, Redux와 같이 store와 같은 외부 요인이 아닌 React 내부의 상태를 활용하고 Context API를 통해 구현되어 있기 때문에 더 리액트에 가까운 라이브러리이다. 또한, 위에서 언급했던 Context API의 문제점을 겪지 않아도 되며 Redux보다도 훨씬 사용이 간편하다. `Recoil`은 `atom`이라는 작은 데이터 조각을 만들어서 해당 `State` 변화 시에 이를 참조하는 컴포넌트들만 리렌더를 시키는 단순한 로직으로 되어있다. Recoil로 개발할 경우 이점들을 요약해보면 다음과 같다.

- 리코일은 atom이라는 상태를 store 없이 전역으로 관리할 수 있다.
- atom은 구독, 옵저버와 같은 개념을 생각할 필요없이 hook을 사용하듯이 사용하면 된다.
- selector를 이용하면 리듀서 없이 복잡한 연산도 간단하게 할 수 있다.
- 비동기 데이터 흐름을 위한 내장 솔루션까지 제공한다.
- react 내부에 대한 접근이 가능하여 `React의 동시성 모드`, `Suspense` 등을 손쉽게 지원 가능하다.

```jsx
import React from 'react';
import { RecoilRoot, atom, selector, useRecoilState, useRecoilValue } from 'recoil';

const textState = atom({
  key: 'textState', // unique ID (with respect to other atoms/selectors)
  default: '', // default value (aka initial value)
});

const charCountState = selector({
  key: 'charCountState', // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const text = get(textState);

    return text.length;
  },
});

const TextInput = () => {
  const [text, setText] = useRecoilState(textState);

  const onChange = (event) => {
    setText(event.target.value);
  };

  return (
    <div>
      <input type="text" value={text} onChange={onChange} />
      <div>Echo: {text}</div>
    </div>
  );
};

const CharacterCount = () => {
  const count = useRecoilValue(charCountState);

  return <>Character Count: {count}</>;
};

const CharacterCounter = () => {
  return (
    <div>
      <TextInput />
      <CharacterCount />
    </div>
  );
};

const App = () => {
  return (
    <RecoilRoot>
      <CharacterCounter />
    </RecoilRoot>
  );
};
```

위의 코드에서 보듯이 Redux의 복잡한 보일러 플레이트 코드를 설정할 필요가 없으며, useState Hook을 사용하는 것 처럼 쉽게 상태관리를 할 수 있을 것 같다. 하지만, 아직 공식적으로는 experimental 단계이기 때문에 개발스펙이 바뀔 수 있으니 조심스럽게 접근하는게 좋을꺼 같다.

따라서 내가 내린 결론은... 만약, SSR을 지원하고 싶다던가 `Flux` 패턴을 이용한 선언적이고 안정적인 상태관리를 원한다면 `Redux`를 사용하고, 새로운 기술을 도전해보고 싶고 쉽고 간단하게 구현해보고 싶다면 `Recoil`을 사용하여 전역상태를 관리하며 추가로, 서버상태관리가 필요한 경우, `SWR` 혹인 `React-query`를 이용해보는 것이 좋을 것 같다라는 생각이 든다.
