import type { TurntableConfig, VideoInfo } from './types';
import { getErrorMessage, delay } from './utils';
import {
    PPR_BASE_PIXELS,
    PPR_BASE_SCREEN_SIZE_PX,
    PPR_SMALL_SCREEN_BREAKPOINT_PX,
    PPR_SMALL_SCREEN_MULTIPLIER,
    PPR_MIN,
    PPR_MAX,
    QUALITY_DPR_LIMIT,
    MOBILE_BREAKPOINT_PX,
    DEFAULT_VIDEO_WIDTH_PX,
    DEFAULT_ASPECT_RATIO,
} from './constants';

/**
 * 動画設定・品質・URL構築を管理するクラス
 */
export class VideoConfigManager {
    private container: HTMLElement;
    private iframe: HTMLIFrameElement;
    private config: TurntableConfig;

    constructor(container: HTMLElement, iframe: HTMLIFrameElement, config: TurntableConfig) {
        this.container = container;
        this.iframe = iframe;
        this.config = config;
    }

    /**
     * 表示サイズに基づいてPIXELS_PER_ROTATIONを動的に計算
     */
    calculatePixelsPerRotation(): number {
        const htmlWidth = parseInt(this.iframe.getAttribute('width') || '0');
        const containerWidth = this.container.clientWidth || 0;
        const iframeWidth = this.iframe.clientWidth || 0;
        const computedWidth = Math.max(containerWidth, iframeWidth) || 0;

        const finalWidth = htmlWidth || computedWidth || 320;

        console.log(`Container width for calculation: ${finalWidth}px (html: ${htmlWidth}, container: ${containerWidth}, iframe: ${iframeWidth})`);

        let pixelsPerRotation = (finalWidth / PPR_BASE_SCREEN_SIZE_PX) * PPR_BASE_PIXELS;

        if (finalWidth <= PPR_SMALL_SCREEN_BREAKPOINT_PX) {
            pixelsPerRotation *= PPR_SMALL_SCREEN_MULTIPLIER;
        }

        pixelsPerRotation = Math.max(PPR_MIN, Math.min(PPR_MAX, pixelsPerRotation));

        console.log(`Calculated PIXELS_PER_ROTATION: ${Math.round(pixelsPerRotation)} for width: ${finalWidth}px`);
        return Math.round(pixelsPerRotation);
    }

    /**
     * 表示サイズに応じた動画品質選択
     */
    selectVideoQuality(): string {
        const videoWidth = parseInt(this.container.getAttribute('video-width') || '0');
        const videoHeight = parseInt(this.container.getAttribute('video-height') || '0');
        const htmlWidth = parseInt(this.iframe.getAttribute('width') || '0');
        const htmlHeight = parseInt(this.iframe.getAttribute('height') || '0');
        const computedWidth = this.iframe.clientWidth || this.container.clientWidth || 0;

        const finalWidth = videoWidth || htmlWidth || computedWidth || 480;
        const finalHeight = videoHeight || htmlHeight || finalWidth;

        const area = finalWidth * finalHeight;
        const effectiveArea = Math.sqrt(area);

        const devicePixelRatio = window.devicePixelRatio || 1;

        let effectiveSize: number;
        if ((htmlWidth && htmlHeight) || (videoWidth && videoHeight)) {
            const limitedDPR = Math.min(devicePixelRatio, QUALITY_DPR_LIMIT);
            effectiveSize = effectiveArea * limitedDPR;
        } else {
            effectiveSize = effectiveArea * devicePixelRatio;
        }

        let selectedQuality = '240p';
        if (effectiveSize <= 240) {
            selectedQuality = '240p';
        } else if (effectiveSize <= 360) {
            selectedQuality = '360p';
        } else if (effectiveSize <= 480) {
            selectedQuality = '540p';
        } else if (effectiveSize <= 960) {
            selectedQuality = '720p';
        } else if (effectiveSize <= 1280) {
            selectedQuality = '1080p';
        } else if (effectiveSize <= 1920) {
            selectedQuality = '2k';
        } else {
            selectedQuality = '4k';
        }

        console.log(`Selected quality: ${selectedQuality} for effective size: ${effectiveSize}px (${finalWidth}x${finalHeight})`);
        return selectedQuality;
    }

