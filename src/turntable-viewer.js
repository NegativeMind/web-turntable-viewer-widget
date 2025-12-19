// CSSをインポート
import './turntable-viewer.css';

/**
 * Web Turntable Viewer
 * ドラッグ操作で360度回転表示を制御するクラス
 */
class TurntableViewer {
    constructor(containerId) {
        // DOM要素の取得
        this.container = document.getElementById(containerId);
        this.iframe = this.container.querySelector('iframe');
        this.angleEl = this.container.querySelector('#rotation-angle');
        this.angleDisplay = this.container.querySelector('#angle-display');
        this.dragOverlay = this.container.querySelector('.drag-overlay');

        // プログレスバー関連要素
        this.loadingOverlay = this.container.querySelector('.loading-overlay');
        this.loadingText = this.container.querySelector('.loading-text');
        this.progressFill = this.container.querySelector('.progress-fill');
        this.progressText = this.container.querySelector('.progress-text');

        // リロードボタンを作成・追加
        this.createReloadButton();

        // DOM要素の存在確認
        console.log('DOM elements check:');
        console.log('- container:', !!this.container);
        console.log('- iframe:', !!this.iframe);
        console.log('- loadingOverlay:', !!this.loadingOverlay);
        console.log('- progressFill:', !!this.progressFill);
        console.log('- progressText:', !!this.progressText);
        console.log('- loadingText:', !!this.loadingText);
        console.log('- angleEl (optional):', !!this.angleEl);
        console.log('- angleDisplay (optional):', !!this.angleDisplay);

        // 必須要素のチェック（angle要素はオプション）
        if (!this.container || !this.iframe || !this.loadingOverlay) {
            throw new Error('Required elements not found: container, iframe, or loading-overlay');
        }

        console.log('DOM elements validation passed');

        // 設定を取得（videoIdの検証含む）
        try {
            this.config = this.getConfig();
            console.log('Configuration loaded:', this.config);
        } catch (error) {
            console.error('Configuration error:', error.message);
            this.showError('Configuration Error', error.message);
            throw error; // 初期化を停止
        }

        // 状態管理
        this.state = {
            player: null,
            duration: 0,
            isPlayerReady: false,
            isPreloaded: false, // 動画事前読み込み完了フラグ
            isDragging: false,
            dragStartX: 0,
            startTime: 0,
            lastDragUpdate: 0, // ドラッグ更新のスロットリング用
            lastDisplayedAngle: null, // 角度表示の最適化用
            pendingApiCall: null // API呼び出し管理用
        };

        // イベントハンドラーをバインド
        this.bindMethods();

        // 初期化
        this.initialize();
    }

    /**
     * 設定を取得
     */
    getConfig() {
        const videoId = this.container.getAttribute('vimeo-video-id');

        // clockwise-rotation属性の取得（ブール値）
        const clockwiseAttr = this.container.getAttribute('clockwise-rotation');
        let isClockwise = true; // デフォルトは時計回り

        if (clockwiseAttr !== null) {
            // 属性が存在する場合の値判定
            if (clockwiseAttr === '' || clockwiseAttr === 'true' || clockwiseAttr === '1') {
                isClockwise = true;
            } else if (clockwiseAttr === 'false' || clockwiseAttr === '0') {
                isClockwise = false;
            } else {
                console.warn(`Invalid clockwise-rotation attribute value: "${clockwiseAttr}". Using default "true".`);
                isClockwise = true;
            }
        }

        // videoIdが指定されていない場合はエラーを出す
        if (!videoId) {
            throw new Error('vimeo-video-id attribute is required on the container element');
        }

        // セキュリティ: videoIdの形式検証（数字のみ許可）
        if (!/^\d+$/.test(videoId)) {
            throw new Error(`Invalid vimeo-video-id format: "${videoId}". Only numeric IDs are allowed.`);
        }

        return {
            RESIZE_DEBOUNCE_MS: 500,
            PLAYER_LOAD_DELAY_MS: 1000,
            DRAG_THROTTLE_MS: 16, // 約60FPS
            isClockwise: isClockwise,
            videoId: videoId
        };
    }

    /**
     * 表示サイズに基づいてPIXELS_PER_ROTATIONを動的に計算
     */
    calculatePixelsPerRotation() {
        // サイズ取得の優先順位:
        // 1. HTMLのwidth属性
        // 2. 計算されたサイズ（CSS適用後）
        // 3. デフォルト値

        const htmlWidth = parseInt(this.iframe.getAttribute('width')) || 0;
        // レスポンシブ対応: 親要素とiframe自体のサイズを比較
        const containerWidth = this.container.clientWidth || 0;
        const iframeWidth = this.iframe.clientWidth || 0;
        const computedWidth = Math.max(containerWidth, iframeWidth) || 0;

        const finalWidth = htmlWidth || computedWidth || 320;

        console.log(`Container width for calculation: ${finalWidth}px (html: ${htmlWidth}, container: ${containerWidth}, iframe: ${iframeWidth})`);

        // 基準サイズでの基準値から比例計算
        // モバイル向けに感度を調整
        const basePixels = 1200;
        const baseScreenSize = 640;

        // 線形スケーリング + モバイル用調整
        let pixelsPerRotation = (finalWidth / baseScreenSize) * basePixels;

        // スマホ画面では感度を少し上げる（操作しやすくする）
        if (finalWidth <= 480) {
            pixelsPerRotation *= 1.2;
        }

        // 最小値: 250px（スマホでも操作しやすく）
        // 最大値: 3000px（大画面でも細かい制御が可能）
        pixelsPerRotation = Math.max(250, Math.min(3000, pixelsPerRotation));

        console.log(`Calculated PIXELS_PER_ROTATION: ${Math.round(pixelsPerRotation)} for width: ${finalWidth}px`);
        return Math.round(pixelsPerRotation);
    }

    /**
     * メソッドをバインド
     */
    bindMethods() {
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onWindowResize = this.debounce(this.onWindowResize.bind(this), this.config.RESIZE_DEBOUNCE_MS);
    }

