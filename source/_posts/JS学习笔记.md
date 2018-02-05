---
title: JS高级程序设计---笔记（1）
date: 2017-11-08
---
13年的时候写了一年的js业务逻辑代码，最近打算重操旧业，做web app相关的事情，所以计划用最短的时间把JS高级程序设计这本书系统的看一遍，博客主要用于记录阅读过程中重要的笔记。
## JS简介

### JS实现
一个完整的JS实现由 核心（ECMAScirpt）、文档对象模型（DOM）、浏览器对象模型（BOM）组成。

####ECMAScript
ECMAScript就是对实现ECMA标准的各个方面内容的语言的描述，JS实现了ECMAScript。

ECMA兼容
1、支持ECMA描述的所有类型、值、对象、属性、函数以及程序句法和语义；
2、支持Unicode字符标准；
3、兼容实现扩展：添加ECMA没有描述的类型、类、对象、属性、函数；支持ECMA没有定义的程序和正则表达式语法。

####DOM
文档对象模型是针对XML但经过扩展用于html的应用程序编程接口。DOM把整个页面映射为一个多层节点结构。

DOM级别
DOM1（主要是映射文档的结构）：由两个模块组成DOM Core和DOM html。DOM core规定如何映射XML文档结构，DOM html在DOM core上扩展，添加针对html的对象和方法。
DOM2（扩充事件、范围、编历迭代等细分模块，CSS支持）
新类型和新接口：DOM view（视图接口），DOM event（事件接口），DOM style（样式接口），DOM Traversal and Range（编历和操作文档树的接口）
DOM3：DOM load and save（文档加载和保存方法），DOM validation（DOM 验证）

####BOM
html5致力于把很多BOM功能写入正式规范。从根本上讲BOM只处理浏览器窗口和框架。习惯上把针对浏览器的JS操作也算作是BOM的一部分。包括：
1、弹出新浏览器窗口
2、移动、缩放、关闭窗口
3、提供浏览器详细信息
4、提供加载页面详细信息
5、提供显示器详细信息
6、对cookie的支持
7、XMLhttprequst等自定义对象

## 在html中使用JS
### <script>元素


转载请注明: http://jhyan.me/2017/08/19/OVS源码函数栈/
