// CSSをインポート
import './turntable-viewer.css';
import type { TurntableConfig, TurntableState } from './types';
import { ProgressManager } from './progress-manager';
import { VideoConfigManager } from './video-config-manager';
import { PlayerInitializer } from './player-initializer';
import { DragHandler } from './drag-handler';
import { UIManager } from './ui-manager';
import { getErrorMessage, delay } from './utils';

/**
 * Web Turntable Viewer
 * ドラッグ操作で360度回転表示を制御するクラス
 */
class TurntableViewer {
    private container: HTMLElement;
    private iframe: HTMLIFrameElement;
    private dragOverlay: HTMLElement;
    private config: TurntableConfig;
    private state: TurntableState;
    private isReloading: boolean = false;

    // マネージャークラス
    private progressManager: ProgressManager;
    private videoConfigManager: VideoConfigManager;
    private playerInitializer: PlayerInitializer;
    private dragHandler: DragHandler | null = null;
    private uiManager: UIManager;

    constructor(containerId: string) {
        // DOM要素の取得
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container element with id "${containerId}" not found`);
        }
        this.container = container;

        const iframe = this.container.querySelector<HTMLIFrameElement>('iframe');
        if (!iframe) {
            throw new Error('iframe element not found in container');
        }
        this.iframe = iframe;

        const angleEl = this.container.querySelector<HTMLElement>('#rotation-angle');
        const angleDisplay = this.container.querySelector<HTMLElement>('#angle-display');

        const dragOverlay = this.container.querySelector<HTMLElement>('.drag-overlay');
        if (!dragOverlay) {
            throw new Error('drag-overlay element not found in container');
        }
        this.dragOverlay = dragOverlay;

        // プログレスバー関連要素
        const loadingOverlay = this.container.querySelector<HTMLElement>('.loading-overlay');
        const loadingText = this.container.querySelector<HTMLElement>('.loading-text');
        const progressFill = this.container.querySelector<HTMLElement>('.progress-fill');
        const progressText = this.container.querySelector<HTMLElement>('.progress-text');

        if (!loadingOverlay || !loadingText || !progressFill || !progressText) {
            throw new Error('Required loading elements not found in container');
        }

        // ProgressManagerを初期化
        this.progressManager = new ProgressManager(
            this.container,
            this.iframe,
            loadingOverlay,
            loadingText,
            progressFill,
            progressText
        );

        // DOM要素の存在確認
        console.log('DOM elements check:');
        console.log('- container:', !!this.container);
        console.log('- iframe:', !!this.iframe);
        console.log('- loadingOverlay:', !!loadingOverlay);
        console.log('- progressFill:', !!progressFill);
        console.log('- progressText:', !!progressText);
        console.log('- loadingText:', !!loadingText);
        console.log('- angleEl (optional):', !!angleEl);
        console.log('- angleDisplay (optional):', !!angleDisplay);

        // 必須要素のチェック
        if (!this.container || !this.iframe || !loadingOverlay) {
            throw new Error('Required elements not found: container, iframe, or loading-overlay');
        }

        console.log('DOM elements validation passed');

        // 設定を取得
        try {
            this.config = this.getConfig();
            console.log('Configuration loaded:', this.config);
        } catch (error) {
            const message = getErrorMessage(error);
            console.error('Configuration error:', message);
            this.showError('Configuration Error', message);
            throw error;
        }

        // 状態管理
        this.state = {
            player: null,
            duration: 0,
            isPlayerReady: false,
            isDragging: false,
            dragStartX: 0,
            startTime: 0,
            lastDragUpdate: 0,
            lastDisplayedAngle: null,
            pendingApiCall: null
        };

        // マネージャークラスを初期化
        this.videoConfigManager = new VideoConfigManager(this.container, this.iframe, this.config);
        this.playerInitializer = new PlayerInitializer(this.container, this.iframe);
        this.uiManager = new UIManager(
            this.container,
            this.iframe,
            angleEl,
            angleDisplay,
            this.config,
            this.state,
            this.progressManager,
            this.handleReload.bind(this)
        );

        // 初期化
        this.initialize();
    }

    /**
     * 設定を取得
     */
    getConfig(): TurntableConfig {
        const videoId = this.container.getAttribute('vimeo-video-id');
        const clockwiseAttr = this.container.getAttribute('clockwise-rotation');
        let isClockwise = true;

        if (clockwiseAttr !== null) {
            if (clockwiseAttr === '' || clockwiseAttr === 'true' || clockwiseAttr === '1') {
                isClockwise = true;
            } else if (clockwiseAttr === 'false' || clockwiseAttr === '0') {
                isClockwise = false;
            } else {
                console.warn(`Invalid clockwise-rotation attribute value: "${clockwiseAttr}". Using default "true".`);
                isClockwise = true;
            }
        }

        if (!videoId) {
            throw new Error('vimeo-video-id attribute is required on the container element');
        }

        if (!/^\d+$/.test(videoId)) {
            throw new Error(`Invalid vimeo-video-id format: "${videoId}". Only numeric IDs are allowed.`);
        }

        return {
            RESIZE_DEBOUNCE_MS: 500,
            PLAYER_LOAD_DELAY_MS: 1000,
            DRAG_THROTTLE_MS: 16,
            isClockwise: isClockwise,
            videoId: videoId
        };
    }

    /**
     * 初期化
     */
    async initialize(): Promise<void> {
        this.uiManager.hideAngleDisplay();
        this.progressManager.showLoadingOverlay();

        try {
            await this.initializePlayer();
            this.attachEventListeners();
            console.log('TurntableViewer initialized successfully');

            this.uiManager.showAngleDisplay();
        } catch (error) {
            console.error('TurntableViewer initialization failed:', error);
            this.progressManager.updateProgress(100, '初期化エラーが発生しました');
            this.uiManager.hideLoadingOverlay();
        }
    }

    /**
     * リロード処理
     */
    async handleReload(): Promise<void> {
        if (this.isReloading) return;

        this.isReloading = true;
        this.uiManager.setReloadLoading(true);

        try {
            console.log('Reloading turntable viewer...');

            // DragHandlerのイベントリスナーを削除
            if (this.dragHandler) {
                this.dragHandler.removeEventListeners();
                this.dragHandler = null;
            }

            // iframe情報をプレイヤー破棄前に保存（destroy が iframe を削除する可能性があるため）
            if (!this.iframe || !this.iframe.parentElement) {
                console.error('iframe or parent element not found, cannot reload');
                throw new Error('Cannot reload: iframe element not properly initialized');
            }

            const parent = this.iframe.parentElement;
            const oldId = this.iframe.id;
            const oldClassName = this.iframe.className;

            // プレイヤーを破棄
            if (this.state.player) {
                try {
                    await this.state.player.destroy();
                    console.log('Player destroyed successfully');
                } catch (e) {
                    console.warn('Error destroying player:', e);
                }
                this.state.player = null;
            }

            // 古いiframeを削除（既に destroy で削除されている可能性があるため確認）
            if (this.iframe.parentElement) {
                this.iframe.remove();
                console.log('Old iframe removed');
            } else {
                console.log('iframe already removed by player.destroy()');
            }

            // 新しいiframe要素を作成
            const newIframe = document.createElement('iframe');
            newIframe.id = oldId;
            newIframe.className = oldClassName;
            newIframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
            newIframe.setAttribute('loading', 'lazy');

            // 新しいiframeを挿入
            parent.appendChild(newIframe);
            this.iframe = newIframe;
            console.log('iframe element recreated');

            // マネージャークラスのiframe参照を更新
            this.videoConfigManager = new VideoConfigManager(this.container, this.iframe, this.config);
            this.playerInitializer = new PlayerInitializer(this.container, this.iframe);

            // 少し待機してブラウザがDOMを更新するのを待つ
            await delay(300);

            // 状態をリセット
            this.state = {
                player: null,
                duration: 0,
                isPlayerReady: false,
                isDragging: false,
                startTime: 0,
                dragStartX: 0,
                lastDragUpdate: 0,
                pendingApiCall: null,
                lastDisplayedAngle: 0
            };

            this.progressManager.resetTimeout();

            // 再初期化
            await this.initialize();

        } catch (error) {
            console.error('Reload failed:', error);
        } finally {
            this.isReloading = false;
            this.uiManager.setReloadLoading(false);
        }
    }

    /**
     * Vimeoプレイヤー初期化
     */
    async initializePlayer(): Promise<void> {
        try {
            // 初期サイズを設定
            await this.videoConfigManager.setInitialSizeFromAPI(
                (progress, message) => {
                    this.progressManager.updateProgress(progress, message);
                },
                () => {
                    this.progressManager.adjustLoadingOverlaySize();
                }
            );

            // 動画URLを構築してiframeを設定
            this.videoConfigManager.setupVideoPlayer();

            this.progressManager.updateProgress(20, 'Creating player...');

            // iframeが新しいURLをロードするまで待機（リロード時は長めに）
            if (this.isReloading) {
                await delay(2000);
                console.log('Extended delay for reload');
            } else {
                await delay(this.config.PLAYER_LOAD_DELAY_MS);
            }

            // プレイヤーを作成
            this.state.player = await this.playerInitializer.createPlayer((progress, message) => {
                this.progressManager.updateProgress(progress, message);
            });

            // プレイヤーが完全にロードされるまで待機（リロード時はさらに長めに）
            if (this.isReloading) {
                await delay(2000);
                console.log('Extended player load delay for reload');
            } else {
                await delay(this.config.PLAYER_LOAD_DELAY_MS);
            }
            this.progressManager.updateProgress(60, 'Loading player settings...');

            // プレイヤーの基本情報取得
            this.state.duration = await this.playerInitializer.getPlayerDuration(
                this.state.player,
                this.isReloading,
                (progress, message) => this.progressManager.updateProgress(progress, message)
            );

            // 動画のアスペクト比を調整
            await this.playerInitializer.adjustVideoAspectRatio(
                this.state.player,
                () => this.progressManager.adjustLoadingOverlaySize()
            );

            this.progressManager.updateProgress(75, 'Applying player settings...');

            // プレイヤー設定を適用
            await this.playerInitializer.applyPlayerSettings(this.state.player);

            // 動画の事前バッファリング（オプショナル）
            await this.playerInitializer.preloadVideo(
                this.state.player,
                this.state.duration,
                (progress, message) => this.progressManager.updateProgress(progress, message)
            );

            this.progressManager.updateProgress(90, 'Setting initial state...');

            // 初期状態設定
            await this.playerInitializer.setInitialPlayerState(this.state.player);

            // 初期角度表示を更新
            this.uiManager.updateAngle(0);

            this.state.isPlayerReady = true;
            console.log('Player ready');

            // プログレス完了
            this.progressManager.updateProgress(100, 'Initialization complete!');

            // ローディングオーバーレイを隠す
            setTimeout(() => {
                this.uiManager.hideLoadingOverlay();
            }, 500);

        } catch (error) {
            console.error('Player initialization failed:', error);

            const errorMessage = getErrorMessage(error);
            if (errorMessage.includes('Failed to create Vimeo player')) {
                this.showError('プレイヤーエラー', 'ビデオプレイヤーを作成できませんでした。接続を確認してリロードしてください。');
            } else if (errorMessage.includes('Video not found')) {
                this.showError('ビデオが見つかりません', '指定されたビデオが見つかりませんでした。ビデオIDを確認してください。');
            } else if (errorMessage.includes('Access denied')) {
                this.showError('アクセス拒否', 'このビデオは非公開または制限されています。ビデオの権限を確認してください。');
            } else if (errorMessage.includes('Failed to get video duration')) {
                this.showError('ビデオ情報の取得に失敗', 'ビデオの長さを取得できませんでした。ネットワーク接続を確認してリロードしてください。');
            } else {
                this.showError('初期化エラー', `ビデオプレイヤーの読み込みに失敗しました。<br><br>エラー: ${errorMessage}<br><br>リロードボタンを押して再試行してください。`);
            }

            this.videoConfigManager.setInitialSizeFallback(() => {
                this.progressManager.adjustLoadingOverlaySize();
            });
            console.log('Error state maintained, loading overlay not hidden');
        }
    }

    /**
     * イベントリスナーの追加
     */
    attachEventListeners(): void {
        // DragHandlerを作成
        this.dragHandler = new DragHandler(
            this.container,
            this.dragOverlay,
            this.state,
            this.config,
            () => this.videoConfigManager.calculatePixelsPerRotation(),
            (seconds) => this.uiManager.updateAngle(seconds)
        );

        this.dragHandler.attachEventListeners();
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    /**
     * ウィンドウリサイズイベントハンドラー
     */
    async onWindowResize(): Promise<void> {
        const newQuality = this.videoConfigManager.selectVideoQuality();
        const currentSrc = this.iframe.src;

        if (!currentSrc.includes(`quality=${newQuality}`)) {
            console.log('Reinitializing player due to quality change:', newQuality);
            this.state.isPlayerReady = false;
            await this.initializePlayer();
        }

        const newPixelsPerRotation = this.videoConfigManager.calculatePixelsPerRotation();
        console.log('Window resized, new PIXELS_PER_ROTATION:', newPixelsPerRotation);
    }

    /**
     * エラー表示（ProgressManagerを使用）
     */
    private showError(title: string, message: string): void {
        this.progressManager.showError(title, message);
    }

    /**
     * エラー表示（非推奨：後方互換性のため残す）
     */
    private showError_old(title: string, message: string): void {
        this.uiManager.showError(title, message);
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        if (this.dragHandler) {
            this.dragHandler.removeEventListeners();
        }
        window.removeEventListener('resize', this.onWindowResize.bind(this));
        console.log('TurntableViewer destroyed');
    }
}

// グローバルな初期化済みコンテナを追跡
if (!window.turntableViewerInstances) {
    window.turntableViewerInstances = new Set();
}

// 初期化関数
function initializeTurntableViewers(): void {
    const containers = document.querySelectorAll('[vimeo-video-id]');

    if (containers.length === 0) {
        console.warn('No turntable containers found. Make sure elements have vimeo-video-id attribute.');
        return;
    }

    console.log(`Found ${containers.length} turntable container(s), checking for new instances...`);

    containers.forEach((container, index) => {
        try {
            if (!container.id) {
                container.id = `turntable-container-${Date.now()}-${index}`;
                console.log(`Auto-generated ID: ${container.id}`);
            }

            if (window.turntableViewerInstances.has(container.id)) {
                console.log(`TurntableViewer already initialized for container: ${container.id}`);
                return;
            }

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
    document.addEventListener('DOMContentLoaded', initializeTurntableViewers);
} else {
    initializeTurntableViewers();
}

// ESモジュールとしてクラスをエクスポート
export { TurntableViewer };

// グローバルにも公開(後方互換性のため)
if (typeof window !== 'undefined') {
    window.TurntableViewer = TurntableViewer;
}
