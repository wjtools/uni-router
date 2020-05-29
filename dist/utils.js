export function joinQuery(url, query) {
    const keys = Object.keys(query);
    if (!keys.length) {
        return url;
    }
    else {
        const pairs = keys.map((key) => `${key}=${query[key]}`);
        url = /\?/g.test(url) ? `${url}&` : `${url}?`;
        url += pairs.join('&');
        return url;
    }
}
export function parseUrl(fullPath) {
    let path = fullPath;
    let query = {};
    if (/\?/g.test(fullPath)) {
        path = fullPath.split('?')[0];
        let queryString = fullPath.split('?')[1];
        let pairs = queryString.split('&');
        pairs.forEach((pair) => {
            let pairArr = pair.split('=');
            query[pairArr[0]] = pairArr[1] || '';
        });
    }
    return {
        path,
        query,
        fullPath
    };
}
export function deepClone(obj) {
    let objClone = Array.isArray(obj) ? [] : {};
    if (obj && typeof obj === 'object') {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (obj[key] && typeof obj[key] === 'object') {
                    objClone[key] = deepClone(obj[key]);
                }
                else {
                    objClone[key] = obj[key];
                }
            }
        }
    }
    return objClone;
}
export const getCurrentRoute = async () => {
    const queryRoute = () => {
        const pages = getCurrentPages();
        if (!pages[pages.length - 1])
            return false;
        return pages[pages.length - 1].route;
    };
    return new Promise((resolve) => {
        if (queryRoute()) {
            resolve(queryRoute());
        }
        else {
            const timer = setInterval(() => {
                if (queryRoute()) {
                    resolve(queryRoute());
                    clearInterval(timer);
                }
            }, 10);
        }
    });
};
export const getUniRoutePath = async (url) => {
    const path = await getCurrentRoute();
    const toTop = path.split('/').reduce((res, val, index, arr) => {
        if (index === arr.length - 1 || !val)
            return res;
        return '../' + res;
    }, '');
    return Promise.resolve((toTop + url).replace(/\/\//g, '/'));
};
