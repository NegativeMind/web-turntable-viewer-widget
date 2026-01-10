/**
 * プログレスバー管理クラス
 * ローディングオーバーレイとプログレスバーの表示・更新・タイムアウト検知を管理
 */
import type { TurntableConfig } from './types';

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
        this.progressText = progressText;
    }

    /**
     * プログレスバーを更新
     */
    updateProgress(percentage: number, text: string | null = null): void {
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
     * ローディングオーバーレイを表示
     */
    showLoadingOverlay(): void {
        if (this.loadingOverlay) {
            // ローディング中はAngle表示を即座に非表示
            const angleDisplay = this.container.querySelector('#angle-display') as HTMLElement;
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
    hideLoadingOverlay(): void {
        if (this.loadingOverlay) {
            setTimeout(() => {
                this.loadingOverlay.classList.add('hidden');

                // Angle表示を再表示（show-angle属性がある場合のみ）
                if (this.config.showAngle) {
                    const angleDisplay = this.container.querySelector('#angle-display') as HTMLElement;
                    if (angleDisplay) {
                        angleDisplay.style.display = 'block';
                        console.log('Angle display made visible after loading');
                    } else {
                        console.log('Angle display element not found (optional element)');
                    }
                }
            }, 500); // 少し遅延してスムーズに非表示
        }
    }

    /**
     * ローディングオーバーレイのサイズをiframe要素に合わせて調整
     */
    adjustLoadingOverlaySize(): void {
        if (!this.loadingOverlay || !this.iframe) return;

        // iframeの実際のサイズ（属性値）を取得
        const iframeWidth = parseInt(this.iframe.getAttribute('width') || '0');
        const iframeHeight = parseInt(this.iframe.getAttribute('height') || '0');

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
     * ローディングタイムアウトをチェック
     */
    private checkLoadingTimeout(percentage: number): void {
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
}
