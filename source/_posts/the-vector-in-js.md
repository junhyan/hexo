---
title: JS中的各种宽高
date: 2018-06-19 10:48:23
tags:
---
在研究前端各种框架的时候，总会遇到一些宽高和定位的代码，在这里做一个总计，也方便以后查看。

## Dom对象的宽高
dom对象会涉及到宽高，和定位的问题，对于可以滚动的dom对象，还会涉及到隐藏的部分。

### client
clientWidth和clientHeight是元素的可视部分宽度和高度，即padding+content，如果没有滚动条，即为元素设定的高度和宽度，如果出现滚动条，那么该属性就是其本来宽高减去滚动条的宽高。
clientTop和clientLeft是元素的外层boarder的上方和左侧的宽度。

### offset
offsetWidth和offsetHeight是元素的border+padding+content，是元素的整体的宽高，即使存在滚动条也会将其计算在内。
offsetParent指的是当前元素的离自己最近的具有定位的父级元素，如果找不到定位元素那该元素就是body元素，offsetTop和offsetLeft是相对于offsetParent的上边距和左边距。

### scroll
scrollHeight和scrollWidth是当元素内部的内容超出其宽度和高度的时候，元素内部内容的实际宽度和高度，是显示的高度/宽度和隐藏的高度/宽度的和，需要注意的是，当元素其中内容没有超过其高度或者宽度的时候，该属性是取不到的。
scrollTop和scrollLeft是隐藏部分的高度和宽度。另一种理解方式，是当前的scroll显示的部分距离scroll的dom的top/left的上边距/左边距。

## event对象
在事件发生时，为事件的处理函数提供了event对象，该对象中包含了事件发生相关的位置信息。

### client
cientX与clientY是事件发生的时相对于浏览器的左上角（0，0）的位置。

### screen
screenX与screenY是事件发生时候相对于设备屏幕左上角（0，0）的位置。

### offset
offsetX与offsetY是相对于当前元素的左上角的位置。该属性firefox不支持，类似的属性是 layerX和layerY。

### page
pageX与pageY是相对于页面左上角的位置，当没有发生scroll的时候，这两个值与clientX与clientY的值相同，当发生了scroll，这两个值会包含隐藏部分的距离，所以会大于clientX与clientY。

## 总结
本文主要记录一些与位置有关的属性，方便之后再工作和学习中查阅，记录下来也加深记忆。
