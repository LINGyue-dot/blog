# 一个像素在 Chorme 的渲染过程



所有输入显示在显示器上都是：软件调用操作系统的绘制 api ，操作系统再去调用硬件进行绘制像素点



渲染主进程

1. 解析 HTML 生成 DOM 树，同时赋予 DOM api 例如获取父 DOM api 等

2. 解析 styleSheet 即 css 文件生成 `ComputedStyle` 对象

3. 由 DOM 树生成 Layout （布局）树。Layout 节点基本与 DOM 节点一致，但是 `display:none` 的节点不显示，独立未被包裹的内联元素会创建 LayoutBlock 匿名节点包裹。例如下方，span 就独立下方

   ```html
   <span>独立一行</span>
   <p>独立一行</p>
   ```

   

4. layer 分层后合成，某些属性会形成单独的层例如 `transform` 方便进行图形变化，`scrollbar` 等。最终的合成任务在渲染进程的合成线程进行，不在主线程中进行

5. prepaint 预渲染阶段，遍历并构建属性树，属性树即存储 滚动偏移、透明度等数据的地方，方便绘制阶段直接拿数据进行处理

6. paint 绘制阶段，即将 Layout 树结合属性树转换为绘制指令。





GPU 进程

1.  raster 栅格化，将绘制指令转为位图 `bitmap` ，转换后每个像素的 rgba 都确认了。该阶段也使得放大会”糊“，由于放大后多个点就需要由一个点提供的数据来进行渲染，但是 `bitmap` 一个点只存储一个 rgba 的数据
2. 调用 封装了 OpenGL 调用的 Skia ，将像素呈现在屏幕上





## 总结



页面渲染

1. 先对资源进行解析，查看响应头信息，查看 `Content-Type` 值，根据不同资源类型用不同的解析方式
2. 解析 HTML ，构建 DOM 树
3. 解析 CSS 生成 ComputedStyle 对象
4. 由 DOM 树生成 Layout 树/布局树，即计算每个节点的位置
5. 构建属性树，即计算透明度等数据，方便拿数据
6. 将 Layout 树结合属性树转换为绘制指令
7. 将绘制指令转为 位图 `bitmap` 
8. 在 GPU 进程中渲染

