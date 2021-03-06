---
title: js常用继承总结
date: 2018-10-15 15:22:44
tags:
---
看了很多次js的继承实现方式，但是隔一段时间总忘。写一篇博客做个笔记。
一般的OO语言都支持接口继承和实现继承，js中没有接口继承，实现继承的方式有：原型链方式实现继承（不足：原型链会共享，不能向父类型传递参数），借用构造函数 （使用superClass.call(this) 函数复用性不足），组合继承，原型式继承，寄生式继承，寄生组合式继承。
### 原型简介
js中的原型是一个很有意思的东西，js中的每个函数都有prototype属性，这个属性是一个指针，指向了一个对象，称呼它为原型对象。原型对象里包含了原型所属类型的所有实例共享的成员属性和方法。原型对象中的属性和方法可以用于所有的该类型的实例对象共享。
顺便提一个原型对象的问题，原型对象是共享的，所以对于方法和基本类型的值比较方便，但是对于引用类型的值就存在很大的问题，使用一个示例来说明：
```js
function Cup () {

}
Cup.prototype.color = ['red','blue'];

var cup1 = new Cup();
var cup2 = new Cup();
cup1.color.push('white');
console.log(cup1.color); //["red", "blue", "white"]
console.log(cup2.color); //["red", "blue", "white"]
```
因为是共享的引用类型属性，所以即使没有操作cup2的color属性，他的color也添加了'white'。所以较为常用的创建类型方式是通过构造函数来定义实例属性，使用原型对象来定义共享的方法和属性。
### 原型链实现继承
#### 实现
原型链继承是js继承实现的主要方法，基本思想就是使用原型让一个引用类型继承另一个应用类型的属性和方法。先来一段代码：
```js
function Parent() {
    this.name = '老张';
}
Parent.prototype.showName = function () {
    console.log(this.name);
}
function Child() {
    this.name = '小张';
}
Child.prototype = new Parent();
var instance = new Child();
instance.showName(); // 小张
```
上面的代码就是原型链继承的常见的实现方式，Child通过设置他的原型为Parent的对象实现了对Parent类型的继承，因为在Child中重写了对象的name，所以输出结果为"小张"。上面代码的原型链如下图：
![](protolink.png)
先简单介绍一个概念_proto_属性，每个js对象都有一个这样的隐形原型，这个属性指向创建该对象的函数的prototype（待确认，但是===判断是相同的）。_proto_又有它的_proto_属性，这样就形成了一个原型链。在调用instance.showName()的时候先找实例中有没有改方法，如果没有，找Child.prototype中是否有该共享方法，如果还是没有，找Parent.prototype中是否有该共享方法。
#### 问题
原型链继承的问题在于包含引用类型的原型，具体原因就是之前prototype的问题。第二个问题在于没有办法在不影响所有实例的情况下给父类的构造函数传递参数。如果想传递参数给父类结构体，则子类的原型对象会影响到所有共享该对象的子类对象。

### 构造函数继承
构造函数的继承也叫经典继承，这种继承方式的基本思想就是在子类的构造函数内部调用父类的构造函数。通过call()和apply()在新对象中调用父类的构造函数。具体实现如下：
```js
function Parent() {
    this.color = ['black'];
}
function Child() {
    Parent.call(this);
}
var instance1 = new Child();
instance1.color.push('white');
var instance2 = new Child();
instance2.color.push('red');
console.log(instance1.color); // ['black', 'white']
console.log(instance2.color); // ['black', 'red']
```
采用这种继承方式解决了原型继承所带来的引用类型共享带来的问题，但是函数都的在构造函数中定义，就实现不了函数的复用了。

### 组合继承
鉴于原型继承和构造函数继承的优势和不足之处，通过两种继承方式的组合来扬长避短。基本思想就是使用原型链实现对原型属性和方法的继承，使用构造函数继承实现对实例属性的继承。组合继承的实现方式如下：
```js
function Parent(name) {
    this.name = name;
    this.color = ['black'];
}
Parent.prototype.showName = function () {
    console.log(this.name);
}
function Child(name) {
    Parent.call(this, name);
}
Child.prototype = new Parent();
var instance1 = new Child('小张');
instance1.color.push('white');
var instance2 = new Child('小匣子');
instance2.color.push('red');
console.log(instance1.color); // ['black', 'white']
console.log(instance2.color); // ['black', 'red']
instance1.showName() // '小张'
instance2.showName() // '小匣子'
```
组合继承是js最为常用的继承方式。但也有不足之处，就是继承都会调用两次父类的构造函数。

原型式继承、寄生式继承和寄生组合式继承在这里不做进一步介绍，但是就目前来说，寄生组合式继承应该是比较完善的继承方式。