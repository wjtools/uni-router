declare const getCurrentPages: Function

/**
 * @description url 拼接参数
 * @param url {string}
 * @param query {object}
 */
export function joinQuery(url: string, query: object): string {
  const keys = Object.keys(query)
  if (!keys.length) {
    return url
  } else {
    const pairs: string[] = keys.map((key) => `${key}=${query[key]}`)
    url = /\?/g.test(url) ? `${url}&` : `${url}?`
    url += pairs.join('&')
    return url
  }
}

/**
 * @description 解析 url
 * @param fullPath {string}
 * @return {path, query, fullPath} {Object}
 */
export function parseUrl(fullPath: string): object {
  let path: string = fullPath
  let query: object = {}
  if (/\?/g.test(fullPath)) {
    path = fullPath.split('?')[0]
    let queryString: string = fullPath.split('?')[1]
    let pairs: string[] = queryString.split('&')
    pairs.forEach((pair) => {
      let pairArr = pair.split('=')
      query[pairArr[0]] = pairArr[1] || ''
    })
  }
  return {
    path,
    query,
    fullPath
  }
}

/**
 * @description 深拷贝
 * @param obj {object}
 * @return obj {object}
 */
export function deepClone(obj: object) {
  let objClone: any[] | object = Array.isArray(obj) ? [] : {}
  if (obj && typeof obj === 'object') {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        // 如果子元素为对象，则递归复制
        if (obj[key] && typeof obj[key] === 'object') {
          objClone[key] = deepClone(obj[key])
        } else {
          objClone[key] = obj[key]
        }
      }
    }
  }
  return objClone
}

/**
 * @description 获取当前路由
 */
export const getCurrentRoute = async (): Promise<string> => {
  const queryRoute = () => {
    const pages = getCurrentPages()
    if (!pages[pages.length - 1]) return false
    return pages[pages.length - 1].route
  }
  return new Promise<string>((resolve) => {
    if (queryRoute()) {
      resolve(queryRoute())
    } else {
      const timer = setInterval(() => {
        if (queryRoute()) {
          resolve(queryRoute())
          clearInterval(timer)
        }
      }, 10)
    }
  })
}

/**
 * @description 转换路由路径为符合 uni-app 的路径
 * @param url {string}
 * @return url {string}
 */
export const getUniRoutePath = async (url: string): Promise<string> => {
  const path: string = await getCurrentRoute()
  const toTop: string = path.split('/').reduce((res, val, index, arr) => {
    if (index === arr.length - 1 || !val) return res
    return '../' + res
  }, '')
  console.log('path', path)
  console.log('toTop', toTop)
  console.log('url', url)
  return Promise.resolve((toTop + url).replace(/\/\//g, '/'))
}
