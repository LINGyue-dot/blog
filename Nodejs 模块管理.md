# Nodejs（三）模块机制



Node 原生支持2个模块系统：Commonjs 与 ESM

由于 `ESM` 为官方规范，所以现在大多的插件都在转 `ESM` 

Node 参考 Commonjs 的规范实现了一系列模块

##  模块涵盖内容

一个模块规范涵盖的内容如下：包括 FS 文件操作 IO 流、Buffer 、模块、套接字等

![image-20220220223040563](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/image-20220220223040563.png)



## Commonjs 模块引入

模块通过 `module.export` 导出  `require` 引入大致需要经过以下几个过程

1. 路径分析
2. 文件定位
3. 编译执行



### 模块缓存

与前端浏览器会缓存静态脚本文件（协商缓存、强制缓存）以提高性能一样，Node 会对引入模块进行缓存，不同的是浏览器缓存文件，而 Node 缓存编译和执行之后的对象 `Module._cache`





### 模块文件路径分析

所有 `require` 时候都会先查找缓存中是否存在，然后根据如下分类进行查找

* 核心模块

  核心模块即例如 `fs ` Node 自携带的模块，这些模块已被编译为二进制执行文件，所以执行引入时候直接将其加载到内存中即可

* 路径形式的文件

  即 `require('./')` 等标注路径的模块，这会被文件模块转为真实路径，所以基本没有查找时间，然而需要编译所以加载时间慢于核心模块

* 自定义文件

  即 install 来的 package ，首先需要先查找文件真实路径，查找顺序：当前文件的 `node_modules` 目录下 --> 当前父目录 --> 当前父目录的父目录 ，逐渐递归直到根目录 `node_modules` ，所以查找速度是非常慢的 

所有模块第一次引入之后，都会被缓存





### 文件定位

主要对其后缀名进行定位，按照 `js` `json` `node` 文件扩展名进行定位，其中定位是使用 `fs ` 的阻塞式查找文件及判断是否存在，所以加载 `json` `node` 文件时候添加上后缀名会提高性能

当找不到文件却存在某一目录同名，此时就会引入目录，将该文件夹作为一个包，会利用 `JSON.parse` 解析该包下的 `package.json` 文件内的数据



### 模块编译

对不同后缀文件载入的方法不同，具体如下

![image-20220220231546044](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/image-20220220231546044.png)



那文件中的默认存在的 `__dirname` `module` `require` 关键字如何来的？模块编译时会将该文件外部用函数包裹起来，提供这些关键字

```js
(function (exports, require, module, __filename, __dirname) { 
 var math = require('math'); 
 exports.area = function (radius) { 
 return Math.PI * radius * radius; 
 }; 
});
```



### 核心模块为什么加载快

对于 JS 核心模块而言：

* 所有核心模块部分的代码实现由 C/C++ 与 JS 实现的
* 在编译 C 之前，先将其 JS 代码转存在 C/C++ 中，以字符串形式存储在数组中
* Node 执行时候，直接执行 JS 代码将其编译加载到内存中。同时编译时候也对其头尾进行封装





最终模块调用的关系如下

![image-20220220234319331](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/image-20220220234319331.png)











## Commonjs vs ES Moudle

1. Commonjs 模块是运行时加载，ESM 是编译时输出接口
2. Commonjs 是加载整个模块将所有接口都加载进来，ESM 可以单独加载一个接口
3. Commonjs 输出的是值的拷贝，ESM 输出的是值的引用
4. Commonjs  `this` 指向当前模块，ESM `this` 指向 undefined
5. 二者都做了缓存处理，多次引入真正只会引入一次



Commonjs 的 `exports` `module.exports` ：

默认会给 `exports` 赋予一个默认对象，即 `exports === module.exports === this` 

所以如果对 `exports` 挂载属性后，再对 `module.exports` 赋值时候，会将原来的默认对象覆盖导致 `exports` 挂载的属性丢失

```js
exports.c = {
    name:'c'
}
// 被覆盖
module.exports={ // 相当于赋值了一个全新的对象，将其默认的初始对象覆盖
    age:18
}
```



## 总结

require 的模块加载机制

1. 查找缓存
2. 观察是那种类型文件
   1. 核心模块 `fs` 等 Node 自带的模块，这些模块已经被编译成二进制文件，所以执行时候直接加载到内存
   2. 路径 `require('./')` ，将路径转为绝对路径，查找很快但是需要编译
   3. 自定义 `node_modules` 文件，就需要不断递归根据 `module.paths` 进行递归查找
3. 输出模块的 `exports` 属性，同时将其添加到缓存中



## 参考

深入浅出Node.js-朴灵

https://www.teqng.com/2021/08/06/%E6%B7%B1%E5%85%A5%E5%88%86%E6%9E%90-javascript-%E6%A8%A1%E5%9D%97%E5%BE%AA%E7%8E%AF%E5%BC%95%E7%94%A8/



