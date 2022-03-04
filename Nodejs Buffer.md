# Nodejs Buffer



Buffer Blob Stream

## 介绍

Buffer 用于处理大文件、网络二进制数据，存储字节，操作类似数组的对象。底层实现与性能相关的是用 C++ 实现，无关的是用 JS 实现。同时 Buffer 占用的内存不是通过 V8 分配的，属于堆外内存，是由 C++ 层面实现的内存申请。

Buffer 大小不可变，所以 Buffer 拼接时候就是生成一个合并后的对象将原来的 buffer 复制到该对象中

网络 IO 与文件 IO 时候都会将字符串转为 buffer ，以二进制数据传输



## 内存分配

简单说，Buffer 内存都是 C++ 层面提供的，都不在 V8 的堆内存中

* 较小的 <8K ：由 C++ 预申请后分配
* 较大的 >8K ：由 C++ 层面与 OS 请求，直接使用 C++ 提供的内存即可





## 读取文件

例如读取实例如下

```js
var fs = require("fs");

var rs = fs.createReadStream("data.md");
var data = "";
rs.on("data", function (chunk) {
	data += chunk;
});
rs.on("end", function () {
	console.log(data);
});

```

这里的 `chunk`  就是一个 buffer ，这里 `data+=chunk` 本质其实是 `buffer.toString()` 转为字符串。对于普通编码 `utf-8` ，英文字母占用一个字节，而中文占用三个字节，这也意味着，每个 chunk buffer 必须是 3 的倍数

```js
var rs = fs.createReadStream("data.md",{highWaterMark:11}); // 每个 chunk 是 11 个字节
```

如果设置为 11 那么就会导致前2个中文能被正确转为字符串，而第三个中文由于只有2个字节可以解析所以就会乱码。



乱码问题解决：

* 用 `setEncoding` 设置编码，直接将其转为 string 输出









## 参考

深入浅出 Nodejs
