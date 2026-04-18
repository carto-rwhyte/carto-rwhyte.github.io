import { Matrix4 } from 'three';
import type { EntityUserData } from './Entity';
import ImageCollectionBase, { type ImageCollectionBaseOptions, type ImageCollectionBasePickResult, type ImageCollectionBaseSource, type ImageSource } from './ImageCollectionBase';
export type OrientedImageSource = ImageSource & {
    /** Vertical field of view in degrees. */
    fov: number;
    aspectRatio: number;
};
export type OrientedImageCollectionSource = ImageCollectionBaseSource<OrientedImageSource>;
/**
 * Constructor options for the OrientedImageCollection entity.
 */
export type OrientedImageCollectionOptions = ImageCollectionBaseOptions<OrientedImageSource>;
export type OrientedImageCollectionPickResult = ImageCollectionBasePickResult;
/**
 * Displays a collection of oriented images coming from a {@link OrientedImageCollectionSource} in the 3D space.
 *
 * Each oriented image is displayed as 3 distinct elements:
 * - a sphere positioned at the location of the camera receptor
 * - a wireframe to show the camera receptor (orientation, field of view and aspect ratio)
 * - a texture plane on which the image is projected
 *
 * Each of these 3 elements can be made visible or invisible independently.
 *
 * If the collection contains images that are too spread out geographically, visual issues may occur.
 * This is why we advise to group images that are relatively close together.
 */
export declare class OrientedImageCollection<TUserData extends EntityUserData = EntityUserData> extends ImageCollectionBase<OrientedImageSource, TUserData> {
    /** Readonly flag to indicate that this object is a OrientedImageCollection instance. */
    readonly isOrientedImageCollection: true;
    readonly type: "OrientedImageCollection";
    constructor(options: OrientedImageCollectionOptions);
    protected computeWireframeScaleMatrix(source: OrientedImageSource): Matrix4;
}
export default OrientedImageCollection;
//# sourceMappingURL=OrientedImageCollection.d.ts.map