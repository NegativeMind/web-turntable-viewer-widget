import type { TurntableConfig, VideoInfo } from './types';
import { getErrorMessage, withTimeout, delay } from './utils';

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

        const basePixels = 1200;
        const baseScreenSize = 640;

        let pixelsPerRotation = (finalWidth / baseScreenSize) * basePixels;

        if (finalWidth <= 480) {
            pixelsPerRotation *= 1.2;
        }

        pixelsPerRotation = Math.max(250, Math.min(3000, pixelsPerRotation));

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
        const computedHeight = this.iframe.clientHeight || this.container.clientHeight || 0;

        const finalWidth = videoWidth || htmlWidth || computedWidth || 480;
        const finalHeight = videoHeight || htmlHeight || finalWidth;

        const area = finalWidth * finalHeight;
        const effectiveArea = Math.sqrt(area);

        const devicePixelRatio = window.devicePixelRatio || 1;

        let effectiveSize;
        if ((htmlWidth && htmlHeight) || (videoWidth && videoHeight)) {
            const limitedDPR = Math.min(devicePixelRatio, 1.5);
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
        if (screenWidth <= 768) {
            const containerWidth = this.container.clientWidth || this.container.parentElement?.clientWidth || screenWidth;
            const availableWidth = Math.floor(containerWidth * 0.9);
            if (availableWidth > 200) {
                finalWidth = availableWidth;
                finalHeight = availableWidth;
            }
        }

        this.iframe.setAttribute('width', finalWidth.toString());
        this.iframe.setAttribute('height', finalHeight.toString());

        if (screenWidth <= 768) {
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
                aspectRatio: 9 / 16,
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
                console.log(`Both width and height specified: ${currentWidth}x${currentHeight}`);
                this.container.classList.add('initialized');
                this.iframe.style.visibility = 'visible';
                this.iframe.classList.add('size-ready');
                console.log('Container and iframe ready with fixed size');
                onAdjustOverlay?.();
                return;
            }

            if (currentWidth || currentHeight) {
                onProgress?.(5, 'Getting video information...');

                const videoInfo = await this.getVideoInfoFromAPI();

                if (currentWidth && !currentHeight) {
                    const calculatedHeight = Math.round(currentWidth * videoInfo.aspectRatio);
                    this.iframe.setAttribute('height', calculatedHeight.toString());
                    console.log(`Set height from width: ${currentWidth}x${calculatedHeight} (aspect ratio: ${videoInfo.aspectRatio.toFixed(3)})`);
                } else if (currentHeight && !currentWidth) {
                    const calculatedWidth = Math.round(currentHeight / videoInfo.aspectRatio);
                    this.iframe.setAttribute('width', calculatedWidth.toString());
                    console.log(`Set width from height: ${calculatedWidth}x${currentHeight} (aspect ratio: ${videoInfo.aspectRatio.toFixed(3)})`);
                }

                this.container.classList.add('initialized');
                this.iframe.style.visibility = 'visible';
                this.iframe.classList.add('size-ready');
                console.log('Container and iframe size ready, made visible');

                onAdjustOverlay?.();
            } else {
                const defaultWidth = 480;
                onProgress?.(5, 'Getting video information...');

                const videoInfo = await this.getVideoInfoFromAPI();
                const calculatedHeight = Math.round(defaultWidth * videoInfo.aspectRatio);

                this.iframe.setAttribute('width', defaultWidth.toString());
                this.iframe.setAttribute('height', calculatedHeight.toString());
                console.log(`Set default size: ${defaultWidth}x${calculatedHeight} (aspect ratio: ${videoInfo.aspectRatio.toFixed(3)})`);

                this.container.classList.add('initialized');
                this.iframe.style.visibility = 'visible';
                this.iframe.classList.add('size-ready');
                console.log('Container and iframe size ready with default size');

                onAdjustOverlay?.();
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

            if (currentWidth && currentHeight) {
                console.log(`Fallback: Both width and height specified: ${currentWidth}x${currentHeight}`);
            } else if (currentWidth && !currentHeight) {
                const defaultHeight = Math.round(currentWidth * (9 / 16));
                this.iframe.setAttribute('height', defaultHeight.toString());
                console.log(`Fallback: Set height from width: ${currentWidth}x${defaultHeight} (16:9 default aspect ratio)`);
            } else if (currentHeight && !currentWidth) {
                const defaultWidth = Math.round(currentHeight / (9 / 16));
                this.iframe.setAttribute('width', defaultWidth.toString());
                console.log(`Fallback: Set width from height: ${defaultWidth}x${currentHeight} (16:9 default aspect ratio)`);
            } else {
                const defaultWidth = 480;
                const defaultHeight = Math.round(defaultWidth * (9 / 16));
                this.iframe.setAttribute('width', defaultWidth.toString());
                this.iframe.setAttribute('height', defaultHeight.toString());
                console.log(`Fallback: Set default size: ${defaultWidth}x${defaultHeight} (16:9 default aspect ratio)`);
            }

            this.container.classList.add('initialized');
            this.iframe.style.visibility = 'visible';
            this.iframe.classList.add('size-ready');
            console.log('Container and iframe size ready (fallback), made visible');

            onAdjustOverlay?.();
        } catch (error) {
            console.warn('Could not set fallback initial size:', error);
        }
    }

    /**
     * 動画プレイヤーのセットアップ
     */
    setupVideoPlayer(): void {
        const videoUrl = this.buildVideoUrl();
        this.iframe.src = videoUrl;
    }
}
