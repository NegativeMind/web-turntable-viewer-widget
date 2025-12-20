/// <reference types="vite/client" />

// CSS modules
declare module '*.css' {
    const content: string;
    export default content;
}

// CSS副作用インポート用
declare module '*.css' {
    const content: void;
    export = content;
}
