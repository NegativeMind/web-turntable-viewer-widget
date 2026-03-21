// CSSをインポート
import './turntable-viewer.css';
import type { TurntableConfig, TurntableState, VimeoPlayer } from './types';
import { ProgressManager } from './progress-manager';
import { VideoConfigManager } from './video-config-manager';
import { PlayerInitializer } from './player-initializer';
import { DragHandler } from './drag-handler';
import { UIManager } from './ui-manager';
import { getErrorMessage, delay, withTimeout } from './utils';
import {
    PLAYER_LOAD_DELAY_MS,
    PLAYER_RELOAD_EXTRA_DELAY_MS,
    PLAYER_DOM_SETTLE_DELAY_MS,
    LOADING_OVERLAY_HIDE_DELAY_MS,
} from './constants';

/**
 * Web Turntable Viewer
 * ドラッグ操作で360度回転表示を制御するクラス
 */
export class TurntableViewer {
    private container: HTMLElement;
    private iframe: HTMLIFrameElement;
    private dragOverlay: HTMLElement;
    private config: TurntableConfig;
    private state: TurntableState;
    private isReloading: boolean = false;
    private root: Document | ShadowRoot;
    private resizeObserver: ResizeObserver | null = null;
    private resizeDebounceTimer: number | null = null;

    // マネージャークラス
    private progressManager: ProgressManager;
    private videoConfigManager: VideoConfigManager;
    private playerInitializer: PlayerInitializer;
    private dragHandler: DragHandler | null = null;
    private uiManager: UIManager;

