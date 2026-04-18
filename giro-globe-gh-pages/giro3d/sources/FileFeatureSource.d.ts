import type FeatureFormat from 'ol/format/Feature';
import type { Type } from 'ol/format/Feature';
import CoordinateSystem from '../core/geographic/CoordinateSystem';
import { FeatureSourceBase, type GetFeatureRequest, type GetFeatureResult } from './FeatureSource';
export type Getter = (url: string, type: Type) => Promise<unknown>;
export interface FileFeatureSourceOptions {
    /**
     * The URL to the remote file.
     */
    url: string;
    /**
     * The format to parse the file.
     * @defaultValue {@link GeoJSON}
     */
    format?: FeatureFormat;
    /**
     * A function to retrieve the file remotely.
     * If not specified, will use standard fetch functions to download the file.
     * Mostly useful for unit testing.
     */
    getter?: Getter;
    /**
     * The coordinate system of the features in this source.
     * 1. If not provided, will attempt to read it from the file.
     * 2. If the file does not contain coordinate system information, will assume EPSG:4326.
     */
    sourceCoordinateSystem?: CoordinateSystem;
}
/**
 * Loads features from a remote file (such as GeoJSON, GPX, etc.)
 */
export default class FileFeatureSource extends FeatureSourceBase {
    readonly isFileFeatureSource: true;
    readonly type: "FileFeatureSource";
    private readonly _format;
    private _features;
    private _loadFeaturePromise;
    private _getter;
    private _url;
    private _sourceCoordinateSystem?;
    constructor(params: FileFeatureSourceOptions);
    private loadFeatures;
    private loadFeaturesOnce;
    getFeatures(request: GetFeatureRequest): Promise<GetFeatureResult>;
    /**
     * Deletes the already loaded features, and dispatch an event to reload the features.
     */
    reload(): void;
}
//# sourceMappingURL=FileFeatureSource.d.ts.map