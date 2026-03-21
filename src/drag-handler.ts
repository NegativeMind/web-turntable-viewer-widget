import type { TurntableConfig, TurntableState } from './types';
import { DRAG_SENSITIVITY_FACTOR, DRAG_EXTREME_DELTA_PX, DRAG_API_THROTTLE_MS } from './constants';

/**
 * ドラッグ操作とイベント処理を管理するクラス
 *
 * シーク戦略:
 *   - DRAG_API_THROTTLE_MS 間隔でスロットリングし、直接 setCurrentTime を呼び出す。
 *   - 非同期ループは使用しない（isSeeking フラグが詰まると 2 回目以降のドラッグが
 *     ブロックされるため）。
 *
 * イベント戦略:
 *   - pointerdown は dragOverlay で受け取る（コンポーネント生存期間）。
 *   - pointermove / pointerup はドラッグ開始後のみ document に登録。
 *   - pointerId フィルタリングで、タッチパッド等の誤操作によるドラッグ中断を防ぐ。
 *   - AbortController で全リスナーを一括解除。
 */
export class DragHandler {
    private container: HTMLElement;
    private dragOverlay: HTMLElement;
    private state: TurntableState;
    private config: TurntableConfig;
    private calculatePixelsPerRotation: () => number;
    private onAngleUpdate: (seconds: number) => void;

    /** コンポーネント生存期間のリスナー管理 */
    private abortController: AbortController | null = null;
    /** ドラッグセッション中のドキュメントリスナー管理 */
    private dragAbortController: AbortController | null = null;

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
    }

    attachEventListeners(): void {
        this.abortController = new AbortController();
        this.dragOverlay.addEventListener(
            'pointerdown',
            (e) => this.onPointerDown(e),
            { signal: this.abortController.signal }
        );
    }

    removeEventListeners(): void {
        this.dragAbortController?.abort();
        this.dragAbortController = null;
        this.abortController?.abort();
        this.abortController = null;
    }

    private calculateNewTime(deltaX: number): number {
        const pixelsPerRotation = this.calculatePixelsPerRotation();
        const rotationProgress = (deltaX * DRAG_SENSITIVITY_FACTOR) / pixelsPerRotation;

        const timeDelta = this.config.isClockwise
            ? -rotationProgress * this.state.duration
            : rotationProgress * this.state.duration;

        const newTime = this.state.startTime + timeDelta;
        return ((newTime % this.state.duration) + this.state.duration) % this.state.duration;
    }

    private handleDragMove(currentX: number): void {
        if (!this.state.isDragging || !this.state.isPlayerReady) return;
        if (this.state.startTime == null || this.state.dragStartX == null) return;

        const deltaX = currentX - this.state.dragStartX;

        if (Math.abs(deltaX) > DRAG_EXTREME_DELTA_PX) {
            console.warn('Extreme deltaX detected, ignoring:', deltaX);
            return;
        }

        const newTime = this.calculateNewTime(deltaX);

        // 角度表示は常に即時更新
        this.onAngleUpdate(newTime);

        // Vimeo API 呼び出しはスロットリング
        const now = performance.now();
        if (now - this.state.lastDragUpdate < DRAG_API_THROTTLE_MS) return;
        this.state.lastDragUpdate = now;

        this.state.player?.setCurrentTime(newTime).catch(() => {});
    }

    private async handleDragStart(startX: number): Promise<boolean> {
        if (!this.state.isPlayerReady) return false;

        this.state.isDragging = false;
        this.state.dragStartX = startX;
        this.dragOverlay.style.cursor = 'grabbing';

        try {
            this.state.startTime = await this.state.player.getCurrentTime();
            this.state.isDragging = true;
            this.state.dragStartX = startX;
            this.state.lastDragUpdate = 0;

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

    private handleDragEnd(): void {
        if (!this.state.isDragging) return;

        this.state.isDragging = false;
        this.state.lastDragUpdate = 0;

        this.dragOverlay.classList.remove('dragging');
        this.container.classList.remove('dragging');
        this.dragOverlay.style.cursor = 'grab';
        this.state.player?.pause();
    }

    private async onPointerDown(e: PointerEvent): Promise<void> {
        if (this.state.isDragging) return;

        // リロードボタン上のポインターダウンはドラッグ処理に渡さない
        if ((e.target as HTMLElement).closest('.reload-button')) return;

        const success = await this.handleDragStart(e.clientX);
        if (!success) return;

        // await 中にコンポーネントが破棄された場合（リロードなど）は中断
        if (!this.abortController) return;

        // pointerId でフィルタリングし、タッチパッドや他のポインターの
        // pointerup でドラッグが誤終了するのを防ぐ
        const activePointerId = e.pointerId;

        this.dragAbortController = new AbortController();
        const { signal } = this.dragAbortController;

        document.addEventListener('pointermove', (ev) => {
            if (ev.pointerId === activePointerId) this.onPointerMove(ev);
        }, { signal });
        document.addEventListener('pointerup', (ev) => {
            if (ev.pointerId === activePointerId) this.onPointerUp(ev);
        }, { signal });
        document.addEventListener('pointercancel', (ev) => {
            if (ev.pointerId === activePointerId) this.onPointerUp(ev);
        }, { signal });
    }

    private onPointerMove(e: PointerEvent): void {
        this.handleDragMove(e.clientX);
    }

    private onPointerUp(_e: PointerEvent): void {
        this.handleDragEnd();
        this.dragAbortController?.abort();
        this.dragAbortController = null;
    }
}
