import type { TurntableConfig, TurntableState } from './types';
import { DRAG_SENSITIVITY_FACTOR, DRAG_EXTREME_DELTA_PX, DRAG_API_THROTTLE_MS } from './constants';

/**
 * ドラッグ操作とイベント処理を管理するクラス
 */
export class DragHandler {
    private container: HTMLElement;
    private dragOverlay: HTMLElement;
    private state: TurntableState;
    private config: TurntableConfig;
    private calculatePixelsPerRotation: () => number;
    private onAngleUpdate: (seconds: number) => void;

    // バインド済みのイベントハンドラー
    private boundMouseDown: (e: MouseEvent) => Promise<void>;
    private boundMouseMove: (e: MouseEvent) => void;
    private boundMouseUp: () => void;
    private boundTouchStart: (e: TouchEvent) => Promise<void>;
    private boundTouchMove: (e: TouchEvent) => void;
    private boundTouchEnd: (e: TouchEvent) => void;

    constructor(
        container: HTMLElement,
        dragOverlay: HTMLElement,
        state: TurntableState,
        config: TurntableConfig,
        calculatePixelsPerRotation: () => number,
        onAngleUpdate: (seconds: number) => void
    ) {
        this.container = container;
        this.dragOverlay = dragOverlay;
        this.state = state;
        this.config = config;
        this.calculatePixelsPerRotation = calculatePixelsPerRotation;
        this.onAngleUpdate = onAngleUpdate;

        this.boundMouseDown = this.onMouseDown.bind(this);
        this.boundMouseMove = this.onMouseMove.bind(this);
        this.boundMouseUp = this.onMouseUp.bind(this);
        this.boundTouchStart = this.onTouchStart.bind(this);
        this.boundTouchMove = this.onTouchMove.bind(this);
        this.boundTouchEnd = this.onTouchEnd.bind(this);
    }

    /**
     * イベントリスナーを追加
     */
    attachEventListeners(): void {
        this.dragOverlay.addEventListener('mousedown', this.boundMouseDown);
        this.dragOverlay.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    }

    /**
     * イベントリスナーを削除
     */
    removeEventListeners(): void {
        this.dragOverlay.removeEventListener('mousedown', this.boundMouseDown);
        this.dragOverlay.removeEventListener('touchstart', this.boundTouchStart);
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
        document.removeEventListener('touchmove', this.boundTouchMove);
        document.removeEventListener('touchend', this.boundTouchEnd);
    }

    /**
     * 新しい再生時間を計算（ループ対応）
     */
    private calculateNewTime(deltaX: number): number {
        const pixelsPerRotation = this.calculatePixelsPerRotation();
        const rotationProgress = (deltaX * DRAG_SENSITIVITY_FACTOR) / pixelsPerRotation;

        const timeDelta = this.config.isClockwise
            ? -rotationProgress * this.state.duration
            : rotationProgress * this.state.duration;

        const newTime = this.state.startTime + timeDelta;
        return ((newTime % this.state.duration) + this.state.duration) % this.state.duration;
    }

    /**
     * ドラッグ操作の共通処理
     */
    private handleDragMove(currentX: number): void {
        if (!this.state.isDragging || !this.state.isPlayerReady) return;
        if (this.state.startTime == null || this.state.dragStartX == null) return;

        const deltaX = currentX - this.state.dragStartX;

        if (Math.abs(deltaX) > DRAG_EXTREME_DELTA_PX) {
            console.warn('Extreme deltaX detected, ignoring:', deltaX);
            return;
        }

        const newTime = this.calculateNewTime(deltaX);
        this.onAngleUpdate(newTime);

        const now = performance.now();
        if (now - this.state.lastDragUpdate < DRAG_API_THROTTLE_MS) return;

        this.state.lastDragUpdate = now;

        if (this.state.pendingApiCall) {
            cancelAnimationFrame(this.state.pendingApiCall);
        }

        this.state.pendingApiCall = requestAnimationFrame(() => {
            if (this.state.isDragging && this.state.isPlayerReady) {
                this.state.player?.setCurrentTime(newTime).catch(() => {});
            }
            this.state.pendingApiCall = null;
        });
    }

    /**
     * ドラッグ開始の共通処理
     */
    private async handleDragStart(startX: number): Promise<boolean> {
        if (!this.state.isPlayerReady) return false;

        this.state.isDragging = false;
        this.state.dragStartX = startX;
        this.dragOverlay.style.cursor = 'grabbing';

        try {
            this.state.startTime = await this.state.player.getCurrentTime();
            this.state.isDragging = true;
            this.state.dragStartX = startX;

            this.dragOverlay.classList.add('dragging');
            this.container.classList.add('dragging');
            return true;
        } catch (error) {
            console.error('Failed to get current time:', error);
            this.state.isDragging = false;
            this.dragOverlay.classList.remove('dragging');
            this.container.classList.remove('dragging');
            this.dragOverlay.style.cursor = 'grab';
            return false;
        }
    }

    /**
     * ドラッグ終了の共通処理
     */
    private handleDragEnd(): void {
        if (!this.state.isDragging) return;

        this.state.isDragging = false;

        this.dragOverlay.classList.remove('dragging');
        this.container.classList.remove('dragging');

        if (this.state.pendingApiCall) {
            cancelAnimationFrame(this.state.pendingApiCall);
            this.state.pendingApiCall = null;
        }

        this.dragOverlay.style.cursor = 'grab';
        this.state.player?.pause();
    }

    private async onMouseDown(e: MouseEvent): Promise<void> {
        if (this.state.isDragging) return;

        const success = await this.handleDragStart(e.clientX);
        if (!success) return;

        document.addEventListener('mousemove', this.boundMouseMove);
        document.addEventListener('mouseup', this.boundMouseUp);
        e.preventDefault();
    }

    private onMouseMove(e: MouseEvent): void {
        this.handleDragMove(e.clientX);
    }

    private onMouseUp(): void {
        this.handleDragEnd();
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
    }

    private async onTouchStart(e: TouchEvent): Promise<void> {
        if (this.state.isDragging) return;

        e.preventDefault();
        e.stopPropagation();

        const success = await this.handleDragStart(e.touches[0].clientX);
        if (!success) return;

        document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
        document.addEventListener('touchend', this.boundTouchEnd, { passive: false });
    }

    private onTouchMove(e: TouchEvent): void {
        e.preventDefault();
        e.stopPropagation();
        this.handleDragMove(e.touches[0].clientX);
    }

    private onTouchEnd(e: TouchEvent): void {
        e.preventDefault();
        e.stopPropagation();
        this.handleDragEnd();
        document.removeEventListener('touchmove', this.boundTouchMove);
        document.removeEventListener('touchend', this.boundTouchEnd);
    }
}
