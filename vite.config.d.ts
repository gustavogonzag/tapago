export declare const pwaOptions: {
    registerType: 'autoUpdate';
    workbox: {
        maximumFileSizeToCacheInBytes: number;
        globPatterns: string[];
    };
    manifest: {
        name: string;
        short_name: string;
        description: string;
        display: 'standalone';
        theme_color: string;
        background_color: string;
        lang: string;
    };
};
declare const _default: import("vite").UserConfig;
export default _default;
