declare module '*.css' {
    const content: Record<string, string>;
    export default content;
}
declare const __APP_VERSION__: string

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}