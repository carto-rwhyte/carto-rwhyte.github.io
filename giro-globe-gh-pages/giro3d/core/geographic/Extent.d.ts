import type { TypedArray } from 'three';
import { Box3, Vector2, Vector3 } from 'three';
import OffsetScale from '../OffsetScale';
import Coordinates from './Coordinates';
import CoordinateSystem from './CoordinateSystem';
export declare function reasonnableEpsilonForCRS(crs: CoordinateSystem, width: number, height: number): number;
export interface GridExtent {
    extent: Extent;
    width: number;
    height: number;
}
/**
 * A rectangular extent in a specific {@link CoordinateSystem | coordinate system}.
 */
export declare class Extent {
    private readonly _values;
    private _crs;
    /**
     * Creates an extent from a coordinate system and a pair of coordinates.
     * @param crs - The coordinate system to use.
     * @param bottomLeft - The bottom-left corner of the extent.
     * @param topRight - The top-right corner of the extent.
     * @remarks Both coordinates must be in the same coordinate system as this extent.
     */
    constructor(crs: CoordinateSystem, bottomLeft: Coordinates, topRight: Coordinates);
    /**
     * Creates an extent from an object containing the min/max XY values.
     * @param crs - The coordinate system to use.
     * @param values - The extent limits.
     */
    constructor(crs: CoordinateSystem, values: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    });
    /**
     * Creates an extent from the min/max XY values.
     * @param crs - The coordinate system to use.
     * @param values - The extent limits.
     * @deprecated Due to ambiguity (not all coordinate systems are north-up), this constructor
     * should not be used.
     */
    constructor(crs: CoordinateSystem, values: {
        west: number;
        east: number;
        south: number;
        north: number;
    });
    /**
     * Creates an extent from the min/max XY values
     * @param crs - The coordinate system to use.
     * @param minX - The X coordinate of the left side of this extent.
     * @param maxX - The X coordinate of the righ side of this extent.
     * @param minY - The Y coordinate of the bottom side of this extent.
     * @param maxY - The Y coordinate of the top side of this extent.
     */
    constructor(crs: CoordinateSystem, minX: number, maxX: number, minY: number, maxY: number);
    /**
     * Returns an extent centered at the specified coordinate, and with the specified size.
     *
     * @param crs - The CRS identifier.
     * @param center - The center.
     * @param width - The width, in CRS units.
     * @param height - The height, in CRS units.
     * @returns The produced extent.
     */
    static fromCenterAndSize(crs: CoordinateSystem, center: {
        x: number;
        y: number;
    }, width: number, height: number): Extent;
    /**
     * Returns the internal value array in this order: [minX, maxX, minY, maxY]
     */
    get values(): Float64Array;
    /**
     * Returns the coordinate of the location on the extent that matches U and V, where U and V
     * are normalized (in the range [0, 1]), and U = 0  and V = 0 are the bottom/left corner of
     * the extent, and U = 1 and V = 1 are to top right corner.
     * @param u - The normalized coordinate over the X-axis.
     * @param v - The normalized coordinate over the Y-axis.
     * @param target - The target to store the result. If unspecified, one will be created.
     * @returns The sampled coordinate.
     * @example
     * const extent = new Extent(CoordinateSystem.epsg4326, 0, 10, 0, 5);
     * // Get the bottom left corner
     * extent.sampleUV(0, 0)
     * // [0, 0]
     *
     * // Get the center
     * extent.sampleUV(0.5, 0.5)
     * // [5, 2.5]
     *
     * // Get the top right corner
     * extent.sampleUV(1, 1)
     * // [10, 5]
     */
    sampleUV(u: number, v: number, target?: Coordinates): Coordinates;
    /**
     * Returns `true` if the two extents are equal.
     *
     * @param other - The extent to compare.
     * @param epsilon - The optional comparison epsilon.
     * @returns `true` if the extents are equal, otherwise `false`.
     */
    equals(other: Extent, epsilon?: number): boolean;
    /**
     * Checks the validity of the extent. Valid extents must not have infinite or NaN values.
     *
     * @returns `true` if the extent is valid, `false` otherwise.
     */
    isValid(): boolean;
    /**
     * Clones this object.
     *
     * @returns a copy of this object.
     */
    clone(): Extent;
    /**
     * Returns an extent grown the specified relative margin.
     * The margin is relative to the width or height of the extent.
     *
     * @param marginRatio - The margin, in normalized value ([0, 1]).
     * A margin of 1 means 100% of the width or height of the extent.
     * @example
     * // Create an extent with a 10% margin applied:
     * const extent = new Extent(CoordinateSystem.epsg3857, 0, 100, 0, 100);
     * const margin = extent.withRelativeMargin(0.1);
     * //  new Extent(CoordinateSystem.epsg3857, -10, 110, -10, 110);
     * @returns a new extent with a specified margin applied.
     */
    withRelativeMargin(marginRatio: number): Extent;
    /**
     * Returns an extent grown or shrinked with the specified margin.
     * If the margin is positive, the new extent is bigger, and if the margin is negative the new extent is smaller.
     *
     * @param x - The horizontal margin, in CRS units.
     * @param y - The vertical margin, in CRS units.
     * @example
     * const extent = new Extent(CoordinateSystem.epsg3857, 0, 100, 0, 100);
     * const margin = extent.withMargin(10, 15);
     * //  new Extent(CoordinateSystem.epsg3857, -10, 110, -15, 115);
     * @returns a new extent with a specified margin applied.
     */
    withMargin(x: number, y: number): Extent;
    /**
     * Converts this extent into another CRS.
     * If `crs` is the same as the current CRS, the original object is returned.
     *
     * @param crs - the new CRS
     * @returns the converted extent.
     * @example
     * const original = new Extent(CoordinateSystem.epsg4326, -5, 5, -5, 5);
     * const transformed = original.as(CoordinateSystem.epsg3857);
     * // [-556597.4539663679, 556597.4539663679, -557305.2572745769, 557305.2572745753]
     */
    as(crs: CoordinateSystem): this | Extent;
    offsetToParent(other: Extent, target?: OffsetScale): OffsetScale;
    /**
     * @returns the horizontal coordinate of the westernmost side
     * @deprecated Use {@link minX} instead.
     */
    get west(): number;
    /**
     * The minimum X value of this extent (the X coordinate of the left side).
     */
    get minX(): number;
    /**
     * @returns the horizontal coordinate of the easternmost side
     * @deprecated Use {@link maxX} instead.
     */
    get east(): number;
    /**
     * The maximum X value of this extent (the X coordinate of the right side).
     */
    get maxX(): number;
    /**
     * @returns the vertical coordinate of the northernmost side
     * @deprecated Use {@link maxY} instead.
     */
    get north(): number;
    /**
     * The maximum Y value of this extent (the Y coordinate of the top side).
     */
    get maxY(): number;
    /**
     * @returns the horizontal coordinate of the southermost side
     * @deprecated Use {@link minY} instead.
     */
    get south(): number;
    /**
     * The minimum Y value of this extent (the Y coordinate of the bottom side).
     */
    get minY(): number;
    /**
     * @returns the coordinates of the top left corner
     */
    topLeft(): Coordinates;
    /**
     * @returns the coordinates of the top right corner
     */
    topRight(): Coordinates;
    /**
     * @returns the coordinates of the bottom right corner
     */
    bottomRight(): Coordinates;
    /**
     * @returns the coordinates of the bottom right corner
     */
    bottomLeft(): Coordinates;
    /**
     * Gets the coordinate reference system of this extent.
     */
    get crs(): CoordinateSystem;
    /**
     * Sets `target` with the center of this extent.
     *
     * @param target - the coordinate to set with the center's coordinates.
     * If none provided, a new one is created.
     * @returns the modified object passed in argument.
     */
    center(target?: Coordinates): Coordinates;
    /**
     * Sets `target` with the center of this extent.
     *
     * @param target - the vector to set with the center's coordinates.
     * If none provided, a new one is created.
     * @returns the modified object passed in argument.
     */
    centerAsVector2(target?: Vector2): Vector2;
    /**
     * Sets `target` with the center of this extent.
     * Note: The z coordinate of the resulting vector will be set to zero.
     *
     * @param target - the vector to set with the center's coordinates.
     * If none provided, a new one is created.
     * @returns the modified object passed in argument.
     */
    centerAsVector3(target?: Vector3): Vector3;
    getQuadrant(x: number, y: number): 0 | 1 | 2 | 3;
    /**
     * Sets the target with the width and height of this extent.
     * The `x` property will be set with the width,
     * and the `y` property will be set with the height.
     *
     * @param target - the optional target to set with the result.
     * @returns the modified object passed in argument,
     * or a new object if none was provided.
     */
    dimensions(target?: Vector2): Vector2;
    /**
     * Checks whether the specified coordinate is inside this extent.
     *
     * @param coord - the coordinate to test
     * @param epsilon - the precision delta (+/- epsilon)
     * @returns `true` if the coordinate is inside the bounding box
     */
    isPointInside(coord: Coordinates, epsilon?: number): boolean;
    isXYInside(x: number, y: number, epsilon?: number): boolean;
    /**
     * Tests whether this extent is contained in another extent.
     *
     * @param other - the other extent to test
     * @param epsilon - the precision delta (+/- epsilon).
     * If this value is not provided, a reasonable epsilon will be computed.
     * @returns `true` if this extent is contained in the other extent.
     */
    isInside(other: Extent, epsilon?: number | null): boolean;
    /**
     * Tests whether this extent contains entirely another extent.
     *
     * @param other - the other extent to test
     * @param epsilon - the precision delta (+/- epsilon).
     * If this value is not provided, a reasonable epsilon will be computed.
     * @returns `true` if this extent contains the other extent.
     */
    contains(other: Extent, epsilon?: number | null): boolean;
    /**
     * Returns `true` if this extent intersects with the specified extent.
     *
     * @param bbox - the extent to test
     * @returns `true` if this extent intersects with the provided extent, `false` otherwise.
     */
    intersectsExtent(bbox: Extent): boolean;
    /**
     * Set this extent to the intersection of itself and other
     *
     * @param other - the bounding box to intersect
     * @returns the modified extent
     */
    intersect(other: Extent): this;
    /**
     * Returns an extent that is adjusted so that its edges land exactly at the border
     * of the grid pixels. Optionally, you can specify the minimum pixel size of the
     * resulting extent.
     *
     * @param gridExtent - The grid extent.
     * @param gridWidth - The grid width, in pixels.
     * @param gridHeight - The grid height, in pixels.
     * @param minPixWidth - The minimum width, in pixels, of the resulting extent.
     * @param minPixHeight - The minimum height, in pixels, of the resulting extent.
     * @returns The adjusted extent and pixel
     * size of the adjusted extent.
     */
    fitToGrid(gridExtent: Extent, gridWidth: number, gridHeight: number, minPixWidth?: number, minPixHeight?: number): GridExtent;
    /**
     * Sets the values of this extent from a coordinate system and a pair of coordinates.
     * @param crs - The coordinate system to use.
     * @param bottomLeft - The bottom-left corner of the extent.
     * @param topRight - The top-right corner of the extent.
     * @remarks Both coordinates must be in the same coordinate system as this extent.
     */
    set(crs: CoordinateSystem, bottomLeft: Coordinates, topRight: Coordinates): this;
    /**
     * Sets the values of this extent from an object containing the min/max XY values.
     * @param crs - The coordinate system to use.
     * @param values - The extent limits.
     */
    set(crs: CoordinateSystem, values: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    }): this;
    /**
     * Sets the values of this extent from the min/max XY values.
     * @param crs - The coordinate system to use.
     * @param values - The extent limits.
     * @deprecated Due to ambiguity (not all coordinate systems are north-up), this constructor
     * should not be used.
     */
    set(crs: CoordinateSystem, values: {
        west: number;
        east: number;
        south: number;
        north: number;
    }): this;
    /**
     * Sets the values of this extent from the min/max XY values
     * @param crs - The coordinate system to use.
     * @param minX - The X coordinate of the left side of this extent.
     * @param maxX - The X coordinate of the righ side of this extent.
     * @param minY - The Y coordinate of the bottom side of this extent.
     * @param maxY - The Y coordinate of the top side of this extent.
     */
    set(crs: CoordinateSystem, minX: number, maxX: number, minY: number, maxY: number): this;
    copy(other: Extent): this;
    /** @internal */
    static unionMany(...extents: Extent[]): Extent | null;
    union(extent: Extent | null | undefined): void;
    /**
     * Expands the extent to contain the specified coordinates.
     *
     * @param coordinates - The coordinates to include
     */
    expandByPoint(coordinates: Coordinates): this;
    /**
     * Moves the extent by the provided `x` and `y` values.
     *
     * @param x - the horizontal shift
     * @param y - the vertical shift
     * @returns the modified extent.
     */
    shift(x: number, y: number): this;
    /**
     * Constructs an extent from the specified box.
     *
     * @param crs - the coordinate reference system of the new extent.
     * @param box - the box to read values from
     * @returns the constructed extent.
     */
    static fromBox3(crs: CoordinateSystem, box: Box3): Extent;
    /**
     * Returns a [Box3](https://threejs.org/docs/?q=box3#api/en/math/Box3) that matches this extent.
     *
     * @param minHeight - The min height of the box.
     * @param maxHeight - The max height of the box.
     * @returns The box.
     */
    toBox3(minHeight: number, maxHeight: number): Box3;
    /**
     * Returns the normalized offset from bottom-left in extent of this Coordinates
     *
     * @param coordinate - the coordinate
     * @param target - optional `Vector2` target.
     * If not present a new one will be created.
     * @returns normalized offset in extent
     * @example
     * extent.offsetInExtent(extent.center())
     * // returns `(0.5, 0.5)`.
     */
    offsetInExtent(coordinate: Coordinates, target?: Vector2): Vector2;
    /**
     * Divides this extent into a regular grid.
     * The number of points in each direction is equal to the number of subdivisions + 1.
     * The points are laid out row-wise, from west to east, and north to south:
     *
     * ```
     * 1 -- 2
     * |    |
     * 3 -- 4
     * ```
     *
     * @param xSubdivs - The number of grid subdivisions in the x-axis.
     * @param ySubdivs - The number of grid subdivisions in the y-axis.
     * @param target - The array to fill.
     * @param stride - The number of elements per item (2 for XY, 3 for XYZ).
     * @returns the target.
     */
    toGrid<T extends TypedArray>(xSubdivs: number, ySubdivs: number, target: T, stride: number): T;
    /**
     * Subdivides this extents into x and y subdivisions.
     *
     * Notes:
     * - Subdivisions must be strictly positive.
     * - If both subvisions are `1`, an array of one element is returned,
     *  containing a copy of this extent.
     *
     * @param xSubdivs - The number of subdivisions on the X/longitude axis.
     * @param ySubdivs - The number of subdivisions on the Y/latitude axis.
     * @returns the resulting extents.
     * @example
     * const extent = new Extent(CoordinateSystem.epsg3857, 0, 100, 0, 100);
     * extent.split(2, 1);
     * // [0, 50, 0, 50], [50, 100, 50, 100]
     */
    split(xSubdivs: number, ySubdivs: number): Extent[];
    /**
     * The bounds of the Web Mercator (EPSG:3857) projection.
     */
    static get webMercator(): Extent;
    /**
     * The bounds of the whole world in the EPSG:4326 projection.
     *
     * @example
     * const bounds = Extent.WGS84;
     * // [-180, 180, -90, 90]
     */
    static get WGS84(): Extent;
    /**
     * The bounds of the whole sphere in the `'equirectangular'` projection.
     */
    static get fullEquirectangularProjection(): Extent;
    /**
     * Creates an extent from parameters of a photosphere in the `'equirectangular'` projection for the given image parameters.
     * See [the Google Street View documentation](https://developers.google.com/streetview/spherical-metadata) for additional information.
     * @param params - The parameters of the image. If undefined, then it returns the extent
     * for the full sphere equivalent to {@link fullEquirectangularProjection}
     * @returns The extent of the image in the `'equirectangular'` projection.
     */
    static fromPhotosphere(params?: {
        fullPanoImageWidthPixels: number;
        fullPanoImageHeightPixels: number;
        croppedAreaLeftPixels: number;
        croppedAreaTopPixels: number;
        croppedAreaImageWidthPixels: number;
        croppedAreaImageHeightPixels: number;
    }): Extent;
}
export default Extent;
export declare function isCoordinates(obj: unknown): obj is Coordinates;
//# sourceMappingURL=Extent.d.ts.map