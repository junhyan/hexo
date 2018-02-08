---
title: JS高级程序设计---笔记（3）
date: 2017-12-15
---
本来打算在上一篇中就记录引用类型这一章节，可是在记录过程中发现完全可以把这一部分单独为一篇博客。JS的引用类型看上去有些像java的类，但不是相同的概念，面向对象的类有多重要，我觉得可以类比到JS

## 引用类型
引用类型的值（对象）是引用类型的一个实例。在ECMAScript中，引用类型是一种数据结构，用于将数据和功能组织在一起，通常被称为类。

### Object类型
目前看到的大多数的引用类型都是Object类型的实例。创建Object实例的方式有两种：
```js
var person = new Object()； //使用new操作符

var person = {}; //使用对象字面量语法

var person = {   //也是使用对象字面量语法
    name : "xxxx"， // name 可以写成 "name"
    age : 22        //不加逗号
}
```
对象字面量语法更加受开发人员青睐，代码少，封装感，而且对象字面量也是向函数传递大量可选参数的首选方式。例子：
```js
testFunction({
    name : "xxx",
    age : 23
});
```
一般来说，对象访问属性时使用点表示法，JS也可以使用方括号表示法来访问对象的属性，功能上来看，这两种方法没有任何区别，但是使用方括号的主要优点在于，可以通过变量来访问属性。对于可能造成语法错误的的字符或关键字和保留字，可以使用方括号的方式解决。例如：
```js
var key = "xxx";
person[key]; //通过变量访问属性

person["xxx xxx"]; //带有空格的对象属性，使用方括号获取。
```

### Array类型
创建Array对象也有两种方式，第一种是使用Array构造函数，示例代码如下：
```js
var colors =  new Array();
var colors =  new Array(20);
var colors =  new Array("red", "green", "grey");
var colors =  Array("red", "green", "grey"); //省略new
```
第二种基本方式是使用数组字面量表示法：示例代码如下：
```js
var colors =  [] //空数组
var colors =  ["red", "green", "grey"];
```
数组的length属性很有特点，它不是只读的，可以通过设置这个属性，从数组的末尾移除项或者向数组添加新项。利用length属性方便在末尾添加新项。
```js
var colors =  ["red", "green", "grey"];
colors.length = 2;
alert(colors[2]); //undefined

colors[colors.length] = "white";
colors[colors.length] = "blue";
```

#### 检测数组
对于一个数组或者一个全局作用域而言，使用instanceof操作就能得到满意的结果，但如果又多个全局作用域的话可能存在不同的Array构造函数。
所有ECMAScript提供的Array.isArray()方法。用来判断引用对象是不是数组。

#### 栈方法
```js
var colors = new Array();
var count = colors.push("red", "blue"); //count = 2

var item = colors.pop()
```

#### 队列方法
```js
var colors = new Array();
var count = colors.push("red", "blue"); //count = 2

var item = colors.shift()
```

#### 重排序方法
数组已经又两个直接用来重排序的方法：reverse（）和sort（）。
reverse（）方法会反转数组项的顺序。
sort（）默认为升序排序，而且比较的都是字符串，即使是数字也会调用toString（）方法后进行字符串的比较。
但这种方法在多数情况下不是最佳方案，所以sort（）函数可以接收一个比较函数作为参数。

#### 操作方法
数组的concat（）方法基于现在的数组创建一个新的数组，是原来数组的一个副本，有独立的内存空间，其参数是要在新的数组中添加的项，参数可以是一个项或者是一个数组，concat（）方法都会把这些一一加入到副本数组中。
数组的slice（）方法是基于现在数组分割出一个子数组，子数组有独立的内存空间。可以有一个或两个参数，一个参数的情况下，返回从该项到结尾的所有项，如果是两个参数，则返回起始项到结束位置的前一项，不包括结束位置的项。因为是独立的新的内存空间，所有slice（）不会影响原数组内容。
数组的pslice（）方法是个功能很强大的方法。具体包括：
删除：指定2个参数：1、要删除的第一项的位置； 2、要删除的项数。
插入：指定3+个参数：1、其实位置； 2、0（因为是插入所以要删除的项数设为0）； 3、要插入的项。
替换：指定3+个参数：1、其实位置； 2、要删除的项数； 3、要插入的项。

