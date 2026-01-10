/**
 * Web Turntable Viewer Widget
 * Main entry point with Web Component support
 */

// Web Componentのインポートと登録
import './turntable-viewer-element';

// 既存のクラスもエクスポート（後方互換性のため）
export { TurntableViewer } from './turntable-viewer';
export { TurntableViewerElement } from './turntable-viewer-element';

// グローバルにも公開
import { TurntableViewer } from './turntable-viewer';
import { TurntableViewerElement } from './turntable-viewer-element';

if (typeof window !== 'undefined') {
    (window as any).TurntableViewer = TurntableViewer;
    (window as any).TurntableViewerElement = TurntableViewerElement;
}
