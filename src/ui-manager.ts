import type { TurntableConfig, TurntableState } from './types';
import { timeToAngle } from './utils';
import {
    LOADING_STALL_TIMEOUT_MS,
    LOADING_TOTAL_TIMEOUT_MS,
    MOBILE_BREAKPOINT_PX,
} from './constants';

/**
 * UI全体を管理するクラス
 * - ローディングオーバーレイ・プログレスバー（旧 ProgressManager）
 * - 角度表示・リロードボタン・Vimeoリンク（旧 UIManager）
 *
 * コンストラクタでコンテナから必要なDOM要素をすべて取得する。
 */
export class UIManager {
    private container: HTMLElement;
    private iframe: HTMLIFrameElement;
    private config: TurntableConfig;
    private state: TurntableState;

    // Loading / progress elements
    private loadingOverlay: HTMLElement;
    private loadingText: HTMLElement;
    private progressBar: HTMLProgressElement;
    private progressText: HTMLElement;

    // Angle display elements
    private angleEl: HTMLElement | null;
    private angleDisplay: HTMLElement | null;

    // Reload button
    private reloadButton: HTMLButtonElement;

    // Loading timeout tracking
    private loadingStartTime: number | null = null;
    private lastProgressTime: number = 0;
    private lastProgressPercentage: number = 0;

    constructor(
        container: HTMLElement,
        iframe: HTMLIFrameElement,
        config: TurntableConfig,
        state: TurntableState,
        onReload: () => Promise<void>
    ) {
        this.container = container;
        this.iframe = iframe;
        this.config = config;
        this.state = state;

        this.angleEl = container.querySelector('#rotation-angle');
        this.angleDisplay = container.querySelector('#angle-display');

        const loadingOverlay = container.querySelector<HTMLElement>('.loading-overlay');
        const loadingText = container.querySelector<HTMLElement>('.loading-text');
        const progressBar = container.querySelector<HTMLProgressElement>('progress.progress-bar');
        const progressText = container.querySelector<HTMLElement>('.progress-text');
        const reloadButton = container.querySelector<HTMLButtonElement>('.reload-button');

        if (!loadingOverlay || !loadingText || !progressBar || !progressText || !reloadButton) {
            throw new Error('Required UI elements not found in container');
        }

        this.loadingOverlay = loadingOverlay;
        this.loadingText = loadingText;
        this.progressBar = progressBar;
        this.progressText = progressText;
        this.reloadButton = reloadButton;

        this.reloadButton.addEventListener('click', () => onReload());
    }

    // ─── Loading / Progress ───────────────────────────────────────────────────

    updateProgress(percentage: number, text: string | null = null): void {
        this.progressBar.value = percentage;
        this.progressText.textContent = `${Math.round(percentage)}%`;

        if (text) {
            this.loadingText.textContent = text;
        }

        if (percentage >= 100) {
            this.resetTimeout();
            return;
        }

        this.checkLoadingTimeout(percentage);
    }

    showLoadingOverlay(): void {
        if (this.angleDisplay) {
            this.angleDisplay.style.display = 'none';
        }

        this.restoreLoadingContent();
        this.loadingOverlay.classList.remove('hidden');
        this.loadingOverlay.style.display = 'flex';
        this.loadingOverlay.style.backgroundColor = '';
        this.loadingText.style.color = '';
        this.updateProgress(0, 'Initializing video player...');
        this.adjustLoadingOverlaySize();
        setTimeout(() => this.adjustLoadingOverlaySize(), 10);
    }

    hideLoadingOverlay(): void {
        setTimeout(() => {
            this.loadingOverlay.classList.add('hidden');

            if (this.config.showAngle && this.angleDisplay) {
                this.angleDisplay.style.display = 'block';
            }
        }, 500);

        this.showVimeoLink();
    }

    /**
     * リロード後に新しい iframe 参照を更新
     */
    updateIframe(iframe: HTMLIFrameElement): void {
        this.iframe = iframe;
    }

    /**
     * ローディングオーバーレイのサイズ調整
     * CSS で position: absolute; width: 100%; height: 100% を使用しているため、
     * インラインスタイルでの上書きは行わない。
     * iframe の offsetWidth/offsetHeight が確定済みであれば明示的に合わせる。
     * 未確定（0）の場合は CSS に委ねてインラインスタイルをクリアする。
     */
    adjustLoadingOverlaySize(): void {
        const screenWidth = window.innerWidth || document.documentElement.clientWidth;
        const isMobile = screenWidth <= MOBILE_BREAKPOINT_PX;

        if (isMobile) {
            // モバイル: CSS width: 100% !important がiframe幅を上書きするため、
            // 高さをアスペクト比に合わせて再計算してinlineで設定する
            const attrWidth = parseInt(this.iframe.getAttribute('width') || '0');
            const attrHeight = parseInt(this.iframe.getAttribute('height') || '0');
            const containerWidth = this.container.clientWidth || 0;

            if (containerWidth > 0) {
                if (attrWidth > 0 && attrHeight > 0) {
                    const scaledHeight = Math.round(containerWidth * (attrHeight / attrWidth));
                    this.iframe.style.height = `${scaledHeight}px`;
                } else {
                    this.iframe.style.height = `${containerWidth}px`;
                }
            }

            this.loadingOverlay.style.width = '';
            this.loadingOverlay.style.height = '';
            return;
        }

        const renderedWidth = this.iframe.offsetWidth;
        const renderedHeight = this.iframe.offsetHeight;

        if (renderedWidth > 0 && renderedHeight > 0) {
            this.loadingOverlay.style.width = `${renderedWidth}px`;
            this.loadingOverlay.style.height = `${renderedHeight}px`;
        } else {
            this.loadingOverlay.style.width = '';
            this.loadingOverlay.style.height = '';
        }
    }

