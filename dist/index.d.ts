interface Route {
    query: object;
    path: string;
    fullPath: string;
}
interface toRoute {
    query?: object;
    path?: string;
    fullPath?: string;
    [key: string]: any;
}
interface Platform {
    switchTab: Function;
    navigateTo: Function;
    redirectTo: Function;
    navigateBack: Function;
    reLaunch: Function;
    [key: string]: any;
}
declare class Router {
    currentRoute: Route;
    protected _platform: Platform;
    protected mode: string;
    get platform(): {
        ready(callback: any): void;
    };
    get app(): any;
    ready(callback: any): void;
    tabBars: string[];
    tabAction(to: toRoute): string;
    push(to?: string | toRoute): void;
    replace(to?: string | toRoute): void;
    go(delta: number): Promise<void>;
    back(): void;
    relaunch(to?: string | toRoute): void;
    reLaunch(to?: string | toRoute): void;
    navigate(action?: string, to?: toRoute): Promise<void>;
    getPlatform(): Promise<Platform>;
    install(Vue: any, options: any): void;
}
declare const _default: Router;
export default _default;
