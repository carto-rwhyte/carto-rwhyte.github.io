import type { Feature } from 'ol';
import type { GetFeatureRequest, GetFeatureResult } from './FeatureSource';
import CoordinateSystem from '../core/geographic/CoordinateSystem';
import { FeatureSourceBase } from './FeatureSource';
export interface StaticFeaturesSourceOptions {
    /**
     * The initial features in this source.
     */
    features?: Feature[];
    /**
     * The coordinate system of features contained in this source.
     * @defaultValue {@link CoordinateSystem.epsg4326}
     */
    coordinateSystem?: CoordinateSystem;
}
/**
 * A feature source that does not read from any remote source, but
 * instead acts as a container for features added by the user.
 *
 * > [!note]
 * > When features are added to this source, they might be transformed to
 * > match the target coordinate system, as well as assigning them unique IDs.
 */
export default class StaticFeatureSource extends FeatureSourceBase {
    readonly isStaticFeatureSource: true;
    readonly type: "StaticFeatureSource";
    private readonly _initialFeatures;
    private readonly _features;
    private readonly _coordinateSystem;
    /**
     * Returns a copy of the features contained in this source.
     *
     * Note: this property returns an empty array if the source is not yet initialized.
     */
    get features(): Readonly<Feature[]>;
    constructor(options?: StaticFeaturesSourceOptions);
    /**
     * Adds a single feature.
     *
     * Note: if you want to add multiple features at once, use {@link addFeatures} for better performance.
     */
    addFeature(feature: Feature): void;
    /**
     * Removes a single feature.
     *
     * Note: if you want to remove multiple features at once, use {@link removeFeatures} for better performance.
     *
     * @returns `true` if the feature feature was actually removed, `false` otherwise.
     */
    removeFeature(feature: Feature): boolean;
    /**
     * Adds multiple features.
     */
    addFeatures(features: Iterable<Feature>): void;
    /**
     * Removes multiple features.
     *
     * @returns `true` if at least one feature was actually removed, `false` otherwise.
     */
    removeFeatures(features: Iterable<Feature>): boolean;
    /**
     * Removes all features.
     */
    clear(): void;
    private doAddFeatures;
    initialize(options: {
        targetCoordinateSystem: CoordinateSystem;
    }): Promise<void>;
    getFeatures(request: GetFeatureRequest): Promise<GetFeatureResult>;
}
//# sourceMappingURL=StaticFeatureSource.d.ts.map