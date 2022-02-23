---
title: 'Javascript OOP'
date: 2021-5-23 09:47:12
category: 'Javascript'
draft: false
---

## 객체

서로 연관된 변수와 함수를 그룹핑하고 이름 붙인 것.

## This

이 부분에 대해선 추후에 빠른 시일내로 따로 설명드리겠습니다. 일단은 this는 **this가 속해있는 메소드가 속해 있는 객체를 가리키는 특수한 예약어** 정도로 알고 계시면 되겠습니다.

```jsx
var kim = {
  name: 'kim',
  first: 10,
  second: 20,
  sum: function () {
    return this.first + this.second;
  },
};
```

여기서 this는 kim이라는 객체를 가리키게 됩니다.

## Class

**ECMAScript 5** 이전 버전의 JavaScript에는 클래스가 없습니다. 따라서, 클래스와 비슷하게 설계하는 방법은 생성자를 생성한 다음 생성자의 프로토 타입에 메서드를 할당하는 것입니다.

```jsx
function Person(name, first, second) {
  this.name = name;
  this.first = first;
  this.second = second;
}

Person.prototype.sum = function () {
  return this.first + this.second;
};

var kim = new Person('kim', 10, 20);
var lee = new Person('lee', 20, 30);
```

Person은 함수지만 **`new`** 키워드로 인해 **객체를 리턴하는 생성자 함수(constructor)**가 됩니다.

**ECMAScript 6**에서 클래스 형식은 다른 언어의 클래스와 비슷한 클래스 선언입니다.

```jsx
class Person {
  constructor(name, first, second) {
    this.name = name;
    this.first = first;
    this.second = second;
  }

  // 메소드의 경우, function 이라는 키워드를 작성하지 않아도 됩니다.
  sum() {
    return this.first + this.second;
  }
}

var kim = new Person('kim', 10, 20);
var lee = new Person('lee', 20, 30);
```

## 상속

우리가 만약 누군가의 객체를 **재사용** 해야 한다면? 예를 들어 누군가의 클래스 코드를 가져왔으나 **나는 특별한 하나의 기능을 추가하고 싶은데...?** 라는 생각을 할 수 있습니다. 물론 코드 전체를 복사해서 새로운 기능을 추가시켜 나만의 새로운 클래스를 만들 수 있습니다만, 메모리를 더 먹는다던가 쓸데 없이 두배 이상의 코드가 생기는 문제 등 여러 불필요한 문제가 생기겠죠...? 그래서 등장한 것이 바로 상속입니다. 여기서는 현재 first와 second만을 인자로 받는데 만약 인자로 third도 받아서 계산을 하는 클래스를 만들고 싶다면? 다음과 같이 작성하시면 됩니다.

```jsx
class Person {
  constructor(name, first, second) {
    this.name = name;
    this.first = first;
    this.second = second;
  }

  sum() {
    return this.first + this.second;
  }
}

class MyPerson extends Person {
  constructor(name, first, second, third) {
    super(name, first, second);
    this.third = third;
  }

  sum() {
    return super.sum(this.first, this.second) + this.third;
  }
}

var kim = new Person('kim', 10, 20);
var lee = new MyPerson('lee', 20, 30, 40);
```

`extends`라는 키워드를 사용해서 Person으로 확장(상속)하고, `super`라는 키워드를 사용해서 부모인 Person의 생성자 함수와 sum 메소드를 상속받고 사용가능합니다.

추가자료 - ES5에서의 상속

```jsx
function Person(name, first, second) {
  this.name = name;
  this.first = first;
  this.second = second;
}

Person.prototype.sum = function () {
  return this.first + this.second;
};

var kim = new Person('kim', 10, 20);

var lee = Object.create(kim); // 또는 lee.__proto__ = kim;
lee.name = 'lee';
lee.first = 20;
lee.second = 30;
lee.third = 40;

lee.sum = function () {
  return lee.__proto__.sum.call(this) + lee.third;
};

console.log(lee.name);
console.log(lee.sum());
console.log(kim.name);
console.log(kim.sum());
```

`call`은 실행될 때마다 객체의 this 값을 바꾸는 다시 말해서 컨텍스트를 바꾼다.

- `bind`는 함수의 this 값을 영구적으로 바꾸는 새로운 함수를 리턴한다.

## 접근자(Access) 프로퍼티

클래스 생성자 내에서 자체 프로퍼티를 만들어야 하지만, 클래스를 사용하면 프로토타입에 접근자(Accessor) 프로퍼티를 정의할 수 있습니다. Getter를 만들려면 키워드 `get` 다음에 공백 문자와 식별자를 사용합니다. Setter를 만들려면 `set` 키워드를 사용합니다.

```jsx
class Person {
  constructor(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    this._name = value;
  }

  get say() {
    return this._word;
  }

  set say(value) {
    this._word = value;
  }
}

const ted = new Person('ted');

ted.name; // "ted"
ted.say; // undefined
ted.say = 'hello';
ted.say; // 'hello'
ted._word; // 'hello' <-- 직접접근(피하는게 좋음.)
```

이러한 원리는 캡슐화의 이점인 **정보 은닉**이 된다. 메소드로 접근하는 것처럼 보이지 않기 때문에 외관상에도 깔끔하고 자바스크립트만의 특징이다. 그리고, 사실 상 this.\_name에 직접 접근할 수 있지만, 이러한 직접적인 접근은 피하는 것이 좋다.

## 정적 메소드(static methods)

자바스크립트의 클래스에서 prototype에 할당되지 않고 클래스 자체에 할당된 함수를 static 메소드라고 한다.

클래스 자체에 할당되었기 때문에 클래스의 인스턴스를 통해서는 호출될 수 없으며 클래스를 통해 호출해야 한다.

클래스가 가지고 있지만 클래스의 인스턴스에 바인딩되지 않은 기능을 구현하고자 할때 사용된다.

```jsx
class Person {
  constructor(name) {
    this.name = name;
    Person.count();
  }

  static count() {
    Person._counter = (Person._counter || 0) + 1;
    return Person._counter;
  }

  static countPrinter() {
    return Person._counter;
  }
}

const a = new Person('kim');
const b = new Person('lee');

console.log(Person.countPrinter()); // 2
console.log(b.countPrinter()); // error
```
