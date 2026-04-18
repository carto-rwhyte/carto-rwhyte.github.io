/*
 * Copyright (c) 2015-2018, IGN France.
 * Copyright (c) 2018-2026, Giro3D team.
 * SPDX-License-Identifier: MIT
 */

import OpenLayersUtils from '../../utils/OpenLayersUtils';
import PromiseUtils from '../../utils/PromiseUtils';
export async function processFeatures(features, sourceProjection, targetProjection, optionalProcessings) {
  // Since everything happens in the main frame, we split the computation
  // into several slices that are executed over time.
  await PromiseUtils.nextFrame();
  const shouldReproject = sourceProjection.id !== targetProjection.id;
  const tmpExtent = [0, 0, 0, 0];
  // Process the features in batched slices
  const actualFeatures = await PromiseUtils.batch(features, (feature, index) => {
    const id = optionalProcessings?.getFeatureId != null ? optionalProcessings.getFeatureId(feature) : index;
    feature.setId(id);
    const geometry = feature.getGeometry();

    // We ignore features without geometry as they cannot be represented.
    if (geometry) {
      if (shouldReproject) {
        // Reproject geometry
        geometry.transform(sourceProjection.id, targetProjection.id);
      }

      // Pre-compute extent to speedup ulterior computations
      geometry.getExtent(tmpExtent);
      if (optionalProcessings?.transformer) {
        optionalProcessings.transformer(feature, geometry);
      }
      return feature;
    }
    return null;
  });
  return actualFeatures;
}
export function intersects(feature, olExtent) {
  const geom = feature.getGeometry();
  if (!geom) {
    return false;
  }
  if (geom.intersectsExtent(olExtent)) {
    return true;
  }
  return false;
}
export async function filterByExtent(features, extent, options) {
  const olExtent = OpenLayersUtils.toOLExtent(extent);
  const filtered = await PromiseUtils.batch(features, feature => {
    if (intersects(feature, olExtent)) {
      return feature;
    }
    return null;
  }, {
    signal: options?.signal
  });
  return filtered;
}