/*
 * Copyright (c) 2015-2018, IGN France.
 * Copyright (c) 2018-2026, Giro3D team.
 * SPDX-License-Identifier: MIT
 */

import { FeatureSourceBase } from './FeatureSource';
/**
 * A {@link FeatureSource} that aggregates multiple sub-sources behind a single interface.
 */
export default class AggregateFeatureSource extends FeatureSourceBase {
  type = 'AggregateFeatureSource';
  isAggregateFeatureSource = true;
  constructor(params) {
    super();
    this._sources = [...params.sources];
  }

  /**
   * The sources in this source.
   */
  get sources() {
    return [...this._sources];
  }
  async getFeatures(request) {
    const result = [];
    const promises = [];
    for (const source of this._sources) {
      const promise = source.getFeatures(request);
      promises.push(promise);
    }
    const promiseResults = await Promise.all(promises);
    promiseResults.forEach(r => result.push(...r.features));
    return {
      features: result
    };
  }
  async initialize(options) {
    await super.initialize(options);
    this.sources.forEach(source => source.initialize(options));
  }
}