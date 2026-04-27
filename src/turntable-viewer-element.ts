/**
 * Web Turntable Viewer - Web Component (Shadow DOM)
 * カスタムエレメントとしてShadow DOMで完全に隔離されたウィジェット
 */

import styles from './turntable-viewer.css?inline';
import { TurntableViewer } from './turntable-viewer';

const HTMLElementBase: typeof HTMLElement =
    typeof HTMLElement === 'undefined' ? class { } as typeof HTMLElement : HTMLElement;

const DEFAULT_WIDTH = '480';
const MAX_DIMENSION_PX = 10000;

export class TurntableViewerElement extends HTMLElementBase {
    private viewer: TurntableViewer | null = null;
    private shadowContainer: HTMLElement | null = null;
    private mq: MediaQueryList | null = null;
    private mqHandler: ((e: MediaQueryListEvent) => void) | null = null;

    static get observedAttributes() {
        return ['vimeo-video-id', 'clockwise-rotation', 'width', 'height', 'show-angle'];
    }

    constructor() {
        super();

        // Shadow DOMをアタッチ（完全隔離）
        if (typeof HTMLElement !== 'undefined') {
            this.attachShadow({ mode: 'open' });
        }
    }

    connectedCallback() {
        this.applyMobileHostStyle(window.matchMedia('(max-width: 768px)'));
        if (!this.mq) {
            this.mq = window.matchMedia('(max-width: 768px)');
            this.mqHandler = (e: MediaQueryListEvent) => this.applyMobileHostStyle(e);
            this.mq.addEventListener('change', this.mqHandler);
        }
        this.recreateViewer();
    }

    disconnectedCallback() {
        this.destroyViewer();
        if (this.mq && this.mqHandler) {
            this.mq.removeEventListener('change', this.mqHandler);
            this.mq = null;
            this.mqHandler = null;
        }
    }

    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null) {
        if (oldValue === newValue || !this.isConnected) {
            return;
        }

        this.recreateViewer();
    }

    /**
     * モバイル時にホスト要素を block/100% に切り替える
     * CSS @media 内の :host がビルド時に削除されるため JS で代替処理
     */
    private applyMobileHostStyle(mq: MediaQueryList | MediaQueryListEvent) {
        if (mq.matches) {
            this.style.setProperty('display', 'block', 'important');
            this.style.setProperty('width', '100%', 'important');
        } else {
            this.style.removeProperty('display');
            this.style.removeProperty('width');
        }
    }

    private render() {
        const vimeoVideoId = this.getAttribute('vimeo-video-id');
        const clockwiseRotation = this.getAttribute('clockwise-rotation');
        const widthAttr = this.normalizeDimensionAttribute('width');
        const heightAttr = this.normalizeDimensionAttribute('height');
        const width = widthAttr || (!heightAttr ? DEFAULT_WIDTH : '');
        const height = heightAttr || '';
        const showAngle = this.hasAttribute('show-angle');

        if (!vimeoVideoId) {
            console.error('vimeo-video-id attribute is required');
            this.shadowRoot?.replaceChildren();
            this.shadowContainer = null;
            return;
        }

        if (!this.shadowRoot) return;

        const style = document.createElement('style');
        style.textContent = styles;

        const wrapper = document.createElement('div');
        wrapper.className = 'turntable-wrapper';

        const container = document.createElement('div');
        container.id = 'turntable-container';
        container.setAttribute('vimeo-video-id', vimeoVideoId);
        if (clockwiseRotation !== null) {
            container.setAttribute('clockwise-rotation', clockwiseRotation);
        }
        if (showAngle) {
            container.setAttribute('show-angle', '');
        }

        const iframe = document.createElement('iframe');
        if (width) iframe.setAttribute('width', width);
        if (height) iframe.setAttribute('height', height);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', '');

        const dragOverlay = document.createElement('div');
        dragOverlay.className = 'drag-overlay';

        const reloadButton = document.createElement('button');
        reloadButton.className = 'reload-button';
        reloadButton.title = 'Reload video';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'reload-icon');
        svg.setAttribute('viewBox', '0 0 24 24');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2');
        svg.appendChild(path);
        reloadButton.appendChild(svg);

        const angleDisplay = document.createElement('div');
        angleDisplay.id = 'angle-display';

        const angle = document.createElement('span');
        angle.id = 'angle';

        const rotationAngle = document.createElement('span');
        rotationAngle.id = 'rotation-angle';
        rotationAngle.textContent = '0';

        const degreeSymbol = document.createElement('span');
        degreeSymbol.className = 'degree-symbol';
        degreeSymbol.textContent = '°';

        angle.append(rotationAngle, degreeSymbol);
        angleDisplay.appendChild(angle);
        dragOverlay.append(reloadButton, angleDisplay);

        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';

        const loadingContent = document.createElement('div');
        loadingContent.className = 'loading-content';

        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = 'Loading turntable...';

        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';

        const progressBar = document.createElement('progress');
        progressBar.className = 'progress-bar';
        progressBar.max = 100;
        progressBar.value = 0;

        const progressText = document.createElement('div');
        progressText.className = 'progress-text';
        progressText.textContent = '0%';

        progressContainer.append(progressBar, progressText);
        loadingContent.append(loadingText, progressContainer);
        loadingOverlay.appendChild(loadingContent);
        container.append(iframe, dragOverlay, loadingOverlay);

        const vimeoLink = document.createElement('a');
        vimeoLink.className = 'vimeo-link';
        vimeoLink.href = `https://vimeo.com/${vimeoVideoId}`;
        vimeoLink.target = '_blank';
        vimeoLink.rel = 'noopener noreferrer';
        vimeoLink.textContent = 'View on Vimeo';

        wrapper.append(container, vimeoLink);
        this.shadowRoot.replaceChildren(style, wrapper);
        this.shadowContainer = container;
    }

    private normalizeDimensionAttribute(name: 'width' | 'height'): string {
        const value = this.getAttribute(name);
        if (value === null || value.trim() === '') {
            return '';
        }

        const normalized = value.trim();
        if (!/^\d+$/.test(normalized)) {
            console.warn(`Invalid ${name} attribute value: "${value}". Use a positive integer pixel value.`);
            return '';
        }

        const numericValue = Number(normalized);
        if (numericValue <= 0 || numericValue > MAX_DIMENSION_PX) {
            console.warn(`Invalid ${name} attribute value: "${value}". Use a value between 1 and ${MAX_DIMENSION_PX}.`);
            return '';
        }

        return normalized;
    }

    private initializeViewer() {
        if (!this.shadowContainer || !this.shadowRoot) {
            return;
        }

        try {
            // TurntableViewerを初期化（Shadow DOM内で動作）
            this.viewer = new TurntableViewer('turntable-container', this.shadowRoot);
        } catch (error) {
            console.error('Failed to initialize TurntableViewer:', error);
        }
    }

    private recreateViewer() {
        this.destroyViewer();
        this.render();
        this.initializeViewer();
    }

    private destroyViewer() {
        if (this.viewer) {
            this.viewer.destroy();
            this.viewer = null;
        }
        this.shadowContainer = null;
    }
}

// カスタムエレメントを登録
if (typeof customElements !== 'undefined' && !customElements.get('turntable-viewer')) {
    customElements.define('turntable-viewer', TurntableViewerElement);
}
