---
title: 'React Test 코드 작성'
date: 2022-06-06 23:00:01
category: 'React'
draft: false
---

<aside>
💡 <b>개요</b> <br/>
모든 개발자들이 테스트코드 작성의 중요성에 대해서 알지만, 쉽사리 실무에서 테스트 코드를 작성하면서 개발을 하기란 쉬운 일이 아니란 것을 공감하실겁니다. 특히나 프론트엔드에서는 시각적인 부분이 많다보니 아무래도 눈으로 직접 검증하는 경우가 많은데요. 테스트 코드를 통해 안정적이고 견고한 서비스를 개발하고 또 유지보수가 용이하도록 만들기 위해 이번에 React에서 테스트 코드를 어떻게 작성하고 테스트 하는지에 대해 알아보고자 하였습니다.

</aside>

## 1. 기술스택

- react 18
- react-router-dom v6
- react-query
- testing-library
  <br/><br/>

기술 스택의 경우, `React 18`과 `React-router-dom v6` 과 같이 최신 버젼의 라이브러리를 사용하였고, API 호출을 위한 `Axios`와 서버 상태관리를 위한 `React-query` 를 이용하였고, React 공식 홈페이지에도 게시되어있듯 Facebook에서는 `React Testing Library` 사용을 권장하는 만큼 테스트 코드 작성은 `Testing-library` 를 이용하여 진행하였습니다.

## 2. React Testing Library

React Testing Library(RTL)은 기존의 Enzyme와 같은 도구의 `구현 기반의 테스트 방법론`의 단점을 보완하기 위해 등장하였고, `행위 주도 테스트 방법론`으로 테스트를 진행합니다.

먼저, `구현 기반의 테스트 방법론` 이란, 주로 애플리케이션이 어떻게 동작하는지에 대해서 초점을 두어 테스트 코드를 작성합니다.

```tsx
<div class="title">Hello</div>
```

예를 들어, 위와 같은 코드가 있을 경우, 컴포넌트에 어떤 `prop`이 넘어가고, 현재 `state`이 어떻게 되는지, `div` 태그가 쓰였고 `title`이라는 클래스가 사용되었는지 등을 테스트 합니다.

이에 반해, `행위 주도 테스트 방법론`의 경우, 세부적인 구현사항보다는 실제 사용자 경험과 유사한 방식으로 테스트 코드를 작성합니다. 즉, 사용자 입장에서는 div 태그가 쓰였다 title이라는 클래스가 사용되었는지 보다는 화면에 `올바른 콘텐츠 내용이 표기되는가` 라는 부분이 더 중요하기 때문에, RTL의 경우, `Hello`라는 텍스트가 화면에 있는지를 테스트 합니다. 따라서 이와 같이 구현보다 기능에 초점을 맞춘 테스트 방식은 신뢰도를 높임과 동시에 코드 리팩토링 시 테스트 코드 수정 빈도를 줄일 수 있습니다.

## 3. 컴포넌트 렌더링 테스트

먼저, 간단한 예시를 통해서 RTL을 활용해서 어떻게 테스트하는지 예시를 살펴보겠습니다.

```tsx
const Home = () => {
  return (
    <section>
      <h1>Hello Word</h1>
      <p>안녕하세요. 프론트엔드 개발자 MAENG입니다.</p>
    </section>
  );
};
```

위와 같은 컴포넌트를 가지고 테스트를 진행할 경우, 사용자 입장에서 생각해보면, 먼저 `Hello world` 라는 문구와 `안녕하세요. 프론트엔드 개발자 MAENG입니다.` 라는 문구를 컴포넌트가 렌더링되었을때 화면에 노출되어야할 것입니다.

RTL을 가지고 해당 내용들이 제대로 노출되는지 테스트하기 위해서는 다음과 같이 테스트 코드를 작성할 수 있습니다.

```tsx
describe('Home', () => {
  it('renders Home', () => {
    const { getByText } = render(<Home />);
    expect(getByText('Hello world')).toBeInTheDocument();
    expect(getByText('안녕하세요. 프론트엔드 개발자 MAENG입니다.')).toBeInTheDocument();
  });
});
```

