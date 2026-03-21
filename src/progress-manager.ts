/**
 * プログレスバー管理クラス
 * ローディングオーバーレイとプログレスバーの表示・更新・タイムアウト検知を管理
 */
import type { TurntableConfig } from './types';
import {
    LOADING_STALL_TIMEOUT_MS,
    LOADING_TOTAL_TIMEOUT_MS,
} from './constants';

export class ProgressManager {
    private loadingOverlay: HTMLElement;
    private loadingText: HTMLElement;
    private progressBar: HTMLProgressElement;
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
        progressBar: HTMLProgressElement,
        progressText: HTMLElement,
        config: TurntableConfig
    ) {
        this.container = container;
        this.iframe = iframe;
        this.loadingOverlay = loadingOverlay;
        this.loadingText = loadingText;
        this.progressBar = progressBar;
        this.progressText = progressText;
        this.config = config;
    }

    /**
     * プログレスバーを更新
     */
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
     * ローディングオーバーレイのサイズ調整
     * CSS で position: absolute; width: 100%; height: 100% を使用しているため、
     * インラインスタイルでの上書きは行わない。
     * iframe の offsetWidth/offsetHeight が確定済みであれば明示的に合わせる。
     * 未確定（0）の場合は CSS に委ねてインラインスタイルをクリアする。
     */
    adjustLoadingOverlaySize(): void {
        const renderedWidth = this.iframe.offsetWidth;
        const renderedHeight = this.iframe.offsetHeight;

        if (renderedWidth > 0 && renderedHeight > 0) {
            this.loadingOverlay.style.width = `${renderedWidth}px`;
            this.loadingOverlay.style.height = `${renderedHeight}px`;
        } else {
            // レンダリング前は CSS の width: 100%; height: 100% に委ねる
            this.loadingOverlay.style.width = '';
            this.loadingOverlay.style.height = '';
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
