

# Nodejs 异步 IO



## temp

* 异步底层是如何实现的？让 OS 去创建线程去读取？
* 多线程读取文件是读取线程中阻塞？



## OS 内容

IO 操作消耗的资源不在 CPU ，计算机利用 `DMA` 读取文件，不占用 CPU

### 子线程

从主线程创建的线程就是该线程的子线程，本质上没有具体的区别

### 多线程

多线程的执行宏观上是并行的，微观上是串行的



### 并发相关性能指标

* 请求数 QPS ：即通俗讲的并发数，即每秒处理的请求。如果 http 头中有 close 则关闭这次 TCP 连接。如有 Keep-Alive ，则本次连接不关闭。
* 并发连接数 SBC ：即每秒服务器连接的 TCP 总数，即进程创建的最多线程数目





## 多线程与非异步的单线程



多线程：优势是可以很好利用多核多线程 CPU ，但是存在锁以及状态同步问题将问题复杂化

非异步的单线程：代码串行化易懂，虽然 OS 会平均分配时间片，所以会将时间片平均分配











## Nodejs 中的实现

Node 在 win 或者 linux 下都是借助线程池完成异步，线程池是系统内核进行管理的

![image-20210925161023206](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/upload_64a9946a8d3dab7aacbb6c05575cbd3f.png)



Nodejs 中利用 `libuv` 库对两个系统进行抽象以实现异步 IO

![image-20210925161033678](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/upload_458021397ddcdb837747d948e4139610.png)



Nodejs 异步 IO 具体如下：

* 发起异步调用，设置回调函数
* 将请求对象传入线程池中，开启线程进行执行，执行完成后会进行通知 IO 观察者
* 同时 JS 事件循环，当每个循环（ tick ）后，就会去查看 IO 观察者是否已经完成

![image-20210925162726361](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/upload_13f3400d24bba8082f2bd19dd9671d9c.png)



> 请求对象是整个 IO 过程中的过渡产物
>
> 例如 `fs.open` 是开启一个文件得到一个文件描述符，这个请求对象中包括文件描述符、回调函数等许多内容





## Nodejs 中的 event loop 

Nodejs 使用 V8 作为 JS 的解析引擎，但是 IO 处理等方面使用自己设计的 `libuv` ，内部也实现了事件循环机制

![img](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/v2-76c03811879fa04e38a5054b00665554_b.jpg)

Nodejs 中的运行机制：

* V8 引擎解析 JS 脚本（变量存储等仍然在 V8 中）
* 解析后的代码，调用 Nodejs api
* `libuv` 库负责 api 执行，将不同任务分配给不同线程，形成事件循环，最后以异步的方式将任务的执行结果返回给 V8
* V8 再将结果返回给用户

`libux` 引擎的事件循环主要分为 6 个阶段

* timers 阶段：`setTImeout` `setInterval` 的回调
* I/O 回调阶段：处理上一轮少数未执行的 I/O 回调
* idle、prepare ：仅 node 内部使用
* 轮询：检查新的 IO 事件，执行 IO 回调同时也会进行如下（除了关闭回调函数、计时器以及 check 阶段，其余 node 都会再次不断轮询）
  * 如果有 timer 的话回到 timer 阶段执行回调
  * 如果没有 timer 的话
    * 如果 **轮询队列** 不空，会遍历回调队列并同步执行，直到空或者达到一定数目
    * 如果 **轮询队列** 为空，
      * 如果有 `setImmediate` 回调执行，就跳到 `setTimmediate` 阶段执行回调
      * 如果没有 `setImmediate` 回调需要执行，就会等待回调被加入队列就立刻执行，这里同样有个最大等待时间防止一直等下去
* check 阶段：执行 `setImmediate` 回调
* close 阶段：一些关闭的回调函数，例如 `socket.on('close',...)`

> process.nextTick 是在每次事件循环之前执行，即同步代码执行完成之后第一时间执行

> Nodejs v14 执行结果与浏览器中基本一致



![img](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/v2-de1858abd236bdc70904525c3c5b05d7_b.jpg)



```js
console.log("start");
setTimeout(() => {
	console.log("timer1");
	Promise.resolve().then(function () {
		console.log("promise1");
	});
}, 0);
setTimeout(() => {
	console.log("timer2");
	Promise.resolve().then(function () {
		console.log("promise2");
	});
}, 0);
Promise.resolve().then(function () {
	console.log("promise3");
});
process.nextTick(() => {
	console.log("nextTick");
});
console.log("end");
//start=>end=>promise3=>timer1=>timer2=>promise1=>promise2

// nodejs v14 执行
// start
// end
// nextTick
// promise3
// timer1
// promise1
// timer2

```







补：这是浏览器中的事件循环

![img](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/v2-539cfb365f2646bd724da392d779476c_b.jpg)



## 为什么 setTimeout 不准

* setTimeout 是每次 tick 时候发现时间差值超过之后生成回调函数
* 回调的事件是加入事件循环中进行的，如果某一轮的事件循环事件占用很多的话，那么就明显超时了



## 参考

https://zhuanlan.zhihu.com/p/113116894