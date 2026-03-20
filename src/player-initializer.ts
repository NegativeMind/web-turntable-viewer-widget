import type { VimeoPlayer } from './types';
import { getErrorMessage, withTimeout, delay } from './utils';
import {
    PLAYER_DURATION_TIMEOUT_MS,
    PLAYER_DURATION_RELOAD_TIMEOUT_MS,
    PLAYER_SETTING_TIMEOUT_MS,
    PLAYER_PRELOAD_TIMEOUT_MS,
    PLAYER_PRELOAD_DELAY_MS,
    PLAYER_PRELOAD_POINTS,
} from './constants';

/**
 * プレイヤー初期化と事前ロードを管理するクラス
 */
export class PlayerInitializer {
    private iframe: HTMLIFrameElement;
    private container: HTMLElement;

    constructor(container: HTMLElement, iframe: HTMLIFrameElement) {
        this.container = container;
        this.iframe = iframe;
    }

    /**
     * Vimeoプレイヤーを作成
     */
    async createPlayer(onProgress?: (progress: number, message: string) => void): Promise<VimeoPlayer> {
        try {
            onProgress?.(40, 'Connecting to player...');
            // @ts-ignore - VimeoはグローバルにCDNから読み込まれている
            return new Vimeo.Player(this.iframe);
        } catch (error) {
            throw new Error(`Failed to create Vimeo player: ${getErrorMessage(error)}`);
        }
    }

    /**
     * プレイヤーの基本情報取得
     */
    async getPlayerDuration(player: VimeoPlayer, isReloading: boolean = false, onProgress?: (progress: number, message: string) => void): Promise<number> {
        onProgress?.(60, 'Loading player settings...');

        const timeout = isReloading ? PLAYER_DURATION_RELOAD_TIMEOUT_MS : PLAYER_DURATION_TIMEOUT_MS;
        const duration = await withTimeout(
            player.getDuration(),
            timeout,
            'Failed to get video duration'
        );

        if (!duration || duration <= 0) {
            throw new Error('Invalid video duration received');
        }

        return duration;
    }

    /**
     * 動画のアスペクト比を調整（プレイヤー情報から詳細確認）
     */
    async adjustVideoAspectRatio(player: VimeoPlayer, onAdjustOverlay?: () => void): Promise<void> {
        try {
            const videoWidth = await withTimeout(
                player.getVideoWidth(),
                PLAYER_SETTING_TIMEOUT_MS,
                'Failed to get video width'
            );
            const videoHeight = await withTimeout(
                player.getVideoHeight(),
                PLAYER_SETTING_TIMEOUT_MS,
                'Failed to get video height'
            );
            const aspectRatio = videoHeight / videoWidth;

            const currentWidth = parseInt(this.iframe.getAttribute('width') || '480');
            const currentHeight = parseInt(this.iframe.getAttribute('height') || '480');
            const currentAspectRatio = currentHeight / currentWidth;
            const specifiedVideoHeight = parseInt(this.container.getAttribute('video-height') || '0');

            if (!specifiedVideoHeight && Math.abs(currentAspectRatio - aspectRatio) > 0.01) {
                const calculatedHeight = Math.round(currentWidth * aspectRatio);
                this.iframe.setAttribute('height', calculatedHeight.toString());
            }

            onAdjustOverlay?.();
        } catch (error) {
            console.warn('Could not get video dimensions, keeping current size:', getErrorMessage(error));
            onAdjustOverlay?.();
        }
    }

    /**
     * プレイヤー設定を個別にエラーハンドリング付きで適用
     */
    async applyPlayerSettings(player: VimeoPlayer, onProgress?: (progress: number, message: string) => void): Promise<void> {
        onProgress?.(75, 'Applying player settings...');

        const settings = [
            {
                name: 'loop',
                action: () => player.setLoop(true),
                fallback: () => console.warn('Could not set loop mode')
            },
            {
                name: 'volume',
                action: () => player.setVolume(0),
                fallback: () => console.warn('Could not set volume')
            }
        ];

        for (const setting of settings) {
            try {
                await withTimeout(setting.action() as Promise<unknown>, PLAYER_SETTING_TIMEOUT_MS, `Failed to set ${setting.name}`);
            } catch (error) {
                console.warn(`Setting ${setting.name} failed:`, getErrorMessage(error));
                setting.fallback();
            }
        }
    }

    /**
     * 動画の事前ロード（失敗しても続行可能）
     */
    async preloadVideo(player: VimeoPlayer, duration: number, onProgress?: (progress: number, message: string) => void): Promise<boolean> {
        try {
            onProgress?.(85, 'Buffering video...');

            for (let i = 0; i < PLAYER_PRELOAD_POINTS.length; i++) {
                const point = PLAYER_PRELOAD_POINTS[i];
                const seekTime = duration * point;
                await withTimeout(
                    player.setCurrentTime(seekTime),
                    PLAYER_PRELOAD_TIMEOUT_MS,
                    `Preload seek timeout at ${point * 100}%`
                );
                await delay(PLAYER_PRELOAD_DELAY_MS);
                onProgress?.(85 + (i + 1) * 2, `Buffering ${Math.round(point * 100)}%...`);
            }

            await withTimeout(player.setCurrentTime(0), PLAYER_PRELOAD_TIMEOUT_MS, 'Preload final seek timeout');
            return true;
        } catch (error) {
            console.warn('Video buffer preload skipped:', getErrorMessage(error));
            return false;
        }
    }

    /**
     * 初期プレイヤー状態の設定
     */
    async setInitialPlayerState(player: VimeoPlayer, onProgress?: (progress: number, message: string) => void): Promise<void> {
        onProgress?.(90, 'Setting initial state...');

        const actions = [
            { name: 'play', action: () => player.play(), optional: true },
            { name: 'pause', action: () => player.pause(), optional: false },
            { name: 'seek to start', action: () => player.setCurrentTime(0), optional: false }
        ];

        for (const action of actions) {
            try {
                await withTimeout(action.action() as Promise<unknown>, PLAYER_SETTING_TIMEOUT_MS, `Failed to ${action.name}`);
            } catch (error) {
                if (!action.optional) {
                    console.warn(`Action ${action.name} failed:`, getErrorMessage(error));
                }
            }
        }
    }
}
