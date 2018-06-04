---
title: ECUI前端框架之控件
date: 2018-03-08
---
core init属性函数中调用了initEnvironment方法中var options = core.getOptions(document.body, 'data-ecui') || {}; 如果不是data-ecui，在init中var list = dom.getAttribute(el, ecuiName) ? [el] : []，其中ecuiName = 'ui'。list.push(item)便利所有带有ui:的都加入到list，然后
list.forEach(function (item) {

  对每个list中的元素进行便利，options = core.getOptions(item)，获得ui的option属性，比如id，type等。options.type.indexOf('.')，options.type是控件的类型通过util.toCamelCase(options.type.charAt(0).toUpperCase() + options.type.slice(1))，toCamelCase方法将 xxx-xxx 字符串转换成 xxxXxx。controls.push({object: core.$create(item, options), options: options});把item对应的控件加入到controls中。
  在core.$create设置uid：options.uid = 'ecui-' + (++uniqueIndex); 设置控件class：el.className = className = el.className + ' ' + primary + UIClass.CLASS;  var control = new UIClass(el, options);调用控件的构造函数。传递给控件el和options。
  控件对象创建后的处理oncreate(control, options); allControls.push(control);namedControls[options.id] = control; control.$ID = options.id;

  independentControls.push(control); ？？？？
  // 处理所有的委托操作，参见delegate ？？？？
  




}




转载请注明: http://jhyan.me/2017/12/08/JS高级程序设计---笔记（1）/
