import type GUI from 'lil-gui';
import type GlobeControls from '../controls/GlobeControls';
import type Instance from '../core/Instance';
import Panel from './Panel';
declare class GlobeControlsInspector extends Panel {
    private readonly _dampingControllers;
    readonly controls: GlobeControls;
    /**
     * @param parentGui - The parent GUI.
     * @param instance - The Giro3D instance.
     */
    constructor(parentGui: GUI, instance: Instance, controls: GlobeControls);
    private updateControllerVisibility;
    attach(): void;
    detach(): void;
}
export default GlobeControlsInspector;
//# sourceMappingURL=GlobeControlsInspector.d.ts.map