## 4. 유저 인터렉션 테스트

이제 `버튼`이나 `입력필드` 등 유저 인터렉션이 이루어지는 부분은 어떻게 테스트하는지 살펴볼 차례입니다.

```tsx
const Button = ({ onClick }) => {
  return <button onClick={onClick}>버튼</button>;
};
```

위와 같은 버튼 컴포넌트가 있을 경우, 사용자 입장에서 생각해볼때 `"버튼"` 이라는 텍스트를 가진 버튼을 클릭할 경우, `onClick` 함수가 1번 실행될 것을 기대할 수 있습니다.

위의 내용을 테스트 코드로 작성하면 다음과 같습니다.

```tsx
describe('Button', () => {
  it('renders Button', () => {
    const onClick = jest.fn(); // 가짜 함수
    const { getByText } = render(<Button onClick={onClick} />);
    expect(getByText('버튼')).toBeInTheDocument();
    fireEvent.click(button);
    expect(onClick).toBeCalledTimes(1);
  });
});
```

위 코드를 보면 `jest.fn()` 을 사용하여 `onClick` 함수를 모킹하는데 모킹에 대해서는 하단에 따로 정리하여 설명하도록 하겠습니다.

이번에는 입력 필드의 경우 어떻게 테스트를 진행하는지 살펴보겠습니다.

```tsx
const Form = () => {
  const [text, setText] = useState('');

  return (
    <form>
      <input
        type="text"
        placeholder="텍스트를 입력해주세요."
        value={text}
        onChange={({ target: { value } }) => setText(value)}
      />
      <button disabled={!text}>제출</button>
    </form>
  );
};
```

위와 같은 버튼 컴포넌트가 있을 경우, 마찬가지로 사용자 입장에서 생각해보면 `"텍스트를 입력해주세요."` 라는 placeholder가 있는 입력필드에 텍스트를 입력할 경우, 해당 입력필드의 값은 사용자가 입력한 값으로 변할 것이고, `"제출"` 이라는 텍스트를 지닌 버튼이 활성화 될 것입니다.

위의 내용을 테스트 코드로 작성하면 다음과 같습니다.

```tsx
describe('Form', () => {
  it('renders Form', () => {
    const { getByText, getByPlaceholderText } = render(<Form />);

    const input = getByPlaceholderText('텍스트를 입력해주세요.');
    const button = getByText('제출');

    expect(button).toBeDisabled();
    fireEvent.change(input, { target: { value: 'Maeng Input Test' } });
    expect(input.value).toBe('Maeng Input Test');
    expect(button).toBeEnabled();
  });
});
```

## 5. Custom Hook 테스트

요즘 React에서는 함수형 컴포넌트와 여러가지 훅을 이용해서 간단하면서도 재생산성을 높인 방식으로 프로그래밍을 하기에 여러 컴포넌트에서 반복적으로 사용되거나 복잡한 계산이 포함된 훅들은 별도의 커스텀 훅으로 만들어 관리하는게 용이합니다. 따라서 React를 테스트할 때 단순 컴포넌트 렌더링뿐 아니라 이러한 훅들에 대한 테스트도 이루어져야합니다.

리액트 커스텀 훅을 테스트하기 위해서 다음과 같이 여러 가지 방법을 사용할 수 있습니다.

1. 라이브러리 없이 Hook 테스트
2. Custom Hook을 사용하는 테스트 컴포넌트를 만들어 테스트
3. `@testing-library/react-hooks`의 `renderHook`을 사용

저는 이중에서 `@testing-library/react-hooks` 를 이용해서 커스텀 훅을 테스트하는 방법에 대해서 설명하겠습니다.

`@testing-library/react-hooks` 라이브러리를 이용하면 별도의 React Component의 도움 없이도 React Hook을 직접 테스트를 할 수가 있습니다.

직접 코드를 작성하여 설명드리도록 하겠습니다.

```tsx
const useInput = (initialValue = null) => {
  const [value, setValue] = useState(initialValue);
  const handler = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  return [value, handler];
};
```

