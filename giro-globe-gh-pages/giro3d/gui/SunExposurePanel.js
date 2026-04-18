/*
 * Copyright (c) 2015-2018, IGN France.
 * Copyright (c) 2018-2026, Giro3D team.
 * SPDX-License-Identifier: MIT
 */

import { Mesh, MeshBasicMaterial, Sphere, SphereGeometry } from 'three';
import { isEntity3D } from '../entities/Entity3D';
import DrawTool from '../interactions/DrawTool';
import SunExposure from '../interactions/SunExposure';
import Panel from './Panel';
export default class SunExposurePanel extends Panel {
  radius = 100;
  resolution = 10;
  temporalResolution = 10;
  helpers = false;
  date = '2025-06-21';
  timeRange = '8-18';
  _drawTool = null;
  _center = null;
  _sphere = null;
  _helper = null;
  _entity = null;
  _sunExposure = null;
  updateBoundingSphere() {
    if (this._center == null) {
      return;
    }
    this._sphere = new Sphere(this._center, this.radius);
    if (this._helper == null) {
      const helper = new Mesh(new SphereGeometry(), new MeshBasicMaterial({
        color: 'cyan',
        wireframe: true,
        opacity: 0.3
      }));
      this._helper = helper;
      this.instance.add(helper);
    }
    const r = this.radius;
    this._helper.position.copy(this._center);
    this._helper.scale.set(r, r, r);
    this._helper.updateMatrixWorld(true);
    this.instance.notifyChange();
  }
  constructor(parentGui, instance) {
    super(parentGui, instance, 'SunExposure');
    const updateSphere = this.updateBoundingSphere.bind(this);
    this.addController(this, 'radius').min(1).max(10000).onChange(updateSphere);
    this.addController(this, 'setCenter');
    this.addController(this, 'resolution').min(0.1).max(1000);
    this.addController(this, 'helpers').name('Show helpers');
    this.addController(this, 'date');
    this.addController(this, 'timeRange').name('Start/End hours (UTC)');
    this.addController(this, 'temporalResolution').name('Temporal resolution (minutes)').min(10).max(120);
    this.addController(this, 'compute');
    this.addController(this, 'cleanup');
  }
  async compute() {
    if (this._sphere == null) {
      console.error('No sphere set for computation');
      return;
    }
    this.cleanup();
    const [startTime, endTime] = this.timeRange.split('-').map(x => Number.parseInt(x));
    const date = new Date(this.date);
    const yyyy = date.getUTCFullYear();
    const mm = date.getUTCMonth();
    const dd = date.getUTCDay();
    const start = new Date(Date.UTC(yyyy, mm, dd, startTime));
    const end = new Date(Date.UTC(yyyy, mm, dd, endTime));
    const tool = new SunExposure({
      instance: this.instance,
      objects: this.instance.getEntities(e => isEntity3D(e)),
      start,
      end,
      temporalResolution: this.temporalResolution * 60,
      limits: this._sphere,
      showHelpers: this.helpers,
      spatialResolution: this.resolution
    });
    this._sunExposure = tool;
    const results = await tool.compute();
    this._entity = results.entity;
  }
  cleanup() {
    if (this._entity != null) {
      this.instance.remove(this._entity);
      this._entity = null;
    }
    if (this._sunExposure != null) {
      this._sunExposure.dispose();
      this._sunExposure = null;
    }
  }
  async setCenter() {
    if (this._drawTool == null) {
      this._drawTool = new DrawTool({
        instance: this.instance
      });
    }
    const shape = await this._drawTool.createPoint();
    if (shape != null) {
      this._center = shape.points[0];
    }
    this.updateBoundingSphere();
  }
}