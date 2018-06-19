---
title: Ecui框架在兼容Pointer事件过程中踩过的坑
date: 2018-06-09 17:14:10
tags:
---
最近组内在总结Ecui事件集中管理的一下思想和处理方式，在总结过程中我们对Ecui框架进行了拓展，增加了Ecui框架对Pointer事件的支持。在开发过程中踩了关于pointermove和pointercancel的两个坑。所以写下这篇文字记录下踩得坑和解决方案。

## Pointer事件简介
当前的web应用的Pointing设备除了鼠标还有触屏和电子笔，Pointer事件是一系列为pionting设备制定的DOM事件，现在在开发过程中针对于不同的设备有Touch事件有mouse事件，有的设备既支持touch又支持mouse，所以设计Pointer事件的主要目的是做一个标准的事件处理方式，可以兼顾mouse、touch和pen事件。Pointer事件是硬件无关的，对大多数的屏幕都支持。因为本篇不是对Pointer事件的介绍所以更加具体的内容可以参照[MDN Pointer事件](https://developer.mozilla.org/zh-CN/docs/Web/API/Pointer_events)。    
下面就说下在兼容Pointer事件过程中遇到的坑。

## 兼容Pointer事件遇到的坑
此次踩到的坑一个是在触屏的情况下drag或者move或者长按的时候，point会触发pointercancel事件，导致之后的pointer事件都失效；另一个是在开发过程中监管了原生的点击事件，比如使用了Ecui或者fastclick库，并且对Pointer事件的处理如果与Touch类似的时候在surface pro上触发的坑。

### pointercancel引起的坑
在我们对Ecui框架做Pointer事件的兼容过程中，发现在支持Touch事件和Pointer事件的浏览器和设备上，当触摸时间久一点，Pointer事件处理函数就不会被触发。究其原因发现使用Pointer事件的应用程序将在浏览器开始处理Touch手势时会收到一个pointercancel事件。
问题的解决方案是当触控事件发生在元素上时，不进行任何操作，即用到了css3的属性touch-action，将该属性设置为none，具体设置代码如下：
```css
.listview * {
    touch-action:none;
}
```
这样就可以使listview class所在元素全面支持pointer事件，此处在类名后添加‘\*’是因为touch-action不是继承属性，添加‘\*’是元素内部所有元素都可以支持pointer事件处理。
### pointermove引起的坑
踩到这个坑的主要的原因是对于同时兼容mouse与touch的设备，mouse相关事件无法确定是由touch行为产生的还是mouse行为产生的，所以需要pointer来统一二者的行为。在move事件触发的时候，是不容许有点击事件发生的，所以在触发move事件后就会禁止到点击事件，当然，点击事件也需要是框架或者事件库（如fastclick）对点击事件进行拦截和处理。fastclick在Vue项目中广为使用，但因为目前还没有对Pionter事件的拦截集中处理。此处可以看下fastclick对于touchmove事件的处理：
```js
FastClick.prototype.onTouchMove = function(event) {
  if (!this.trackingClick) {
    return true;
  }
  // If the touch has moved, cancel the click tracking
  if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
    this.trackingClick = false;
    this.targetElement = null;
  }
  return true;
};
```
可以看出fastclick对于touchmove事件的拦截处理过程中，如果判断是move的状态，则禁止了点击事件，targetElement设置为了null；targetElement是点击事件的目标元素，在fastclick中的定义和说明如下：
```js
/**
 * The element being tracked for a click.
 *
 * @type EventTarget
 */
this.targetElement = null;
```
发现的问题是如果设备既支持鼠标事件又支持触屏事件，Pointer设备上纯点击也可能会触发move，比如surface pro设备，添加了对pointmove的拦截处理后，就不会触发点击事件了，至少使用人的手指很难触发。原因在于pointer事件在于当手指按在触屏上时候，手指与屏幕接触面积会逐渐变大，从而被当成了pointermove事件，因此也不会触发click事件了。
问题在Ecui中的解决方案是：
```js
// Pointer设备上纯点击也可能会触发move
if ((Math.sqrt(track.speedX * track.speedX + track.speedY * track.speedY) > HIGH_SPEED) && isMobileMoved === false) {
    isMobileMoved = true;
}
```
此处做的判断是如果左右滑动和上下滑动的向量速度大于HIGH_SPEED（100)才算做是pointermove事件，对于速度的计算Ecui是通过pageX/pageY，和触发时间与当前时间来计算。这样在速度足够低的情况下就可以认为是点击事件。

### pointer-event穿透实现
穿透的实现跟pointer没关系，ie10以前是都不支持Pointer事件的，这部分内容是对事件的拓展。
在很多的B端项目中会需要用到穿透的效果来实现对下层元素事件的触发。比如公司组织结构节点移动，移动后下方元素的重新组合。
pointer-event是css3属性，设置pointer-events: none可以禁止设置元素的鼠标和触屏事件，这样就可以实现穿透效果。该属性在大部分IE之外的浏览器都支持，IE10以上（不包括IE10）也支持，但是对于低版本的IE该属性不支持，Ecui对低版本的IE做了特殊处理：
```js
            if (ieVersion <= 10) {
                var name = ieVersion < 9 ? 'filter' : 'content';
outer:          for (var caches = [], target = event.target, el; target; target = getElementFromEvent(event)) {
                    for (el = target;; el = dom.getParent(el)) {
                        if (!el) {
                            break outer;
                        }
                        var text = el.currentStyle[name];
                        if (text && text.indexOf('pointer-events:none') >= 0) {
                            caches.push([el, el.style.visibility]);
                            el.style.visibility = 'hidden';
                            break;
                        }
                    }
                }
                this.target = target;
                caches.forEach(function (item) {
                    item[0].style.visibility = item[1];
                });
            }
```
通过在设置元素的css属性来实现，对于小于IE9的版本设置filter属性，对于IE9和IE10的版本设置content属性，设置属性为pointer-events:none，并通过该属性来获得元素对象，通过设置visibility属性来暂时隐藏元素，从而实现穿透效果，触发穿透后的事件后，再显示出该元素。
选择filter和content是因为在IE6-IE8版本中filter中的无效滤镜不会工作，但值会被保留；在IE9-IE10版本中content需要配合::before和::after伪类才有意义，直接给element设置没有任何意义。而如果直接写IE不支持的css属性则会被IE浏览器忽略，通过filter和content变相实现了元素对象的获取。
在此处再介绍一个与文章主题关系不大的css的坑，也是在开发中发现的，height与line-height相等的情况下，部分PC浏览器可能盒子模型下的高度会是小数，我们的解决方案是建议line-height的取值比height小1。

## 总结
Pointer事件有很多的实用属性，可以检测手指按下的倾斜程度，可以检测手指的按压力度等。在Ecui拓展支持Pointer事件的过程中踩到了pointercancel和pointermove的两个坑，并且找到了问题的根源，解决了问题，实现了对Pointer事件的集中管理，也实现了穿透的效果。
