import type { Texture } from 'three';
import ColorMap from '../../core/ColorMap';
export interface ColorMapUniform {
    min: number;
    max: number;
    lut: Texture;
}
export declare function createDefaultColorMap(): ColorMap;
export declare function buildColorMapUniform(colorMap: ColorMap): ColorMapUniform;
//# sourceMappingURL=ColorMapUniform.d.ts.map