    /**
     * 初期化
     */
    async initialize() {
        // 初期化時にAngle表示を非表示にする
        const angleDisplay = this.container.querySelector('#angle-display');
        if (angleDisplay) {
            angleDisplay.style.display = 'none';
        }

        // ローディングオーバーレイを表示
        this.showLoadingOverlay();

        try {
            await this.initializePlayer();
            this.attachEventListeners();
            console.log('TurntableViewer initialized successfully');

            // 初期化成功時は位置調整後にAngle表示を表示
            const angleDisplay = this.container.querySelector('#angle-display');
            if (angleDisplay) {
                // まず位置を調整
                this.adjustAngleDisplayPosition();
                // 調整後に表示
                angleDisplay.style.display = 'block';
                console.log('Angle display enabled after successful initialization and position adjustment');
            }

            // リロードボタンは常に表示（非表示にしない）
        } catch (error) {
            console.error('TurntableViewer initialization failed:', error);
            this.updateProgress(100, '初期化エラーが発生しました');
            this.hideLoadingOverlay();
            // エラー時もリロードボタンは常に表示
        }
    }

    /**
     * リロードボタンを作成
     */
    createReloadButton() {
        this.reloadButton = document.createElement('button');
        this.reloadButton.className = 'reload-button';
        this.reloadButton.title = 'ビデオを再読み込み';

        // リロードアイコン（Google Chromeスタイルの回転矢印）
        this.reloadButton.innerHTML = `
                <svg class="reload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 4v6h-6"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
            `;

        // クリックイベント
        this.reloadButton.addEventListener('click', () => {
            this.handleReload();
        });

        // コンテナに追加
        this.container.appendChild(this.reloadButton);
    }

    /**
     * リロードボタンを表示
     */
    showReloadButton() {
        if (this.reloadButton) {
            this.reloadButton.style.display = 'flex';
        }
    }

    /**
     * リロードボタンを非表示
     */
    hideReloadButton() {
        if (this.reloadButton) {
            this.reloadButton.style.display = 'none';
        }
    }

    /**
     * リロード処理
     */
    async handleReload() {
        if (this.isReloading) return;

        this.isReloading = true;
        this.reloadButton.classList.add('loading');

        try {
            console.log('Reloading turntable viewer...');

            // 現在のプレイヤーを破棄
            if (this.player) {
                try {
                    this.player.destroy();
                } catch (e) {
                    console.warn('Error destroying player:', e);
                }
                this.player = null;
            }

            // 状態をリセット
            this.state = {
                isReady: false,
                isDragging: false,
                currentTime: 0
            };

            // ローディングタイムアウトをリセット
            this.loadingStartTime = null;

            // 初期化をやり直し
            await this.initialize();

        } catch (error) {
            console.error('Reload failed:', error);
        } finally {
            this.isReloading = false;
            this.reloadButton.classList.remove('loading');
        }
    }

    /**
     * 表示サイズに応じた動画品質選択
     */
    selectVideoQuality() {
        // サイズ取得の優先順位:
        // 1. video属性で指定されたサイズ
        // 2. HTMLのwidth/height属性
        // 3. 計算されたサイズ（CSS適用後）
        // 4. デフォルト値

        const videoWidth = parseInt(this.container.getAttribute('video-width')) || 0;
        const videoHeight = parseInt(this.container.getAttribute('video-height')) || 0;
        const htmlWidth = parseInt(this.iframe.getAttribute('width')) || 0;
        const htmlHeight = parseInt(this.iframe.getAttribute('height')) || 0;
        const computedWidth = this.iframe.clientWidth || this.container.clientWidth || 0;
        const computedHeight = this.iframe.clientHeight || this.container.clientHeight || 0;

        // 実際に使用される最終サイズを計算（buildVideoUrlと同じロジック）
        const finalWidth = videoWidth || htmlWidth || computedWidth || 480;
        const finalHeight = videoHeight || htmlHeight || finalWidth; // 360度動画は正方形（1:1）が一般的

        // 面積ベースでの品質選択
        const area = finalWidth * finalHeight;
        const effectiveArea = Math.sqrt(area);

        const devicePixelRatio = window.devicePixelRatio || 1;

        // HTMLまたはvideo属性で明示的にサイズが指定されている場合はDPRの影響を制限
        let effectiveSize;
        if ((htmlWidth && htmlHeight) || (videoWidth && videoHeight)) {
            const limitedDPR = Math.min(devicePixelRatio, 1.5);
            effectiveSize = effectiveArea * limitedDPR;
        } else {
            effectiveSize = effectiveArea * devicePixelRatio;
        }

        // 品質選択
        let selectedQuality = '240p';
        if (effectiveSize <= 240) {
            selectedQuality = '240p';
        } else if (effectiveSize <= 360) {
            selectedQuality = '360p';
        } else if (effectiveSize <= 480) {
            selectedQuality = '540p';
        } else if (effectiveSize <= 960) {
            selectedQuality = '720p';
        } else if (effectiveSize <= 1280) {
            selectedQuality = '1080p';
        } else if (effectiveSize <= 1920) {
            selectedQuality = '2k';
        } else {
            selectedQuality = '4k';
        }

        console.log(`Selected quality: ${selectedQuality} for effective size: ${effectiveSize}px (${finalWidth}x${finalHeight})`);
        return selectedQuality;
    }