#### 位置方法
数组实例包含两个位置方法 indexOf（）和lastIndexOf（），这两个方法都接收两个参数，1、要查找的项，2、（可选）查找起点位置的索引。其中indexOf（）是从index小到大搜索，lastIndexOf（）是从大到小搜索。

#### 迭代方法
迭代方法包括every（），filter（）， forEach（），map（），some（），每个方法接收两个参数：1、每一项上运行的函数，2、（可选）该函数的作用域。传入的函数会接收三个参数：1、数组项的值， 2、该项在数组中的位置， 3、数组对象。
```js
numbers.forEach(function(item, index, array){
    ...
});
```

### Date类型
new Date（）获取当前时间。

### RegExp类型
ECMAScript通过RegExp类型来支持正则表达式。
```js
var expression = / pattern / flags;
```
pattern部分是正则表达式，每个正则表达式都可带一个或多个flags，支持的flags有：
g：全局模式，匹配到第一个后会继续匹配； 
i：不区分大小写；
m：多行模式，一行匹配不到，会在下一行继续匹配。

#### RegExp实例属性
global：boolen，是否设置g flag。
ignoreCase：boolen， 是否设置i flag
lastIndex： int， 搜索下一个匹配项的字符位置
multiline： boolen， 是否设置m flag
source：string， 返回正则表达式的字符串

#### RegExp实例方法
RegExp对象的主要方法是exec（），接收一个参数即要使用pattern的字符串。返回包含第一个匹配项信息的数组，没有匹配项返回null。如果加了g标签，每次执行exec（）都会匹配字符串中的下一个匹配项。
```js
var matches = pattern.exec(str);
```

#### RegExp构造函数属性
input（$_）:最近一次要匹配的字符串
lastMatch（$&）:最近一次匹配项
lastParen（$+）：最近一次匹配的捕获组
leftContex（$`）：input字符串中lastMatch之前的文本
multiline（$*）：boolen，是否所有表达式都使用多行模式
rightContext（$'）：input字符串中lastMatch之后的文本

### Function类型
ECMAScript中的函数实际上是对象，每个函数都是Function类型的实例，而且都与其他引用类型一样具有属性和方法。函数名实际是一个指向函数对象的指针，不会与某个函数绑定。

#### 函数的定义
```js
function xxx (...) {
    return ...;
}

var xxx = function(...){
    return ...;
}; //有分号

//使用构造函数定义函数， 不推荐，会导致两次解析代码
var xxx = new Function ("..", "..", "return ..");
```
JS函数没有重载，1、参数是数组，2、函数名是引用，函数名相同时候，后执行的会覆盖之前执行的内容。

#### 杂记
解释器在向执行环境中加载数据时，对函数的声明和函数表达式并非一视同仁，解释器会先度曲函数声明，并使其在执行任何代码前可用，函数表达式要等到解释器执行到他所在的代码行时才会被解释执行。
在代码执行之前，解析器就已经通过一个名为函数声明提升的过程，将声明添加到执行环境中，js引擎第一遍会声明函数并把他们放在源代码顶部。

函数内部有两个特殊对象，arguments和this，arguments有一个叫做callee的属性，该属性是个指针，指向拥有该arguments对象的函数。
this和java中的this类似，this引用的是函数据以执行的环境对象。
caller对象保存这调用当前函数的函数引用。（arguments.callee.caller可以实现低耦合）

#### 函数属性和方法
函数本身是对象，所以函数有属性和方法，每个函数都包含length和prototype两个属性，length表示函数希望接收到的参数的个数。
prototype是保存引用类型所有实例方法的真正所在，例如toString（）、valueOf（）等方法都保存在prototype名下。prototype属性不可以枚举。
每个函数都包含两个非继承而来的方法，apply（）和call（），作用都是在特定的作用域中调用函数，apply有两个参数一个是要在其内运行的作用域，一个是参数，可以是arguments对象或者数组，call与apply类似，但所call的参数需要都列出来。使用call和apply扩充作用域的最大好处就是对象不需要与方法有任何耦合关系。

### 基本包装类型
 

### 


转载请注明: http://jhyan.me/2017/12/15/JS高级程序设计---笔记（3）/
