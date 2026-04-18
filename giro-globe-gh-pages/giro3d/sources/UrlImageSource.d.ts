import type CoordinateSystem from '../core/geographic/CoordinateSystem';
import type Extent from '../core/geographic/Extent';
import type ImageFormat from '../formats/ImageFormat';
import type { GetImageOptions, ImageResponse, ImageSourceOptions } from './ImageSource';
import ImageSource from './ImageSource';
/**
 * Constructor options for {@link UrlImageSource}.
 */
export interface UrlImageSourceOptions extends ImageSourceOptions {
    /**
     * The URL template to use for image requests. Parameters to substitute must be enclosed in braces, e.g `{minx}`.
     * Supported parameters:
     * - `{minx}`: The min X (leftmost side) value of the requested extent.
     * - `{maxx}`: The max X (rightmost side) value of the requested extent.
     * - `{miny}`: The min Y (bottom side) value of the requested extent.
     * - `{maxy}`: The max Y (top side) value of the requested extent.
     * - `{width}`: The width, in pixels, of the requested image.
     * - `{height}`: The height, in pixels, of the requested image.
     * - `{epsgCode}`: The numerical code of the request coordinate system.
     * For example, if the instance coordinate system is EPSG:3857, `{epsgCode}` will be substituted with the `3857` value.
     * ```js
     * // A typical GetMap WMS pattern
     * const wmsTemplate: "http://example.com?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=MyLayer&STYLES=&SRS=EPSG:{epsgCode}&BBOX={minx},{miny},{maxx},{maxy}&WIDTH={width}&HEIGHT={height}&FORMAT=image/png"
     * ```
     */
    urlTemplate: string;
    /**
     * The Coordinate Reference System of the image. If unspecified, will assume that the desired coordinate system is the one of the entity that contains the layer.
     */
    crs?: CoordinateSystem;
    /**
     * The image format decoder to use. Note: for jpeg, png and webp images, no format decoder is required.
     */
    format?: ImageFormat;
    /**
     * The optional extent to use.
     */
    extent?: Extent;
    /**
     * The optional HTTP request timeout, in milliseconds.
     *
     * @defaultValue 5000
     */
    httpTimeout?: number;
    /**
     * How many retries to execute when an HTTP request ends up in error.
     * @defaultValue 3
     */
    retries?: number;
    /**
     * Enable web workers.
     * @defaultValue true
     */
    enableWorkers?: boolean;
    /**
     * The optional no-data value.
     */
    noDataValue?: number;
}
/**
 * Base class for URL-based image sources. Image requests are based on a provided URL
 * template that contain parameters replaced with their actual values.
 *
 * Supported template tokens:
 * |Parameter|Value|
 * |---|---|
 * |`{minx}`|The minimum X coordinate of the request bounding box|
 * |`{miny}`|The minimum Y coordinate of the request bounding box|
 * |`{maxx}`|The maximum X coordinate of the request bounding box|
 * |`{maxy}`|The maximum Y coordinate of the request bounding box|
 * |`{width}`|The width, in pixels of the requested image|
 * |`{height}`|The height, in pixels of the requested image|
 * |`{epsgCode}`|The numerical code of the coordinate system, e.g `3857`|
 *
 * @example
 * ```js
 * const source = new UrlImageSource({
 *    urlTemplate: "http://example.com?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=MyLayer&STYLES=&SRS=EPSG:4326&BBOX={minx},{miny},{maxx},{maxy}&WIDTH={width}&HEIGHT={height}&FORMAT=image/png"
 * });
 * ```
 */
export default class UrlImageSource extends ImageSource {
    readonly isUrlImageSource: true;
    readonly type: string;
    private readonly _extent;
    private readonly _downloader;
    private readonly _enableWorkers;
    private readonly _format;
    private readonly _noDataValue;
    private _urlTemplate;
    private _crs;
    /** @internal */
    readonly info: {
        requestedImages: number;
        loadedImages: number;
    };
    /**
     * Sets the URL template to a new value. This raises the `updated` event so that the layer can be repainted.
     * @param template - The new URL template to use.
     */
    setUrlTemplate(template: string): void;
    constructor(options: UrlImageSourceOptions);
    initialize(options: {
        targetProjection: CoordinateSystem;
    }): Promise<void>;
    getCrs(): CoordinateSystem;
    getExtent(): Extent | null;
    getImages(options: GetImageOptions): ImageResponse[];
    /** @internal */
    generateUrl(options: GetImageOptions): string;
    private requestImageFromSource;
    private fetchData;
}
//# sourceMappingURL=UrlImageSource.d.ts.map