위의  `useInput` 이라는 커스텀 훅은 입력 값을 담은 `value` 상태값과 그 상태값을 수정할 수 있는 `handle` 를 배열에 담아 반환합니다. 초기 상태값을 `initialState` 인자를 통해 받을 수 있으며, 인자를 넘기지 않은 경우 기본값으로 `null`을 사용합니다.

Custom Hook 테스트의 경우, 컴포넌트처럼 사용자에게 보여지는 부분이 아니다 보니 컴포넌트 테스트와는 조금 다르게 사용자 입장이 아닌 Jest에서 기능 테스트를 진행하듯이 렌더링이 아닌 함수처럼 매개변수에 따른 결과값, 즉 동일한 매개변수에 대해서 동일한 결과값을 도출하는지를 테스트합니다.

따라서, useInput 훅을 인자 없이 호출했을 때 value는 null인 상태값을 지니고, handler 함수를 호출할 경우, value의 상태값은 handler의 인자로 들어온 값에 의해 변화가 이루어질 것을 우리는 기대할 수 있고 다음과 같이 테스트 코드를 작성할 수 있습니다.

```tsx
describe('useInput', () => {
  it('update value when handler is called', () => {
    const { result } = renderHook(() => useInput());
    expect(result.current[0]).toBe(null);
    act(() => result.current[1]({ target: { value: 'Maeng Input Test' } }));
    expect(result.current[0]).toBe('Maeng Input Test');
  });
});
```

`renderHook()`함수에 React Hook 함수를 호출하는 코드를 인자로 넘기면 `result`속성을 담고 있는 객체를 반환합니다. 이 `result` 객체는 `current` 속성을 갖는데, 이 속성을 통해서 해당 React Hook 함수의 반환값에 직접 접근할 수 있습니다.

## 6. API 호출 테스트

이제 API 호출의 경우 어떻게 테스트 하는지 알아보도록 하겠습니다.

API 호출 테스트의 경우도 Custom Hook 테스트와 비슷하게 해당 훅을 호출 하였을때, 서버로 API 요청을 보내고, 올바른 응답을 받는지 테스트를 진행하면 되겠습니다.

저의 경우, API 호출 라이브러리로 `Axios`를 사용하였고, 서버 상태 관리 라이브러리로 `React-query`를 이용하였습니다. 해당 포스트는 테스트 코드 작성에 대한 글이므로 Axios나 React-query에 대한 설명은 생략하도록 하겠습니다.

먼저, 간단하게 React-query를 이용하여 데이터를 불러오는 간단한 커스텀 훅을 작성해보겠습니다.

```tsx
const useFetchData = () => {
  const { data, isLoading, error } = useQuery('/data', async () => {
    const response = await API.get(`/data`);
    return response.data;
  });

  return { data, isLoading, error };
};
```

useFetchData 훅은 API를 요청하고 응답값을 data에 담아 `{ data, isLoading, error }` 객체를 리턴합니다.

따라서, 우리는 useFetchData 훅을 호출했을 때, 다음과 같은 결과를 기대할 수 있습니다.

```tsx
// 데이터 요청 완료 전
{
	data: undefined,
	isLoading: true,
	error: null
}

// 정상적으로 데이터 요청 완료
{
	data: { name: 'Maeng' },
	isLoading: false,
	error: null
}
```

이를 기반으로 테스트 코드를 작성해보면 다음과 같습니다.

```tsx
describe('useFetchData', () => {
  it('fetch data', async () => {
    const { result, waitFor } = renderHook(() => useFetchData(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => !result.current.isLoading);
    expect(result.current.data?.name).not.toBe(undefined);
  });
});
```

React-query를 사용하기 위해서는 별도의 Wrapper 컴포넌트가 필요합니다. 따라서 `createQueryWrapper` 라는 함수를 만들어 React-query를 사용할 수 있도록 Wrapper 컴포넌트 생성해주었습니다.

```tsx
// React-query를 위한 Wrapper 컴포넌트 생성
const createQueryWrapper = () => {
  const testQueryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};
```

하지만 위처럼 API 호출 테스트 진행을 하면서, 몇가지 불편사항을 겪게 되었습니다.

