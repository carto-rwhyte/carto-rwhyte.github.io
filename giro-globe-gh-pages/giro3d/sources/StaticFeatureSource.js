/*
 * Copyright (c) 2015-2018, IGN France.
 * Copyright (c) 2018-2026, Giro3D team.
 * SPDX-License-Identifier: MIT
 */

import { MathUtils } from 'three';
import CoordinateSystem from '../core/geographic/CoordinateSystem';
import { nonNull } from '../utils/tsutils';
import { filterByExtent } from './features/processor';
import { FeatureSourceBase } from './FeatureSource';
function preprocess(feature, src, dst) {
  if (feature.getId() == null) {
    feature.setId(MathUtils.generateUUID());
  }
  if (src.id !== dst.id) {
    feature.getGeometry()?.transform(src.id, dst.id);
  }
  return feature;
}
/**
 * A feature source that does not read from any remote source, but
 * instead acts as a container for features added by the user.
 *
 * > [!note]
 * > When features are added to this source, they might be transformed to
 * > match the target coordinate system, as well as assigning them unique IDs.
 */
export default class StaticFeatureSource extends FeatureSourceBase {
  isStaticFeatureSource = true;
  type = 'StaticFeatureSource';
  _initialFeatures = undefined;
  _features = new Set();
  /**
   * Returns a copy of the features contained in this source.
   *
   * Note: this property returns an empty array if the source is not yet initialized.
   */
  get features() {
    return [...this._features];
  }
  constructor(options) {
    super();
    this._coordinateSystem = options?.coordinateSystem ?? CoordinateSystem.epsg4326;
    if (options?.features) {
      this._initialFeatures = [...options.features];
    }
  }

  /**
   * Adds a single feature.
   *
   * Note: if you want to add multiple features at once, use {@link addFeatures} for better performance.
   */
  addFeature(feature) {
    this.throwIfNotInitialized();
    this.doAddFeatures(feature);
    this.update();
  }

  /**
   * Removes a single feature.
   *
   * Note: if you want to remove multiple features at once, use {@link removeFeatures} for better performance.
   *
   * @returns `true` if the feature feature was actually removed, `false` otherwise.
   */
  removeFeature(feature) {
    if (this._features.delete(feature)) {
      this.update();
      return true;
    }
    return false;
  }

  /**
   * Adds multiple features.
   */
  addFeatures(features) {
    this.throwIfNotInitialized();
    this.doAddFeatures([...features]);
    this.update();
  }

  /**
   * Removes multiple features.
   *
   * @returns `true` if at least one feature was actually removed, `false` otherwise.
   */
  removeFeatures(features) {
    let actuallyRemoved = false;
    for (const feature of features) {
      if (this._features.delete(feature)) {
        actuallyRemoved = true;
      }
    }
    if (actuallyRemoved) {
      this.update();
      return true;
    }
    return false;
  }

  /**
   * Removes all features.
   */
  clear() {
    if (this._features.size > 0) {
      this._features.clear();
      this.update();
    }
  }
  doAddFeatures(features) {
    if (Array.isArray(features)) {
      features.forEach(f => {
        preprocess(f, this._coordinateSystem, nonNull(this._targetCoordinateSystem));
        this._features.add(f);
      });
    } else {
      preprocess(features, this._coordinateSystem, nonNull(this._targetCoordinateSystem));
      this._features.add(features);
    }
  }
  async initialize(options) {
    await super.initialize(options);

    // Let's prepare the features that were added during construction.
    // We couldn't do that before since the target coordinate system was not known.
    if (this._initialFeatures) {
      this.doAddFeatures(this._initialFeatures);
      this._initialFeatures.length = 0;
    }
  }
  async getFeatures(request) {
    const filtered = await filterByExtent([...this._features], request.extent, {
      signal: request.signal
    });
    return {
      features: filtered
    };
  }
}