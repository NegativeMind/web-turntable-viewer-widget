/**
 * Web Turntable Viewer - Web Component (Shadow DOM)
 * カスタムエレメントとしてShadow DOMで完全に隔離されたウィジェット
 */

import styles from './turntable-viewer.css?inline';
import { TurntableViewer } from './turntable-viewer';

export class TurntableViewerElement extends HTMLElement {
    private viewer: TurntableViewer | null = null;
    private shadowContainer: HTMLElement | null = null;

    static get observedAttributes() {
        return ['vimeo-video-id', 'clockwise-rotation', 'width', 'height', 'show-angle'];
    }

    constructor() {
        super();

        // Shadow DOMをアタッチ（完全隔離）
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.initializeViewer();
    }

    disconnectedCallback() {
        // クリーンアップ処理
        if (this.viewer) {
            // TurntableViewerにクリーンアップメソッドがあれば呼び出す
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
                                    <div class="progress-bar"><div class="progress-fill"></div></div>
                                    <div class="progress-text">0%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <a class="vimeo-link" href="#" target="_blank">View on Vimeo</a>
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
}

// カスタムエレメントを登録
if (!customElements.get('turntable-viewer')) {
    customElements.define('turntable-viewer', TurntableViewerElement);
}
