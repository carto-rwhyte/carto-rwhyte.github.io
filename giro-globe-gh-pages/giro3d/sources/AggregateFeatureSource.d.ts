import type CoordinateSystem from '../core/geographic/CoordinateSystem';
import type { FeatureSource, GetFeatureRequest, GetFeatureResult } from './FeatureSource';
import { FeatureSourceBase } from './FeatureSource';
export interface AggregateFeatureSourceOptions {
    sources: FeatureSource[];
}
/**
 * A {@link FeatureSource} that aggregates multiple sub-sources behind a single interface.
 */
export default class AggregateFeatureSource extends FeatureSourceBase {
    readonly type: "AggregateFeatureSource";
    readonly isAggregateFeatureSource: true;
    private readonly _sources;
    constructor(params: AggregateFeatureSourceOptions);
    /**
     * The sources in this source.
     */
    get sources(): Readonly<FeatureSource[]>;
    getFeatures(request: GetFeatureRequest): Promise<GetFeatureResult>;
    initialize(options: {
        targetCoordinateSystem: CoordinateSystem;
    }): Promise<void>;
}
//# sourceMappingURL=AggregateFeatureSource.d.ts.map