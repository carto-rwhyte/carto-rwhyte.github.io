import type FeatureFormat from 'ol/format/Feature';
import type { Type } from 'ol/format/Feature';
import type { Cache } from '../core/Cache';
import CoordinateSystem from '../core/geographic/CoordinateSystem';
import Extent from '../core/geographic/Extent';
import { FeatureSourceBase, type GetFeatureRequest, type GetFeatureResult } from './FeatureSource';
/**
 * A function to build URLs used to query features from the remote source.
 * @returns The URL of the query, or `undefined`, if the query should not be made at all.
 */
export type StreamableFeatureSourceQueryBuilder = (params: {
    extent: Extent;
    sourceCoordinateSystem: CoordinateSystem;
}) => URL | undefined;
/**
 * A query builder to fetch data from an OGC API Features service.
 * @param serviceUrl - The base URL to the service.
 * @param collection - The name of the feature collection.
 * @param options - Optional parameters to customize the query.
 */
export declare const ogcApiFeaturesBuilder: (serverUrl: string, collection: string, options?: {
    /**
     * The limit of features to retrieve with each query.
     * @defaultValue 1000
     */
    limit?: number;
    /**
     * Additional parameters to pass to the query, such as CQL filter, etc,
     * with the exception of the `limit` (passed with the `limit` option)
     * and `bbox` parameters (dynamically computed for each query).
     */
    params?: Record<string, string>;
}) => StreamableFeatureSourceQueryBuilder;
/**
 * A query builder to fetch data from an WFS service.
 * @param serviceUrl - The base URL to the service.
 * @param typename - The name of the feature collection.
 * @param options - Optional parameters to customize the query.
 */
export declare const wfsBuilder: (serverUrl: string, typename: string, options?: {
    /**
     * Additional parameters to pass to the query, with the exception
     * of the `bbox` parameter (dynamically computed for each query).
     */
    params?: Record<string, string>;
}) => StreamableFeatureSourceQueryBuilder;
export type StreamableFeatureSourceGetter = (url: string, type: Type) => Promise<unknown>;
/**
 * Getter for JSON, text, XML and ArrayBuffer data.
 */
export declare const defaultGetter: StreamableFeatureSourceGetter;
export interface StreamableFeatureSourceOptions {
    /**
     * The query builder.
     */
    queryBuilder: StreamableFeatureSourceQueryBuilder;
    /**
     * The format of the features.
     * @defaultValue {@link GeoJSON}
     */
    format?: FeatureFormat;
    /**
     * The function to download and process the data.
     * @defaultValue {@link defaultGetter}
     */
    getter?: StreamableFeatureSourceGetter;
    /**
     * Enable caching of downloaded features.
     * @defaultValue true
     */
    enableCaching?: boolean;
    /**
     * The cache to use.
     * @defaultValue {@link GlobalCache}
     */
    cache?: Cache;
    /**
     * The loading strategy.
     * @defaultValue {@link defaultLoadingStrategy}
     */
    loadingStrategy?: StreamableFeatureSourceLoadingStrategy;
    /**
     * The source coordinate system.
     * @defaultValue EPSG:4326
     */
    sourceCoordinateSystem?: CoordinateSystem;
    /**
     * Limits the extent in which features are queried. If a feature request is
     * outside this extent, no query happens.
     * @defaultValue `null`
     */
    extent?: Extent | null;
}
export type StreamableFeatureSourceLoadingStrategy = (request: GetFeatureRequest) => {
    requests: GetFeatureRequest[];
};
/**
 * A loading strategy that process the entire input request without any filtering or splitting.
 */
export declare const defaultLoadingStrategy: StreamableFeatureSourceLoadingStrategy;
/**
 * Splits the input request into a regular grid of requests to improves caching.
 */
export declare const tiledLoadingStrategy: (params?: {
    /**
     * The size of the tiles in the grid. Expressed in CRS units (typically meters).
     * @defaultValue 1000
     */
    tileSize?: number;
}) => StreamableFeatureSourceLoadingStrategy;
/**
 * A feature source that supports streaming features from a
 * remote server (e.g OGC API Features, etc)
 */
export default class StreamableFeatureSource extends FeatureSourceBase {
    readonly isStreamableFeatureSource: true;
    readonly type: "StreamableFeatureSource";
    private readonly _options;
    constructor(params: StreamableFeatureSourceOptions);
    private processRequest;
    getFeatures(request: GetFeatureRequest): Promise<GetFeatureResult>;
}
//# sourceMappingURL=StreamableFeatureSource.d.ts.map