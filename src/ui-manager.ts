import type { TurntableConfig, TurntableState } from './types';
import { ProgressManager } from './progress-manager';

/**
 * UI更新を管理するクラス（角度表示、リロードボタン、Vimeoリンク）
 */
export class UIManager {
    private container: HTMLElement;
    private iframe: HTMLIFrameElement;
    private angleEl: HTMLElement | null;
    private angleDisplay: HTMLElement | null;
    private reloadButton: HTMLButtonElement;
    private config: TurntableConfig;
    private state: TurntableState;
    private progressManager: ProgressManager;
    private onReload: () => Promise<void>;

    constructor(
        container: HTMLElement,
        iframe: HTMLIFrameElement,
        angleEl: HTMLElement | null,
        angleDisplay: HTMLElement | null,
        config: TurntableConfig,
        state: TurntableState,
        progressManager: ProgressManager,
        onReload: () => Promise<void>
    ) {
        this.container = container;
        this.iframe = iframe;
        this.angleEl = angleEl;
        this.angleDisplay = angleDisplay;
        this.config = config;
        this.state = state;
        this.progressManager = progressManager;
        this.onReload = onReload;

        // リロードボタンを作成
        this.reloadButton = document.createElement('button');
        this.createReloadButton();
    }

    /**
     * リロードボタンを作成
     */
    private createReloadButton(): void {
        this.reloadButton.className = 'reload-button';
        this.reloadButton.title = 'ビデオを再読み込み';

        this.reloadButton.innerHTML = `
            <svg class="reload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
        `;

        this.reloadButton.addEventListener('click', () => {
            this.onReload();
        });

        this.container.appendChild(this.reloadButton);
    }

    /**
     * リロードボタンを表示
     */
    showReloadButton(): void {
        if (this.reloadButton) {
            this.reloadButton.style.display = 'flex';
        }
    }

    /**
     * リロードボタンを非表示
     */
    hideReloadButton(): void {
        if (this.reloadButton) {
            this.reloadButton.style.display = 'none';
        }
    }

    /**
     * リロード処理のローディング状態を設定
     */
    setReloadLoading(isLoading: boolean): void {
        if (isLoading) {
            this.reloadButton.classList.add('loading');
        } else {
            this.reloadButton.classList.remove('loading');
        }
    }

    /**
     * 角度表示更新
     */
    updateAngle(seconds: number): void {
        let angle;

        if (this.config.isClockwise) {
            angle = (seconds / this.state.duration) * 360;
        } else {
            angle = 360 - (seconds / this.state.duration) * 360;
        }

        angle = angle % 360;
        if (angle < 0) angle += 360;

        if (!this.angleEl) return;

        const roundedAngle = Math.round(angle);
        if (this.state.isDragging) {
            this.angleEl.textContent = roundedAngle.toString();
            this.state.lastDisplayedAngle = roundedAngle;
        } else {
            if (this.state.lastDisplayedAngle !== roundedAngle) {
                this.angleEl.textContent = roundedAngle.toString();
                this.state.lastDisplayedAngle = roundedAngle;
            }
        }
    }

    /**
     * 角度表示の位置を調整
     */
    adjustAngleDisplayPosition(): void {
        if (!this.angleDisplay || !this.iframe) {
            console.log('angleDisplay or iframe not found, skipping position adjustment');
            return;
        }

        const wasHidden = this.angleDisplay.style.display === 'none';
        if (wasHidden) {
            this.angleDisplay.style.visibility = 'hidden';
            this.angleDisplay.style.display = 'block';
        }

        console.log('Angle display positioned at bottom center via CSS');

        if (wasHidden) {
            this.angleDisplay.style.display = 'none';
            this.angleDisplay.style.visibility = 'visible';
        }
    }

    /**
     * 角度表示を表示
     */
    showAngleDisplay(): void {
        if (this.angleDisplay) {
            this.adjustAngleDisplayPosition();
            this.angleDisplay.style.display = 'block';
            console.log('Angle display enabled after successful initialization and position adjustment');
        }
    }

    /**
     * 角度表示を非表示
     */
    hideAngleDisplay(): void {
        if (this.angleDisplay) {
            this.angleDisplay.style.display = 'none';
        }
    }

    /**
     * Vimeoリンクを表示
     */
    showVimeoLink(): void {
        const vimeoLink = (this.container.parentNode?.querySelector('.vimeo-link') ||
            this.container.querySelector('.vimeo-link')) as HTMLAnchorElement;
        if (vimeoLink && this.config.videoId) {
            if (!/^\d+$/.test(this.config.videoId)) {
                console.warn('Invalid video ID format detected, skipping Vimeo link generation');
                return;
            }

            vimeoLink.href = `https://vimeo.com/${this.config.videoId}`;

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
     * ローディングオーバーレイを隠す（UI調整含む）
     */
    hideLoadingOverlay(): void {
        this.progressManager.hideLoadingOverlay();

        if (this.angleDisplay) {
            this.adjustAngleDisplayPosition();
        }

        this.showVimeoLink();
    }

    /**
     * エラー表示
     */
    showError(title: string, message: string): void {
        this.progressManager.showError(title, message);
    }
}
