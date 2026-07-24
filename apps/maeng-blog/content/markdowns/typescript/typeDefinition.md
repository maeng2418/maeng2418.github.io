---
title: 'typeRoots vs include'
date: 2024-9-4 22:29:32
category: 'Typescript'
thumbnail: '../../images/Typescript.png'
draft: false
---

## typeRoots

`typeRoots`는 **타입 정의 파일(.d.ts)들을 찾을 디렉터리를 지정**하는 옵션입니다. 이 옵션은 TypeScript가 프로젝트의 전역 타입 정보를 인식할 때 사용됩니다.

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "typeRoots": ["./node_modules/@types", "./@types"]
  }
}
```

`typeRoots`는 `node_modules/@types`와 `@types` 디렉터리를 포함하고 있습니다. 이 설정은 TypeScript가 이 두 디렉터리에서 타입 정의 파일을 찾고, 해당 파일들을 전역 타입으로 사용할 수 있도록 합니다.

**typeRoots**가 명시되지 않은 경우, TypeScript는 기본적으로 node_modules/@types 디렉터리를 검색하여 전역 타입을 자동으로 가져옵니다.

## include

`include`는 TypeScript 컴파일러가 **컴파일할 파일들을 지정**하는 옵션입니다. 이 옵션에 명시된 파일들은 TypeScript 컴파일러가 컴파일하고 타입 체크를 수행할 파일들입니다.

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs"
  },
  "include": ["src/**/*"]
}
```

`include`는 `src` 디렉터리 하위의 모든 파일(`**/*`)을 포함합니다. 따라서 `src` 디렉터리 내의 모든 `.ts` 파일들이 컴파일됩니다.

**include**가 명시되지 않은 경우, TypeScript는 기본적으로 프로젝트 루트에서 tsconfig.json 파일을 기준으로 모든 .ts 파일을 컴파일 대상으로 삼습니다.

## 요약

- **`include`**: 컴파일할 소스 파일들을 지정합니다.
- **`typeRoots`**: 타입 정의 파일들을 찾을 디렉터리를 지정합니다.

## `include` 사용 시 `typeRoots` 인식 문제

기본적으로 `include` 옵션과 `typeRoots` 옵션은 독립적으로 작동합니다. `include`는 컴파일할 소스 파일을 결정하고, `typeRoots`는 타입 정의 파일(.d.ts)을 찾는 디렉터리를 결정합니다. `include`에 의해 컴파일 될 파일이 `typeRoots` 내의 타입 정의 파일을 찾지 못하는 문제가 발생할 수 있습니다.

### 타입 정의 파일이 포함되지 않은 경우

만약 타입 정의 파일이 `include`에 의해 커버되지 않는 위치에 있다면 문제가 발생할 수 있습니다.

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "typeRoots": ["./node_modules/@types", "./@types"]
  },
  "include": ["src/**/*"]
}
```

위 설정에서 `typeRoots`에 `./@types`이 포함되어 있지만, 만약 `@types` 폴더가 `src` 폴더 내에 있지 않고 루트 디렉터리에 있다면 `include` 옵션으로는 해당 폴더가 포함되지 않으므로, 전역 타입 정의가 인식되지 않습니다.

## 해결 방법 1

`tsconfig.json`의 `types` 옵션을 사용하여 타입 정의를 특정할 수 있습니다.

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./@types"],
    "types": ["node", "utils"] // 전역으로 인식할 타입 패키지 명시
  },
  "include": ["src/**/*"]
}
```

이렇게 되면 `include`에 `@types`를 포함시키지 않아도 `node_modules/@types/node.d.ts` 와, `@types/utils.d.ts` 정의 파일을 읽을 수 있음.

> 단, `types`를 지정하지 않았을 때 default 값이 모두 가져오는거라, `node_modules` 에 있는 `@types` 내 모든 타입 정의 파일을 가져오지 못함.

## 해결 방법 2

**`include`에서 타입 정의 파일이 있는 경로를 명시적으로 포함**:
`include` 설정에 타입 정의 파일들이 있는 경로를 명시적으로 포함시켜 타입 정의 파일들이 컴파일러에 의해 인식되도록 합니다.

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./@types"]
  },
  "include": ["src/**/*", "@types/**/*"]
}
```

이 설정을 사용하면 `src` 하위 파일뿐만 아니라 `@types` 하위 파일도 TypeScript 컴파일러가 인식하게 됩니다. 이 방법으로 `@types`에 있는 모든 타입 정의 파일들을 `include` 경로에 명시적으로 포함시켜 문제가 해결됩니다.

**이럴 경우, typeRoots 생략 가능!**
`include` 옵션을 사용하면 TypeScript는 해당 경로에 있는 모든 파일을 타입 검사 및 컴파일 대상으로 포함하므로, `typeRoots`를 명시적으로 설정하지 않아도 됩니다.

```json
{
  "compilerOptions": {
    // 'typeRoots'와 'types' 옵션을 생략
  },
  "include": ["src/**/*", "@types/**/*"]
}
```

**`include`** 옵션을 통해 `src`, `@types` 디렉터리 내의 모든 파일을 컴파일러가 포함할 파일로 지정하고, `typeRoots` 옵션과 `types` 을 생략하여 기본적으로 `node_modules/@types` 내의 모든 타입이 자동으로 포함됩니다.