**첫 번째**는 **API에 응답을 내려주는 서버가 제대로 동작하지 않을 경우**, 당연하게도 실패 메시지를 노출하게 됩니다. 만약 백엔드가 구현이 아직 안된 상태로 프론트 작업을 한다면, 계속해서 테스트 케이스에서 실패가 발생할 것입니다.

**두 번째**는 API가 DB에서 데이터를 가져오기 때문에 위에서는 단순히 `data`가 `undefined`가 아님을 테스트하였지만, **좀 더 상세하게** `data` **값에 대해 테스트를 진행할 경우** DB가 수정됨에 따라 응답값은 매번 바뀔 것이기 때문에 이 또한 테스트 케이스에서 실패가 발생할 것입니다.

**세 번째**는 **CORS 처리**를 추가해주어야하는 번거로움(?)이 있었습니다. 제가 구현한 서버의 경우, `Access-Control-Allow-Origin` 을, React의 경우 포트 번호를 3000번을 사용하기에 3000번만 허용해주었더니 CORS에러가 발생하여 확인한 결과, 테스트 코드의 경우, API 호출 시 80포트를 이용해서 요청하고 있어, 만약 API 서버에서 3000번 포트만을 허용하고 있다면 80포트도 허용하도록 추가적인 작업이 필요했습니다.

따라서, 어떻게 해결하면 좋을까에 대해서 고민하던 중, `axios-mock-adapter` 에 대해 알게 되었습니다.

`axios-mock-adapter` 를 활용하면, API 요청과 응답을 Mocking 할 수 있습니다. 따라서 API 요청과 응답값을 테스트 코드 내에서 조작할 수 있습니다.

다음은 `axios-mock-adapter` 를 활용해서 테스트 코드를 재작성해보았습니다.

```tsx
describe('useFetchData', () => {
  it('fetch data', async () => {
    mock.onGet('/data').reply(200, { name: 'Maeng' });

    const { result, waitFor } = renderHook(() => useGetBankList(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => !result.current.isLoading);
    expect(result.current.data.name).toBe('Maeng');
  });
});
```

이처럼 `axios-mock-adapter` 을 활용하면 직접 API 요청을 보내지 않고도 예상되는 응답 상태와 값을 내려주도록 API를 모킹하여 테스트를 진행할 수 있습니다.

## 7. 라우팅 테스트

다음으로, 컴포넌트 또는 리액트 훅에서 발생하는 라우팅은 어떻게 테스트하는지 알아보겠습니다. 대개 React에서는 React-router-dom 라이브러리를 활용해서 라우팅 설정을 하는데요. 최근에 V6가 릴리즈되어 저는 이를 기반으로 테스트 코드를 작성하였습니다.

먼저, 다음과 같이 라우팅이 발생하는 간단한 컴포넌트를 작성해보겠습니다.

```tsx
const Button = () => {
  const navigate = useNavigate();

  const onClick = () => {
    navigate('/');
  };
  return <button onClick={onClick}>버튼</button>;
};
```

자, 라우팅이 발생하는 컴포넌트 입니다. 아까도 말씀드렸다시피 컴포넌트 테스트는 사용자 입장에서 생각하여 테스트를 진행합니다. 따라서 우리가 기대하는 해당 컴포넌트의 시나리오는 `"버튼"` 이라는 텍스트를 지닌 버튼을 클릭하면 “/”로 라우팅 되는 것입니다.

이를 기반으로 테스트 코드를 작성하기에 앞서 우리는 react-router-dom 동작에 대해서 생각해 보아야 합니다. 좀전에 react-query 테스트를 할 때, Wrapper 컴포넌트가 필요하였듯이, react-router-dom 이 동작하기 위해 Wrapper 컴포넌트가 필요합니다.

따라서 React-router-dom을 위해 테스트 컴포넌트를 감싸 렌더링해줄 수 있는 `renderWithRouter` 함수를 작성해보도록 하겠습니다.

```tsx
// React-router-dom을 위한 Wrapping
const renderWithRouter = (children) => {
  return {
    ...render(<MemoryRouter>{children}</MemoryRouter>
    )
  };
```

