---
title: js设备识别
date: 2018-11-10
tags:
---
随着H5协议的普及，js的使用也越来也广泛，随之而来的就是需要适配的设备越来越多，这篇文章就介绍一下在我们ecui框架中对设备的识别。

## 设备识别

用来判断是不是点击设备：
```js
isToucher = document.ontouchstart !== undefined
```

用来判断是不是webkit浏览器：
```js
isWebkit = /webkit/i.test(navigator.userAgent)
```

用来判断是不是ios：
```js
iosVersion = /(iPhone|iPad).+OS (\d+)/i.test(navigator.userAgent) ?  +(RegExp.$2) : undefined
```

用来判断是不是uc浏览器：
```js
isUCBrowser = /ucbrowser/i.test(navigator.userAgent)
```

用来判断是不是chrome浏览器及其版本号：
```js
chromeVersion = /(Chrome|CriOS)\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$2 : undefined
```

用来判断是不是ie浏览器及其版本号：
```js
ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined
```

用来判断是不是Firefox浏览器及其版本号：
```js
firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined
```

用来判断是不是Opera浏览器及其版本号：
```js
operaVersion = /opera\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined
```

用来判断是不是safari浏览器及其版本号：
```js
safariVersion = !chromeVersion && !isUCBrowser && /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) ? +RegExp.$1 : undefined
```

用来判断是不是app内嵌webview：
```js
isWebview = iosVersion && !chromeVersion && !isUCBrowser ? !/\)\s*Version\//.test(navigator.userAgent) : /\)\s*Version\//.test(navigator.userAgent);
```