    resetTimeout(): void {
        this.loadingStartTime = null;
        this.lastProgressTime = 0;
        this.lastProgressPercentage = 0;
    }

    showError(title: string, message: string): void {
        const loadingContent = document.createElement('div');
        loadingContent.className = 'loading-content';

        const titleEl = document.createElement('div');
        titleEl.className = 'loading-text';
        titleEl.style.color = '#ff6b6b';
        titleEl.textContent = title;

        const messageEl = document.createElement('div');
        messageEl.style.color = '#ffa8a8';
        messageEl.style.fontSize = '11px';
        messageEl.style.marginTop = '8px';
        messageEl.style.lineHeight = '1.4';
        messageEl.style.whiteSpace = 'pre-line';
        messageEl.textContent = message.replace(/<br\s*\/?>/gi, '\n');

        loadingContent.append(titleEl, messageEl);
        this.loadingOverlay.replaceChildren(loadingContent);
        this.loadingOverlay.style.display = 'flex';
        this.loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';

        console.error(`${title}: ${message}`);
    }

    private restoreLoadingContent(): void {
        if (this.progressBar.isConnected && this.loadingText.isConnected && this.progressText.isConnected) {
            return;
        }

        const loadingContent = document.createElement('div');
        loadingContent.className = 'loading-content';

        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = 'Loading turntable...';

        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';

        const progressBar = document.createElement('progress');
        progressBar.className = 'progress-bar';
        progressBar.max = 100;
        progressBar.value = 0;

        const progressText = document.createElement('div');
        progressText.className = 'progress-text';
        progressText.textContent = '0%';

        progressContainer.append(progressBar, progressText);
        loadingContent.append(loadingText, progressContainer);
        this.loadingOverlay.replaceChildren(loadingContent);

        this.loadingText = loadingText;
        this.progressBar = progressBar;
        this.progressText = progressText;
    }

    private checkLoadingTimeout(percentage: number): void {
        if (!this.loadingStartTime) {
            this.loadingStartTime = Date.now();
            this.lastProgressTime = Date.now();
            this.lastProgressPercentage = percentage;
            return;
        }

        const now = Date.now();
        const totalLoadingTime = now - this.loadingStartTime;
        const timeSinceLastProgress = now - this.lastProgressTime;

        if (percentage > this.lastProgressPercentage) {
            this.lastProgressTime = now;
            this.lastProgressPercentage = percentage;
            return;
        }

        if (timeSinceLastProgress > LOADING_STALL_TIMEOUT_MS || totalLoadingTime > LOADING_TOTAL_TIMEOUT_MS) {
            console.warn(`Loading timeout detected. Stalled: ${timeSinceLastProgress}ms, Total: ${totalLoadingTime}ms`);

            this.loadingText.textContent = 'ローディングが停止しました - リロードボタンを押してください';
            this.loadingText.style.color = '#ff6b6b';

            this.loadingStartTime = null;
        }
    }

    // ─── Angle / Reload / Vimeo link ─────────────────────────────────────────

    setReloadLoading(isLoading: boolean): void {
        this.reloadButton.classList.toggle('loading', isLoading);
    }

    updateAngle(seconds: number): void {
        if (!this.angleEl) return;

        const angle = timeToAngle(seconds, this.state.duration, this.config.isClockwise);
        const roundedAngle = Math.round(angle);

        if (this.state.isDragging || this.state.lastDisplayedAngle !== roundedAngle) {
            this.angleEl.textContent = roundedAngle.toString();
            this.state.lastDisplayedAngle = roundedAngle;
        }
    }

    showAngleDisplay(): void {
        if (this.angleDisplay && this.config.showAngle) {
            this.angleDisplay.style.display = 'block';
        }
    }

    hideAngleDisplay(): void {
        if (this.angleDisplay) {
            this.angleDisplay.style.display = 'none';
        }
    }

    private showVimeoLink(): void {
        const vimeoLink = (this.container.parentNode?.querySelector('.vimeo-link') ||
            this.container.querySelector('.vimeo-link')) as HTMLAnchorElement;
        if (vimeoLink) {
            if (this.iframe) {
                const videoWidth = this.iframe.offsetWidth;
                if (videoWidth > 0) {
                    vimeoLink.style.width = `${videoWidth}px`;
                }
            }
            vimeoLink.classList.add('visible');
        }
    }
}
