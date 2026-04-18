import type Extent from '../core/geographic/Extent';
import type ImageFormat from '../formats/ImageFormat';
import type { UrlImageSourceOptions } from './UrlImageSource';
import UrlImageSource from './UrlImageSource';
/**
 * Constructor options for {@link WmsSourceOptions}.
 */
export interface WmsSourceOptions extends Omit<UrlImageSourceOptions, 'urlTemplate' | 'crs'> {
    /**
     * The URL to the WMS service.
     */
    url: string;
    /**
     * The projection to use in GetMap requests.
     */
    projection: string;
    /**
     * The name of the WMS layer, or layers to use.
     */
    layer: string | string[];
    /**
     * The image format (e.g `image/png`).
     * @defaultValue 'image/png'
     */
    imageFormat?: string;
    /**
     * The optional no-data value.
     */
    noDataValue?: number;
    /**
     * The optional image decoder.
     * @defaultValue undefined
     */
    format?: ImageFormat;
    /**
     * The optional extent of the source. Not required, except for some performance optimizations.
     */
    extent?: Extent;
    /**
     * The list of WMS styles to use.
     * @defaultValue undefined
     */
    styles?: string[];
    /**
     * Additional params to pass to the WMS service.
     */
    params?: Record<string, unknown>;
    /**
     * The WMS version to use.
     * @defaultValue '1.3.0'
     */
    version?: '1.3.0' | '1.1.1';
    /**
     * Enable transparency on requests.
     * @defaultValue true
     */
    transparent?: boolean;
}
/**
 * Create a GetMap URL template from the provided WMS parameters.
 * @internal
 */
export declare function createGetMapTemplate(params: {
    url: string;
    layer: string | string[];
    projection: string;
    imageFormat?: string;
    transparent?: boolean;
    styles?: string[];
    params?: Record<string, unknown>;
    version?: '1.3.0' | '1.1.1';
}): string;
/**
 * An image source that is backed by a one or more [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) layer(s).
 * Note: this is a convenient class that simplifies the usage of {@link UrlImageSource}.
 * ```js
 * const source = new WmsSource({
 *      url: 'http://example.com/wms',
 *      projection: 'EPSG:3857',
 *      layer: 'myLayer',
 *      imageFormat: 'image/png',
 * });
 * ```
 */
export default class WmsSource extends UrlImageSource {
    readonly isWmsSource: true;
    readonly type: string;
    private readonly _initialOptions;
    /**
     * Creates a {@link WmsSource} from the specified parameters.
     *
     * @param options - The options.
     */
    constructor(options: WmsSourceOptions);
    /**
     * Sets the `TIME` parameter of the tile requests, and refreshes the source.
     * If `date` is undefined, temporal requests are disabled.
     */
    setTime(date?: Date): void;
}
export declare function isWmsSource(obj: unknown): obj is WmsSource;
//# sourceMappingURL=WmsSource.d.ts.map