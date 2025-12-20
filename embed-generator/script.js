// ウィジェットを直接import
import '../src/turntable-viewer.ts';

class EmbedGenerator {
    constructor() {
        this.form = document.getElementById('generatorForm');
        this.vimeoUrl = document.getElementById('vimeoUrl');
        this.videoWidth = document.getElementById('videoWidth');
        this.rotationDirection = document.getElementById('rotationDirection');
        this.generateBtn = document.getElementById('generateBtn');
        this.previewSection = document.getElementById('previewSection');
        this.codeSection = document.getElementById('codeSection');
        this.previewArea = document.getElementById('previewArea');
        this.codeContent = document.getElementById('codeContent');
        this.copyBtn = document.getElementById('copyBtn');
        this.urlError = document.getElementById('urlError');

        this.bindEvents();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateEmbed();
        });

        this.copyBtn.addEventListener('click', () => {
            this.copyCode();
        });
    }

    extractVideoId(url) {
        const patterns = [
            /vimeo\.com\/(\d+)/,
            /player\.vimeo\.com\/video\/(\d+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    }

    generateEmbed() {
        let url = this.vimeoUrl.value.trim();
        const width = parseInt(this.videoWidth.value) || 480;
        const isClockwise = this.rotationDirection.value === 'clockwise';

        // エラーをクリア
        this.urlError.style.display = 'none';

        let finalUrl = url;

        // URLが空の場合はplaceholder値を使用
        if (!url) {
            finalUrl = this.vimeoUrl.placeholder || 'https://vimeo.com/1118303126';
            this.vimeoUrl.value = finalUrl;
        }

        const videoId = this.extractVideoId(finalUrl);
        if (!videoId) {
            this.showError('有効なVimeoのURLを入力してください。\\n例: https://vimeo.com/1118303126');
            return;
        }

        // 埋め込みコード生成
        const embedCode = this.createEmbedCode(videoId, width, isClockwise);

        // プレビュー表示
        this.showPreview(videoId, width, isClockwise);

        // コード表示
        this.showCode(embedCode);
    }

    createEmbedCode(videoId, width, isClockwise) {
        const clockwiseAttr = isClockwise ? 'clockwise-rotation' : 'clockwise-rotation="false"';

        const embedCode = [
            '<script src="https://player.vimeo.com/api/player.js"><' + '/script>',
            '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/NegativeMind/web-turntable-viewer-widget@v0.1.4-beta/dist/turntable-viewer.css">',
            '<div class="turntable-wrapper">',
            '  <div vimeo-video-id="' + videoId + '" ' + clockwiseAttr + '>',
            '    <iframe width="' + width + '" frameborder="0" allowfullscreen></iframe>',
            '    <div class="drag-overlay"></div>',
            '    <div class="loading-overlay">',
            '      <div class="loading-content">',
            '        <div class="loading-text">Loading turntable...</div>',
            '        <div class="progress-container">',
            '          <div class="progress-bar">',
            '            <div class="progress-fill"></div>',
            '          </div>',
            '          <div class="progress-text">0%</div>',
            '        </div>',
            '      </div>',
            '    </div>',
            '  </div>',
            '  <a class="vimeo-link" href="https://vimeo.com/' + videoId + '" target="_blank">View on Vimeo</a>',
            '</div>',
            '<script src="https://cdn.jsdelivr.net/gh/NegativeMind/web-turntable-viewer-widget@v0.1.4-beta/dist/turntable-viewer.js"><' + '/script>'
        ];

        return embedCode.join('\\n').trim();
    }

    showError(message) {
        this.urlError.textContent = message;
        this.urlError.style.display = 'block';
    }

    showPreview(videoId, width, isClockwise) {
        // プレビューエリアをクリア
        this.previewArea.innerHTML = '';

        // 既存のターンテーブルインスタンスをクリア（プレビュー用のみ）
        if (window.turntableViewerInstances) {
            const instancesToRemove = [];
            window.turntableViewerInstances.forEach(id => {
                if (id.startsWith('preview-turntable-')) {
                    instancesToRemove.push(id);
                }
            });
            instancesToRemove.forEach(id => {
                window.turntableViewerInstances.delete(id);
            });
        }

        // プレビュー用のHTMLを構築
        const clockwiseAttr = isClockwise ? 'clockwise-rotation' : 'clockwise-rotation="false"';
        const containerId = `preview-turntable-${Date.now()}`;

        const previewHTML = `
            <div class="turntable-wrapper">
                <div id="${containerId}" vimeo-video-id="${videoId}" ${clockwiseAttr}>
                    <iframe width="${width}" frameborder="0" allowfullscreen></iframe>
                    <div class="drag-overlay"></div>
                    <div class="loading-overlay">
                        <div class="loading-content">
                            <div class="loading-text">Loading turntable...</div>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill"></div>
                                </div>
                                <div class="progress-text">0%</div>
                            </div>
                        </div>
                    </div>
                </div>
                <a class="vimeo-link" href="https://vimeo.com/${videoId}" target="_blank">View on Vimeo</a>
            </div>
        `;

        this.previewArea.innerHTML = previewHTML;

        // ターンテーブルを初期化
        setTimeout(() => {
            try {
                if (window.TurntableViewer && window.Vimeo) {
                    new window.TurntableViewer(containerId);
                    console.log('プレビュー用ターンテーブル初期化完了:', containerId);
                } else {
                    console.error('TurntableViewer または Vimeo Player API が利用できません');
                }
            } catch (error) {
                console.error('プレビュー初期化エラー:', error);
            }
        }, 300);

        this.previewSection.style.display = 'block';
    }

    showCode(embedCode) {
        // 前後の空白行を完全に除去
        const cleanedCode = embedCode.trim();

        // プレーンテキストを保存（コピー用）
        this.plainCode = cleanedCode;

        this.codeContent.textContent = cleanedCode;
        this.codeSection.style.display = 'block';
    }

    async copyCode() {
        try {
            // プレーンテキストをコピー
            await navigator.clipboard.writeText(this.plainCode || this.codeContent.textContent);
            this.copyBtn.textContent = 'コピー完了!';
            this.copyBtn.classList.add('copy-success');

            setTimeout(() => {
                this.copyBtn.textContent = 'コピー';
                this.copyBtn.classList.remove('copy-success');
            }, 2000);
        } catch (err) {
            // フォールバック
            const textArea = document.createElement('textarea');
            textArea.value = this.plainCode || this.codeContent.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            this.copyBtn.textContent = 'コピー完了!';
            setTimeout(() => {
                this.copyBtn.textContent = 'コピー';
            }, 2000);
        }
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    new EmbedGenerator();
});
