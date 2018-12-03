---
title: js ajax的点点滴滴
date: 2018-11-14
tags:
---
在项目开发中必不可少的会用到各种各样的请求，现在现成的库把各个类型的请求已经封装的很好了，但基本上都是对原生ajax请求的封装。所以抽空复习下js原生的ajax，探索下之前不知道的点点滴滴。

### 什么是ajax
ajax是Asynchornous JavaScript + XML的缩写，这项技术可以向服务器请求额外的数据而无需卸载页面（js高级程序设计中的定义） 

### XHR（XMLHttpRequest）对象
对于ie7以下的xhr对象需要做兼容，但ie7以上的浏览器就直接使用原生xhr对象可以，所以本文不对兼容做更多的说明。   
创建一个XHR对象
```js
var xhr = new XMLHttpRequest();
```
文章从XHR的api、状态等方面进行介绍。 
#### XHR对象API
列举一些在请求过程中经常使用到的api。
##### xhr.open()
xhr.open()是使用xhr对象时候调用的第一个方法，调用open()方法并不会发送请求，只是启动一个请求，以备发送。xhr.open()接受三个参数：第一个是请求的类型（post，get，put等），第二个参数是请求的url，第三个参数是请求是否为异步请求（true：异步请求，false：同步请求）；
##### xhr.send()
xhr.send()是将open创建的备用请求发送出去。xhr.send()接受一个参数：data（请求主体发送的数据）。如果不需要请求主体，比如发送get请求，则需要把参数设置成null，因为这个参数对有些浏览器是必须的。    
如果是同步请求，则在调用send()后，xhr.responseText是返回的主体文本，xhr.status是返回的状态一般状态在200为正常请求状态，304表示数据没有变化，直接从浏览器缓存中获取，也有些浏览器会返回204，而且ie使用ActiveX插件会返回1223。其他状态一般视为不正常的返回状态。不要信赖xhr.statusText，不同浏览器中该值可能存在差异，不是一个可靠的判断依据。   
如果是异步请求，则需要根据xhr.readyState来判断当前的请求状态，xhr.readyState代码对应的状态如下：
>0：没有初始化，还没有调用open()方法
>1：已经调用open()方法，但是还没有调用send()方法
>2：已经调用send()方法，但是还未收到相应
>3：正在接收相应，但是还没有接收全
>4：已经接收到了所有的响应数据，并且客户端可以使用这些数据了
只要readyState的值发生变化就会触发readystatechange事件，可以通过该事件监控异步请求状态的变化，其实对于客户端来说真正关心的是readyState为4的时候，此时客户端可以根据拿到的数据做调用对应的回调函数，做进一步处理。
##### xhr.abort()
xhr.abort()是客户端主动放弃请求的方法，调用该方法后放弃请求，并且放弃监控请求状态变化。因为内存缘故，不建议重用xhr，设置xhr = null。
##### xhr.setRequestHeader()
xhr.setRequestHeader()用于自定义请求头部信息，xhr.setRequestHeader()接受两个参数：请求头部字段，和请求头部字段对应的值。
##### xhr.getResponseHeader()
xhr.getResponseHeader()方法用于获得响应头部的信息，xhr.getResponseHeader()接受一个参数：响应头部字段名称。
##### xhr.getAllResponseHeaders()
xhr.getAllResponseHeaders()方法用于获取响应头部的所有信息。

### FormData
formData常用的一项功能就是将表单的数据序列化，为序列化表单和创建与表单相同格式的数据提供里便利。
```js
var data = new FormData(document.forms[0]); // 序列化form表单
data.append('age', '20'); //创建于form相同个数的数据。
xhr.send(data);
```

### ecui中的ajax
ecui框架实现了自己的ajax，ecui框架做了对ie7以下版本的兼容。具体的请求对该ajax进行的二次封装。
```js
io.ajax =  function (url, options) {
    function stateChangeHandler() {
        if (xhr.readyState === 4) {
            try {
                var status = xhr.status;
            } catch (ignore) {
                // 在请求时，如果网络中断，Firefox会无法取得status
            }

            if ((status >= 200 && status < 300) || status === 304 || status === 1223) {
                if (options.onsuccess) {
                    options.onsuccess(xhr.responseText, xhr);
                }
            } else {
                onerror(xhr);
            }

            /*
                * NOTE: Testing discovered that for some bizarre reason, on Mozilla, the
                * JavaScript <code>XmlHttpRequest.onreadystatechange</code> handler
                * function maybe still be called after it is deleted. The theory is that the
                * callback is cached somewhere. Setting it to null or an empty function does
                * seem to work properly, though.
                *
                * On IE, there are two problems: Setting onreadystatechange to null (as
                * opposed to an empty function) sometimes throws an exception. With
                * particular (rare) versions of jscript.dll, setting onreadystatechange from
                * within onreadystatechange causes a crash. Setting it from within a timeout
                * fixes this bug (see issue 1610).
                *
                * End result: *always* set onreadystatechange to an empty function (never to
                * null). Never set onreadystatechange from within onreadystatechange (always
                * in a setTimeout()).
                */
            util.timer(
                function () {
                    xhr.onreadystatechange = util.blank;
                    xhr = null;
                }
            );

            if (stop) {
                stop();
            }
        }
    }

    options = options || {};

    var data = options.data || '',
        async = options.async !== false,
        method = (options.method || 'GET').toUpperCase(),
        headers = options.headers || {},
        onerror = options.onerror || util.blank,
        stop,
        xhr;

    try {
        if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject('Msxml2.XMLHTTP');
            } catch (e) {
                xhr = new ActiveXObject('Microsoft.XMLHTTP');
            }
        } else {
            xhr = new XMLHttpRequest();
        }

        if (options.onupload && xhr.upload) {
            xhr.upload.onprogress = options.onupload;
        }

        if (method === 'GET') {
            if (data) {
                url += (url.indexOf('?') >= 0 ? '&' : '?') + data;
                data = null;
            }
            if (!options.cache) {
                url += (url.indexOf('?') >= 0 ? '&' : '?') + 'b' + Date.now() + '=1';
            }
        }

        xhr.open(method, url, async);

        if (async) {
            xhr.onreadystatechange = stateChangeHandler;
        }

        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }

        if (options.timeout) {
            stop = util.timer(
                function () {
                    xhr.onreadystatechange = util.blank;
                    xhr.abort();
                    onerror(xhr);
                    xhr = null;
                },
                options.timeout
            );
        }
        xhr.send(data);

        if (!async) {
            stateChangeHandler();
        }
    } catch (e) {
        onerror(xhr);
    }
}
```

涉及请求就会有跨域相关的操作，该部分内容会单独作为一篇文章分享。