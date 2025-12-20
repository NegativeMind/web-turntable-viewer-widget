// Vimeo Player APIの型定義
declare global {
    interface Window {
        Vimeo: typeof Vimeo;
        TurntableViewer: any; // クラスコンストラクタの型
        turntableViewerInstances: Set<string>;
    }
}

// Vimeo Player APIの基本的な型定義
declare namespace Vimeo {
    class Player {
        constructor(element: HTMLIFrameElement | string, options?: PlayerOptions);
        play(): Promise<void>;
        pause(): Promise<void>;
        getDuration(): Promise<number>;
        getCurrentTime(): Promise<number>;
        setCurrentTime(seconds: number): Promise<number>;
        getVideoWidth(): Promise<number>;
        getVideoHeight(): Promise<number>;
        setVolume(volume: number): Promise<number>;
        setLoop(loop: boolean): Promise<boolean>;
        destroy(): Promise<void>;
    }

    interface PlayerOptions {
        id?: number;
        url?: string;
        background?: boolean;
        byline?: boolean;
        portrait?: boolean;
        title?: boolean;
        speed?: boolean;
        transparent?: boolean;
        gesture?: string;
        autopause?: boolean;
        muted?: boolean;
        loop?: boolean;
        controls?: boolean;
        quality?: string;
        responsive?: boolean;
        dnt?: boolean;
    }
}

export interface TurntableConfig {
    RESIZE_DEBOUNCE_MS: number;
    PLAYER_LOAD_DELAY_MS: number;
    DRAG_THROTTLE_MS: number;
    isClockwise: boolean;
    videoId: string;
}

export interface TurntableState {
    player: Vimeo.Player | null;
    duration: number;
    isPlayerReady: boolean;
    isPreloaded: boolean;
    isDragging: boolean;
    dragStartX: number;
    startTime: number;
    lastDragUpdate: number;
    lastDisplayedAngle: number | null;
    pendingApiCall: number | null;
}

export interface VideoInfo {
    width: number;
    height: number;
    aspectRatio: number;
    title: string;
}

export { };