    /**
     * 動画URLを構築
     */
    buildVideoUrl() {
        const quality = this.selectVideoQuality();

        // サイズ情報を取得
        const videoWidth = parseInt(this.container.getAttribute('video-width')) || 0;
        const videoHeight = parseInt(this.container.getAttribute('video-height')) || 0;
        const htmlWidth = parseInt(this.iframe.getAttribute('width')) || 0;
        const htmlHeight = parseInt(this.iframe.getAttribute('height')) || 0;

        // 優先順位: video-width > width属性 > デフォルト
        let finalWidth = videoWidth || htmlWidth || 480;
        let finalHeight = videoHeight || htmlHeight || finalWidth; // 360度動画は正方形（1:1）が一般的

        // スマホ対応: 画面幅が狭い場合は調整
        const screenWidth = window.innerWidth || document.documentElement.clientWidth;
        if (screenWidth <= 768) {
            // スマホ・タブレットでは画面幅の90%を使用（余白を考慮）
            const containerWidth = this.container.clientWidth || this.container.parentElement?.clientWidth || screenWidth;
            const availableWidth = Math.floor(containerWidth * 0.9); // 90%使用
            if (availableWidth > 200) { // 最小サイズ確保
                finalWidth = availableWidth;
                finalHeight = availableWidth; // 正方形を維持
            }
        }

        // iframe要素にサイズを設定（属性とスタイルの両方）
        this.iframe.setAttribute('width', finalWidth.toString());
        this.iframe.setAttribute('height', finalHeight.toString());

        // スマホではCSSスタイルも直接設定
        if (screenWidth <= 768) {
            this.iframe.style.width = finalWidth + 'px';
            this.iframe.style.height = finalHeight + 'px';
            this.iframe.style.maxWidth = 'none';
            this.iframe.style.display = 'block';
            console.log(`Applied direct CSS styles: ${finalWidth}x${finalHeight}`);
        }

        const params = new URLSearchParams({
            background: '1',
            byline: '0',
            portrait: '0',
            title: '0',
            speed: '0',
            transparent: '1',
            gesture: 'media',
            autopause: '0',
            muted: '1',
            loop: '1',
            controls: '0',
            quality: quality,
            responsive: '0', // responsiveを無効にしてサイズ固定
            dnt: '1'
        });

        const url = `https://player.vimeo.com/video/${this.config.videoId}?${params.toString()}`;
        console.log(`Video URL set: ${url} (Size: ${finalWidth}x${finalHeight}, Screen: ${screenWidth})`);
        return url;
    }

    /**
     * Vimeo oEmbed APIから動画情報を事前取得
     */
    async getVideoInfoFromAPI() {
        try {
            // セキュリティ: videoIdの再検証
            if (!/^\d+$/.test(this.config.videoId)) {
                throw new Error('Invalid video ID format for API call');
            }

            const oembedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${this.config.videoId}`;
            console.log(`Fetching video info from: ${oembedUrl}`);

            // API呼び出し前に少し待機（競合状態を減らす）
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500));

            // タイムアウト付きでfetch実行
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

            const response = await fetch(oembedUrl, {
                signal: controller.signal,
                referrerPolicy: 'no-referrer', // セキュリティ強化
                headers: {
                    'Accept': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Video not found (ID: ${this.config.videoId}). Please check the video ID.`);
                } else if (response.status === 403) {
                    throw new Error(`Access denied to video (ID: ${this.config.videoId}). Video may be private.`);
                } else if (response.status >= 500) {
                    throw new Error(`Vimeo server error (status: ${response.status}). Please try again later.`);
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const data = await response.json();

            // APIレスポンスの検証
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid API response format');
            }

            if (!data.width || !data.height || data.width <= 0 || data.height <= 0) {
                throw new Error('Invalid video dimensions in API response');
            }

            const aspectRatio = data.height / data.width;

            console.log(`API Video dimensions: ${data.width}x${data.height}, aspect ratio: ${aspectRatio.toFixed(3)}`);

