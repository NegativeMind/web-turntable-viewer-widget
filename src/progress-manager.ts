/**
 * プログレスバー管理クラス
 * ローディングオーバーレイとプログレスバーの表示・更新・タイムアウト検知を管理
 */
import type { TurntableConfig } from './types';
import {
    DEFAULT_VIDEO_WIDTH_PX,
    DEFAULT_ASPECT_RATIO,
    LOADING_STALL_TIMEOUT_MS,
    LOADING_TOTAL_TIMEOUT_MS,
} from './constants';

export class ProgressManager {
    private loadingOverlay: HTMLElement;
    private loadingText: HTMLElement;
    private progressFill: HTMLElement;
    private progressText: HTMLElement;
    private container: HTMLElement;
    private iframe: HTMLIFrameElement;
    private config: TurntableConfig;

    // タイムアウト検知用
    private loadingStartTime: number | null = null;
    private lastProgressTime: number = 0;
    private lastProgressPercentage: number = 0;

    constructor(
        container: HTMLElement,
        iframe: HTMLIFrameElement,
        loadingOverlay: HTMLElement,
        loadingText: HTMLElement,
        progressFill: HTMLElement,
        progressText: HTMLElement,
        config: TurntableConfig
    ) {
        this.container = container;
        this.iframe = iframe;
        this.loadingOverlay = loadingOverlay;
        this.loadingText = loadingText;
        this.progressFill = progressFill;
        this.progressText = progressText;
        this.config = config;
    }

    /**
     * プログレスバーを更新
     */
    updateProgress(percentage: number, text: string | null = null): void {
        this.progressFill.style.width = `${percentage}%`;
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

    /**
     * ローディングオーバーレイを表示
     */
    showLoadingOverlay(): void {
        const angleDisplay = this.container.querySelector('#angle-display') as HTMLElement;
        if (angleDisplay) {
            angleDisplay.style.display = 'none';
        }

        this.loadingOverlay.classList.remove('hidden');
        this.updateProgress(0, 'Initializing video player...');
        this.adjustLoadingOverlaySize();
        setTimeout(() => this.adjustLoadingOverlaySize(), 10);
    }

    /**
     * ローディングオーバーレイを隠す
     */
    hideLoadingOverlay(): void {
        setTimeout(() => {
            this.loadingOverlay.classList.add('hidden');

            if (this.config.showAngle) {
                const angleDisplay = this.container.querySelector('#angle-display') as HTMLElement;
                if (angleDisplay) {
                    angleDisplay.style.display = 'block';
                }
            }
        }, 500);
    }

    /**
     * ローディングオーバーレイのサイズをiframe要素に合わせて調整
     */
    adjustLoadingOverlaySize(): void {
        const iframeWidth = parseInt(this.iframe.getAttribute('width') || '0');
        const iframeHeight = parseInt(this.iframe.getAttribute('height') || '0');

        if (iframeWidth && iframeHeight) {
            this.loadingOverlay.style.width = `${iframeWidth}px`;
            this.loadingOverlay.style.height = `${iframeHeight}px`;
        } else {
            const defaultWidth = DEFAULT_VIDEO_WIDTH_PX;
            const defaultHeight = Math.round(defaultWidth * DEFAULT_ASPECT_RATIO);
            this.loadingOverlay.style.width = `${defaultWidth}px`;
            this.loadingOverlay.style.height = `${defaultHeight}px`;
        }
    }

    /**
     * ローディングタイムアウトをチェック
     */
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

            if (this.loadingText) {
                this.loadingText.textContent = 'ローディングが停止しました - リロードボタンを押してください';
                this.loadingText.style.color = '#ff6b6b';
            }

            this.loadingStartTime = null;
        }
    }

    /**
     * タイムアウトタイマーをリセット
     */
    resetTimeout(): void {
        this.loadingStartTime = null;
        this.lastProgressTime = 0;
        this.lastProgressPercentage = 0;
    }

    /**
     * エラー表示（ローディングオーバーレイをエラー表示に変更）
     */
    showError(title: string, message: string): void {
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
}
