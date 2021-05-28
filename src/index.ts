import {
  joinQuery,
  parseUrl,
  deepClone,
  getUniRoutePath,
  getCurrentRoute
} from './utils'

declare let uni: any
declare let getApp: Function

interface Route {
  query: object
  path: string
  fullPath: string
}

interface toRoute {
  query?: object
  path?: string
  fullPath?: string
  [key: string]: any
}

interface Platform {
  switchTab: Function
  navigateTo: Function
  redirectTo: Function
  navigateBack: Function
  reLaunch: Function
  [key: string]: any
}

class Router {
  currentRoute: Route
  protected _platform: Platform
  protected mode: string = 'strict'
  get platform() {
    const that = this
    return {
      ready(callback) {
        that.getPlatform().then(callback)
      }
    }
  }

  get app() {
    return getApp()
  }

  ready(callback) {
    const ready = () =>
      this.currentRoute && this.currentRoute.path && getApp() && this._platform
    if (ready()) {
      callback()
    } else {
      const timer = setInterval(() => {
        if (ready()) {
          callback()
          clearInterval(timer)
        }
      }, 10)
    }
  }

  tabBars: string[]

  tabAction(to: toRoute): string {
    if (this.mode === 'strict') return 'switchTab'
    to.query = to.query || {}
    const hasQuery = Object.keys(to.query).length || /\?.*?=/.test(to.path!)
    return hasQuery ? 'reLaunch' : 'switchTab'
  }

  push(to: string | toRoute = {}) {
    to = typeof to === 'string' ? { path: to } : to
    const { path } = parseUrl(to.path || '') as Route
    let action = this.tabBars.includes(path) ? this.tabAction(to) : 'navigateTo'
    this.navigate(action, to)
  }

  replace(to: string | toRoute = {}) {
    to = typeof to === 'string' ? { path: to } : to
    const { path } = parseUrl(to.path || '') as Route
    let action = this.tabBars.includes(path) ? this.tabAction(to) : 'redirectTo'
    this.navigate(action, to)
  }

  async go(delta: number) {
    if (!delta) {
      this.relaunch(this.currentRoute)
    }
    // delta = -delta
    delta = Math.abs(delta)
    const platform: Platform = await this.getPlatform()
    platform.navigateBack({ delta })
  }

  back(): void {
    this.go(-1)
  }

  relaunch(to: string | toRoute = {}) {
    to = typeof to === 'string' ? { path: to } : to
    this.navigate('reLaunch', to)
  }

  reLaunch(to: string | toRoute = {}) {
    this.relaunch(to)
  }

  async navigate(action: string = 'navigateTo', to: toRoute = {}) {
    try {
      if (!to.path) throw new Error('path 不能为空')
      const {
        path,
        query = {},
        success = () => {},
        fail = (err) => {
          err.to = to
          throw new Error(err)
        },
        complete = () => {}
      } = to

      // 如果有参数，拼接参数
      let url: string = Object.keys(query).length
        ? joinQuery(path, query)
        : path

      // 转换为符合 uni-app 要求的相对路径
      url = await getUniRoutePath(url)
      const platform: Platform = await this.getPlatform()
      platform[action]({
        url,
        success,
        fail,
        complete
      })
    } catch (e) {
      throw new Error(e)
    }
  }

  getPlatform(): Promise<Platform> {
    return new Promise<Platform>((resolve) => {
      if (this._platform) {
        resolve(this._platform)
      } else {
        const timer = setInterval(() => {
          if (this._platform) {
            resolve(this._platform)
            clearInterval(timer)
          }
        }, 10)
      }
    })
  }

  install(Vue, options) {
    const router = this
    let { mode, tabBars = [] } = options || {}
    router.mode = mode || 'strict'
    router.tabBars = tabBars.map(path => path.startsWith('/') ? path : '/' + path)

    Object.defineProperty(Vue.prototype, '$Router', {
      get() {
        return router
      },
      set() {
        throw new Error('不能修改$Router的值')
      }
    })
    Object.defineProperty(Vue.prototype, '$Route', {
      get() {
        return router.currentRoute
      },
      set() {
        throw new Error('不能修改$Route的值')
      }
    })

    Vue.mixin({
      // onLaunch() {
      //   let platformType = uni ? uni.getSystemInfoSync().platform : undefined
      //   console.warn(`uni-router 识别平台成功，当前平台：${platformType}`)
      // },

      onLoad() {
        // 兼容百度小程序
        if (this?.$mp?.page?.is) {
          this.$mp.page.route = this.$mp.page.is
        }

        if (this?.$mp?.page?.route) {
          const path = '/' + this.$mp.page.route
          const query = this.$mp.query || {}
          router.currentRoute = {
            query,
            path,
            fullPath: joinQuery(path, query)
          }
        }
        if (router._platform) return
        router._platform = uni as Platform
      },

      // onShow 里面还需要重新赋值一次，用于页面回退的时候纠正
      onShow() {
        // 兼容百度小程序
        if (this?.$mp?.page?.is) {
          this.$mp.page.route = this.$mp.page.is
        }

        if (this?.$mp?.page?.route) {
          const path = '/' + this.$mp.page.route
          const query = this.$mp.query || {}
          router.currentRoute = {
            query,
            path,
            fullPath: joinQuery(path, query)
          }
        }
      }
    } as any)
  }
}

export default new Router()