    /**
     * 動画URLを構築
     */
    buildVideoUrl(): string {
        const quality = this.selectVideoQuality();

        const videoWidth = parseInt(this.container.getAttribute('video-width') || '0');
        const videoHeight = parseInt(this.container.getAttribute('video-height') || '0');
        const htmlWidth = parseInt(this.iframe.getAttribute('width') || '0');
        const htmlHeight = parseInt(this.iframe.getAttribute('height') || '0');

        let finalWidth = videoWidth || htmlWidth || 480;
        let finalHeight = videoHeight || htmlHeight || finalWidth;

        const screenWidth = window.innerWidth || document.documentElement.clientWidth;
        if (screenWidth <= MOBILE_BREAKPOINT_PX) {
            const containerWidth = this.container.clientWidth || this.container.parentElement?.clientWidth || screenWidth;
            const availableWidth = Math.floor(containerWidth * 0.9);
            if (availableWidth > 200) {
                finalWidth = availableWidth;
                finalHeight = availableWidth;
            }
        }

        this.iframe.setAttribute('width', finalWidth.toString());
        this.iframe.setAttribute('height', finalHeight.toString());

        if (screenWidth <= MOBILE_BREAKPOINT_PX) {
            this.iframe.style.width = finalWidth + 'px';
            this.iframe.style.height = finalHeight + 'px';
            this.iframe.style.maxWidth = 'none';
            this.iframe.style.display = 'block';
            console.log(`Applied direct CSS styles: ${finalWidth}x${finalHeight}`);
        }

        const params = new URLSearchParams({
            background: '1',
            byline: '0',
            portrait: '0',
            title: '0',
            speed: '0',
            transparent: '1',
            gesture: 'media',
            autopause: '0',
            muted: '1',
            loop: '1',
            controls: '0',
            quality: quality,
            responsive: '0',
            dnt: '1'
        });

        const url = `https://player.vimeo.com/video/${this.config.videoId}?${params.toString()}`;
        console.log(`Video URL set: ${url} (Size: ${finalWidth}x${finalHeight}, Screen: ${screenWidth})`);
        return url;
    }

