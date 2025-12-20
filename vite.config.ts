import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// 環境変数でビルドモードを切り替え
const buildMode = process.env.BUILD_MODE || 'lib';

export default defineConfig({
    base: buildMode === 'docs' ? '/web-turntable-viewer-widget/' : '/',
    build: buildMode === 'docs' ? {
        // 埋め込みツールページのビルド（embed-generator/ → docs/）
        rollupOptions: {
            input: resolve(__dirname, 'embed-generator/index.html')
        },
        outDir: resolve(__dirname, 'docs'),
        emptyOutDir: true,
        sourcemap: true
    } : {
        // ライブラリモードでビルド（src/ → dist/）
        lib: {
            entry: resolve(__dirname, 'src/turntable-viewer.ts'),
            name: 'TurntableViewer',
            formats: ['es', 'umd'],
            fileName: (format) => {
                if (format === 'es') return 'turntable-viewer.js';
                if (format === 'umd') return 'turntable-viewer.umd.cjs';
                return `turntable-viewer.${format}.js`;
            }
        },
        rollupOptions: {
            external: ['@vimeo/player'],
            output: {
                globals: {
                    '@vimeo/player': 'Player'
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') return 'turntable-viewer.css';
                    return assetInfo.name || 'asset';
                }
            }
        },
        sourcemap: true,
        outDir: 'dist',
        emptyOutDir: true
    },
    // 開発サーバー設定
    server: {
        open: '/embed-generator/index.html',
        port: 3000
    },
    // プレビューサーバー設定
    preview: {
        open: true,
        port: 3000
    }
});
