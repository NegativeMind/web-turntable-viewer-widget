/**
 * Web Turntable Viewer - Web Component (Shadow DOM)
 * カスタムエレメントとしてShadow DOMで完全に隔離されたウィジェット
 */

import styles from './turntable-viewer.css?inline';
import { TurntableViewer } from './turntable-viewer';

const HTMLElementBase: typeof HTMLElement =
    typeof HTMLElement === 'undefined' ? class { } as typeof HTMLElement : HTMLElement;

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
        this.mq = window.matchMedia('(max-width: 768px)');
        this.mqHandler = (e: MediaQueryListEvent) => this.applyMobileHostStyle(e);
        this.mq.addEventListener('change', this.mqHandler);
        this.render();
        this.initializeViewer();
    }

    disconnectedCallback() {
        if (this.viewer) {
            this.viewer.destroy();
            this.viewer = null;
        }
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

        this.reinitializeViewer();
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
        const width = this.getAttribute('width') || '480';
        const height = this.getAttribute('height') || '';
        const showAngle = this.hasAttribute('show-angle');

        if (!vimeoVideoId) {
            console.error('vimeo-video-id attribute is required');
            return;
        }

        // Shadow DOM内にHTMLとCSSを注入
        if (this.shadowRoot) {
            // clockwise-rotation属性を正しく伝播（指定時は必ずbool値が必要）
            let clockwiseAttr = '';
            if (clockwiseRotation !== null) {
                clockwiseAttr = `clockwise-rotation="${clockwiseRotation}"`;
            }
            // 属性がない場合は何も追加しない（デフォルトで時計回り）

            this.shadowRoot.innerHTML = `
                <style>${styles}</style>
                <div class="turntable-wrapper">
                    <div id="turntable-container" vimeo-video-id="${vimeoVideoId}" ${clockwiseAttr} ${showAngle ? 'show-angle' : ''}>
                        <iframe ${width ? `width="${width}"` : ''} ${height ? `height="${height}"` : ''} frameborder="0" allowfullscreen></iframe>
                        <div class="drag-overlay">
                            <button class="reload-button" title="Reload video">
                                <svg class="reload-icon" viewBox="0 0 24 24">
                                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                                </svg>
                            </button>
                            <div id="angle-display">
                                <span id="angle"><span id="rotation-angle">0</span><span class="degree-symbol">°</span></span>
                            </div>
                        </div>
                        <div class="loading-overlay">
                            <div class="loading-content">
                                <div class="loading-text">Loading turntable...</div>
                                <div class="progress-container">
                                    <progress class="progress-bar" max="100" value="0"></progress>
                                    <div class="progress-text">0%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <a class="vimeo-link" href="https://vimeo.com/${vimeoVideoId}" target="_blank">View on Vimeo</a>
                </div>
            `;

            this.shadowContainer = this.shadowRoot.getElementById('turntable-container');
        }
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

    private reinitializeViewer() {
        if (this.viewer) {
            this.viewer.destroy();
            this.viewer = null;
        }
        this.render();
        this.initializeViewer();
    }
}

// カスタムエレメントを登録
if (typeof customElements !== 'undefined' && !customElements.get('turntable-viewer')) {
    customElements.define('turntable-viewer', TurntableViewerElement);
}