보통 React에서는 React-router-dom에서 제공하는 App.js에 `BrowserRouter` 또는 `HashRotuer` 를 통해 컴포넌트들을 감싸 라우팅을 구현하는데, `MemoryRouter`는 `<BrowserHistory>` 및 `<HashHistory>` 와는 달리 브라우저의 기록 스택과 같은 외부 소스에 연결되지 않습니다. 따라서 테스트와 같이 기록 스택을 완전히 제어해야 하는 시나리오에 이상적이라고 합니다.

이제 라우팅을 테스트하기 위한 준비를 마쳤으니, 다음과 같이 코드를 작성해서 테스트를 진행하였습니다.

```tsx
// useNavigate 모킹
const mockedNavigator = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigator,
}));

describe('Button', () => {
  it('renders Button', () => {
    const { getByText } = renderWithRouter(<Button />);
    expect(getByText('버튼')).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockedNavigator).toBeCalledTimes(1);
  });
});
```

해당 테스트 코드를 실행시키면 정상적으로 통과하는 것을 확인할 수 있지만, 저는 아직 만족하지 못했습니다.

정확히 “/”로 라우팅 되는지까지 테스트를 진행하여 좀더 완벽한 테스트 코드 작성하고 싶었습니다.

하지만 구성 요소가 일부 작업에서 경로를 변경하는 경우 `MemoryRouter`를 사용 하여 history의 변경 사항에 액세스할 수 없기 때문에 `MemoryRouter` 를 사용하는 것만으로는 충분하지 않다는 사실을 알게되었고, history에 대해 액세스할 수 있는 `HistoryRouter` 를 활용하고자 하였습니다.

다음은 `HistoryRouter`를 활용해서 `renderWithRouter`를 재구현한 코드입니다.

```tsx
const renderWithRouter = (renderComponent, route) => {
  const history = createMemoryHistory();

  if (route) {
    history.push(route);
  }

  return {
    ...render(
      <HistoryRouter history={history}>
        <Routes>{renderComponent()}</Routes>
      </HistoryRouter>
    ),
    history,
  };
```

이제는 history의 변경사항에 대해 엑세스할 수 있습니다.

다시 테스트 코드를 작성해보도록 하겠습니다.

```tsx
describe('Button', () => {
  it('renders Button', () => {
    const { getByText, history } = renderWithRouter(
      () => (
        <>
          <Route path="/test" element={<Button />} />
          <Route path="/" element={<div />} />
        </>
      ),
      '/test',
    );
    expect(getByText('버튼')).toBeInTheDocument();
    fireEvent.click(button);
    await waitFor(() => {
      expect(history.location.pathname).toEqual('/');
    });
  });
});
```

이전 코드와 달리 useNavigate 모킹하지 않아도 되며, history 객체에 액세스하여 정확하게 “/” 로 라우팅되는지 테스트할 수 있게 되었습니다.

## 8. 심화 테스트

이제는 위에서 학습한 내용을 바탕으로 복합적인 테스트를 진행해보도록 하겠습니다.

다음은 서버로 부터 데이터를 가져오고 이를 업데이트 하는 페이지 컴포넌트 입니다. 컴포넌트 상세 코드는 생략하고 테스트 코드 위주로 작성하고 설명드리도록 하겠습니다.

```tsx
const UpdatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, error, isLoading, isError } = useFetchData(id);
  const { mutateAsync, isLoading: isMutating } = useUpdateData();

  const onFormSubmit = async (formData) => {
    await mutateAsync({ ...formData, id });
    navigate('/');
  };

  if (isLoading) {
    return <div data-testid="loader">Loading</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Update Data</h1>
      <DataForm defaultValues={data} onFormSubmit={onFormSubmit} isLoading={isMutating} />
    </div>
  );
};
```

업데이트 페이지에 대해서 간략하게 설명드리자면, 현재 url로 부터 id 파라미터를 가져와 해당 id에 해당하는 데이터를 조회하고 폼 컴포넌트에서는 조회된 데이터를 바탕으로 기본값이 세팅되며, 이를 수정하고 업데이트할 경우, 루트(”/”)로 라우팅 되는 페이지 입니다.

