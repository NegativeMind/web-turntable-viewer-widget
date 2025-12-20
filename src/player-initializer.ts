import type { TurntableState } from './types';
import { getErrorMessage, withTimeout, delay } from './utils';

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
    async createPlayer(onProgress?: (progress: number, message: string) => void): Promise<any> {
        try {
            onProgress?.(40, 'Connecting to player...');
            // @ts-ignore - VimeoはグローバルにCDNから読み込まれている
            const player = new Vimeo.Player(this.iframe);
            return player;
        } catch (error) {
            throw new Error(`Failed to create Vimeo player: ${getErrorMessage(error)}`);
        }
    }

    /**
     * プレイヤーの基本情報取得
     */
    async getPlayerDuration(player: any, isReloading: boolean = false, onProgress?: (progress: number, message: string) => void): Promise<number> {
        onProgress?.(60, 'Loading player settings...');

        // リロード時はタイムアウトを長くする
        const timeout = isReloading ? 15000 : 10000;
        const duration = await withTimeout(
            player.getDuration(),
            timeout,
            'Failed to get video duration'
        );
        console.log('Duration:', duration);

        if (!duration || duration <= 0) {
            throw new Error('Invalid video duration received');
        }

        return duration;
    }

    /**
     * 動画のアスペクト比を調整（プレイヤー情報から詳細確認）
     */
    async adjustVideoAspectRatio(player: any, onAdjustOverlay?: () => void): Promise<void> {
        try {
            console.log('Getting video dimensions...');
            const videoWidth = await withTimeout(
                player.getVideoWidth(),
                3000,
                'Failed to get video width'
            );
            const videoHeight = await withTimeout(
                player.getVideoHeight(),
                3000,
                'Failed to get video height'
            );
            const aspectRatio = videoHeight / videoWidth;

            console.log(`Player Video dimensions: ${videoWidth}x${videoHeight}, aspect ratio: ${aspectRatio.toFixed(3)}`);

            const currentWidth = parseInt(this.iframe.getAttribute('width') || '480');
            const currentHeight = parseInt(this.iframe.getAttribute('height') || '480');
            const currentAspectRatio = currentHeight / currentWidth;
            const specifiedVideoHeight = parseInt(this.container.getAttribute('video-height') || '0');

            if (!specifiedVideoHeight && Math.abs(currentAspectRatio - aspectRatio) > 0.01) {
                const calculatedHeight = Math.round(currentWidth * aspectRatio);
                this.iframe.setAttribute('height', calculatedHeight.toString());
                console.log(`Fine-tuned iframe size: ${currentWidth}x${calculatedHeight} (aspect ratio: ${aspectRatio.toFixed(3)})`);

                onAdjustOverlay?.();
            } else {
                console.log('Aspect ratio already correct, no adjustment needed');
            }
        } catch (error) {
            console.warn('Could not get video dimensions, keeping current size:', getErrorMessage(error));
            onAdjustOverlay?.();
        }
    }

    /**
     * プレイヤー設定を個別にエラーハンドリング付きで適用
     */
    async applyPlayerSettings(player: any, onProgress?: (progress: number, message: string) => void): Promise<void> {
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
                await withTimeout(setting.action(), 3000, `Failed to set ${setting.name}`);
                console.log(`Successfully set ${setting.name}`);
            } catch (error) {
                console.warn(`Setting ${setting.name} failed:`, getErrorMessage(error));
                setting.fallback();
            }
        }
    }

    /**
     * 動画の事前ロード（失敗しても続行可能）
     */
    async preloadVideo(player: any, duration: number, onProgress?: (progress: number, message: string) => void): Promise<boolean> {
        try {
            onProgress?.(85, 'Buffering video...');
            console.log('Starting video buffer preload...');

            // 再生せずにseekだけでバッファリング（ブラウザの自動再生ブロックを回避）
            const preloadPoints = [0, 0.5];
            for (let i = 0; i < preloadPoints.length; i++) {
                const point = preloadPoints[i];
                const seekTime = duration * point;
                await withTimeout(
                    player.setCurrentTime(seekTime),
                    5000,
                    `Preload seek timeout at ${point * 100}%`
                );
                await delay(300);

                onProgress?.(85 + (i + 1) * 2, `Buffering ${Math.round(point * 100)}%...`);
            }

            await withTimeout(player.setCurrentTime(0), 5000, 'Preload final seek timeout');

            console.log('Video buffer preload completed');
            return true;
        } catch (error) {
            // バッファリングはオプショナルなので、失敗しても問題ない
            console.log('Video buffer preload skipped:', getErrorMessage(error));
            return false;
        }
    }

    /**
     * 初期プレイヤー状態の設定
     */
    async setInitialPlayerState(player: any, onProgress?: (progress: number, message: string) => void): Promise<void> {
        onProgress?.(90, 'Setting initial state...');

        // playはブラウザの自動再生ポリシーでブロックされる可能性があるが、
        // pauseとseekが成功すればウィジェットは機能する
        const actions = [
            { name: 'play', action: () => player.play(), optional: true },
            { name: 'pause', action: () => player.pause(), optional: false },
            { name: 'seek to start', action: () => player.setCurrentTime(0), optional: false }
        ];

        for (const action of actions) {
            try {
                await withTimeout(action.action(), 3000, `Failed to ${action.name}`);
                console.log(`Successfully executed: ${action.name}`);
            } catch (error) {
                if (action.optional) {
                    // オプショナルな操作（play等）の失敗は通常動作
                    console.log(`${action.name} skipped (likely blocked by browser autoplay policy)`);
                } else {
                    // 必須の操作（pause/seek）の失敗は警告
                    console.warn(`Action ${action.name} failed:`, getErrorMessage(error));
                }
            }
        }
    }
}
