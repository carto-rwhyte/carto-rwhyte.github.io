/*
 * Copyright (c) 2015-2018, IGN France.
 * Copyright (c) 2018-2026, Giro3D team.
 * SPDX-License-Identifier: MIT
 */

import GeoJSON from 'ol/format/GeoJSON';
import CoordinateSystem from '../core/geographic/CoordinateSystem';
import Fetcher from '../utils/Fetcher';
import { nonNull } from '../utils/tsutils';
import { filterByExtent, processFeatures } from './features/processor';
import { FeatureSourceBase } from './FeatureSource';
const defaultGetter = (url, type) => {
  switch (type) {
    case 'arraybuffer':
      return Fetcher.arrayBuffer(url);
    case 'json':
      return Fetcher.json(url);
    case 'text':
      return Fetcher.text(url);
    case 'xml':
      return Fetcher.xml(url);
  }
};
/**
 * Loads features from a remote file (such as GeoJSON, GPX, etc.)
 */
export default class FileFeatureSource extends FeatureSourceBase {
  isFileFeatureSource = true;
  type = 'FileFeatureSource';
  _features = null;
  _loadFeaturePromise = null;
  constructor(params) {
    super();
    this._format = params.format ?? new GeoJSON();
    this._url = params.url;
    this._sourceCoordinateSystem = params.sourceCoordinateSystem;
    this._getter = params.getter ?? defaultGetter;
  }
  loadFeatures() {
    this.throwIfNotInitialized();
    if (this._features != null) {
      return Promise.resolve(this._features);
    }
    if (this._loadFeaturePromise != null) {
      return this._loadFeaturePromise;
    }
    this._loadFeaturePromise = this.loadFeaturesOnce();
    return this._loadFeaturePromise;
  }
  async loadFeaturesOnce() {
    const data = await this._getter(this._url, this._format.getType());
    if (!this._sourceCoordinateSystem) {
      const dataProjection = this._format.readProjection(data);
      if (dataProjection) {
        this._sourceCoordinateSystem = CoordinateSystem.get(dataProjection?.getCode());
      } else {
        this._sourceCoordinateSystem = CoordinateSystem.epsg4326;
      }
    }
    const features = this._format.readFeatures(data);
    const targetProjection = nonNull(this._targetCoordinateSystem, 'this source is not initialized');
    const sourceProjection = nonNull(this._sourceCoordinateSystem);
    const actualFeatures = await processFeatures(features, sourceProjection, targetProjection);
    this._features = actualFeatures;
    return actualFeatures;
  }
  async getFeatures(request) {
    request.signal?.throwIfAborted();
    const features = await this.loadFeatures();
    request.signal?.throwIfAborted();
    const filtered = await filterByExtent(features, request.extent, {
      signal: request.signal
    });
    request.signal?.throwIfAborted();
    return {
      features: filtered
    };
  }

  /**
   * Deletes the already loaded features, and dispatch an event to reload the features.
   */
  reload() {
    this._features = null;
    this._loadFeaturePromise = null;
    this.dispatchEvent({
      type: 'updated'
    });
  }
}