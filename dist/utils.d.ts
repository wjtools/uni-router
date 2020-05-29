export declare function joinQuery(url: string, query: object): string;
export declare function parseUrl(fullPath: string): object;
export declare function deepClone(obj: object): object | any[];
export declare const getCurrentRoute: () => Promise<string>;
export declare const getUniRoutePath: (url: string) => Promise<string>;
