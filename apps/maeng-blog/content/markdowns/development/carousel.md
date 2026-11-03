---
title: 'VanilaJS Carousel 만들기'
date: 2021-5-24 21:09:47
category: 'Development'
thumbnail: '../../images/Javascript.jpg'
draft: false
---

## Carousel 만들기

### **요구사항**

1. 터치로 슬라이드를 이동시킬 수 있습니다.
2. 양쪽 버튼을 클릭하여 슬라이드를 이동시킬 수 있습니다.
3. 무한 반복 슬라이드가 되어야 합니다.

## 구현

```html
<div class="carousel-container">
  <div class="carousel-slide">
    <div class="img">Slide 1</div>
    <div class="img">Slide 2</div>
    <div class="img">Slide 3</div>
    <div class="img">Slide 4</div>
    <div class="img">Slide 5</div>
  </div>
  <button id="prev" class="prev"></button>
  <button id="next" class="next"></button>
</div>
```

- carousel-container : 전체적인 캐러셀 컨테이너
- carousel-slide : 슬라이드를 담는 컨테이너라고 이해하면 됩니다.
- prev, next : 슬라이드 이동 버튼

```css
* {
  padding: 0px;
  margin: 0px;
  box-sizing: border-box;
}

.carousel-container {
  width: 400px;
  height: 300px;
  margin: auto;
  overflow: hidden;
  position: relative;
}

.carousel-slide {
  display: flex;
  height: 100%;
  position: relative;
}

.carousel-slide.shifting {
  transition: transform 0.2s ease-out;
}

.img {
  flex: 0 0 auto;
  width: 100%;
  height: 100%;
  text-align: center;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 1s;
  background: #ffcf47;
  border-radius: 2px;
}

.prev,
.next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50px;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.3);
  background-size: 22px;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
}

.prev {
  background-image: url(https://cdn0.iconfinder.com/data/icons/navigation-set-arrows-part-one/32/ChevronLeft-512.png);
  left: 20px;
}

.next {
  background-image: url(https://cdn0.iconfinder.com/data/icons/navigation-set-arrows-part-one/32/ChevronRight-512.png);
  right: 20px;
}

.prev:active,
.next:active {
  width: 40px;
  height: 40px;
}
```

- CSS를 간략히 설명하면, carousel-container라는 메인 컨테이너 안에 길게 늘어선 슬라이드 컨테이너인 carousel-slide가 있고, 그 안에는 여러 슬라이드들이 한 줄로 정렬되어 있습니다. 이후 carousel-container에 overflow: hidden을 적용하여 길게 늘어선 carousel-slide를 숨깁니다.

```jsx
const carouselContainer = document.querySelector('.carousel-container')
const carouselSlide = document.querySelector('.carousel-slide')
const carouselImages = document.querySelectorAll('.img')

const prev = document.querySelector('#prev')
const next = document.querySelector('#next')

// 터치시 드래그 길이
const threshold = 100

const slideWidth = carouselImages[0].clientWidth
const slidesLength = carouselImages.length

// 첫번째 이미지가 나타나도록 함. (지금 맨처음꺼에 lastClone이 있고 마지막에 firstClone이 있으므로)
carouselSlide.style.transform = `translateX(${-slideWidth}px)`

let posX1 = 0
let posX2 = 0
let posInitial
let posFinal

const firstSlide = carouselImages[0]
const lastSlide = carouselImages[slidesLength - 1]
const cloneFirst = firstSlide.cloneNode(true)
const cloneLast = lastSlide.cloneNode(true)

// Clone first and last slide
carouselSlide.appendChild(cloneFirst)
carouselSlide.insertBefore(cloneLast, firstSlide)

let index = 0
let allowShift = true // 벗어나는 거 막음 (안전코드) - 트랜지션이 끝나면 다음 클릭 가능
let offsetLeft

const dragStart = (e) => {
  e = e || window.event
  e.preventDefault()
  posInitial = -slideWidth * (index + 1)
  offsetLeft = posInitial
  if (e.type == 'touchstart') {
    posX1 = e.touches[0].clientX
  } else {
    posX1 = e.clientX
    document.onmouseup = dragEnd
    document.onmousemove = dragAction
  }
}

const dragAction = (e) => {
  e = e || window.event
  if (e.type == 'touchmove') {
    posX2 = posX1 - e.touches[0].clientX
    posX1 = e.touches[0].clientX
  } else {
    posX2 = posX1 - e.clientX
    posX1 = e.clientX
  }
  offsetLeft -= posX2
  carouselSlide.style.transform = 'translateX(' + offsetLeft + 'px)'
}

const dragEnd = (e) => {
  posFinal = offsetLeft
  if (posFinal - posInitial < -threshold) {
    shiftSlide(1, 'drag')
  } else if (posFinal - posInitial > threshold) {
    shiftSlide(-1, 'drag')
  } else {
    carouselSlide.style.transform = 'translateX(' + posInitial + 'px)'
  }
  document.onmouseup = null
  document.onmousemove = null
}

const shiftSlide = (dir, action) => {
  carouselSlide.classList.add('shifting')

  if (allowShift) {
    // 벗어나는 거 막음 (안전코드) - 트랜지션이 끝나면 다음 클릭 가능
    if (!action) {
      posInitial = -slideWidth * (index + 1)
    }
    // next
    if (dir == 1) {
      carouselSlide.style.transform = 'translateX(' + (posInitial - slideWidth) + 'px)'
      index++
      // prev
    } else if (dir == -1) {
      carouselSlide.style.transform = 'translateX(' + (posInitial + slideWidth) + 'px)'
      index--
    }
  }

  allowShift = false
}

const checkIndex = () => {
  carouselSlide.classList.remove('shifting')
  if (index == -1) {
    carouselSlide.style.transform = 'translateX(' + -(slidesLength * slideWidth) + 'px)'
    index = slidesLength - 1
  }
  if (index == slidesLength) {
    carouselSlide.style.transform = 'translateX(' + -(1 * slideWidth) + 'px)'
    index = 0
  }

  allowShift = true // 벗어나는거 막음 (안전코드)
}

// Mouse events
carouselSlide.onmousedown = dragStart

// Touch events
carouselSlide.addEventListener('touchstart', dragStart)
carouselSlide.addEventListener('touchmove', dragAction)
carouselSlide.addEventListener('touchend', dragEnd)

// Click events
prev.addEventListener('click', (e) => shiftSlide(-1))
next.addEventListener('click', (e) => shiftSlide(1))

// Transition events
carouselSlide.addEventListener('transitionend', checkIndex)
```

- carousel-slide를 left 속성으로 직접 이동시키는 방식이 아니라 transform과 translateX를 이용해 이동하는 것처럼 보이는 방식이라 offsetLeft 값을 가져올 수 없었습니다. 이를 해결하기 위해 이벤트가 발생하는 지점들을 계산하여 활용하고, 추가적으로 width와 index를 이용하여 이동시켰습니다.
- 연속으로 버튼을 누를 때 transition이 끝나기 전에 클릭이 되어 범위를 벗어나 의도치 않은 동작이 발생하는 경우가 있어, 이를 방지하기 위해 안전 코드인 allowShift를 추가하였습니다.

## 참고

[[Javascript] 캐러셀 슬라이더 2가지 예제](https://devdesigner.tistory.com/4)

[Infinite plain Javascript slider (click and touch events)](https://medium.com/@claudiaconceic/infinite-plain-javascript-slider-click-and-touch-events-540c8bd174f2)
