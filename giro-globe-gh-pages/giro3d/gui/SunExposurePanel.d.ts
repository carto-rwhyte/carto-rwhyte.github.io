import type GUI from 'lil-gui';
import type Instance from '../core/Instance';
import Panel from './Panel';
export default class SunExposurePanel extends Panel {
    radius: number;
    resolution: number;
    temporalResolution: number;
    helpers: boolean;
    date: string;
    timeRange: string;
    private _drawTool;
    private _center;
    private _sphere;
    private _helper;
    private _entity;
    private _sunExposure;
    private updateBoundingSphere;
    constructor(parentGui: GUI, instance: Instance);
    compute(): Promise<void>;
    cleanup(): void;
    setCenter(): Promise<void>;
}
//# sourceMappingURL=SunExposurePanel.d.ts.map