    /**
     * Vimeo oEmbed APIから動画情報を事前取得
     */
    async getVideoInfoFromAPI(): Promise<VideoInfo> {
        try {
            if (!/^\d+$/.test(this.config.videoId)) {
                throw new Error('Invalid video ID format for API call');
            }

            const oembedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${this.config.videoId}`;
            console.log(`Fetching video info from: ${oembedUrl}`);

            await delay(Math.random() * 500);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(oembedUrl, {
                signal: controller.signal,
                referrerPolicy: 'no-referrer',
                headers: {
                    'Accept': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Video not found (ID: ${this.config.videoId}). Please check the video ID.`);
                } else if (response.status === 403) {
                    throw new Error(`Access denied to video (ID: ${this.config.videoId}). Video may be private.`);
                } else if (response.status >= 500) {
                    throw new Error(`Vimeo server error (status: ${response.status}). Please try again later.`);
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const data = await response.json();

            if (!data || typeof data !== 'object') {
                throw new Error('Invalid API response format');
            }

            if (!data.width || !data.height || data.width <= 0 || data.height <= 0) {
                throw new Error('Invalid video dimensions in API response');
            }

            const aspectRatio = data.height / data.width;

            console.log(`API Video dimensions: ${data.width}x${data.height}, aspect ratio: ${aspectRatio.toFixed(3)}`);

            return {
                width: data.width,
                height: data.height,
                aspectRatio: aspectRatio,
                title: data.title || 'Untitled Video'
            };
        } catch (error) {
            if ((error as any).name === 'AbortError') {
                console.warn('API request timed out, using default aspect ratio');
            } else {
                console.warn('Could not fetch video info from API:', getErrorMessage(error));
            }

            return {
                width: 1920,
                height: 1080,
                aspectRatio: DEFAULT_ASPECT_RATIO,
                title: 'Untitled Video'
            };
        }
    }

    /**
     * 初期サイズを設定（API情報から）
     */
    async setInitialSizeFromAPI(
        onProgress?: (progress: number, message: string) => void,
        onAdjustOverlay?: () => void
    ): Promise<void> {
        try {
            const currentWidth = parseInt(this.iframe.getAttribute('width') || '0');
            const currentHeight = parseInt(this.iframe.getAttribute('height') || '0');

            this.iframe.style.visibility = 'hidden';

            if (currentWidth && currentHeight) {
                // 両方指定済み：API不要
                console.log(`Both width and height specified: ${currentWidth}x${currentHeight}`);
                this.applySizeToIframe(currentWidth, currentHeight, onAdjustOverlay);
                return;
            }

            onProgress?.(5, 'Getting video information...');
            const videoInfo = await this.getVideoInfoFromAPI();

            if (currentWidth || currentHeight) {
                // 片方のみ指定：アスペクト比から補完
                let finalW = currentWidth;
                let finalH = currentHeight;
                if (currentWidth && !currentHeight) {
                    finalH = Math.round(currentWidth * videoInfo.aspectRatio);
                    console.log(`Set height from width: ${finalW}x${finalH} (aspect ratio: ${videoInfo.aspectRatio.toFixed(3)})`);
                } else {
                    finalW = Math.round(currentHeight / videoInfo.aspectRatio);
                    console.log(`Set width from height: ${finalW}x${finalH} (aspect ratio: ${videoInfo.aspectRatio.toFixed(3)})`);
                }
                this.applySizeToIframe(finalW, finalH, onAdjustOverlay);
            } else {
                // 両方未指定：デフォルト幅 + アスペクト比
                const defaultWidth = DEFAULT_VIDEO_WIDTH_PX;
                const calculatedHeight = Math.round(defaultWidth * videoInfo.aspectRatio);
                console.log(`Set default size: ${defaultWidth}x${calculatedHeight} (aspect ratio: ${videoInfo.aspectRatio.toFixed(3)})`);
                this.applySizeToIframe(defaultWidth, calculatedHeight, onAdjustOverlay);
            }

            console.log('setInitialSizeFromAPI completed');
        } catch (error) {
            console.warn('Could not set initial size from API:', error);
            this.setInitialSizeFallback(onAdjustOverlay);
        }
    }

    /**
     * 初期サイズを設定（フォールバック版）
     */
    setInitialSizeFallback(onAdjustOverlay?: () => void): void {
        try {
            const currentWidth = parseInt(this.iframe.getAttribute('width') || '0');
            const currentHeight = parseInt(this.iframe.getAttribute('height') || '0');

            let finalW: number;
            let finalH: number;

            if (currentWidth && currentHeight) {
                finalW = currentWidth;
                finalH = currentHeight;
                console.log(`Fallback: Both width and height specified: ${finalW}x${finalH}`);
            } else if (currentWidth && !currentHeight) {
                finalW = currentWidth;
                finalH = Math.round(currentWidth * DEFAULT_ASPECT_RATIO);
                console.log(`Fallback: Set height from width: ${finalW}x${finalH} (16:9 default aspect ratio)`);
            } else if (currentHeight && !currentWidth) {
                finalH = currentHeight;
                finalW = Math.round(currentHeight / DEFAULT_ASPECT_RATIO);
                console.log(`Fallback: Set width from height: ${finalW}x${finalH} (16:9 default aspect ratio)`);
            } else {
                finalW = DEFAULT_VIDEO_WIDTH_PX;
                finalH = Math.round(DEFAULT_VIDEO_WIDTH_PX * DEFAULT_ASPECT_RATIO);
                console.log(`Fallback: Set default size: ${finalW}x${finalH} (16:9 default aspect ratio)`);
            }

            this.applySizeToIframe(finalW, finalH, onAdjustOverlay);
            console.log('Container and iframe size ready (fallback), made visible');
        } catch (error) {
            console.warn('Could not set fallback initial size:', error);
        }
    }

    /**
     * iframe のサイズを確定させ、コンテナを初期化済み状態にする（内部共通処理）
     */
    private applySizeToIframe(width: number, height: number, onAdjustOverlay?: () => void): void {
        this.iframe.setAttribute('width', width.toString());
        this.iframe.setAttribute('height', height.toString());
        this.container.classList.add('initialized');
        this.iframe.style.visibility = 'visible';
        this.iframe.classList.add('size-ready');
        onAdjustOverlay?.();
    }

    /**
     * 動画プレイヤーのセットアップ
     */
    setupVideoPlayer(): void {
        const videoUrl = this.buildVideoUrl();
        this.iframe.src = videoUrl;
    }
}