    constructor(containerId: string, root: Document | ShadowRoot = document) {
        this.root = root;
        const container = this.root.getElementById(containerId);
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

        const loadingOverlay = this.container.querySelector<HTMLElement>('.loading-overlay');
        const loadingText = this.container.querySelector<HTMLElement>('.loading-text');
        const progressBar = this.container.querySelector<HTMLProgressElement>('progress.progress-bar');
        const progressText = this.container.querySelector<HTMLElement>('.progress-text');

        if (!loadingOverlay || !loadingText || !progressBar || !progressText) {
            throw new Error('Required loading elements not found in container');
        }

        try {
            this.config = this.getConfig();
        } catch (error) {
            const message = getErrorMessage(error);
            console.error('Configuration error:', message);
            throw error;
        }

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

        this.progressManager = new ProgressManager(
            this.container,
            this.iframe,
            loadingOverlay,
            loadingText,
            progressBar,
            progressText,
            this.config
        );

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
            PLAYER_LOAD_DELAY_MS,
            DRAG_THROTTLE_MS: 16,
            isClockwise,
            videoId,
            showAngle: this.container.hasAttribute('show-angle')
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
            this.cleanupDragHandler();
            await this.destroyCurrentPlayer();
            await this.recreateIframe();
            this.reinitializeManagers();
            await delay(PLAYER_DOM_SETTLE_DELAY_MS);
            this.resetStateForReload();
            this.progressManager.resetTimeout();
            await this.initialize();
        } catch (error) {
            console.error('Reload failed:', error);
        } finally {
            this.isReloading = false;
            this.uiManager.setReloadLoading(false);
        }
    }

    /** DragHandler のイベントリスナーを解除して破棄 */
    private cleanupDragHandler(): void {
        if (this.dragHandler) {
            this.dragHandler.removeEventListeners();
            this.dragHandler = null;
        }
    }

    /** Vimeo プレーヤーを破棄 */
    private async destroyCurrentPlayer(): Promise<void> {
        if (!this.iframe || !this.iframe.parentElement) {
            throw new Error('Cannot reload: iframe element not properly initialized');
        }
        if (this.state.player) {
            try {
                await this.state.player.destroy();
            } catch (e) {
                console.warn('Error destroying player:', e);
            }
            this.state.player = null;
        }
    }

    /** 古い iframe を削除して新しい iframe を同じ位置に挿入 */
    private async recreateIframe(): Promise<void> {
        const parent = this.iframe.parentElement ?? this.container;
        const oldId = this.iframe.id;
        const oldClassName = this.iframe.className;
        const oldWidth = this.iframe.getAttribute('width') || '';
        const oldHeight = this.iframe.getAttribute('height') || '';

        if (this.iframe.parentElement) {
            this.iframe.remove();
        }

        const newIframe = document.createElement('iframe');
        newIframe.id = oldId;
        newIframe.className = oldClassName;
        newIframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
        newIframe.setAttribute('loading', 'lazy');
        if (oldWidth) newIframe.setAttribute('width', oldWidth);
        if (oldHeight) newIframe.setAttribute('height', oldHeight);

        parent.appendChild(newIframe);
        this.iframe = newIframe;
    }

    /** iframe 参照が変わったためマネージャーを再生成 */
    private reinitializeManagers(): void {
        this.videoConfigManager = new VideoConfigManager(this.container, this.iframe, this.config);
        this.playerInitializer = new PlayerInitializer(this.container, this.iframe);
    }

    /** リロード用に TurntableState を初期値にリセット */
    private resetStateForReload(): void {
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
    }

    /**
     * Vimeoプレイヤー初期化
     */
    async initializePlayer(): Promise<void> {
        try {
            await this.setupVideoSource();
            this.state.player = await this.createAndLoadPlayer();
            await this.configurePlayer(this.state.player);
            await this.finalizePlayerSetup();
        } catch (error) {
            this.handlePlayerInitError(error);
        }
    }

    /** 動画ソースを設定してiframeを準備 */
    private async setupVideoSource(): Promise<void> {
        await this.videoConfigManager.setInitialSizeFromAPI(
            (progress, message) => this.progressManager.updateProgress(progress, message),
            () => this.progressManager.adjustLoadingOverlaySize()
        );
        this.videoConfigManager.setupVideoPlayer();
        this.progressManager.updateProgress(20, 'Creating player...');

        if (this.isReloading) {
            await delay(PLAYER_RELOAD_EXTRA_DELAY_MS);
        } else {
            await delay(this.config.PLAYER_LOAD_DELAY_MS);
        }
    }

    /** プレイヤーを作成して基本ロードを待機 */
    private async createAndLoadPlayer(): Promise<VimeoPlayer> {
        const player = await this.playerInitializer.createPlayer(
            (progress, message) => this.progressManager.updateProgress(progress, message)
        );

        if (this.isReloading) {
            await delay(PLAYER_RELOAD_EXTRA_DELAY_MS);
        } else {
            await delay(this.config.PLAYER_LOAD_DELAY_MS);
        }

        return player;
    }

    /** プレイヤーの設定・バッファリング・初期状態を適用 */
    private async configurePlayer(player: VimeoPlayer): Promise<void> {
        this.state.duration = await this.playerInitializer.getPlayerDuration(
            player,
            this.isReloading,
            (progress, message) => this.progressManager.updateProgress(progress, message)
        );
        await this.playerInitializer.adjustVideoAspectRatio(
            player,
            () => this.progressManager.adjustLoadingOverlaySize()
        );
        await this.playerInitializer.applyPlayerSettings(player);
        await this.playerInitializer.setInitialPlayerState(player);
    }

    /** 初期化完了後の状態更新とUI処理 */
    private async finalizePlayerSetup(): Promise<void> {
        this.uiManager.updateAngle(0);
        this.progressManager.updateProgress(95, 'Verifying player...');

        // ドラッグの前提となる getCurrentTime() が応答するまで待機してからオーバーレイを隠す
        try {
            await withTimeout(this.state.player!.getCurrentTime(), 5000, 'Player readiness check timed out');
        } catch {
            // タイムアウトしても続行
        }

        this.state.isPlayerReady = true;
        this.progressManager.updateProgress(100, 'Initialization complete!');
        setTimeout(() => {
            this.uiManager.hideLoadingOverlay();
        }, LOADING_OVERLAY_HIDE_DELAY_MS);
    }

    /** プレイヤー初期化エラーを処理 */
    private handlePlayerInitError(error: unknown): void {
        console.error('Player initialization failed:', error);
        const errorMessage = getErrorMessage(error);
        if (errorMessage.includes('Failed to create Vimeo player')) {
            this.progressManager.showError('Player Error', 'Failed to create player. Check connection and reload.');
        } else if (errorMessage.includes('Video not found')) {
            this.progressManager.showError('Video Not Found', 'The specified video was not found. Check the video ID.');
        } else if (errorMessage.includes('Access denied')) {
            this.progressManager.showError('Access Denied', 'This video is private or restricted.');
        } else if (errorMessage.includes('Failed to get video duration')) {
            this.progressManager.showError('Failed to Load', 'Could not retrieve video duration. Check network and reload.');
        } else {
            this.progressManager.showError('Initialization Error', `Failed to load video player.<br><br>Error: ${errorMessage}<br><br>Click reload to retry.`);
        }
        this.videoConfigManager.setInitialSizeFallback(() => {
            this.progressManager.adjustLoadingOverlaySize();
        });
    }

    /**
     * イベントリスナーの追加
     */
    attachEventListeners(): void {
        this.dragHandler = new DragHandler(
            this.container,
            this.dragOverlay,
            this.state,
            this.config,
            () => this.videoConfigManager.calculatePixelsPerRotation(),
            (seconds) => this.uiManager.updateAngle(seconds)
        );

        this.dragHandler.attachEventListeners();

        this.resizeObserver = new ResizeObserver(() => {
            // 連続発火を防ぐデバウンス（500ms）
            if (this.resizeDebounceTimer !== null) clearTimeout(this.resizeDebounceTimer);
            this.resizeDebounceTimer = window.setTimeout(() => {
                this.resizeDebounceTimer = null;
                this.onContainerResize();
            }, 500);
        });
        this.resizeObserver.observe(this.container);
    }

    /**
     * コンテナリサイズ時の品質切替
     * 初期化中・リロード中・ドラッグ中は無視して並走を防ぐ。
     */
    private async onContainerResize(): Promise<void> {
        // プレーヤーが未準備（初期化中含む）またはドラッグ中・リロード中は無視
        if (!this.state.isPlayerReady || this.isReloading || this.state.isDragging) return;

        const newQuality = this.videoConfigManager.selectVideoQuality();
        const currentSrc = this.iframe.src;

        if (!currentSrc.includes(`quality=${newQuality}`)) {
            this.state.isPlayerReady = false;
            await this.initializePlayer();
        }
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        if (this.dragHandler) {
            this.dragHandler.removeEventListeners();
        }
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        if (this.resizeDebounceTimer !== null) {
            clearTimeout(this.resizeDebounceTimer);
            this.resizeDebounceTimer = null;
        }
    }
}
