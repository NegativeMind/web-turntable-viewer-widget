/**
 * Web Turntable Viewer Widget
 * Main entry point with Web Component support
 */

import './turntable-viewer-element';
import { TurntableViewer } from './turntable-viewer';
import { TurntableViewerElement } from './turntable-viewer-element';

export { TurntableViewer, TurntableViewerElement };

if (typeof window !== 'undefined') {
    (window as any).TurntableViewer = TurntableViewer;
    (window as any).TurntableViewerElement = TurntableViewerElement;
}

