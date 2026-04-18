import { Vector2 } from 'three';
import type Ellipsoid from '../../core/geographic/Ellipsoid';
import type Extent from '../../core/geographic/Extent';
import type TileCoordinate from './TileCoordinate';
import type { TileGeometryBuilder } from './TileGeometry';
import EllipsoidTileGeometry from './EllipsoidTileGeometry';
export declare class EllipsoidTileGeometryBuilder implements TileGeometryBuilder<EllipsoidTileGeometry> {
    private readonly ellipsoid;
    private _segments;
    private readonly _skirtDepth;
    constructor(ellipsoid: Ellipsoid, _segments: number, _skirtDepth: number | null);
    get rootTileMatrix(): Vector2;
    set segments(v: number);
    build(params: {
        tile: TileCoordinate;
        extent: Extent;
    }): EllipsoidTileGeometry;
}
export default EllipsoidTileGeometryBuilder;
//# sourceMappingURL=EllipsoidTileGeometryBuilder.d.ts.map