업데이트 페이지에서 우리가 기대하는 결과들을 다음과 같습니다.

- url 파라미터로 주어진 id를 통해 데이터를 가져오는 함수가 호출된다.
- 로딩중에는 로딩 화면이 노출된다.
- 에러가 발생하면 에러문구가 노출된다.
- 데이터가 정상적으로 조회되었을 경우, `"Update Data"` 문구가 노출되고 DataForm 컴포넌트에 defaultValue값으로 데이터가 전달된다.
- 폼에서 제출이 정상적으로 이루어지면, 루트(”/”)로 페이지 이동이 발생한다.

위의 기대사항들을 기반으로 테스트 코드를 작성하면 아래와 같습니다.

```tsx
jest.mock('./useFetchData', () => ({
  useFetchData: jest.fn(),
}));

jest.mock('./useUpdateData', () => ({
  useUpdateData: jest.fn(),
}));

jest.mock('./DataForm', () => ({
  DataForm: jest.fn(),
}));

describe('UpdatePage', () => {
  beforeEach(() => {
    useFetchData.mockImplementation(() => ({}));
    useUpdateData.mockImplementation(() => ({}));
    DataForm.mockImplementation(() => null);
  });
  it('fetches the data for the given id', () => {
    renderWithRouter(() => <Route path=":id" element={<UpdatePage />} />, '/test-id');
    expect(useFetchData).toHaveBeenCalledWith('test-id');
  });

  describe('while loading', () => {
    it('renders a loader', () => {
      useFetchData.mockImplementation(() => ({
        isLoading: true,
      }));

      const { getByTestId } = renderWithRouter(
        () => <Route path=":id" element={<UpdatePage />} />,
        '/test-id',
      );
      expect(getByTestId('loader')).toBeTruthy();
    });
  });

  describe('with an error', () => {
    it('renders an error message', () => {
      useFetchData.mockImplementation(() => ({
        isError: true,
        error: { message: 'Something went wrong' },
      }));

      const { container } = renderWithRouter(
        () => <Route path=":id" element={<UpdatePage />} />,
        '/test-id',
      );
      expect(container.innerHTML).toMatch('Error: Something went wrong');
    });
  });

  describe('with data', () => {
    it('renders the update page title and the data form', () => {
      useFetchData.mockImplementation(() => ({
        data: { foo: 'bar' },
      }));

      const { container } = renderWithRouter(
        () => <Route path=":id" element={<UpdatePage />} />,
        '/test-id',
      );
      expect(container.innerHTML).toMatch('Update Data');
      expect(DataForm).toBeCalledWith(
        expect.objectContaining({
          defaultValues: { foo: 'bar' },
        }),
        {},
      );
    });

    describe('on data form submit', () => {
      it('updates the data and navigates to the root page', async () => {
        DataForm.mockImplementation(({ onFormSubmit }) => (
          <button onClick={() => onFormSubmit({ foo: 'bar' })}>Submit</button>
        ));
        const mutateAsync = jest.fn();

        useUpdateData.mockImplementation(() => ({ mutateAsync }));

        const { getByText, history } = renderWithRouter(
          () => (
            <>
              <Route path=":id" element={<UpdatePage />} />
              <Route path="/" element={<div />} />
            </>
          ),
          '/test-id',
        );

        fireEvent.click(getByText('Submit'));

        expect(mutateAsync).toHaveBeenCalledWith({
          foo: 'bar',
          id: 'test-id',
        });

        await waitFor(() => {
          expect(history.location.pathname).toEqual('/');
        });
      });
    });
  });
});
```

## 9. 참고

### Mocking

테스트 코드를 작성할때 의존적인 부분을 직접 생성하기가 부담스럽기 때문에 모킹을 많이 사용하는데, 테스트 하고 싶은 기능이 다른 기능들과 엮여있을 경우, 정확한 테스트를 하기 힘들기 때문에 해당 코드가 의존하는 부분을 가짜로 대체하는 것을 의미합니다.

