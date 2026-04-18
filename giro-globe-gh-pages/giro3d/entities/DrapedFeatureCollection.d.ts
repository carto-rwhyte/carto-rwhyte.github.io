import type Feature from 'ol/Feature';
import type { EventDispatcher, Object3D } from 'three';
import type ElevationProvider from '../core/ElevationProvider';
import type { FeatureExtrusionOffset, FeatureExtrusionOffsetCallback } from '../core/FeatureTypes';
import type HasDefaultPointOfView from '../core/HasDefaultPointOfView';
import type Layer from '../core/layer/Layer';
import type SimpleGeometryMesh from '../renderer/geometries/SimpleGeometryMesh';
import type SurfaceMesh from '../renderer/geometries/SurfaceMesh';
import type { FeatureSource } from '../sources/FeatureSource';
import type { MeshUserData } from './FeatureCollection';
import type { Tile } from './Map';
import { type FeatureStyle, type FeatureStyleCallback, type LineMaterialGenerator, type PointMaterialGenerator, type SurfaceMaterialGenerator } from '../core/FeatureTypes';
import Entity3D from './Entity3D';
interface MapLikeEventMap {
    'elevation-loaded': {
        tile: Tile;
    };
    'layer-added': {
        layer: Layer;
    };
    'layer-removed': {
        layer: Layer;
    };
    'layer-visibility-changed': {
        layer: Layer;
    };
    'tile-created': {
        tile: Tile;
    };
    'tile-deleted': {
        tile: Tile;
    };
}
/**
 * Map-like object to drape features onto.
 */
export interface MapLike extends ElevationProvider, EventDispatcher<MapLikeEventMap> {
    traverseTiles(callback: (tile: Tile) => void): void;
}
/**
 * How the geometry should be draped on the terrain:
 * - `per-feature`: the same elevation offset is applied to the entire feature.
 * Suitable for level geometries, such as buildings, lakes, etc.
 * - `per-vertex`: the elevation is applied to each vertex independently. Suitable for
 * lines that must follow the terrain, such as roads.
 * - `none`: no draping is done, the elevation of the feature is used as is. Suitable for
 * geometries that should not be draped on the terrain, such as flight paths or flying objects,
 * or for 3D geometries that already have a vertical elevation.
 *
 * Note: that `Point` geometries, having only one coordinate, will automatically use the `per-feature` mode.
 */
export type DrapingMode = 'per-feature' | 'per-vertex' | 'none';
/**
 * A function to determine the {@link DrapingMode} for each feature.
 */
export type DrapingModeFunction = (feature: Feature) => DrapingMode;
export interface DrapedFeatureCollectionOptions {
    /**
     * The data source.
     */
    source: FeatureSource;
    /**
     * The minimum tile LOD (level of detail) to display the features.
     * If zero, then features are always displayed, since root tiles have LOD zero.
     * @defaultValue 0
     */
    minLod?: number;
    /**
     * How is draping computed for each feature.
     */
    drapingMode?: DrapingMode | DrapingModeFunction;
    /**
     * An style or a callback returning a style to style the individual features.
     * If an object is used, the informations it contains will be used to style every
     * feature the same way. If a function is provided, it will be called with the feature.
     * This allows to individually style each feature.
     */
    style?: FeatureStyle | FeatureStyleCallback;
    /**
     * If set, this will cause 2D features to be extruded of the corresponding amount.
     * If a single value is given, it will be used for all the vertices of every feature.
     * If an array is given, each extruded vertex will use the corresponding value.
     * If a callback is given, it allows to extrude each feature individually.
     */
    extrusionOffset?: FeatureExtrusionOffset | FeatureExtrusionOffsetCallback;
    /**
     * An optional material generator for shaded surfaces.
     */
    shadedSurfaceMaterialGenerator?: SurfaceMaterialGenerator;
    /**
     * An optional material generator for unshaded surfaces.
     */
    unshadedSurfaceMaterialGenerator?: SurfaceMaterialGenerator;
    /**
     * An optional material generator for lines.
     */
    lineMaterialGenerator?: LineMaterialGenerator;
    /**
     * An optional material generator for points.
     */
    pointMaterialGenerator?: PointMaterialGenerator;
}
/**
 * Loads 3D features from a {@link FeatureSource} and displays them on top
 * of a map or map-like entity, by taking terrain into account.
 *
 * To drape features on custom entities, they must implement the {@link MapLike} interface.
 *
 * ## Performance warning
 *
 * This entity is experimental and might suffer performance issues when loading many features.
 * Notably be careful when setting the {@link minLod} value. If this value is too low, this could cause
 * many features to be loaded (especially when used with streamed data, such as WFS servers).
 *
 * It is recommended to experiment with a high `minLod` value then decrease it progressively.
 *
 * @experimental
 */
export default class DrapedFeatureCollection extends Entity3D {
    type: "DrapedFeatureCollection";
    readonly isDrapedFeatureCollection: true;
    private _map;
    private readonly _drapingMode;
    private readonly _geometryConverter;
    private readonly _activeTiles;
    private readonly _objectOptions;
    private readonly _extrusionCallback;
    private readonly _features;
    private readonly _source;
    private readonly _eventHandlers;
    private readonly _style;
    get loadedFeatures(): number;
    private _shouldCleanup;
    private _sortedTiles;
    private _minLod;
    /**
     * The minimum tile LOD (level of detail) to display the features.
     * If zero, then features are always displayed, since root tiles have LOD zero.
     */
    get minLod(): number;
    set minLod(v: number);
    constructor(options: DrapedFeatureCollectionOptions);
    traverseGeometries(callback: (geom: SimpleGeometryMesh<MeshUserData>) => void): void;
    /**
     * Updates the styles of the  given objects, or all objects if unspecified.
     * @param objects - The objects to update.
     */
    updateStyles(objects?: (SimpleGeometryMesh<MeshUserData> | SurfaceMesh<MeshUserData>)[]): void;
    private updateStyle;
    private updateObjectOption;
    /**
     * Toggles the `.castShadow` property on objects generated by this entity.
     *
     * Note: shadow maps require normal attributes on objects.
     */
    get castShadow(): boolean;
    set castShadow(v: boolean);
    /**
     * Toggles the `.receiveShadow` property on objects generated by this entity.
     *
     * Note: shadow maps require normal attributes on objects.
     */
    get receiveShadow(): boolean;
    set receiveShadow(v: boolean);
    private onSourceUpdated;
    preprocess(): Promise<void>;
    /**
     * Sets the draping target.
     */
    attach(map: MapLike): this;
    private getSortedTiles;
    detach(): this;
    updateVisibility(): void;
    private onLayerAdded;
    private onLayerRemoved;
    private onLayerVisibilityChanged;
    private onTileCreated;
    private onTileDeleted;
    private onElevationLoaded;
    private registerAllTiles;
    private registerTile;
    private loadMeshes;
    private prepare;
    private getPointOptions;
    private getExtrusionOffset;
    private getPolygonOptions;
    private getLineOptions;
    private getStyle;
    private createMesh;
    protected assignRenderOrder(obj: Object3D): void;
    private getDrapingMode;
    private loadFeatureMesh;
    private unregisterTile;
    private loadFeaturesOnExtent;
    postUpdate(): void;
    cleanup(): void;
    getDefaultPointOfView({ camera, }: Parameters<HasDefaultPointOfView['getDefaultPointOfView']>[0]): ReturnType<HasDefaultPointOfView['getDefaultPointOfView']>;
    dispose(): void;
}
export {};
//# sourceMappingURL=DrapedFeatureCollection.d.ts.map