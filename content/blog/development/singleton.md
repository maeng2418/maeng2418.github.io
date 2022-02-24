---
title: '싱글톤 패턴'
date: 2021-5-23 21:09:47
category: 'Development'
draft: false
---

## Singleton 패턴

애플리케이션이 시작될 때 어떤 클래스가 **최초 한번만** 메모리를 할당하고(Static) 그 메모리에 인스턴스를 만들어 사용하는 디자인패턴.

전체 시스템에서의 **오직 하나의 인스턴스만** 존재하도록 보장.

```jsx
const singleton = (function () {
  var instance;
  var a = 'singleton';
  function init() {
    return {
      a: a,
      b: function () {
        console.log(a);
      },
    };
  }
  return {
    getInstance: function () {
      if (!instance) {
        instance = init();
      }
      return instance; // 이미 인스턴스가 있다면 새로 생성하지 않음.
    },
  };
})();
const singletone1 = singleton.getInstance();
const singletone2 = singleton.getInstance();
console.log(singletone1 === singletone2); // true;
```
