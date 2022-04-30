# React hooks



本文分析的自带 hook api 如下

* useEffect



需要详细了解 hook 内部如何进行的，需要先进行阅读 `capture value `



## Render 











## useEffect















## Context hook

使用 `context` 可以自实现全局/局部状态管理，相对于 `redux mobx` 等更加轻量，数据流更为简单清晰

以下以用户登录管理的 `context` 为例

`auth-context.tsx`

```tsx
/*
 * @Author: qianlong github:https://github.com/LINGyue-dot
 * @Date: 2022-04-30 15:58:43
 * @LastEditors: qianlong github:https://github.com/LINGyue-dot
 * @LastEditTime: 2022-04-30 16:16:35
 * @Description:
 */

import { User } from "pages/project-list/search-panel";
import React, { useState } from "react";

import * as auth from "utils/auth-provider";

interface AuthFrom {
	username: string;
	password: string;
}
// 创建 context
const AuthContext = React.createContext<
	| {
			user: User | null;
			login: (form: AuthFrom) => Promise<void>;
			register: (form: AuthFrom) => Promise<void>;
			logout: () => Promise<void>;
	  }
	| undefined
>(undefined);

AuthContext.displayName = "AuthContext";

// tsx provider 组件
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);

	const login = (form: AuthFrom) => auth.login(form).then(setUser);
	const register = (form: AuthFrom) => auth.register(form).then(setUser);

	const logout = () => auth.logout().then(() => setUser(null));

	return (
		<AuthContext.Provider
			children={children}
			value={{
				user,
				login,
				logout,
				register,
			}}
		/>
	);
};

// 组件中使用的 hook
export const useAuth = () => {
	const context = React.useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth 并未在 Provider 中使用");
	}
	return context;
};

```

​	`index.tsx`

```tsx
/*
 * @Author: qianlong github:https://github.com/LINGyue-dot
 * @Date: 2022-04-30 15:58:32
 * @LastEditors: qianlong github:https://github.com/LINGyue-dot
 * @LastEditTime: 2022-04-30 16:18:47
 * @Description:
 */

import React from "react";
import { AuthProvider } from "./auth-context";

const AppContext = ({ children }: { children: React.ReactNode }) => {
	return <AuthProvider>{children}</AuthProvider>;
};

export default AppContext;

```

`组件中使用`

```js
const {user,login,logout} = useAuth()
```













## 自封装 hook













## Reference

* https://juejin.cn/post/6844903806090608647#heading-3