**jest.fn()**

Jest는 가짜 함수(mock functiton)를 생성할 수 있도록 jest.fn() 함수를 제공합니다.

이를 이용해서 일회성 테스트용으로서 내부의 함수를 진짜같이 구동해서 코드를 구동 시킬 수 있습니다.

**jest.mock()**

jest.fn()은 개별적으로 하나하나 모킹 처리를 해줄때 사용하며, jest.mock()은 그룹으로 한번에 모킹 처리를 해줄때 사용합니다.
<br/><br/>

### **Jest API**

다음은 Jest로 단위 테스트 코드를 구현할 때 자주 사용되는 API 목록입니다.

**describe**

여러 개의 테스트 케이스를 묶을때 사용하며, 작은 단위의 테스트 코드를 그룹화할 수 있다.

**it과 test**

it과 test 두 가지 모두 하나의 테스트 케이스를 의미하며 완전히 동일한 기능을 합니다.

기본적으로 `it`는 의 별칭 `test`이므로 기능적으로 동일합니다.

**expect**

`expect()`에는 주로 테스트 입력 값 또는 기대 값을 넣습니다

**toBe**

테스트의 결과를 확인하는 API. 테스트의 예상 결과 값을 넣습니다.

**beforeEach**

테스트 파일의 각 테스트 코드가 돌기 전에 수행할 로직을 넣는 API. 테스트 케이스마다 반복되는 로직을 넣기에 적합합니다.
<br/><br/>

### RTL의 다양한 Query

RTL 에는 아래와 같이 Variant와 Query가 존재하며, 이 둘의 조합을 통해 특정 DOM을 선택할 수 있습니다.
<br/><br/>

### **Variant**

**getBy**

`getBy*` 로 시작하는 쿼리는 조건에 일치하는 DOM 엘리먼트 하나를 선택합니다. 만약에 없으면 에러가 발생합니다.

**getAllBy**

`getAllBy*` 로 시작하는 쿼리는 조건에 일치하는 DOM 엘리먼트 여러개를 선택합니다. 만약에 하나도 없으면 에러가 발생합니다.

**queryBy**

`queryBy*` 로 시작하는 쿼리는 조건에 일치하는 DOM 엘리먼트 하나를 선택합니다. 만약에 존재하지 않아도 에러가 발생하지 않습니다.

**queryAllBy**

`queryAllBy*` 로 시작하는 쿼리는 조건에 일치하는 DOM 엘리먼트 여러개를 선택합니다. 만약에 존재하지 않아도 에러가 발생하지 않습니다.

**findBy**

`findBy*` 로 시작하는 쿼리는 조건에 일치하는 DOM 엘리먼트 하나가 나타날 때 까지 기다렸다가 해당 DOM 을 선택하는 Promise 를 반환합니다. 기본 timeout 인 4500ms 이후에도 나타나지 않으면 에러가 발생합니다.

**findAllBy**

`findBy*` 로 시작하는 쿼리는 조건에 일치하는 DOM 엘리먼트 여러개가 나타날 때 까지 기다렸다가 해당 DOM 을 선택하는 Promise 를 반환합니다. 기본 timeout 인 4500ms 이후에도 나타나지 않으면 에러가 발생합니다.
<br/><br/>

### **Queries**

**ByLabelText**

`ByLabelText` 는 label 이 있는 input 의 label 내용으로 input 을 선택합니다.

**ByPlaceholderText**

`ByPlaceholderText` 는 placeholder 값으로 input 및 textarea 를 선택합니다.

**ByText**

`ByText`는 엘리먼트가 가지고 있는 텍스트 값으로 DOM 을 선택합니다.

참고로, 텍스트 값에 정규식을 넣어도 작동합니다.

**ByAltText**

`ByAltText` 는 `alt` 속성을 가지고 있는 엘리먼트 (주로 `img`) 를 선택합니다.

**ByTitle**

`ByTitle` 은 `title` 속성을 가지고 있는 DOM 혹은 `title` 엘리먼트를 지니고있는 SVG 를 선택 할 때 사용합니다.
