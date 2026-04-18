/*
 * Copyright (c) 2015-2018, IGN France.
 * Copyright (c) 2018-2026, Giro3D team.
 * SPDX-License-Identifier: MIT
 */

import { PointCloudSourceBase } from './PointCloudSource';
export default class StaticPointCloudSource extends PointCloudSourceBase {
  type = 'StaticPointCloudSource';
  isStaticPointCloudSource = true;
  _attributeBuffers = new Map();
  constructor(params) {
    super();
    this._bounds = params.bounds;
    this._origin = params.origin;
    this._pointCount = params.positions.count / 3;
    this._positions = params.positions;
    this._spacing = params.spacing;
    this._attributes = params.attributes;
    for (const attrib of this._attributes) {
      this._attributeBuffers.set(attrib.attribute.name, attrib.data);
    }
  }
  initializeOnce() {
    return Promise.resolve(this);
  }
  getHierarchy() {
    const unique = {
      center: this._origin,
      depth: 0,
      id: 'root',
      sourceId: this.id,
      hasData: true,
      volume: this._bounds,
      pointCount: this._pointCount,
      geometricError: this._spacing
    };
    return Promise.resolve(unique);
  }
  getMetadata() {
    const result = {
      pointCount: this._pointCount,
      volume: this._bounds,
      attributes: this._attributes.map(v => v.attribute)
    };
    return Promise.resolve(result);
  }
  getNodeData(params) {
    // This should never happen but let's check anyway.
    if (params.node.id !== 'root') {
      throw new Error("only one node is supported in this source: 'root'");
    }
    const attributes = params.attributes != null ? params.attributes.map(att => this._attributeBuffers.get(att.name)) : [];
    const result = {
      pointCount: this._pointCount,
      origin: this._origin,
      position: params.position ? this._positions : undefined,
      attributes
    };
    return Promise.resolve(result);
  }
  get progress() {
    return 1;
  }
  get loading() {
    return false;
  }
  dispose() {
    // Nothing to do.
  }
  getMemoryUsage(context) {
    let cpuMemory = this._positions.array.byteLength;
    this._attributes.forEach(v => cpuMemory += v.data.array.byteLength);
    context.objects.set(this.id, {
      cpuMemory,
      gpuMemory: 0
    });
  }
}