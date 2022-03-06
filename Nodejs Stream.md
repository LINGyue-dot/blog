# Nodejs Stream 流



## Nodejs 读/写文件方式

* 一种就是使用 stream 进行读写 例如 `createReadStream`

  将其以 stream 模式读取到内存中，实际内存占用的就只是 stream 中基本单位 buffer 的大小

* 一种就是直接读写 ` readFile`

  将整个文件直接读取到内存中



## Stream 读写文件

stream 读写文件类似于滑动窗口，例如对其一个文件进行压缩并输出，此时需要先对源文件 A 读取，并新建 B 文件对其写。

> 注意：写文件的时候其实是先向缓存中写，只有达到一定数据量之后才会写入硬盘

利用 `stream.pipe` stream 的管道 pipe ，每次读取并非将整个文件读取到内存中，而是读取一部分往管道填充，如下  `stream1` 就是读完之后压缩的 buffer 数据，`stream2` 就是此时需要写入到硬盘中的数据

> 现在大多使用  [`pipeline`](https://nodejs.org/api/stream.html#stream_stream_pipeline_streams_callback) ，可以看作是添加错误中断处理的 `pipe`

![image-20220306160014496](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/image-20220306160014496.png)

```js
const gzip = require('zlib').createGzip();
const fs = require('fs');

const inp = fs.createReadStream('The.Matrix.1080p.mkv');
const out = fs.createWriteStream('The.Matrix.1080p.mkv.gz');
 // 连接成 pipe
inp.pipe(gzip).pipe(out);
```



## pipe 如何实现

Nodejs 中大多数的对象都原型链继承了 `EventEmitter` ，也就是发布订阅者模式

`pipe` 基本原理如下

* stream1 监听 chunk buffer ，如有就往管道塞给 stream2
* stream1 监听 end 就关闭 stream

```js
stream1.on('data', (chunk) => {
	stream2.write(chunk)
})

stream1.on('end', () => {
	stream2.end()
})
```

## 数据积压问题

发生该问题主要是

* Readable 传输的速度比 Writable 速度快太多（由于写磁盘的速度比读磁盘的速度慢非常多），就无法平缓的从 stream1 流向 stream2

这样就会导致 stream 管道数据队列会变得非常长，导致更多的数据得存在 **内存** 中，就会占用非常大的内存

一般使用 `drain` 事件和 `stream.write` 返回值以及 `resume` 来进行处理

```js
var rs = fs.createReadStream(src);
var ws = fs.createWriteStream(dst);

rs.on('data', function (chunk) {
    // 数据队列满了
    if (ws.write(chunk) === false) {
        rs.pause();
    }
});

rs.on('end', function () {
    ws.end();
});
//  管道中的数据队列已经空了
ws.on('drain', function () {
    // 重启
    rs.resume();
});


```





## Stream 类型

| 名称      | 特点             |
| --------- | ---------------- |
| Readable  | 可读             |
| Writable  | 可写             |
| Duplex    | 可读可写（双向） |
| Transform | 可读可写（变化） |



注意：Readable 与 Writable 是共享缓冲区的，如上实例代码也可验证。

`Duplex` 是读写二者是是分开的缓冲区

`Transform` 是自己读自己写

![image-20220306163143978](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/image-20220306163143978.png)





## Nodejs 中的 Stream

| Readable  Stream                 | Writeable Stream              |
| -------------------------------- | ----------------------------- |
| HTTP Response 客户端             | HTTP Request 客户端           |
| HTTP Request 服务端              | HTTP Response 服务端          |
| fs read stream                   | fs write stream               |
| child process stdout & stderr    | child process stdin           |
| process.stdin （ terminal log ） | process.stdout,process.stderr |



## 总结

* Nodejs 的 stream 流读取文件的优势
* Stream 流管道的概念
* Stream 流的数据积压
* Stream 流的类型



## 参考

https://juejin.cn/post/6854573219060400141

https://juejin.cn/post/6844903510589341703

https://nodejs.org/zh-cn/docs/guides/backpressuring-in-streams/
