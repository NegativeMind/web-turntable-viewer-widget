import type { TurntableConfig, TurntableState } from './types';
import {
    DRAG_SENSITIVITY_FACTOR,
    DRAG_EXTREME_DELTA_PX,
    DRAG_API_THROTTLE_MS,
    INERTIA_FRICTION,
    INERTIA_MIN_VELOCITY_PX_MS,
    INERTIA_VELOCITY_SAMPLE_WINDOW_MS,
} from './constants';

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
 *
 * 慣性スクロール:
 *   - ドラッグ中に速度サンプルを記録し、離した瞬間の速度を計算。
 *   - requestAnimationFrame ループで INERTIA_FRICTION を乗算しながら減速。
 *   - INERTIA_MIN_VELOCITY_PX_MS を下回った時点で停止してプレーヤーを pause。
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

    /** 速度計算用サンプルバッファ */
    private velocitySamples: { x: number; t: number }[] = [];
    /** 慣性アニメーションの rAF ID */
    private inertiaRafId: number | null = null;
    /** 慣性継続用の直近の動画時刻 */
    private inertiaCurrentTime: number = 0;

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
        this.stopInertia();
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

        const now = performance.now();

        // 速度計算用サンプルを更新
        this.velocitySamples.push({ x: currentX, t: now });
        const cutoff = now - INERTIA_VELOCITY_SAMPLE_WINDOW_MS;
        this.velocitySamples = this.velocitySamples.filter(s => s.t >= cutoff);

        const newTime = this.calculateNewTime(deltaX);

        // 慣性継続用に最新の動画時刻を保持
        this.inertiaCurrentTime = newTime;

        // 角度表示は常に即時更新
        this.onAngleUpdate(newTime);

        // Vimeo API 呼び出しはスロットリング
        if (now - this.state.lastDragUpdate < DRAG_API_THROTTLE_MS) return;
        this.state.lastDragUpdate = now;

        this.state.player?.setCurrentTime(newTime).catch(() => {});
    }

    /** 速度サンプルから直近の速度（px/ms）を算出 */
    private calculateVelocity(): number {
        if (this.velocitySamples.length < 2) return 0;
        const first = this.velocitySamples[0];
        const last = this.velocitySamples[this.velocitySamples.length - 1];
        const dt = last.t - first.t;
        if (dt === 0) return 0;
        return (last.x - first.x) / dt;
    }

    private async handleDragStart(startX: number): Promise<boolean> {
        if (!this.state.isPlayerReady) return false;

        // 慣性アニメーション中に新しいドラッグが来たら停止
        this.stopInertia();

        this.state.isDragging = false;
        this.state.dragStartX = startX;
        this.dragOverlay.style.cursor = 'grabbing';

        try {
            this.state.startTime = await this.state.player.getCurrentTime();
            this.state.isDragging = true;
            this.state.dragStartX = startX;
            this.state.lastDragUpdate = 0;
            this.velocitySamples = [];

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

        const velocity = this.calculateVelocity();
        this.velocitySamples = [];

        this.state.isDragging = false;
        this.state.lastDragUpdate = 0;

        this.dragOverlay.classList.remove('dragging');
        this.container.classList.remove('dragging');
        this.dragOverlay.style.cursor = 'grab';

        if (Math.abs(velocity) > INERTIA_MIN_VELOCITY_PX_MS) {
            this.startInertia(velocity, this.inertiaCurrentTime);
        } else {
            this.state.player?.pause();
        }
    }

    /**
     * 慣性アニメーションを開始する。
     * @param velocity 初速（px/ms）。ドラッグ方向を符号で表す。
     * @param currentTime 慣性開始時点の動画時刻（秒）。
     */
    private startInertia(velocity: number, currentTime: number): void {
        let v = velocity;
        let t = currentTime;
        let lastFrameTime = performance.now();

        const step = () => {
            const now = performance.now();
            const elapsed = now - lastFrameTime;
            lastFrameTime = now;

            // フレームレート非依存の減衰
            v *= Math.pow(INERTIA_FRICTION, elapsed / 16.67);

            if (Math.abs(v) < INERTIA_MIN_VELOCITY_PX_MS) {
                this.inertiaRafId = null;
                this.state.player?.pause();
                return;
            }

            const dx = v * elapsed;
            const pixelsPerRotation = this.calculatePixelsPerRotation();
            const rotationProgress = (dx * DRAG_SENSITIVITY_FACTOR) / pixelsPerRotation;
            const timeDelta = this.config.isClockwise
                ? -rotationProgress * this.state.duration
                : rotationProgress * this.state.duration;

            t = ((t + timeDelta) % this.state.duration + this.state.duration) % this.state.duration;

            this.onAngleUpdate(t);
            this.state.player?.setCurrentTime(t).catch(() => {});

            this.inertiaRafId = requestAnimationFrame(step);
        };

        this.inertiaRafId = requestAnimationFrame(step);
    }

    /** 実行中の慣性アニメーションを停止する */
    private stopInertia(): void {
        if (this.inertiaRafId !== null) {
            cancelAnimationFrame(this.inertiaRafId);
            this.inertiaRafId = null;
        }
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
