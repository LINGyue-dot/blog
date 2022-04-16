

# HTTP 

* 版本演进



## 版本演进

0.9、1、2、3

### 0.9 

* 结构简单，纯文本格式 
* 只允许 GET 从服务端获取
* 响应结束就关闭连接

> 纯文本格式：与其相对应的是富文本格式，包括 http 1.1 的所有都是纯文本



### 1.0

* 增加 HEAD POST 等方法
* 添加了响应码
* 引入 HTTP Header
* 传输数据不仅限于文本

1.0 并没有起到实际的约束力，各大厂商仍然按照自己的意愿发展



### 1.1

* 添加了 PUT DELETE 等方法
* 增加了缓存管理方法即缓存字段
* 持久连接 `connect:keep-alive`
* 由于虚拟机的存在，强制要求 host 头字段，使其能多个主机共享一个 ip
* 允许数据分块，即不标注 `Content-Length` 客户端就无法断开连接直到收到 EOF，可以用于传输大文件以及 websocket 的兼容实现
* 支持断点续传，range 参数















## 参考



https://time.geekbang.org/column/intro/100029001?tab=catalog