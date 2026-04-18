import type { BufferGeometry } from 'three';
import { Matrix4, type ColorRepresentation, type Vector2, type Vector3Like } from 'three';
import type Context from '../core/Context';
import type HasDefaultPointOfView from '../core/HasDefaultPointOfView';
import type { HeadingPitchRollLike } from '../core/HeadingPitchRoll';
import type PickOptions from '../core/picking/PickOptions';
import type PickResult from '../core/picking/PickResult';
import type PointOfView from '../core/PointOfView';
import type { EntityUserData } from './Entity';
import type { Entity3DOptions, Entity3DEventMap } from './Entity3D';
import { type GetMemoryUsageContext } from '../core/MemoryUsage';
import Entity3D from './Entity3D';
export interface ImageSource {
    /**
     * The position of the camera, in the same coordinate system as the instance.
     */
    position: Vector3Like;
    /**
     * The orientation of the camera.
     */
    orientation: HeadingPitchRollLike;
    /**
     * The distance from the origin at which the image is displayed.
     * @defaultValue 10
     */
    distance: number;
    /**
     * The URL of the image. If undefined, the image is not displayed (but the wireframe and origin point can still be displayed)
     */
    imageUrl?: string;
}
export interface ImageCollectionBaseSource<TSource extends ImageSource> {
    images: TSource[];
}
/**
 * Constructor options for the {@link OrientedImageCollection} entity.
 */
export interface ImageCollectionBaseOptions<TSource extends ImageSource> extends Entity3DOptions {
    /**
     * The OrientedImageCollection source.
     */
    source: ImageCollectionBaseSource<TSource>;
    /**
     * Location spheres show the location of the camera when an image was taken.
     */
    locationSpheres?: {
        /**
         * Display the location spheres at the origin of each image.
         * @defaultValue true
         */
        visible?: boolean;
        /**
         * The radius of the location spheres, in CRS units.
         * @defaultValue 0.5
         */
        radius?: number;
        /**
         * The color of the location spheres.
         * @defaultValue green
         */
        color?: ColorRepresentation;
    };
    /**
     * Wireframes represent the field of view of each image.
     */
    wireframes?: {
        /**
         * Display the wireframe of each image.
         * @defaultValue true
         */
        visible?: boolean;
        /**
         * The color of the camera wireframes.
         * @defaultValue green
         */
        color?: ColorRepresentation;
    };
    images?: {
        /**
         * Display the actual images.
         * Note, if the `.imageUrl` property is undefined, then a blank rectangle is displayed instead.
         * @defaultValue false
         */
        visible?: boolean;
        /**
         * The opacity of the image object.
         * @defaultValue 1
         */
        opacity?: number;
    };
}
export interface ImageCollectionBasePickResult extends PickResult {
    imageIndex: number;
}
/**
 * Displays a collection of oriented images coming from a {@link ImageCollectionBaseSource} in the 3D space.
 *
 * Each oriented image is displayed as 3 distinct elements:
 * - a sphere positioned at the location of the camera receptor
 * - a wireframe to show the camera receptor
 * - a texture plane on which the image is projected
 *
 * Each of these 3 elements can be made visible or invisible independently.
 *
 * If the collection contains images that are too spread out geographically, visual issues may occur.
 * This is why we advise to group images that are relatively close together.
 */
export declare abstract class ImageCollectionBase<TSource extends ImageSource = ImageSource, TUserData extends EntityUserData = EntityUserData> extends Entity3D<Entity3DEventMap, TUserData> {
    /** The source of this entity. */
    readonly source: ImageCollectionBaseSource<TSource>;
    private readonly _container;
    private readonly _origin;
    private readonly _images;
    private readonly _spheres;
    private readonly _wireframes;
    constructor(imageGeometry: BufferGeometry, wireframeGeometry: BufferGeometry, options: ImageCollectionBaseOptions<TSource>);
    getMemoryUsage(context: GetMemoryUsageContext): void;
    /**
     * Gets or sets the spheres visibility.
     *
     * @defaultValue true
     */
    get showLocationSpheres(): boolean;
    set showLocationSpheres(visible: boolean);
    /**
     * Gets or sets the wireframes visibility.
     *
     * @defaultValue true
     */
    get showWireframes(): boolean;
    set showWireframes(visible: boolean);
    /**
     * Gets or sets the images opacity.
     *
     * @defaultValue 1
     */
    get imageOpacity(): number;
    set imageOpacity(opacity: number);
    /**
     * Gets or sets the images visibility.
     *
     * @defaultValue false
     */
    get showImages(): boolean;
    set showImages(visible: boolean);
    updateOpacity(): void;
    /**
     * Sets the projection distance of a specific image in the collection.
     */
    setImageProjectionDistance(imageIndex: number, distance: number): void;
    /**
     * Gets the projection distance of a specific image in the collection.
     */
    getImageProjectionDistance(imageIndex: number): number;
    /**
     * Gets the point of view of the first image if there is one.
     */
    getDefaultPointOfView(_params: Parameters<HasDefaultPointOfView['getDefaultPointOfView']>[0]): ReturnType<HasDefaultPointOfView['getDefaultPointOfView']>;
    /**
     * Gets the point of view of a specific image in the collection.
     */
    getImagePointOfView(imageIndex: number): PointOfView;
    /**
     * Disposes this entity and deletes unmanaged graphical resources.
     */
    dispose(): void;
    pick(canvasCoords: Vector2, options?: PickOptions): ImageCollectionBasePickResult[];
    postUpdate(context: Context, _changeSources: Set<unknown>): void;
    private computeSpheres;
    private computeWireframes;
    private computeWireframeMatrix;
    protected abstract computeWireframeScaleMatrix(source: TSource): Matrix4;
    private computeLocalRotationMatrix;
    private computeLocalTranslationMatrix;
    private computePointOfView;
    private getImageSource;
    private updateMinMaxDistance;
    private createImageObject;
}
export default ImageCollectionBase;
//# sourceMappingURL=ImageCollectionBase.d.ts.map