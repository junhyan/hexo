---
title: Vue原理分析和实现
date: 2018-06-04 14:41:23
tags:
---
搞了很长时间的公司内部的前端框架ECUI，ECUI是一个相对较老的框架，在公司期间也使用Vue进行过H5得开发，抽出空来研究下Vue的实现原理，并且读两个框架做一些比较，如果可以，结合两个框架的优点，实现一个新的轻量级框架。

## 源码
Vm就是vue对象
resolveConstructorOptions
mergeOptions
initProxy 与initGlobalA都会调用initMixin
