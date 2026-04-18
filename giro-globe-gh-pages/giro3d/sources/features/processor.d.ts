import type { Feature } from 'ol';
import type { Extent as OLExtent } from 'ol/extent';
import type { Geometry } from 'ol/geom';
import type CoordinateSystem from '../../core/geographic/CoordinateSystem';
import type Extent from '../../core/geographic/Extent';
export declare function processFeatures(features: Feature<Geometry>[], sourceProjection: CoordinateSystem, targetProjection: CoordinateSystem, optionalProcessings?: {
    getFeatureId?: (feature: Feature) => number | string;
    transformer?: (feature: Feature, geometry: Geometry) => void;
}): Promise<Feature<Geometry>[]>;
export declare function intersects(feature: Feature, olExtent: OLExtent): boolean;
export declare function filterByExtent(features: Feature[], extent: Extent, options?: {
    signal?: AbortSignal;
}): Promise<Feature[]>;
//# sourceMappingURL=processor.d.ts.map