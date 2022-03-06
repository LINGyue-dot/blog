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



### 中间件应用





## 洋葱模型机制使用

* 具体实现并不复杂
* 可以利用中间件对用户的操作进行前置与后置处理



## 手写 compose 函数



```js
// 实现洋葱模型
function compose(middleArr) {
	// middleArr 类型判断
	return function (context, next) {
		// begin from 0
		dispath(0);
		function dispath(i) {
			let fn;
			// i / fn 判断
			// i == len 时候就是最后一个中间件执行
			if (i == middleArr.length) {
				fn = next;
			} else {
				fn = middleArr[i];
			}
			// 结束
			if (!fn) {
				return Promise.resolve();
			}
			try {
				// 可以传入 Promise 也可以传入普通数组/字符串等数据
                  // 这里的 dispatch 本质就是 next 函数，
				return Promise.resolve(fn(context, dispath.bind(null, i + 1)));
			} catch (e) {
				return Promise.reject(e);
			}
		}
	};
}
```

测试

```js
const stack = [];

function wait(delay) {
	return new Promise(resolve =>
		setTimeout(() => {
			resolve();
		}, delay)
	);
}

stack.push(async (context, next) => {
	console.log(1);
	await wait(1);
	await next();
	await wait(1);
	console.log(4);
});

stack.push(async (context, next) => {
	console.log(2);
	await wait(1);
	await next();
	await wait(1);
	console.log(3);
});

compose(stack)({});
```







## koa-router

















## 参考

https://juejin.cn/post/6890259747866411022

https://github.com/koajs/compose