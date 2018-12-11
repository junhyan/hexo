---
title: js 数组各方法的实现
date: 2018-12-03
tags:
---
总结下数组的各个方法的原生实现，逐渐积累。

### copyWithin()
```js
Array.prototype.copyWithin = function(target, start/*, end*/) {
    // Steps 1-2.
    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    var O = Object(this);

    // Steps 3-5.
    var len = O.length >>> 0;

    // Steps 6-8.
    var relativeTarget = target >> 0;

    var to = relativeTarget < 0 ?
      Math.max(len + relativeTarget, 0) :
      Math.min(relativeTarget, len);

    // Steps 9-11.
    var relativeStart = start >> 0;

    var from = relativeStart < 0 ?
      Math.max(len + relativeStart, 0) :
      Math.min(relativeStart, len);

    // Steps 12-14.
    var end = arguments[2];
    var relativeEnd = end === undefined ? len : end >> 0;

    var final = relativeEnd < 0 ?
      Math.max(len + relativeEnd, 0) :
      Math.min(relativeEnd, len);

    // Step 15.
    var count = Math.min(final - from, len - to);

    // Steps 16-17.
    var direction = 1;

    if (from < to && to < (from + count)) {
      direction = -1;
      from += count - 1;
      to += count - 1;
    }

    // Step 18.
    while (count > 0) {
      if (from in O) {
        O[to] = O[from];
      } else {
        delete O[to];
      }

      from += direction;
      to += direction;
      count--;
    }

    // Step 19.
    return O;
};
```
### isArray
```js
Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};
```
### forEach
```js
Array.prototype.forEach = function (callbackfn, thisArg) {
    for (var i = 0, len = this.length; i < len; i++) {
        callbackfn.call(thisArg, this[i], i, this);
    }
};
```
### map
```js
Array.prototype.map = function (callbackfn, thisArg) {
    var ret = [];
    for (var i = 0, len = this.length; i < len; i++) {
        ret.push(callbackfn.call(thisArg, this[i], i, this));
    }
    return ret;
};
```
### filter
```js
Array.prototype.filter = function (callbackfn, thisArg) {
    var ret = [];
    for (var i = 0, len = this.length; i < len; i++) {
        if (callbackfn.call(thisArg, this[i], i, this)) {
            ret.push(this[i]);
        }
    }
    return ret;
};
```
### some
```js
Array.prototype.some = function (callbackfn, thisArg) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (callbackfn.call(thisArg, this[i], i, this)) {
            return true;
        }
    }
    return false;
};
```
### every
```js
Array.prototype.every = function (callbackfn, thisArg) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (!callbackfn.call(thisArg, this[i], i, this)) {
            return false;
        }
    }
    return true;
};

```
### indexOf
```js
Array.prototype.indexOf = function (searchElement, fromIndex) {
    for (var i = fromIndex ? Math.max(fromIndex, 0) : 0, len = this.length; i < len; i++) {
        if (this[i] === searchElement) {
            return i;
        }
    }
    return -1;
};
```
### lastIndexOf
```js
Array.prototype.lastIndexOf = function (searchElement, fromIndex) {
    for (var i = fromIndex !== undefined ? Math.min(fromIndex, this.length - 1) : this.length - 1; i >= 0; i--) {
        if (this[i] === searchElement) {
            return i;
        }
    }
    return -1;
};
```
### reduce
```js
Array.prototype.reduce = function (callbackfn, initialValue) {
    var i = 0,
        len = this.length;

    if (initialValue === undefined) {
        initialValue = this[i++];
    }

    for (; i < len; i++) {
        initialValue = callbackfn(initialValue, this[i], i, this);
    }
    return initialValue;
};
```
### reduceRight
```js
Array.prototype.reduceRight = function (callbackfn, initialValue) {
    var len = this.length,
        i = len;

    if (initialValue === undefined) {
        initialValue = this[--i];
    }
    for (; i--; ) {
        initialValue = callbackfn(initialValue, this[i], i, this);
    }
    return initialValue;
};
```
