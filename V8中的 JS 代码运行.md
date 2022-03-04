### JS 编译过程

JS 是静态作用域，即在定义时候他的作用域就已经确定了

JS 引擎与其他引擎相同

* 先进行词法分析，即将字符串的代码分为一个个 token
* 接下来语法分析，将其转换为 ast
* 最终将 ast 转换为中间代码/字节码，并生成 sourcemap
* 字节码被编译为机器码，最终被执行


![image-20220217015838564](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/Snipaste_2022-03-03_21-42-13.png)

#### 生成 ast

生成 ast 可能会很慢，所以部分 JS 引擎工作模式如下：

看见一个一段时间内不使用的函数，会快速进行 “丢弃” 解析只会检测其中的语法错误，并不生成 ast ，当第一次调用该函数的时候就会再次解析该函数，这时候才生成所需完整的 ast 以及字节码

部分 JS 引擎会尝试用其他线程进行计算，或者尝试对其之前生成的字节码进行缓存，这样就完全不需要考虑编译了。





最终的 ast 如下

![image-20220217004305624](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/image-20220217004305624.png)

![image-20220217004300251](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/image-20220217004300251.png)





#### 解释器生成字节码/中间代码
![V8-react-jscode](https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/8ded4af9433045fe9463b983c5f71c7b~tplv-k3u1fbpfcp-watermark-226c346c986344958d841858addd5ce2.jpg)



V8 是解释执行和编译执行混合就是 JIT 即时编译即边生成字节码边执行，对应的是 AOT 生成整个编译文件之后再执行

V8 中的的解释为 `Ignition` 解释器，可以快速生成未经优化的字节码，负责对其每行代码执行情况进行分析，对其进行标注是否是热代码等，同时也会执行字节码

字节码就是一个中间代码，最终生成的字节码会进入编译器的虚拟机。

开始执行时候，JS 中对象查找属性需要不断查找原型对象上的属性，直到 Object.property ，如果对每个属性都进行这样的操作是非常耗时的，所以 JS 引擎有 `内联缓存` ，即上面执行过的字节码存在该属性，就直接生成该属性所在的实际位置的字节码。这样接下来的对象属性查找就不用在递归查找。

其中内联缓存有三种

* 单态：即如上描述的
* 多态：即存在多个不同的属性，就创建一个表进行记录
* 复态：即多态表太大，就需要在某个属性对应的字节码部分进行注释无需进行缓存





#### 编译器生成机器码

V8 `TurboFan` 编译器是一个 `JIT` 编译器，即通过 `Ignition` 解释器的分析结果对其进行优化，主要是通过预测优化，即某个数前面都为 INT ，那么此时判断就优先进行 INT 类型判断 

最终执行字节码的时候，平常就在 `Ignition` 中执行，如果遇见 hot 代码可优化的就利用 `TruboFan` 编译器生成机器码将原本的字节码替换，直接执行机器码。



#### 总结

* 生成 ast 之后
* 代码会被 **解释器** 生成字节码，同时字节码会被 **解释器** 执行，在此过程中发现 hot 代码则将分析数据传递给编译器
* **编译器** 会根据数据分析生成高度优化的机器码（主要的优化就是 **推测优化** ，例如在值类型时候优先判断之前的类型）
* 后面执行时候遇见存在的机器码就直接执行机器码，如果是新代码就通过 **解释器** 执行









#### 参考

https://astexplorer.net/

https://mp.weixin.qq.com/s?src=11&timestamp=1644985470&ver=3623&signature=B70ze4O3Eu4GRdBKdU96VxCFzs60oft9xNBAhyIadwaRMTDilW5IR630CnpoR6VE73tFcH*l2RW2Zv2RdTir9S6yA2zNjZjXm10NPgv4TkclbMlnn2TvceiIpWaAWJKQ&new=1

https://juejin.cn/post/6937835082535141389

[https://juejin.cn/post/6844903953981767688](https://juejin.cn/post/6844903953981767688#heading-4)