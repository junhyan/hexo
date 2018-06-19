---
title: ECUI前端框架之路由
date: 2018-03-04
---
笔记，请忽略

## 请忽略
esr.load

dom.ready(function () {
    if (esr.onready) {
        callRoute(esr.onready());
    } else {
        init();
    }
});

如果index中有route即有esr.onready，执行这个路由callRoute，如果没有，则直接init（）
init();
window.onhashchange = listener;设置当url的锚变化时候执行listener处理函数
esr.redirect(esr.getLocation()); listener调用redirect，重新渲染页面

redirect中的一些处理先忽略，不仔细分析，是一些cache的操作，最后是会调用callRoute
callRoute渲染新路由，如果有路由esr.render(route)，
具体会做一下判断：
if (!route.model) {
    esr.render(route);
} else if ('function' === typeof route.model) {
    if (route.model(context, function () {
            esr.render(route);
        }) !== false) {
        esr.render(route);
    }
} else if (!route.model.length) {
    esr.render(route);
} else {
    if (route.onbeforerequest) {
        route.onbeforerequest(context);
    }
    esr.request(route.model, function () {
        esr.render(route);
    });
    if (route.onafterrequest) {
        route.onafterrequest(context);
    }
}
当model为空，或者model没有数据的时候，直接渲染。但model是function的时候执行route model函数。
当model请求存在，如果定义了onbeforerequest，执行该函数，执行esr.request函数请求数据，如果定义了
onafterrequest，则执行该函数。

但如果找不到路由，则会加载
io.loadScript(
    moduleName + '/' + moduleName + '.js',
    function () {
        pauseStatus = false;
        callRoute(name, options);
    },
    {
        cache: true,
        onerror: function () {
            // 其他浏览器失败
            pauseStatus = false;
        }
    }
);

moduleName是var moduleName = name.split('.')[0];name就是锚
对于开发环境，继续通过loadRoute的方法加载route.xxxx.xx.css,route.xxxx.xx.js,route.xxxx.xx.html
在生产环境中，所有的addRoute函数都被添加到了moduleName.js文件中。不会有loadRoute操作。



autoChildRoute
转载请注明: http://jhyan.me/
