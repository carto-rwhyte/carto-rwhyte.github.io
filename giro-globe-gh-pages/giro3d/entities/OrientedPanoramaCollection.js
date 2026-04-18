/*
 * Copyright (c) 2015-2018, IGN France.
 * Copyright (c) 2018-2026, Giro3D team.
 * SPDX-License-Identifier: MIT
 */

import { MathUtils, Matrix4, SphereGeometry } from 'three';
import ImageCollectionBase from './ImageCollectionBase';

/**
 * Constructor options for the OrientedPanoramaCollection entity.
 */

/**
 * Displays a collection of oriented panoramas coming from a {@link OrientedPanoramaCollectionSource} in the 3D space.
 * The panoramas are expected to be in the 'equirectangular' projection.
 *
 * Each oriented panorama is displayed as 3 distinct elements:
 * - a sphere positioned at the location of the camera receptor
 * - a wireframe to show the camera receptor (orientation, field of view and aspect ratio)
 * - a texture sphere on which the image is projected
 *
 * Each of these 3 elements can be made visible or invisible independently.
 *
 * If the collection contains images that are too spread out geographically, visual issues may occur.
 * This is why we advise to group images that are relatively close together.
 */
export class OrientedPanoramaCollection extends ImageCollectionBase {
  /** Readonly flag to indicate that this object is a OrientedPanoramaCollection instance. */
  isOrientedPanoramaCollection = true;
  type = 'OrientedPanoramaCollection';
  constructor(options) {
    const geometry = new SphereGeometry(1, 12, 8).rotateZ(MathUtils.degToRad(90)).applyMatrix4(new Matrix4().makeScale(1, 1, -1)).rotateY(MathUtils.degToRad(90));
    super(geometry, geometry, options);
  }
  computeWireframeScaleMatrix(source) {
    return new Matrix4().makeScale(source.distance, source.distance, source.distance);
  }
}
export default OrientedPanoramaCollection;