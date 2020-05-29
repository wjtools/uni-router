# uni-router
一款类似 vue-router 的 uni-app 路由插件

本插件修改自 vue-router-uni 和 megalo-router 感谢作者的开源！



## 版本记录

- 1.0.1

  fix: 修复在 app 上的一个兼容问题

- 1.0.0

  在原插件基础上定制开发



## 安装

```bash
yarn add @wjtools/uni-router
```



## 使用

```js
// main.js
import router from '@wjtools/uni-router'

Vue.use(router, {
  mode: 'strict', // loose 模式用 relaunch 跳转 tab 页，可以传参
  tabBars: [
    '/pages/index',
    '/pages/my'
  ]
})
```

Vue.use 的 option 接受一个 mode 变量，表示路由的模式，有两种模式可选，strict 或者 loose，默认是严格模式

Vue.use 的 option 接受一个 tabBars 变量，为小程序的 tabBar 路径列表

- strict 严格模式，如果使用 push 或者 replace 携带参数跳转到 tab 页面，将使用 switchTab 进行跳转，此时 tab 页面无法接收到参数，这是小程序自身的限制：switchTab 无法传参
- loose 宽松模式，如果使用 push 或者 replace 携带参数跳转到 tab 页面，将使用 relaunch 进行跳转，此时 tab 页面可以接收到参数，但是这意味着程序将重新载入



## API

> 支持以下列出的方法及属性



### 属性

#### $Router.app

> 获取全局的 app，相当于 getApp()



在普通页面使用

```js
onLoad() {
  console.log(this.$Router.app)
}
```


在 App.vue 使用要结合 $Router.ready 使用

```js
  onLaunch() {
    this.$Router.ready(() => {
      console.log(this.$Router.app) // 成功
    })
  }
```



#### $Router.currentRoute & $Route

包含如下信息：

```js
{
  query: {} // 页面路由参数
  path: '' // 不带参数的基本路径
  fullPath: '' // 完整路径，带参数
}
```



在普通页面使用

```js
onReady() {
  console.log(this.$Route.query)
  console.log(this.$Route.path)
  console.log(this.$Route.fullPath)
}
```



在 App.vue 使用要结合 $Router.ready 使用

```js
  onLaunch() {
    this.$Router.ready(() => {
      console.log(this.$Route) // 成功
      console.log(this.$Router.currentRoute) // 成功
    })
  }
```



### 方法

#### $Router.ready()

> 接收一个回调函数作为参数



在 App.vue 中获取 $Router.app、$Route 对象或者 $Router.currentRoute，需要调用 $Router.ready

```js
  onLaunch() {
    this.$Router.ready(() => {
      console.log(this.$Router.app) // 成功
      console.log(this.$Route) // 成功

    })
  }
```

如果在 App.vue 中不使用 $Router.ready方法直接获取 $Router.app 或者 $Route 的话会导致失败，因为此时 Router 并未初始化完成



#### $Router.push()

> 打开一个新页面，如果是打开 tabBar 页面，实际是使用 switchTab，否则使用 navigateTo

**如果是跳转到 tabBar 页面，是无法进行传参的，如果真的要传参到 tabBar 页面，请使用 relaunch 或者路由模式配置为宽松模式（loose）**

```js
  // 使用参数和路径进行跳转
  $Router.push({path: '/pages/index', query: {id: 1}})

  // 或者直接传递一个路径
  $Router.push('/pages/index?id=1')
```



#### $Router.replace()

> 在当前页面打开新页面进行替换，如果是打开 tabBar 页面，实际是使用 switchTab，否则使用 redirectTo

**传参方式同 $Router.push**

```js
  // 使用参数和路径进行跳转
  $Router.replace({path: '/pages/index', query: {id: 1}})

  // 或者直接传递一个路径
  $Router.replace('/pages/index?id=1')
```



#### $Router.go()

> 回退页面

```js
  $Router.go(-1) // 后退一页
  $Router.go(0) // 重新载入当前页面 相当于 relaunch 当前页面
```



##### $Router.back()

> 回到上一页，同 $Router.go(-1)



##### $Router.relaunch()

> 重新载入程序

```js
  // 使用参数和路径进行跳转
  $Router.relaunch({path: '/pages/index', query: {id: 1}})

  // 或者直接传递一个路径
  $Router.relaunch('/pages/index?id=1')
```



#### $Router.getPlatform()

> 获取当前所在平台对象，返回值为一个 Promise

使用方法

```js
async onReady() {
  const platform = await this.$Router.getPlatform()
  console.log(platform)
  // 微信小程序里面得到的是 wx 对象
  // 支付宝小程序里面得到的是 my 对象
}
```



#### $Router.platform.ready()

> 接收一个回调，回调的参数为当前所在平台对象，作用跟 getPlatform 一样，是基于 getPlatform 的封装

使用方法

```js
async mounted() {
  this.$Router.platform.ready(platform => {
    console.log(platform)
  })
}
```



## 注意事项

- **传参问题**

  tabBar 页面接收参数的话应该使用 relaunch(小程序自身的限制) 或者开启路由的宽松模式

  如果 query 传参中带有路径或者网址作为参数，请使用 encodeURIComponent 和 decodeURIComponent 进行编码解码，否则可能发生未知错误或者丢参


- **跳转路径问题**

  所有跳转的路径都是使用 '/' 开头的


- **路由跳转回调问题**

  如果需要对跳转的成功或者失败进行回调处理，可以在跳转时候传入回调

  ```js
  $Router.replace({
    path: '/pages/index',
    query: {id: 1},
    success: res => { console.log('跳转成功', res) },
    fail: err => { console.log('跳转失败', err) },
    complete: res => { console.log('跳转结束', res) }
  })
  ```

- **分包页面的跳转写法**

  uni 默认的分包页面之间的跳转比较麻烦，需要写相对路径，例如从 home/index 跳转到 packgeA/pages/a/index，相对路径为 ../../packgeA/pages/a/index

  使用 uni-router 则没有这种烦恼，直接

  ```js
    $Router.push('/packgeA/pages/a/index')
  ```
