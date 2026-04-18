/*
 * Copyright (c) 2015-2018, IGN France.
 * Copyright (c) 2018-2026, Giro3D team.
 * SPDX-License-Identifier: MIT
 */

import { EventDispatcher } from 'three';

/**
 * Interface for feature sources.
 *
 * > [!note]
 * > To implement a feature source, you can use the {@link FeatureSourceBase} base class for convenience.
 */

export class FeatureSourceBase extends EventDispatcher {
  _targetCoordinateSystem = null;
  _initialized = false;
  constructor() {
    super();
  }
  initialize(options) {
    this._targetCoordinateSystem = options.targetCoordinateSystem;
    this._initialized = true;
    return Promise.resolve();
  }

  /**
   * Raises an event to reload the source.
   */
  update() {
    this.dispatchEvent({
      type: 'updated'
    });
  }
  throwIfNotInitialized() {
    if (!this._initialized) {
      throw new Error('this source has not been initialized');
    }
  }
}