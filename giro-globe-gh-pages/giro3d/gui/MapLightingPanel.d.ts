import type GUI from 'lil-gui';
import type Instance from '../core/Instance';
import type MapLightingOptions from '../entities/MapLightingOptions';
import Panel from './Panel';
type ShadingMode = 'Hillshade' | 'LightBased';
declare class MapLightingPanel extends Panel {
    mode: ShadingMode;
    /**
     * @param options - The options.
     * @param parentGui - Parent GUI
     * @param instance - The instance
     */
    constructor(options: Required<MapLightingOptions>, parentGui: GUI, instance: Instance);
}
export default MapLightingPanel;
//# sourceMappingURL=MapLightingPanel.d.ts.map