            return {
                width: data.width,
                height: data.height,
                aspectRatio: aspectRatio,
                title: data.title || 'Untitled Video'
            };
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('API request timed out, using default aspect ratio');
            } else {
                console.warn('Could not fetch video info from API:', error.message);
            }

            // フォールバック値を返す
            return {
                width: 1920,
                height: 1080,
                aspectRatio: 9 / 16, // 16:9のデフォルト
                title: 'Untitled Video'
            };
        }
    }
    async setInitialSizeFromAPI() {
        try {
            // 指定された幅・高さを取得
            const currentWidth = parseInt(this.iframe.getAttribute('width')) || 0;
            const currentHeight = parseInt(this.iframe.getAttribute('height')) || 0;

            // 初期状態でiframeを完全に隠す（一切のサイズ表示を防ぐ）
            this.iframe.style.visibility = 'hidden';

            // width・heightの両方が指定されている場合はそのまま使用
            if (currentWidth && currentHeight) {
                console.log(`Both width and height specified: ${currentWidth}x${currentHeight}`);
                this.container.classList.add('initialized');
                this.iframe.style.visibility = 'visible';
                this.iframe.classList.add('size-ready');
                console.log('Container and iframe ready with fixed size');

                // サイズが確定したのでローディングオーバーレイのサイズも調整
                this.adjustLoadingOverlaySize();
                return;
            }

            // widthまたはheightのどちらか一方のみ指定の場合はAPI情報でアスペクト比を取得
            if (currentWidth || currentHeight) {
                this.updateProgress(5, 'Getting video information...');

                const videoInfo = await this.getVideoInfoFromAPI();

                if (currentWidth && !currentHeight) {
                    // 幅が指定されている場合：高さを計算
                    const calculatedHeight = Math.round(currentWidth * videoInfo.aspectRatio);
                    this.iframe.setAttribute('height', calculatedHeight.toString());
                    console.log(`Set height from width: ${currentWidth}x${calculatedHeight} (aspect ratio: ${videoInfo.aspectRatio.toFixed(3)})`);
                } else if (currentHeight && !currentWidth) {
                    // 高さが指定されている場合：幅を計算
                    const calculatedWidth = Math.round(currentHeight / videoInfo.aspectRatio);
                    this.iframe.setAttribute('width', calculatedWidth.toString());
                    console.log(`Set width from height: ${calculatedWidth}x${currentHeight} (aspect ratio: ${videoInfo.aspectRatio.toFixed(3)})`);
                }

                // 正確なサイズが設定されたのでコンテナとiframeを表示
                this.container.classList.add('initialized');
                this.iframe.style.visibility = 'visible';
                this.iframe.classList.add('size-ready');
                console.log('Container and iframe size ready, made visible');

                // サイズ計算が完了したのでローディングオーバーレイのサイズも調整
                this.adjustLoadingOverlaySize();
            } else {
                // width・heightのどちらも指定されていない場合はデフォルト値を使用
                const defaultWidth = 480;
                this.updateProgress(5, 'Getting video information...');

                const videoInfo = await this.getVideoInfoFromAPI();
                const calculatedHeight = Math.round(defaultWidth * videoInfo.aspectRatio);

                this.iframe.setAttribute('width', defaultWidth.toString());
                this.iframe.setAttribute('height', calculatedHeight.toString());
                console.log(`Set default size: ${defaultWidth}x${calculatedHeight} (aspect ratio: ${videoInfo.aspectRatio.toFixed(3)})`);

                this.container.classList.add('initialized');
                this.iframe.style.visibility = 'visible';
                this.iframe.classList.add('size-ready');
                console.log('Container and iframe size ready with default size');

                // デフォルトサイズが設定されたのでローディングオーバーレイのサイズも調整
                this.adjustLoadingOverlaySize();
            }

            // 全体の処理が完了したことを確認
            console.log('setInitialSizeFromAPI completed');
        } catch (error) {
            console.warn('Could not set initial size from API:', error);
            // フォールバック: デフォルトの16:9を適用
            this.setInitialSizeFallback();
        }
    }

    /**
     * 初期サイズを設定（フォールバック版）
     */
    setInitialSizeFallback() {
        try {
            const currentWidth = parseInt(this.iframe.getAttribute('width')) || 0;
            const currentHeight = parseInt(this.iframe.getAttribute('height')) || 0;

            // width・heightの両方が指定されている場合はそのまま使用
            if (currentWidth && currentHeight) {
                console.log(`Fallback: Both width and height specified: ${currentWidth}x${currentHeight}`);
            } else if (currentWidth && !currentHeight) {
                // 幅のみ指定：16:9のデフォルトアスペクト比で高さを計算
                const defaultHeight = Math.round(currentWidth * (9 / 16));
                this.iframe.setAttribute('height', defaultHeight.toString());
                console.log(`Fallback: Set height from width: ${currentWidth}x${defaultHeight} (16:9 default aspect ratio)`);
            } else if (currentHeight && !currentWidth) {
                // 高さのみ指定：16:9のデフォルトアスペクト比で幅を計算
                const defaultWidth = Math.round(currentHeight / (9 / 16));
                this.iframe.setAttribute('width', defaultWidth.toString());
                console.log(`Fallback: Set width from height: ${defaultWidth}x${currentHeight} (16:9 default aspect ratio)`);
            } else {
                // どちらも指定されていない場合：デフォルトサイズ
                const defaultWidth = 480;
                const defaultHeight = Math.round(defaultWidth * (9 / 16));
                this.iframe.setAttribute('width', defaultWidth.toString());
                this.iframe.setAttribute('height', defaultHeight.toString());
                console.log(`Fallback: Set default size: ${defaultWidth}x${defaultHeight} (16:9 default aspect ratio)`);
            }

            // フォールバックでもコンテナとiframeを表示
            this.container.classList.add('initialized');
            this.iframe.style.visibility = 'visible';
            this.iframe.classList.add('size-ready');
            console.log('Container and iframe size ready (fallback), made visible');

            this.adjustLoadingOverlaySize();
        } catch (error) {
            console.warn('Could not set fallback initial size:', error);
        }
    }

    /**
     * 動画のアスペクト比を調整（プレイヤー情報から詳細確認）
     */
    async adjustVideoAspectRatio() {
        try {
            // 動画の自然なサイズを取得
            const videoWidth = await this.state.player.getVideoWidth();
            const videoHeight = await this.state.player.getVideoHeight();
            const aspectRatio = videoHeight / videoWidth;

            console.log(`Player Video dimensions: ${videoWidth}x${videoHeight}, aspect ratio: ${aspectRatio.toFixed(3)}`);

            // 現在のiframeサイズを取得
            const currentWidth = parseInt(this.iframe.getAttribute('width')) || 480;
            const currentHeight = parseInt(this.iframe.getAttribute('height')) || 480;
            const currentAspectRatio = currentHeight / currentWidth;
            const specifiedVideoHeight = parseInt(this.container.getAttribute('video-height')) || 0;

            // video-heightが指定されていない場合のみ、アスペクト比の差が大きい時に再調整
            if (!specifiedVideoHeight && Math.abs(currentAspectRatio - aspectRatio) > 0.01) {
                const calculatedHeight = Math.round(currentWidth * aspectRatio);
                this.iframe.setAttribute('height', calculatedHeight.toString());
                console.log(`Fine-tuned iframe size: ${currentWidth}x${calculatedHeight} (aspect ratio: ${aspectRatio.toFixed(3)})`);

                // ローディングオーバーレイのサイズも調整
                this.adjustLoadingOverlaySize();
            } else {
                console.log('Aspect ratio already correct, no adjustment needed');
            }
        } catch (error) {
            console.warn('Could not get video dimensions, keeping current size:', error);
            // エラーの場合は現在のサイズを維持
            this.adjustLoadingOverlaySize();
        }
    }

    /**
     * ローディングオーバーレイのサイズをiframe要素に合わせて調整
     */
    adjustLoadingOverlaySize() {
        if (!this.loadingOverlay || !this.iframe) return;

        // iframeの実際のサイズ（属性値）を取得
        const iframeWidth = parseInt(this.iframe.getAttribute('width'));
        const iframeHeight = parseInt(this.iframe.getAttribute('height'));

        // どちらも設定されている場合はそのまま使用
        if (iframeWidth && iframeHeight) {
            this.loadingOverlay.style.width = `${iframeWidth}px`;
            this.loadingOverlay.style.height = `${iframeHeight}px`;
            console.log(`Adjusted loading overlay size: ${iframeWidth}x${iframeHeight}`);
        } else {
            // サイズが未確定の場合はデフォルト値を使用
            const defaultWidth = 480;
            const defaultHeight = Math.round(defaultWidth * (9 / 16));
            this.loadingOverlay.style.width = `${defaultWidth}px`;
            this.loadingOverlay.style.height = `${defaultHeight}px`;
            console.log(`Adjusted loading overlay size to default: ${defaultWidth}x${defaultHeight}`);
        }
    }

    /**
     * 動画プレイヤーのセットアップ
     */
    setupVideoPlayer() {
        const videoUrl = this.buildVideoUrl();
        this.iframe.src = videoUrl;
    }

    /**
     * Vimeoプレイヤー初期化
     */
    async initializePlayer() {
        try {
            // 初期サイズを設定（API情報から実際のアスペクト比を取得）
            await this.setInitialSizeFromAPI();

            // 適切な動画を選択してiframeを設定
            this.setupVideoPlayer();

            this.updateProgress(20, 'Creating player...');

            // プレイヤーを作成（エラーハンドリング強化）
            try {
                this.state.player = new Vimeo.Player(this.iframe);
                this.updateProgress(40, 'Connecting to player...');
            } catch (error) {
                throw new Error(`Failed to create Vimeo player: ${error.message}`);
            }

            // iframeがロードされるまで待機
            await this.delay(this.config.PLAYER_LOAD_DELAY_MS);
            this.updateProgress(60, 'Loading player settings...');

            // プレイヤーの基本情報取得（タイムアウト付き）
            try {
                this.state.duration = await this.withTimeout(
                    this.state.player.getDuration(),
                    5000,
                    'Failed to get video duration'
                );
                console.log('Duration:', this.state.duration);
            } catch (error) {
                console.warn('Could not get video duration:', error.message);
                this.state.duration = 60; // デフォルト値
            }

            // 動画のサイズ情報を取得してアスペクト比を調整
            try {
                await this.adjustVideoAspectRatio();
            } catch (error) {
                console.warn('Could not adjust video aspect ratio:', error.message);
            }

            this.updateProgress(75, 'Applying player settings...');

            // プレイヤー設定を並列実行（個別エラーハンドリング）
            await this.applyPlayerSettings();

            this.updateProgress(85, 'Preloading video...');

            // 動画の事前ロード（バッファリング改善）
            try {
                await this.preloadVideo();
            } catch (error) {
                console.warn('Video preloading failed:', error.message);
            }

            this.updateProgress(90, 'Setting initial state...');

            // 初期状態設定（個別エラーハンドリング）
            try {
                await this.setInitialPlayerState();
            } catch (error) {
                console.warn('Could not set initial player state:', error.message);
            }

            // 初期角度表示を更新
            this.updateAngle(0);

            this.state.isPlayerReady = true;
            console.log('Player ready');

            // プログレス完了
            this.updateProgress(100, 'Initialization complete!');

            // 少し遅延してからローディングオーバーレイを隠す
            setTimeout(() => {
                this.hideLoadingOverlay();
            }, 500);

        } catch (error) {
            console.error('Player initialization failed:', error);

            // エラーの種類に応じた処理
            if (error.message.includes('Failed to create Vimeo player')) {
                this.showError('Player Error', 'Could not create video player. Please check your connection and try again.');
            } else if (error.message.includes('Video not found')) {
                this.showError('Video Not Found', 'The specified video could not be found. Please check the video ID.');
            } else if (error.message.includes('Access denied')) {
                this.showError('Access Denied', 'This video is private or restricted. Please check the video permissions.');
            } else {
                this.showError('Initialization Error', 'Failed to load the video player. Please try refreshing the page.');
            }

            // エラー時もコンテナを表示（フォールバック処理を実行）
            this.setInitialSizeFallback();

            // エラー表示を維持（非表示にしない）
            console.log('Error state maintained, loading overlay not hidden');
        }
    }

    /**
     * 動画の事前ロード
     */
    async preloadVideo() {
        try {
            console.log('Starting video preload...');

            // 動画を短時間再生してバッファリングを促進
            await this.state.player.play();
            await this.delay(1000); // 1秒に短縮
            await this.state.player.pause();

            // プログレス更新
            this.updateProgress(87, 'Buffering video...');

            // 軽量なバッファリング（時間短縮）
            const preloadPoints = [0, 0.5]; // ポイントを削減
            for (let i = 0; i < preloadPoints.length; i++) {
                const point = preloadPoints[i];
                const seekTime = this.state.duration * point;
                await this.state.player.setCurrentTime(seekTime);
                await this.delay(300); // 各ポイントでのバッファリング時間を短縮

                // プログレス更新
                this.updateProgress(87 + (i + 1) * 1, `Buffering ${Math.round(point * 100)}%...`);
            }

            // 最初に戻す
            await this.state.player.setCurrentTime(0);

            this.state.isPreloaded = true;
            console.log('Video preload completed');

        } catch (error) {
            console.warn('Video preload failed, continuing without preload:', error);
            this.state.isPreloaded = false;
        }
    }

    /**
     * プログレスバーの更新
     */
    updateProgress(percentage, text = null) {
        console.log(`Progress update: ${percentage}% - ${text || 'No text'}`);

        if (this.progressFill) {
            this.progressFill.style.width = `${percentage}%`;
            console.log(`Progress fill updated to ${percentage}%`);
        } else {
            console.warn('Progress fill element not found');
        }

        if (this.progressText) {
            this.progressText.textContent = `${Math.round(percentage)}%`;
        } else {
            console.warn('Progress text element not found');
        }

        if (text && this.loadingText) {
            this.loadingText.textContent = text;
        }

        // ローディングタイムアウト監視
        this.checkLoadingTimeout(percentage);
    }

    /**
     * ローディングタイムアウトをチェック
     */
    checkLoadingTimeout(percentage) {
        // 初回またはリセット時にタイマー開始
        if (!this.loadingStartTime) {
            this.loadingStartTime = Date.now();
            this.lastProgressTime = Date.now();
            this.lastProgressPercentage = percentage;
            return;
        }

        const now = Date.now();
        const totalLoadingTime = now - this.loadingStartTime;
        const timeSinceLastProgress = now - this.lastProgressTime;

        // プログレスが進んだ場合は時間を更新
        if (percentage > this.lastProgressPercentage) {
            this.lastProgressTime = now;
            this.lastProgressPercentage = percentage;
            return;
        }

        // 30秒間プログレスが進んでいない場合、または総ローディング時間が60秒を超えた場合
        const STALLED_TIMEOUT = 30000; // 30秒
        const TOTAL_TIMEOUT = 60000;   // 60秒

        if (timeSinceLastProgress > STALLED_TIMEOUT || totalLoadingTime > TOTAL_TIMEOUT) {
            console.warn(`Loading timeout detected. Stalled: ${timeSinceLastProgress}ms, Total: ${totalLoadingTime}ms`);

            // ローディングが停止していることを示す
            if (this.loadingText) {
                this.loadingText.textContent = 'ローディングが停止しました - リロードボタンを押してください';
                this.loadingText.style.color = '#ff6b6b';
            }

            // タイムアウト検出をリセット（重複表示を防ぐ）
            this.loadingStartTime = null;
        }
    }

    /**
     * ローディングオーバーレイを表示
     */
    showLoadingOverlay() {
        if (this.loadingOverlay) {
            // ローディング中はAngle表示を即座に非表示
            const angleDisplay = this.container.querySelector('#angle-display');
            if (angleDisplay) {
                angleDisplay.style.display = 'none';
            }

            this.loadingOverlay.classList.remove('hidden');
            this.updateProgress(0, 'Initializing video player...');

            // ローディングオーバーレイのサイズを即座に調整
            this.adjustLoadingOverlaySize();
            // 念のため少し遅延しても再調整
            setTimeout(() => this.adjustLoadingOverlaySize(), 10);
        }
    }

    /**
     * ローディングオーバーレイを隠す
     */
    hideLoadingOverlay() {
        if (this.loadingOverlay) {
            setTimeout(() => {
                this.loadingOverlay.classList.add('hidden');

                // 先に角度表示の位置を調整（存在する場合のみ）
                if (this.angleDisplay) {
                    this.adjustAngleDisplayPosition();
                }

                // 位置調整後にAngle表示を再表示
                const angleDisplay = this.container.querySelector('#angle-display');
                if (angleDisplay) {
                    angleDisplay.style.display = 'block';
                    console.log('Angle display made visible after loading and position adjustment');
                } else {
                    console.log('Angle display element not found (optional element)');
                }

                // Vimeoリンクを表示（存在する場合のみ）
                this.showVimeoLink();
            }, 500); // 少し遅延してスムーズに非表示
        }
    }

    /**
     * 角度表示の位置を動画内に確実に配置（下中央）
     */
    adjustAngleDisplayPosition() {
        // angle-display要素が存在しない場合は何もしない
        if (!this.angleDisplay || !this.iframe) {
            console.log('angleDisplay or iframe not found, skipping position adjustment');
            return;
        }

        // 一時的に表示してサイズを測定
        const wasHidden = this.angleDisplay.style.display === 'none';
        if (wasHidden) {
            this.angleDisplay.style.visibility = 'hidden';
            this.angleDisplay.style.display = 'block';
        }

        // 下中央配置なので、特別な調整は不要
        // CSSの left: 50% + transform: translateX(-50%) で中央配置されている
        console.log('Angle display positioned at bottom center via CSS');

        // 測定のために一時表示していた場合は元に戻す
        if (wasHidden) {
            this.angleDisplay.style.display = 'none';
            this.angleDisplay.style.visibility = 'visible';
        }
    }

    /**
     * 角度表示更新
     */
    updateAngle(seconds) {
        let angle;

        if (this.config.isClockwise) {
            // 時計回り: 動画の進行と角度の増加が同じ方向
            angle = (seconds / this.state.duration) * 360;
        } else {
            // 反時計回り: 動画の進行と角度の増加が逆方向
            angle = 360 - (seconds / this.state.duration) * 360;
        }

        // 360度でループするように正規化
        angle = angle % 360;
        if (angle < 0) angle += 360;

        // angle要素が存在しない場合は何もしない（デバッグ表示はオプション）
        if (!this.angleEl) return;

        // ドラッグ中は毎回更新（スムーズさ優先）
        const roundedAngle = Math.round(angle);
        if (this.state.isDragging) {
            // ドラッグ中は常に更新 - CSS固定幅レイアウトで位置安定化
            this.angleEl.textContent = roundedAngle.toString();
            this.state.lastDisplayedAngle = roundedAngle;
        } else {
            // 通常時は1度単位で更新（パフォーマンス考慮） - CSS固定幅レイアウトで位置安定化
            if (this.state.lastDisplayedAngle !== roundedAngle) {
                this.angleEl.textContent = roundedAngle.toString();
                this.state.lastDisplayedAngle = roundedAngle;
            }
        }
    }

    /**
     * 新しい再生時間を計算（ループ対応）
     */
    calculateNewTime(deltaX) {
        // スムーズな操作のため、感度調整係数を最適化
        const sensitivityFactor = 0.9; // 感度を少し上げてレスポンシブに

        // 表示サイズに基づいて動的に計算されたPIXELS_PER_ROTATIONを使用
        const pixelsPerRotation = this.calculatePixelsPerRotation();
        const adjustedDelta = deltaX * sensitivityFactor;
        const rotationProgress = adjustedDelta / pixelsPerRotation;

        const timeDelta = this.config.isClockwise
            ? -rotationProgress * this.state.duration
            : rotationProgress * this.state.duration;

        let newTime = this.state.startTime + timeDelta;

        // 0〜duration の範囲でループ
        return ((newTime % this.state.duration) + this.state.duration) % this.state.duration;
    }

    /**
     * ドラッグ操作の共通処理
     */
    handleDragMove(currentX) {
        // より厳密な状態チェック
        if (!this.state.isDragging || !this.state.isPlayerReady) return;

        // startTime が取得されていない場合は処理しない（初期化未完了）
        if (this.state.startTime === undefined || this.state.startTime === null) return;

        // dragStartX が設定されていない場合も処理しない
        if (this.state.dragStartX === undefined || this.state.dragStartX === null) return;

        const deltaX = currentX - this.state.dragStartX;

        // 極端なdeltaXは無視（誤操作防止）
        if (Math.abs(deltaX) > 2000) {
            console.warn('Extreme deltaX detected, ignoring:', deltaX);
            return;
        }

        const newTime = this.calculateNewTime(deltaX);

        // 【最優先】UI更新を毎フレーム即座に実行（スロットリングなし）
        this.updateAngle(newTime);

        // Vimeo API呼び出しは大幅にスロットリング（UI更新とは完全分離）
        const now = performance.now();

        // API呼び出しを100ms間隔に制限（10FPS相当、さらなるUI負荷軽減）
        const shouldThrottle = now - this.state.lastDragUpdate < 100;

        if (!shouldThrottle) {
            this.state.lastDragUpdate = now;

            // 既存のAPI呼び出しをキャンセル（最新の位置のみ重要）
            if (this.state.pendingApiCall) {
                cancelAnimationFrame(this.state.pendingApiCall);
            }

            // Vimeo APIを低頻度で実行（UIパフォーマンス優先）
            this.state.pendingApiCall = requestAnimationFrame(() => {
                if (this.state.isDragging && this.state.isPlayerReady) {
                    // 非同期で実行し、UIを一切ブロックしない
                    this.state.player.setCurrentTime(newTime).catch(err => {
                        // API失敗は無視してUI動作を継続
                        console.warn('Vimeo API call ignored due to performance:', err);
                    });
                }
                this.state.pendingApiCall = null;
            });
        }
    }

    /**
     * ドラッグ開始の共通処理
     */
    async handleDragStart(startX) {
        if (!this.state.isPlayerReady) return false;

        // ドラッグ開始前に状態をリセット
        this.state.isDragging = false; // 一時的にfalseにして初期化完了まで待つ
        this.state.dragStartX = startX;
        this.dragOverlay.style.cursor = 'grabbing';

        try {
            // 現在時間を取得してから正式にドラッグ開始
            this.state.startTime = await this.state.player.getCurrentTime();

            // ここで正式にドラッグ状態を開始
            this.state.isDragging = true;

            // ドラッグ中のスクロール防止クラスを追加
            this.dragOverlay.classList.add('dragging');
            this.container.classList.add('dragging');

            // ドラッグ開始位置を再度設定（念のため）
            this.state.dragStartX = startX;

            console.log('Drag started at time:', this.state.startTime, 'position:', startX);
            return true;
        } catch (error) {
            console.error('Failed to get current time:', error);
            this.state.isDragging = false; // エラー時は確実にfalseに
            // エラー時もクラスを削除
            this.dragOverlay.classList.remove('dragging');
            this.container.classList.remove('dragging');
            this.dragOverlay.style.cursor = 'grab';
            return false;
        }
    }

    /**
     * ドラッグ終了の共通処理
     */
    handleDragEnd() {
        if (!this.state.isDragging) return;

        this.state.isDragging = false;

        // ドラッグ終了時にスクロール防止クラスを削除
        this.dragOverlay.classList.remove('dragging');
        this.container.classList.remove('dragging');

        // ペンディング中のAPI呼び出しをキャンセル
        if (this.state.pendingApiCall) {
            cancelAnimationFrame(this.state.pendingApiCall);
            this.state.pendingApiCall = null;
        }

        this.dragOverlay.style.cursor = 'grab';
        this.state.player.pause();
    }

    /**
     * イベントリスナーの追加
     */
    attachEventListeners() {
        this.dragOverlay.addEventListener('mousedown', this.onMouseDown);
        this.dragOverlay.addEventListener('touchstart', this.onTouchStart, { passive: false });
        window.addEventListener('resize', this.onWindowResize);
    }

    /**
     * マウスダウンイベントハンドラー
     */
    async onMouseDown(e) {
        // 既にドラッグ中の場合は無視
        if (this.state.isDragging) return;

        const success = await this.handleDragStart(e.clientX);
        if (!success) return;

        // ドラッグ開始が完了してからイベントリスナーを追加
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        e.preventDefault();
    }

    /**
     * マウスムーブイベントハンドラー
     */
    onMouseMove(e) {
        this.handleDragMove(e.clientX);
    }

    /**
     * マウスアップイベントハンドラー
     */
    onMouseUp() {
        this.handleDragEnd();
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    /**
     * タッチスタートイベントハンドラー
     */
    async onTouchStart(e) {
        // 既にドラッグ中の場合は無視
        if (this.state.isDragging) return;

        // スクロールを防止するためにpreventDefaultを最初に実行
        e.preventDefault();
        e.stopPropagation();

        const success = await this.handleDragStart(e.touches[0].clientX);
        if (!success) return;

        // ドラッグ開始が完了してからイベントリスナーを追加
        document.addEventListener('touchmove', this.onTouchMove, { passive: false });
        document.addEventListener('touchend', this.onTouchEnd, { passive: false });
    }

    /**
     * タッチムーブイベントハンドラー
     */
    onTouchMove(e) {
        // スクロールを完全に防止
        e.preventDefault();
        e.stopPropagation();

        this.handleDragMove(e.touches[0].clientX);
    }

    /**
     * タッチエンドイベントハンドラー
     */
    onTouchEnd(e) {
        e.preventDefault();
        e.stopPropagation();

        this.handleDragEnd();
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onTouchEnd);
    }

    /**
     * ウィンドウリサイズイベントハンドラー
     */
    async onWindowResize() {
        const newQuality = this.selectVideoQuality();
        const currentSrc = this.iframe.src;

        // 品質変更が必要な場合のみプレイヤーを再初期化
        if (!currentSrc.includes(`quality=${newQuality}`)) {
            console.log('Reinitializing player due to quality change:', newQuality);
            this.state.isPlayerReady = false;
            await this.initializePlayer();
        }

        // リサイズ時にPIXELS_PER_ROTATIONの再計算をログ出力
        // （実際の再計算は calculatePixelsPerRotation() で動的に行われる）
        const newPixelsPerRotation = this.calculatePixelsPerRotation();
        console.log('Window resized, new PIXELS_PER_ROTATION:', newPixelsPerRotation);
    }

    /**
     * ユーティリティ: デバウンス関数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * ユーティリティ: 遅延関数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * ユーティリティ: タイムアウト付きPromise実行
     */
    withTimeout(promise, timeoutMs, errorMessage) {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(errorMessage || 'Operation timed out')), timeoutMs)
            )
        ]);
    }

    /**
     * プレイヤー設定を個別にエラーハンドリング付きで適用
     */
    async applyPlayerSettings() {
        const settings = [
            {
                name: 'loop',
                action: () => this.state.player.setLoop(true),
                fallback: () => console.warn('Could not set loop mode')
            },
            {
                name: 'volume',
                action: () => this.state.player.setVolume(0),
                fallback: () => console.warn('Could not set volume')
            }
        ];

        for (const setting of settings) {
            try {
                await this.withTimeout(setting.action(), 3000, `Failed to set ${setting.name}`);
                console.log(`Successfully set ${setting.name}`);
            } catch (error) {
                console.warn(`Setting ${setting.name} failed:`, error.message);
                setting.fallback();
            }
        }
    }

    /**
     * 初期プレイヤー状態の設定
     */
    async setInitialPlayerState() {
        const actions = [
            { name: 'play', action: () => this.state.player.play() },
            { name: 'pause', action: () => this.state.player.pause() },
            { name: 'seek to start', action: () => this.state.player.setCurrentTime(0) }
        ];

        for (const action of actions) {
            try {
                await this.withTimeout(action.action(), 3000, `Failed to ${action.name}`);
                console.log(`Successfully executed: ${action.name}`);
            } catch (error) {
                console.warn(`Action ${action.name} failed:`, error.message);
                // 個別の失敗は許容（致命的ではない）
            }
        }
    }

    /**
     * Vimeoリンクを表示
     */
    showVimeoLink() {
        // ラッパー内またはドキュメント全体からVimeoリンクを検索
        const vimeoLink = this.container.parentNode.querySelector('.vimeo-link') ||
            this.container.querySelector('.vimeo-link');
        if (vimeoLink && this.config.videoId) {
            // セキュリティ: videoIdの再検証（URL生成前）
            if (!/^\d+$/.test(this.config.videoId)) {
                console.warn('Invalid video ID format detected, skipping Vimeo link generation');
                return;
            }

            // VimeoのURLを設定（静的実装、JavaScriptはURL生成のみ）
            vimeoLink.href = `https://vimeo.com/${this.config.videoId}`;

            // 動画の実際の幅に合わせてリンクの幅を調整
            if (this.iframe) {
                const videoWidth = this.iframe.offsetWidth;
                if (videoWidth > 0) {
                    vimeoLink.style.width = `${videoWidth}px`;
                    console.log(`Vimeo link width adjusted to ${videoWidth}px`);
                }
            }

            vimeoLink.classList.add('visible');
            console.log('Vimeo link displayed');
        } else if (!vimeoLink) {
            console.log('Vimeo link element not found (optional element)');
        }
    }

    /**
     * エラー表示（ローディングオーバーレイを使用）
     */
    showError(title, message) {
        if (!this.loadingOverlay) return;

        // ローディングオーバーレイをエラー表示に変更
        this.loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-text" style="color: #ff6b6b;">${title}</div>
                    <div style="color: #ffa8a8; font-size: 11px; margin-top: 8px; line-height: 1.4;">
                        ${message}
                    </div>
                </div>
            `;
        this.loadingOverlay.style.display = 'flex';
        this.loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';

        console.error(`${title}: ${message}`);
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.dragOverlay.removeEventListener('mousedown', this.onMouseDown);
        this.dragOverlay.removeEventListener('touchstart', this.onTouchStart);
        window.addEventListener('resize', this.onWindowResize);

        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('touchend', this.onTouchEnd);

        console.log('TurntableViewer destroyed');
    }
}

// グローバルな初期化済みコンテナを追跡
if (!window.turntableViewerInstances) {
    window.turntableViewerInstances = new Set();
}

// 初期化関数
function initializeTurntableViewers() {
    // vimeo-video-id属性を持つ全てのコンテナを検索
    const containers = document.querySelectorAll('[vimeo-video-id]');

    if (containers.length === 0) {
        console.warn('No turntable containers found. Make sure elements have vimeo-video-id attribute.');
        return;
    }

    console.log(`Found ${containers.length} turntable container(s), checking for new instances...`);

    // 各コンテナに対してTurntableViewerインスタンスを作成（未初期化のもののみ）
    containers.forEach((container, index) => {
        try {
            // コンテナにIDが設定されていない場合は自動生成
            if (!container.id) {
                container.id = `turntable-container-${Date.now()}-${index}`;
                console.log(`Auto-generated ID: ${container.id}`);
            }

            // 既に初期化済みかチェック
            if (window.turntableViewerInstances.has(container.id)) {
                console.log(`TurntableViewer already initialized for container: ${container.id}`);
                return;
            }

            // 新しいインスタンスを作成
            new TurntableViewer(container.id);
            window.turntableViewerInstances.add(container.id);
            console.log(`TurntableViewer initialized for container: ${container.id}`);
        } catch (error) {
            console.error(`Failed to initialize TurntableViewer for container ${index}:`, error);
        }
    });
}

// DOMContentLoadedイベントで初期化
document.addEventListener('DOMContentLoaded', initializeTurntableViewers);

// スクリプトが動的に読み込まれた場合にも対応
if (document.readyState === 'loading') {
    // まだDOMが読み込み中の場合はDOMContentLoadedを待つ
    document.addEventListener('DOMContentLoaded', initializeTurntableViewers);
} else {
    // DOMが既に読み込み済みの場合は即座に実行
    initializeTurntableViewers();
}

// ESモジュールとしてクラスをエクスポート
export { TurntableViewer };

// グローバルにも公開(後方互換性のため)
if (typeof window !== 'undefined') {
    window.TurntableViewer = TurntableViewer;
}