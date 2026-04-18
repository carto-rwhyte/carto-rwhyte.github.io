import type { ColorRepresentation } from 'three';
import type { OBB } from 'three/examples/jsm/Addons.js';
import { Object3D } from 'three';
/**
 * Helper object to visualize an {@link OBB | Oriented Bounding Box}.
 */
export declare class OBBHelper extends Object3D {
    readonly obb: OBB;
    readonly type: "OBBHelper";
    readonly isOBBHelper: true;
    private _helper;
    private _color;
    constructor(obb: OBB, color: ColorRepresentation);
    private buildHelper;
    set color(v: ColorRepresentation);
    /**
     * Frees the GPU-related resources allocated by this instance
     * @remarks
     * Call this method whenever this instance is no longer used in your app.
     */
    dispose(): void;
}
export default OBBHelper;
//# sourceMappingURL=OBBHelper.d.ts.map