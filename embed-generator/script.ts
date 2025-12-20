// ウィジェットを直接import
import '../src/turntable-viewer.ts';

class EmbedGenerator {
    private form: HTMLFormElement;
    private vimeoUrl: HTMLInputElement;
    private videoWidth: HTMLInputElement;
    private rotationDirection: HTMLSelectElement;
    private generateBtn: HTMLButtonElement;
    private previewSection: HTMLElement;
    private codeSection: HTMLElement;
    private previewArea: HTMLElement;
    private codeContent: HTMLElement;
    private copyBtn: HTMLButtonElement;
    private urlError: HTMLElement;

    constructor() {
        this.form = document.getElementById('generatorForm') as HTMLFormElement;
        this.vimeoUrl = document.getElementById('vimeoUrl') as HTMLInputElement;
        this.videoWidth = document.getElementById('videoWidth') as HTMLInputElement;
        this.rotationDirection = document.getElementById('rotationDirection') as HTMLSelectElement;
        this.generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
        this.previewSection = document.getElementById('previewSection') as HTMLElement;
        this.codeSection = document.getElementById('codeSection') as HTMLElement;
        this.previewArea = document.getElementById('previewArea') as HTMLElement;
        this.codeContent = document.getElementById('codeContent') as HTMLElement;
        this.copyBtn = document.getElementById('copyBtn') as HTMLButtonElement;
        this.urlError = document.getElementById('urlError') as HTMLElement;

        this.bindEvents();
    }

    bindEvents(): void {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateEmbed();
        });

        this.copyBtn.addEventListener('click', () => {
            this.copyCode();
        });
    }

    extractVideoId(url: string): string | null {
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

    generateEmbed(): void {
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

    createEmbedCode(videoId: string, width: number, isClockwise: boolean): string {
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

    showError(message: string): void {
        this.urlError.textContent = message;
        this.urlError.style.display = 'block';
    }

    showPreview(videoId: string, width: number, isClockwise: boolean): void {
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

    showCode(embedCode: string): void {
        // 前後の空白行を完全に除去
        const cleanedCode = embedCode.trim();

        // プレーンテキストを保存（コピー用）
        const plainCode = cleanedCode;

        this.codeContent.textContent = plainCode;
        this.codeContent.dataset.plainCode = plainCode;
        this.codeSection.style.display = 'block';
    }

    async copyCode(): Promise<void> {
        try {
            // プレーンテキストをコピー
            const textToCopy = this.codeContent.dataset.plainCode || this.codeContent.textContent || '';
            await navigator.clipboard.writeText(textToCopy);
            this.copyBtn.textContent = 'コピー完了!';
            this.copyBtn.classList.add('copy-success');

            setTimeout(() => {
                this.copyBtn.textContent = 'コピー';
                this.copyBtn.classList.remove('copy-success');
            }, 2000);
        } catch (err) {
            // フォールバック
            const textArea = document.createElement('textarea');
            const textToCopy = this.codeContent.dataset.plainCode || this.codeContent.textContent || '';
            textArea.value = textToCopy;
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
