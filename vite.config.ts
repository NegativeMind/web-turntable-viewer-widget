import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    // ライブラリモードでビルド
    build: {
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
            // Vimeo Playerは外部依存として扱う（CDNから読み込まれる想定）
            external: ['@vimeo/player'],
            output: {
                globals: {
                    '@vimeo/player': 'Player'
                },
                // CSSを別ファイルとして出力
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') return 'turntable-viewer.css';
                    return assetInfo.name;
                }
            }
        },
        // ソースマップを生成
        sourcemap: true,
        // 出力先をdistに設定
        outDir: 'dist',
        // 既存のdistフォルダをクリア
        emptyOutDir: true
    },
    // 開発サーバー設定
    server: {
        open: '/tests/test.html',
        port: 3000
    },
    // プレビューサーバー設定
    preview: {
        port: 3000,
        open: '/embed-generator/index.html'
    }
});
