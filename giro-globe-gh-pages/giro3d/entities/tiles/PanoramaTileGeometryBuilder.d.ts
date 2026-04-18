import { Vector2 } from 'three';
import type Extent from '../../core/geographic/Extent';
import type TileCoordinate from './TileCoordinate';
import type { TileGeometryBuilder } from './TileGeometry';
import PanoramaTileGeometry from './PanoramaTileGeometry';
export default class PanoramaTileGeometryBuilder implements TileGeometryBuilder<PanoramaTileGeometry> {
    private readonly _radius;
    private readonly _segments;
    constructor(_radius: number, _segments: number);
    get rootTileMatrix(): Vector2;
    build(params: {
        tile: TileCoordinate;
        extent: Extent;
    }): PanoramaTileGeometry;
}
//# sourceMappingURL=PanoramaTileGeometryBuilder.d.ts.map