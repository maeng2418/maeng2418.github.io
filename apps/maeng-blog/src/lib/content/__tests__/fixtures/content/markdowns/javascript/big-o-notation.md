---
title: '빅오 표기법과 시간 복잡도'
date: 2024-03-10 12:00:00
category: 'JavaScript'
draft: false
---

알고리즘의 성능을 수식으로 표현해 보자. :rocket:

인라인 수식 $O(n \log n)$ 과 블록 수식을 함께 사용한다.

$$
T(n) = 2T\left(\frac{n}{2}\right) + O(n)
$$

```ts
function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0)
}
```
