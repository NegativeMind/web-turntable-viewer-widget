import type { TurntableConfig, TurntableState } from './types';
import { ProgressManager } from './progress-manager';
import { timeToAngle } from './rotation-utils';

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

        const reloadButton = container.querySelector<HTMLButtonElement>('.reload-button');
        if (!reloadButton) throw new Error('reload-button not found in container');
        this.reloadButton = reloadButton;
        this.reloadButton.addEventListener('click', () => this.onReload());
    }

    /**
     * リロードボタンを表示
     */
    showReloadButton(): void {
        this.reloadButton.style.display = 'flex';
    }

    /**
     * リロードボタンを非表示
     */
    hideReloadButton(): void {
        this.reloadButton.style.display = 'none';
    }

    /**
     * リロード処理のローディング状態を設定
     */
    setReloadLoading(isLoading: boolean): void {
        this.reloadButton.classList.toggle('loading', isLoading);
    }

    /**
     * 角度表示更新
     */
    updateAngle(seconds: number): void {
        if (!this.angleEl) return;

        const angle = timeToAngle(seconds, this.state.duration, this.config.isClockwise);
        const roundedAngle = Math.round(angle);

        if (this.state.isDragging || this.state.lastDisplayedAngle !== roundedAngle) {
            this.angleEl.textContent = roundedAngle.toString();
            this.state.lastDisplayedAngle = roundedAngle;
        }
    }

    /**
     * 角度表示を表示
     */
    showAngleDisplay(): void {
        if (this.angleDisplay && this.config.showAngle) {
            this.angleDisplay.style.display = 'block';
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

    /**
     * ローディングオーバーレイを隠す（UI調整含む）
     */
    hideLoadingOverlay(): void {
        this.progressManager.hideLoadingOverlay();
        this.showVimeoLink();
    }

    /**
     * エラー表示
     */
    showError(title: string, message: string): void {
        this.progressManager.showError(title, message);
    }
}
