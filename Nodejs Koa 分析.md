# Koa 分析



* next 函数



## 中间件机制

每个中间件其实就是一个函数， koa 内部用数组来存传入的中间件

整体执行机制如下

![image-20220304163725794](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/image-20220304163725794.png)



### 如何实现

核心代码在  `koajs/compose/index`

```js
function compose (middleware) {
  // middleware 类型判断
  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

利用官方的测试样例 `koajs/compose/test/index.js` 来分析

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms || 1));
}

const arr = [];
const stack = [];

// type Middleware<T> = (context: T, next: Koa.Next) => any;
stack.push(async (context, next) => {
  arr.push(1);
  await wait(1);
  await next();
  await wait(1);
  arr.push(6);
});

stack.push(async (context, next) => {
  arr.push(2);
  await wait(1);
  await next();
  await wait(1);
  arr.push(5);
});

stack.push(async (context, next) => {
  arr.push(3);
  await wait(1);
  await next();
  await wait(1);
  arr.push(4);
});

await compose(stack)({});

```

目标结果 arr 中是 [1,2,3,4,5,6]







## koa-router

















## 参考

https://juejin.cn/post/6890259747866411022

https://github.com/koajs/compose