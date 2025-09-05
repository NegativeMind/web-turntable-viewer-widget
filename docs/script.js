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
        const url = this.vimeoUrl.value.trim();
        const width = parseInt(this.videoWidth.value) || 480;
        const isClockwise = this.rotationDirection.value === 'clockwise';

        // エラーをクリア
        this.urlError.style.display = 'none';

        let finalUrl = url;

        // URLが空の場合はデフォルトURLを使用
        if (!url) {
            finalUrl = 'https://vimeo.com/1114427944'; // デフォルトのデモ動画
            // 入力欄にもデフォルト値を表示
            this.vimeoUrl.value = finalUrl;
        }

        const videoId = this.extractVideoId(finalUrl);
        if (!videoId) {
            this.showError('有効なVimeoのURLを入力してください。\n例: https://vimeo.com/1114427944');
            return;
        }

        // 埋め込みコード生成
        const embedCode = this.createEmbedCode(videoId, width, isClockwise);

        // プレビュー表示
        this.showPreview(embedCode);

        // コード表示
        this.showCode(embedCode);
    }

    createEmbedCode(videoId, width, isClockwise) {
        const clockwiseAttr = isClockwise ? 'clockwise-rotation' : 'clockwise-rotation="false"';

        const embedCode = [
            '<script src="https://player.vimeo.com/api/player.js"><' + '/script>',
            '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/NegativeMind/web-turntable-viewer-widget@v0.1.3-beta/dist/turntable-viewer.css">',
            '<div class="turntable-wrapper">',
            '  <div vimeo-video-id="' + videoId + '" ' + clockwiseAttr + '>',
            '    <iframe width="' + width + '" height="' + Math.round(width * 9 / 16) + '" frameborder="0" allowfullscreen></iframe>',
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
            '<script src="https://cdn.jsdelivr.net/gh/NegativeMind/web-turntable-viewer-widget@v0.1.3-beta/dist/turntable-viewer.js"><' + '/script>'
        ];

        return embedCode.join('\n').trim();
    }

    showError(message) {
        this.urlError.textContent = message;
        this.urlError.style.display = 'block';
    }

    handleInitError(container) {
        // エラー表示を更新
        const loadingText = container.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = 'プレビュー読み込みエラー';
            loadingText.style.color = '#e53e3e';
        }

        // プログレスバーを非表示にする
        const progressContainer = container.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }

    showPreview(embedCode) {
        // プレビューエリアをクリア
        this.previewArea.innerHTML = '';

        // 既存のターンテーブルインスタンスをクリア
        if (window.TurntableViewer && window.turntableViewerInstances) {
            window.turntableViewerInstances.clear();
        }

        // スクリプトが既に読み込まれているかチェック
        const vimeoScriptExists = document.querySelector('script[src*="player.vimeo.com"]');
        const turntableScriptExists = document.querySelector('script[src*="turntable-viewer.js"]');

        // 一時的なコンテナを作成
        const previewContainer = document.createElement('div');
        previewContainer.innerHTML = embedCode;

        // プレビュー用の特別な属性に変更して自動初期化を回避
        const vimeoContainers = previewContainer.querySelectorAll('[vimeo-video-id]');
        vimeoContainers.forEach(container => {
            const videoId = container.getAttribute('vimeo-video-id');
            container.removeAttribute('vimeo-video-id'); // 自動初期化を回避
            container.setAttribute('data-preview-video-id', videoId); // プレビュー用属性
            container.dataset.previewMode = 'true';

            // プレビュー生成時にローディングオーバーレイを初期状態で非表示にする
            const loadingOverlay = container.querySelector('.loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
                loadingOverlay.classList.add('hidden');
            }
        });

        // スクリプトタグを処理
        const scripts = previewContainer.querySelectorAll('script');
        const scriptPromises = [];

        scripts.forEach(script => {
            if (script.src) {
                // 既に同じスクリプトが読み込まれているかチェック
                if (script.src.includes('player.vimeo.com') && vimeoScriptExists) {
                    script.remove();
                    return;
                }
                if (script.src.includes('turntable-viewer.js') && turntableScriptExists) {
                    script.remove();
                    return;
                }

                // 新しい外部スクリプト
                const newScript = document.createElement('script');
                newScript.src = script.src;
                const promise = new Promise((resolve) => {
                    newScript.onload = () => resolve(true);
                    newScript.onerror = () => resolve(false);
                });
                document.head.appendChild(newScript);
                scriptPromises.push(promise);
                script.remove();
            }
        });

        // HTMLコンテンツを追加
        this.previewArea.appendChild(previewContainer);

        // スクリプトの読み込み完了を待ってからターンテーブルを初期化
        const initializeTurntable = () => {
            // DOM要素の準備を確認する関数
            const waitForDOMReady = (container, maxAttempts = 10) => {
                return new Promise((resolve, reject) => {
                    let attempts = 0;
                    const checkDOM = () => {
                        attempts++;

                        // 必要な要素がすべて存在するかチェック
                        const iframe = container.querySelector('iframe');
                        const loadingOverlay = container.querySelector('.loading-overlay');
                        const progressFill = container.querySelector('.progress-fill');
                        const progressText = container.querySelector('.progress-text');
                        const loadingText = container.querySelector('.loading-text');

                        if (iframe && loadingOverlay && progressFill && progressText && loadingText) {
                            resolve(true);
                        } else if (attempts >= maxAttempts) {
                            reject(new Error(`DOM要素の準備が完了しませんでした (試行回数: ${attempts})`));
                        } else {
                            setTimeout(checkDOM, 100);
                        }
                    };
                    checkDOM();
                });
            };

            setTimeout(() => {
                try {
                    // プレビュー用のコンテナを検索（data-preview-video-id属性で）
                    const containers = this.previewArea.querySelectorAll('[data-preview-video-id]');

                    if (containers.length === 0) {
                        console.warn('プレビュー用のターンテーブルコンテナが見つかりませんでした');
                        return;
                    }

                    containers.forEach(async (container, index) => {
                        if (window.Vimeo && typeof window.TurntableViewer !== 'undefined') {
                            // 既に初期化されているかチェック
                            if (!container.dataset.initialized) {
                                try {
                                    // 一意のIDを設定
                                    const uniqueId = `preview-turntable-${Date.now()}-${index}`;
                                    container.id = uniqueId;

                                    // プレビュー専用のマーカーを確認
                                    const videoId = container.getAttribute('data-preview-video-id');
                                    if (!videoId) {
                                        console.warn('Preview video ID not found');
                                        return;
                                    }

                                    // プレビュー用の属性を正式な属性に戻す（初期化直前）
                                    container.setAttribute('vimeo-video-id', videoId);
                                    container.removeAttribute('data-preview-video-id');

                                    // DOM要素の準備を待つ
                                    await waitForDOMReady(container);

                                    console.log(`DOM準備完了、ターンテーブル初期化開始: ${uniqueId}`);

                                    // 初期化開始時にローディングオーバーレイを表示
                                    const loadingOverlay = container.querySelector('.loading-overlay');
                                    if (loadingOverlay) {
                                        loadingOverlay.style.display = 'flex';
                                        loadingOverlay.classList.remove('hidden');
                                    }

                                    // 少し待ってから初期化（他の初期化との競合を避ける）
                                    setTimeout(() => {
                                        try {
                                            new window.TurntableViewer(uniqueId);
                                            container.dataset.initialized = 'true';
                                            console.log(`プレビュー用ターンテーブル初期化完了: ${uniqueId}`);
                                        } catch (innerError) {
                                            console.error('ターンテーブル初期化内部エラー:', innerError);
                                            this.handleInitError(container);
                                        }
                                    }, 200);
                                } catch (error) {
                                    console.error('ターンテーブル初期化エラー:', error);
                                    this.handleInitError(container);
                                }
                            }
                        } else {
                            console.warn('Vimeo Player API または TurntableViewer が利用できません');
                            // 少し待ってから再試行
                            setTimeout(initializeTurntable, 1000);
                        }
                    });
                } catch (error) {
                    console.error('プレビュー初期化中にエラーが発生しました:', error);
                }
            }, 500); // 初期化時間を短縮してDOM準備チェックに任せる
        };

        if (scriptPromises.length > 0) {
            Promise.all(scriptPromises).then((results) => {
                const allLoaded = results.every(result => result === true);
                if (allLoaded) {
                    initializeTurntable();
                } else {
                    console.warn('一部のスクリプトの読み込みに失敗しました');
                    initializeTurntable(); // それでも初期化を試行
                }
            });
        } else {
            initializeTurntable();
        }

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
