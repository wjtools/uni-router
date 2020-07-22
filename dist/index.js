import { joinQuery, parseUrl, getUniRoutePath } from './utils';
class Router {
    constructor() {
        this.mode = 'strict';
    }
    get platform() {
        const that = this;
        return {
            ready(callback) {
                that.getPlatform().then(callback);
            }
        };
    }
    get app() {
        return getApp();
    }
    ready(callback) {
        const ready = () => this.currentRoute && this.currentRoute.path && getApp() && this._platform;
        if (ready()) {
            callback();
        }
        else {
            const timer = setInterval(() => {
                if (ready()) {
                    callback();
                    clearInterval(timer);
                }
            }, 10);
        }
    }
    tabAction(to) {
        if (this.mode === 'strict')
            return 'switchTab';
        to.query = to.query || {};
        const hasQuery = Object.keys(to.query).length || /\?.*?=/.test(to.path);
        return hasQuery ? 'reLaunch' : 'switchTab';
    }
    push(to = {}) {
        to = typeof to === 'string' ? { path: to } : to;
        const { path } = parseUrl(to.path || '');
        let action = this.tabBars.includes(path) ? this.tabAction(to) : 'navigateTo';
        this.navigate(action, to);
    }
    replace(to = {}) {
        to = typeof to === 'string' ? { path: to } : to;
        const { path } = parseUrl(to.path || '');
        let action = this.tabBars.includes(path) ? this.tabAction(to) : 'redirectTo';
        this.navigate(action, to);
    }
    async go(delta) {
        if (!delta) {
            this.relaunch(this.currentRoute);
        }
        delta = Math.abs(delta);
        const platform = await this.getPlatform();
        platform.navigateBack({ delta });
    }
    back() {
        this.go(-1);
    }
    relaunch(to = {}) {
        to = typeof to === 'string' ? { path: to } : to;
        this.navigate('reLaunch', to);
    }
    reLaunch(to = {}) {
        this.relaunch(to);
    }
    async navigate(action = 'navigateTo', to = {}) {
        try {
            if (!to.path)
                throw new Error('path 不能为空');
            const { path, query = {}, success = () => { }, fail = (err) => {
                err.to = to;
                throw new Error(err);
            }, complete = () => { } } = to;
            let url = Object.keys(query).length
                ? joinQuery(path, query)
                : path;
            url = await getUniRoutePath(url);
            const platform = await this.getPlatform();
            platform[action]({
                url,
                success,
                fail,
                complete
            });
        }
        catch (e) {
            throw new Error(e);
        }
    }
    getPlatform() {
        return new Promise((resolve) => {
            if (this._platform) {
                resolve(this._platform);
            }
            else {
                const timer = setInterval(() => {
                    if (this._platform) {
                        resolve(this._platform);
                        clearInterval(timer);
                    }
                }, 10);
            }
        });
    }
    install(Vue, options) {
        const router = this;
        let { mode, tabBars = [] } = options || {};
        router.mode = mode || 'strict';
        router.tabBars = tabBars.map(path => path.startsWith('/') ? path : '/' + path);
        Object.defineProperty(Vue.prototype, '$Router', {
            get() {
                return router;
            },
            set() {
                throw new Error('不能修改$Router的值');
            }
        });
        Object.defineProperty(Vue.prototype, '$Route', {
            get() {
                return router.currentRoute;
            },
            set() {
                throw new Error('不能修改$Route的值');
            }
        });
        Vue.mixin({
            onLoad() {
                if (this.$mp && this.$mp.page && this.$mp.page.route) {
                    const path = '/' + this.$mp.page.route;
                    const query = this.$mp.query || {};
                    router.currentRoute = {
                        query,
                        path,
                        fullPath: joinQuery(path, query)
                    };
                }
                if (router._platform)
                    return;
                router._platform = uni;
            },
            onShow() {
                if (this.$mp && this.$mp.page && this.$mp.page.route) {
                    const path = '/' + this.$mp.page.route;
                    const query = this.$mp.query || {};
                    router.currentRoute = {
                        query,
                        path,
                        fullPath: joinQuery(path, query)
                    };
                }
            }
        });
    }
}
export default new Router();
