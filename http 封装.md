# HTTP 请求封装

所谓 http 封装在项目中即为 api 请求的封装，在笔者的理解中也可以将其理解为前端项目工程化的一部分



## TODO

* 取消重复请求
* 请求失败自动重试
* 请求数据缓存





## 为什么需要？

由于引入一样新东西进入项目必然有成本，那这个成本是否能消除原先开发中的痛点，能否开发效率是我们将其加入项目之前的一个重要考量

那么就追根溯源，没对 http 请求进行封装之前有哪些问题

* 重复逻辑，例如 GET 请求时候需要对每个请求借助 `qs` 等库转为 `url params` ，或者得到 401 的响应时候需要对其进行登出等相同操作
* 重复代码，例如 POST 请求时候需要对每个请求头进行添加 `Content-Type : application/json` ，或 jwt 验证时候手动携带 token
* 服务器 ip 迁移时候改动非常大



## 笔者认知好的封装长什么样？

笔者认为所谓“好“其实都是适用不同项目，封装没有什么好坏之分，应该以适合项目而定如何封装

而个人大多开发的项目中一般如下

* 解决 baseUrl 问题，即将 baseUrl 放在某个文件中 `export`  出，其他进行 import ，或者服务端是单机的话就将其写死放在封装函数中
* 解决重复代码问题，将 header 等全局统一的东西直接在封装函数中进行
* 解决重复逻辑问题，封装函数中对不同的请求方法进行不同的处理，如 `GET` 的 `qs` 处理
* 权限控制问题，笔者建议一级封装函数中不要将 `token` 直接写死放入，因为部分请求是不需要携带 token ，较好的解决方案封装函数应该是无状态的即接受 token 等数据，对其进行二次封装得到携带 token 的 http 请求 
* 统一进行错误处理，例如 401等权限问题，直接在封装函数中进行处理



## 示例封装

如下 `http` 函数即为一级封装函数，`useHttp` 是使用 React hook 来实现 token 传入

```ts
/*
 * @Author: qianlong github:https://github.com/LINGyue-dot
 * @Date: 2022-04-30 16:48:40
 * @LastEditors: qianlong github:https://github.com/LINGyue-dot
 * @LastEditTime: 2022-04-30 18:11:55
 * @Description: 对 http 请求进行封装，主要包括 baseUrl、数据携带、header、token 携带、response 的异常辅助处理、发送携带 token 的请求以及不携带 token 的请求
 *
 * 只有断网等特殊情况发生时候 fetch catch 才会触发，普通的 401 500 并不会
 * 所以在 response.ok == false 时候需要手动抛出异常
 * 而 axios 在 401 / 500 时候就可以通过 catch 来进行直接捕获
 */

import * as auth from "utils/auth-provider";
import qs from "qs";
import { useAuth } from "context/auth-context";
interface Config extends RequestInit {
  token?: string | null;
  data?: any;
}

const apiUrl = process.env.REACT_APP_API_URL;

export const http = (
  endpoint: string,
  { token, data, method, headers, ...customConfig }: Config = {}
) => {
  const config = {
    method: method?.toUpperCase() || "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": data ? "application/json" : "",
    },
    ...customConfig,
  };

  // params 形式携带参数
  if (config.method == "GET") {
    endpoint += `?${qs.stringify(data)}`;
  } else {
    config.body = JSON.stringify(data || {});
  }

  //? fetch 兼容性处理
  return window
    .fetch(`${apiUrl}/${endpoint}`, config)
    .then(async (response) => {
      // 401 权限问题
      if (response.status == 401) {
        // 退出登录
        await auth.logout();
        window.location.reload();
        return Promise.reject({ message: "请重新登录" });
      }
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        return Promise.reject(data);
      }
    });
};

// 权限控制的 http 请求 hook
// 实现携带 token 的 http 请求
export const useHttp = () => {
  // 当前用户信息获取，主要用于获取 token
  const { user } = useAuth();
  return (...[endpoint, config]: Parameters<typeof http>) =>
    http(endpoint, { ...config, token: user?.token });
};

```









## 参考

https://coding.imooc.com/class/482.html















