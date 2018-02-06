---
title: JS高级程序设计---笔记（1）
date: 2017-12-08
---
最近打算重操旧业，做web app相关的事情，所以计划用最短的时间把JS高级程序设计这本书系统的看一遍，博客主要用于记录阅读过程中重要的笔记。
## JS简介

### JS实现
一个完整的JS实现由 核心（ECMAScirpt）、文档对象模型（DOM）、浏览器对象模型（BOM）组成。

ECMAScript
ECMAScript就是对实现ECMA标准的各个方面内容的语言的描述，JS实现了ECMAScript。

ECMA兼容
1、支持ECMA描述的所有类型、值、对象、属性、函数以及程序句法和语义；
2、支持Unicode字符标准；
3、兼容实现扩展：添加ECMA没有描述的类型、类、对象、属性、函数；支持ECMA没有定义的程序和正则表达式语法。

DOM
文档对象模型是针对XML但经过扩展用于html的应用程序编程接口。DOM把整个页面映射为一个多层节点结构。

DOM级别
DOM1（主要是映射文档的结构）：由两个模块组成DOM Core和DOM html。DOM core规定如何映射XML文档结构，DOM html在DOM core上扩展，添加针对html的对象和方法。
DOM2（扩充事件、范围、编历迭代等细分模块，CSS支持）
新类型和新接口：DOM view（视图接口），DOM event（事件接口），DOM style（样式接口），DOM Traversal and Range（编历和操作文档树的接口）
DOM3：DOM load and save（文档加载和保存方法），DOM validation（DOM 验证）

BOM
html5致力于把很多BOM功能写入正式规范。从根本上讲BOM只处理浏览器窗口和框架。习惯上把针对浏览器的JS操作也算作是BOM的一部分。包括：
1、弹出新浏览器窗口
2、移动、缩放、关闭窗口
3、提供浏览器详细信息
4、提供加载页面详细信息
5、提供显示器详细信息
6、对cookie的支持
7、XMLhttprequst等自定义对象

## 在html中使用JS

### &lt;script&gt;
元素属性：async（可选），charset（可选），defer（可选），src（可选），type（可选）。
考虑到最大限度的兼容浏览器，目前type属性的值依旧是text/javascript（default）。
在元素内部的代码被从上至下依次解释。
<font color=red>在带有src属性的&lt;script&gt;元素不应该在&lt;script&gt;和&lt;/script&gt;标签之间再出现额外的JS代码。如果包含了则嵌入的代码会被忽略。</font>
src属性也可以包含来自外域的js文件。

&lt;script&gt;标签位置
惯例放在head中，放在head中意味着等到全部的js代码加载解释和执行完成以后，才能呈现页面body内容。这样会导致页面呈现出现延迟。延迟期间窗口出现一片空白。
<font color=green>现代web程序一般把全部js引用放在body元素中页面内容的后面。</font>

延迟脚本（defer）和异步脚本（async）
部分浏览器支持延迟脚本，即在页面内容加载后执行js脚本，在现实中延迟脚本并不一定按照顺序执行。在html中明确规定defer属性只能用于外部脚本。
异步脚本同样部分浏览器支持，只适用于外部脚本，异步脚本加载期间建议不要修改DOM，异步脚本一定会在页面load事件前执行，但可能会在DOMContentLoad事件触发前或者触发后执行。

### 嵌入代码与外部文件
在html中嵌入js没有什么问题，但一般最好还是使用外部文件，但不存在硬性要求。使用外部文件一般有可维护性、可缓存、适应未来的有点。

### &lt;noscript&gt;
用于对于不支持js的浏览器实现平稳的退化，&lt;noscript&gt;的元素包含的内容只有在浏览器不支持脚本或者支持脚本但脚本被禁用的情况下才会显示

## 基本概念

### 语法
该部分很多与其他语言相通，在这里只记录了一些有代表性的内容或者特性。

杂记
标识符的字母可以是扩展的ASCII或unicode字母字符。
严格模式下不确定的行为将得到处理，对某些不安全的操作抛出错误。启动严格模式："use script"（是一个编译指令pragma）。
ECMAScript的变量是松散类型的，可以保存任何类型的数据，变量仅仅是用于保存内容的占位符。
<font color=green>不带var的变量在函数中也是全局变量。</font>

关键字
break&nbsp;&nbsp;&nbsp;do&nbsp;&nbsp;&nbsp;instanceof&nbsp;&nbsp;&nbsp;typeof&nbsp;&nbsp;&nbsp;case
else&nbsp;&nbsp;&nbsp;&nbsp;new&nbsp;&nbsp;debugger*&nbsp;&nbsp;&nbsp;&nbsp;catch&nbsp;&nbsp;&nbsp;&nbsp;finally
return&nbsp;&nbsp;void&nbsp;continue&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;switch
while&nbsp;&nbsp;&nbsp;var&nbsp;&nbsp;function&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;with
default&nbsp;if&nbsp;&nbsp;&nbsp;throw&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;delete&nbsp;&nbsp;&nbsp;in&nbsp;&nbsp;try

保留字
最大程度的保留字，实现最大限度兼容
abstract	enum	int	short
boolean	export	interface	static
byte	extends	long	super
char	final	native	synchronized
class	float	package	throws
const	goto	private	transient
debugger	implements	protected	volatile
double	import	public let yield 

### 数据类型
typeof变量可能的返回值为：
"undefined"
"boolen"
"string"
"number"
"object"
"function"
从返回的值中可以清楚的知道变量的数据类型。
对未初始化和未声明的变量执行typeof都返回undefined。
null类型只有一个特殊值null，typeof null返回object。
boolen true不一定等于1，false不一定等于0。区分大小写
最大数Number.MAX_VALUE,最小数Number.MIN_VALUE,超出最大或最小转换成特殊的Infinity值
NaN（not a number）是一个特殊number，表示一个本来要返回数值的操作数未返回数值的情况（这样做不会抛出错误），所以在js中除以0不会导致错误二是返回NaN，不影响其他代码执行。
涉及NaN的操作都返回NaN，NaN不与任何值相等，包括NaN本身。

数值转换Number()
true-1 false-0
null-0
undefined-NaN
字符串：
普通和c类似的不赘述
"0xf"十六进制返回十进制 15
空字符串""-0
其他-NaN
对象转换调用valueOf（）

数值转换parseInt（）
其他与Number（）类似，但对于空字符串""-NaN
也可以指定基数，按基数的类型进行解析，如果没有基数，默认返回10进制。

字符串类型string单双引号都可以指定。

js的操作符可以用于字符串、数字、boolen、对象，在应用对象时，一般都调用对象的valueOf或toString方法。
非数值应用位操作符会先使用Number（）函数将该值转换成一个数值。
有符号右移>>（两个大于号），无符号右移>>>（三个大于号）。

字符串与数字进行比较时候，先把字符串转换数组，然后进行比较。
任何数值与NaN比较都会返回false。

相等操作符==可以比较不同类型的，转换后相等，===比较相同类型的，不同类型的返回false

### 语句
if、do while、while、for、switch语句基本与c相同
for-in是精确迭代语句，可以用来枚举对象的属性
label与c也类似
break与continue也类似，但可以结合label使用
with语句的作用是将代码的作用域设置到一个特定的对象中。

### 函数
JS函数不介意传递进来多少个参数，也不在乎传递进来的参数类型。原因在于ECMAScript中的参数在内部使用一个数组表示。函数内可以通过arguments对象（并不是Array的实例）来访问这个参数数组。
因此JS中的函数不能重载，因为没有意义。


转载请注明: http://jhyan.me/2017/12/08/JS高级程序设计---笔记（1）/
