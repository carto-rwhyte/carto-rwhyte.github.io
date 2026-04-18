/*
 * Copyright (c) 2015-2018, IGN France.
 * Copyright (c) 2018-2026, Giro3D team.
 * SPDX-License-Identifier: MIT
 */

import { Box3, Vector2, Vector3 } from 'three';
import ProjUtils from '../../utils/ProjUtils';
import { nonNull } from '../../utils/tsutils';
import OffsetScale from '../OffsetScale';
import Coordinates from './Coordinates';
import CoordinateSystem from './CoordinateSystem';
const tmpXY = new Vector2();
const SIDE = {
  LEFT: 0,
  RIGHT: 1,
  BOTTOM: 2,
  TOP: 3
};
export function reasonnableEpsilonForCRS(crs, width, height) {
  if (crs.isEpsg(4326)) {
    return 0.01;
  }
  return 0.01 * Math.min(width, height);
}
const cardinals = [new Vector2(), new Vector2(), new Vector2(), new Vector2(), new Vector2(), new Vector2(), new Vector2(), new Vector2()];
/**
 * A rectangular extent in a specific {@link CoordinateSystem | coordinate system}.
 */
export class Extent {
  /**
   * Creates an extent from a coordinate system and a pair of coordinates.
   * @param crs - The coordinate system to use.
   * @param bottomLeft - The bottom-left corner of the extent.
   * @param topRight - The top-right corner of the extent.
   * @remarks Both coordinates must be in the same coordinate system as this extent.
   */

  /**
   * Creates an extent from an object containing the min/max XY values.
   * @param crs - The coordinate system to use.
   * @param values - The extent limits.
   */

  /**
   * Creates an extent from the min/max XY values.
   * @param crs - The coordinate system to use.
   * @param values - The extent limits.
   * @deprecated Due to ambiguity (not all coordinate systems are north-up), this constructor
   * should not be used.
   */

  /**
   * Creates an extent from the min/max XY values
   * @param crs - The coordinate system to use.
   * @param minX - The X coordinate of the left side of this extent.
   * @param maxX - The X coordinate of the righ side of this extent.
   * @param minY - The Y coordinate of the bottom side of this extent.
   * @param maxY - The Y coordinate of the top side of this extent.
   */

  constructor(crs, arg0, arg1, arg2, arg3) {
    this._values = new Float64Array(4);
    this._crs = crs;
    // @ts-expect-error type overload shenanigans
    this.set(crs, arg0, arg1, arg2, arg3);
  }

  /**
   * Returns an extent centered at the specified coordinate, and with the specified size.
   *
   * @param crs - The CRS identifier.
   * @param center - The center.
   * @param width - The width, in CRS units.
   * @param height - The height, in CRS units.
   * @returns The produced extent.
   */
  static fromCenterAndSize(crs, center, width, height) {
    const minX = center.x - width / 2;
    const maxX = center.x + width / 2;
    const minY = center.y - height / 2;
    const maxY = center.y + height / 2;
    return new Extent(crs, minX, maxX, minY, maxY);
  }

  /**
   * Returns the internal value array in this order: [minX, maxX, minY, maxY]
   */
  get values() {
    return this._values;
  }

  /**
   * Returns the coordinate of the location on the extent that matches U and V, where U and V
   * are normalized (in the range [0, 1]), and U = 0  and V = 0 are the bottom/left corner of
   * the extent, and U = 1 and V = 1 are to top right corner.
   * @param u - The normalized coordinate over the X-axis.
   * @param v - The normalized coordinate over the Y-axis.
   * @param target - The target to store the result. If unspecified, one will be created.
   * @returns The sampled coordinate.
   * @example
   * const extent = new Extent(CoordinateSystem.epsg4326, 0, 10, 0, 5);
   * // Get the bottom left corner
   * extent.sampleUV(0, 0)
   * // [0, 0]
   *
   * // Get the center
   * extent.sampleUV(0.5, 0.5)
   * // [5, 2.5]
   *
   * // Get the top right corner
   * extent.sampleUV(1, 1)
   * // [10, 5]
   */
  sampleUV(u, v, target) {
    const {
      width,
      height
    } = this.dimensions(tmpXY);
    const bottom = this.minY;
    const left = this.minX;
    const x = left + width * u;
    const y = bottom + height * v;
    if (target != null) {
      return target.set(this._crs, x, y);
    } else {
      return new Coordinates(this._crs, x, y);
    }
  }

  /**
   * Returns `true` if the two extents are equal.
   *
   * @param other - The extent to compare.
   * @param epsilon - The optional comparison epsilon.
   * @returns `true` if the extents are equal, otherwise `false`.
   */
  equals(other, epsilon = 0.00001) {
    return other._crs.equals(this._crs) && Math.abs(other._values[0] - this._values[0]) <= epsilon && Math.abs(other._values[1] - this._values[1]) <= epsilon && Math.abs(other._values[2] - this._values[2]) <= epsilon && Math.abs(other._values[3] - this._values[3]) <= epsilon;
  }

  /**
   * Checks the validity of the extent. Valid extents must not have infinite or NaN values.
   *
   * @returns `true` if the extent is valid, `false` otherwise.
   */
  isValid() {
    if (!(Number.isFinite(this.minX) && Number.isFinite(this.maxX) && Number.isFinite(this.minY) && Number.isFinite(this.maxY))) {
      return false;
    }

    // Geographic coordinate systems may allow a greater "west" than "east"
    // to account for the wrap around the 180° longitude line.
    if (!this.crs.isGeographic()) {
      if (this.minX > this.maxX) {
        return false;
      }
    }
    if (this.minY > this.maxY) {
      return false;
    }
    return true;
  }

  /**
   * Clones this object.
   *
   * @returns a copy of this object.
   */
  clone() {
    const minx = this._values[SIDE.LEFT];
    const maxx = this._values[SIDE.RIGHT];
    const miny = this._values[SIDE.BOTTOM];
    const maxy = this._values[SIDE.TOP];
    const result = new Extent(this._crs, minx, maxx, miny, maxy);
    return result;
  }

  /**
   * Returns an extent grown the specified relative margin.
   * The margin is relative to the width or height of the extent.
   *
   * @param marginRatio - The margin, in normalized value ([0, 1]).
   * A margin of 1 means 100% of the width or height of the extent.
   * @example
   * // Create an extent with a 10% margin applied:
   * const extent = new Extent(CoordinateSystem.epsg3857, 0, 100, 0, 100);
   * const margin = extent.withRelativeMargin(0.1);
   * //  new Extent(CoordinateSystem.epsg3857, -10, 110, -10, 110);
   * @returns a new extent with a specified margin applied.
   */
  withRelativeMargin(marginRatio) {
    const w = Math.abs(this.minX - this.maxX);
    const h = Math.abs(this.maxY - this.minY);
    return this.withMargin(marginRatio * w, marginRatio * h);
  }

  /**
   * Returns an extent grown or shrinked with the specified margin.
   * If the margin is positive, the new extent is bigger, and if the margin is negative the new extent is smaller.
   *
   * @param x - The horizontal margin, in CRS units.
   * @param y - The vertical margin, in CRS units.
   * @example
   * const extent = new Extent(CoordinateSystem.epsg3857, 0, 100, 0, 100);
   * const margin = extent.withMargin(10, 15);
   * //  new Extent(CoordinateSystem.epsg3857, -10, 110, -15, 115);
   * @returns a new extent with a specified margin applied.
   */
  withMargin(x, y) {
    const w = this.minX - x;
    const e = this.maxX + x;
    const n = this.maxY + y;
    const s = this.minY - y;
    return new Extent(this.crs, w, e, s, n);
  }

  /**
   * Converts this extent into another CRS.
   * If `crs` is the same as the current CRS, the original object is returned.
   *
   * @param crs - the new CRS
   * @returns the converted extent.
   * @example
   * const original = new Extent(CoordinateSystem.epsg4326, -5, 5, -5, 5);
   * const transformed = original.as(CoordinateSystem.epsg3857);
   * // [-556597.4539663679, 556597.4539663679, -557305.2572745769, 557305.2572745753]
   */
  as(crs) {
    if (!this._crs.equals(crs) && !(this._crs.isEpsg(4326) && crs.isEpsg(4326))) {
      // Compute min/max in x/y by projecting 8 cardinal points,
      // and then taking the min/max of each coordinates.
      const c = this.centerAsVector2(tmpXY);
      const cx = c.x;
      const cy = c.y;
      const e = this.maxX;
      const w = this.minX;
      const n = this.maxY;
      const s = this.minY;
      cardinals[0].set(w, n);
      cardinals[1].set(cx, n);
      cardinals[2].set(e, n);
      cardinals[3].set(e, cy);
      cardinals[4].set(e, s);
      cardinals[5].set(cx, s);
      cardinals[6].set(w, s);
      cardinals[7].set(w, cy);
      let north = -Infinity;
      let south = Infinity;
      let east = -Infinity;
      let west = Infinity;

      // convert the coordinates
      ProjUtils.transformVectors(this._crs, crs, cardinals);

      // loop over the coordinates
      for (let i = 0; i < cardinals.length; i++) {
        north = Math.max(north, cardinals[i].y);
        south = Math.min(south, cardinals[i].y);
        east = Math.max(east, cardinals[i].x);
        west = Math.min(west, cardinals[i].x);
      }
      return new Extent(crs, {
        north,
        south,
        east,
        west
      });
    }
    return this;
  }
  offsetToParent(other, target = new OffsetScale()) {
    if (!this.crs.equals(other.crs)) {
      throw new Error('unsupported mix');
    }
    const oDim = other.dimensions();
    const dim = this.dimensions();
    const originX = Math.round(1000 * (this.minX - other.minX) / oDim.x) * 0.001;
    const originY = Math.round(1000 * (this.minY - other.minY) / oDim.y) * 0.001;
    const scaleX = Math.round(1000 * dim.x / oDim.x) * 0.001;
    const scaleY = Math.round(1000 * dim.y / oDim.y) * 0.001;
    return target.set(originX, originY, scaleX, scaleY);
  }

  /**
   * @returns the horizontal coordinate of the westernmost side
   * @deprecated Use {@link minX} instead.
   */
  get west() {
    return this.minX;
  }

  /**
   * The minimum X value of this extent (the X coordinate of the left side).
   */
  get minX() {
    return this._values[SIDE.LEFT];
  }

  /**
   * @returns the horizontal coordinate of the easternmost side
   * @deprecated Use {@link maxX} instead.
   */
  get east() {
    return this.maxX;
  }

  /**
   * The maximum X value of this extent (the X coordinate of the right side).
   */
  get maxX() {
    return this._values[SIDE.RIGHT];
  }

  /**
   * @returns the vertical coordinate of the northernmost side
   * @deprecated Use {@link maxY} instead.
   */
  get north() {
    return this.maxY;
  }

  /**
   * The maximum Y value of this extent (the Y coordinate of the top side).
   */
  get maxY() {
    return this._values[SIDE.TOP];
  }

  /**
   * @returns the horizontal coordinate of the southermost side
   * @deprecated Use {@link minY} instead.
   */
  get south() {
    return this.minY;
  }

  /**
   * The minimum Y value of this extent (the Y coordinate of the bottom side).
   */
  get minY() {
    return this._values[SIDE.BOTTOM];
  }

  /**
   * @returns the coordinates of the top left corner
   */
  topLeft() {
    return new Coordinates(this.crs, this.minX, this.maxY, 0);
  }

  /**
   * @returns the coordinates of the top right corner
   */
  topRight() {
    return new Coordinates(this.crs, this.maxX, this.maxY, 0);
  }

  /**
   * @returns the coordinates of the bottom right corner
   */
  bottomRight() {
    return new Coordinates(this.crs, this.maxX, this.minY, 0);
  }

  /**
   * @returns the coordinates of the bottom right corner
   */
  bottomLeft() {
    return new Coordinates(this.crs, this.minX, this.minY, 0);
  }

  /**
   * Gets the coordinate reference system of this extent.
   */
  get crs() {
    return this._crs;
  }

  /**
   * Sets `target` with the center of this extent.
   *
   * @param target - the coordinate to set with the center's coordinates.
   * If none provided, a new one is created.
   * @returns the modified object passed in argument.
   */
  center(target) {
    const center = this.centerAsVector2(tmpXY);
    let result;
    if (target) {
      result = target;
      result.set(this._crs, center.x, center.y, 0);
    } else {
      result = new Coordinates(this._crs, center.x, center.y, 0);
    }
    return result;
  }

  /**
   * Sets `target` with the center of this extent.
   *
   * @param target - the vector to set with the center's coordinates.
   * If none provided, a new one is created.
   * @returns the modified object passed in argument.
   */
  centerAsVector2(target) {
    const dim = this.dimensions(tmpXY);
    const x = this._values[0] + dim.x * 0.5;
    const y = this._values[2] + dim.y * 0.5;
    let result;
    if (target) {
      result = target;
      result.set(x, y);
    } else {
      result = new Vector2(x, y);
    }
    return result;
  }

  /**
   * Sets `target` with the center of this extent.
   * Note: The z coordinate of the resulting vector will be set to zero.
   *
   * @param target - the vector to set with the center's coordinates.
   * If none provided, a new one is created.
   * @returns the modified object passed in argument.
   */
  centerAsVector3(target) {
    const center = this.centerAsVector2(tmpXY);
    let result;
    if (target) {
      result = target;
      result.set(center.x, center.y, 0);
    } else {
      result = new Vector3(center.x, center.y, 0);
    }
    return result;
  }
  getQuadrant(x, y) {
    const dims = this.dimensions(tmpXY);
    const midX = this.west + dims.width / 2;
    const midY = this.south + dims.height / 2;
    if (x < midX) {
      if (y < midY) {
        return 0;
      }
      return 1;
    } else {
      if (y < midY) {
        return 3;
      }
      return 2;
    }
  }

  /**
   * Sets the target with the width and height of this extent.
   * The `x` property will be set with the width,
   * and the `y` property will be set with the height.
   *
   * @param target - the optional target to set with the result.
   * @returns the modified object passed in argument,
   * or a new object if none was provided.
   */
  dimensions(target = new Vector2()) {
    target.x = Math.abs(this.maxX - this.minX);
    target.y = Math.abs(this.maxY - this.minY);
    return target;
  }

  /**
   * Checks whether the specified coordinate is inside this extent.
   *
   * @param coord - the coordinate to test
   * @param epsilon - the precision delta (+/- epsilon)
   * @returns `true` if the coordinate is inside the bounding box
   */
  isPointInside(coord, epsilon = 0) {
    const c = this.crs.equals(coord.crs) ? coord : coord.as(this.crs);
    // TODO this ignores altitude
    if (this.crs.isGeographic()) {
      return c.longitude <= this.maxX + epsilon && c.longitude >= this.minX - epsilon && c.latitude <= this.maxY + epsilon && c.latitude >= this.minY - epsilon;
    }
    return this.isXYInside(c.x, c.y, epsilon);
  }
  isXYInside(x, y, epsilon = 0) {
    return x <= this.maxX + epsilon && x >= this.minX - epsilon && y <= this.maxY + epsilon && y >= this.minY - epsilon;
  }

  /**
   * Tests whether this extent is contained in another extent.
   *
   * @param other - the other extent to test
   * @param epsilon - the precision delta (+/- epsilon).
   * If this value is not provided, a reasonable epsilon will be computed.
   * @returns `true` if this extent is contained in the other extent.
   */
  isInside(other, epsilon = null) {
    const o = other.as(this._crs);
    // 0 is an acceptable value for epsilon:
    const dims = this.dimensions(tmpXY);
    epsilon = epsilon == null ? reasonnableEpsilonForCRS(this._crs, dims.x, dims.y) : epsilon;
    return this.maxX - o.maxX <= epsilon && o.minX - this.minX <= epsilon && this.maxY - o.maxY <= epsilon && o.minY - this.minY <= epsilon;
  }

  /**
   * Tests whether this extent contains entirely another extent.
   *
   * @param other - the other extent to test
   * @param epsilon - the precision delta (+/- epsilon).
   * If this value is not provided, a reasonable epsilon will be computed.
   * @returns `true` if this extent contains the other extent.
   */
  contains(other, epsilon = null) {
    return other.isInside(this, epsilon);
  }

  /**
   * Returns `true` if this extent intersects with the specified extent.
   *
   * @param bbox - the extent to test
   * @returns `true` if this extent intersects with the provided extent, `false` otherwise.
   */
  intersectsExtent(bbox) {
    const other = bbox.as(this.crs);
    return !(this.minX >= other.maxX || this.maxX <= other.minX || this.minY >= other.maxY || this.maxY <= other.minY);
  }

  /**
   * Set this extent to the intersection of itself and other
   *
   * @param other - the bounding box to intersect
   * @returns the modified extent
   */
  intersect(other) {
    if (!this.intersectsExtent(other)) {
      this.set(this.crs, 0, 0, 0, 0);
      return this;
    }
    if (!other.crs.equals(this.crs)) {
      other = other.as(this.crs);
    }
    this.set(this.crs, Math.max(this.minX, other.minX), Math.min(this.maxX, other.maxX), Math.max(this.minY, other.minY), Math.min(this.maxY, other.maxY));
    return this;
  }

  /**
   * Returns an extent that is adjusted so that its edges land exactly at the border
   * of the grid pixels. Optionally, you can specify the minimum pixel size of the
   * resulting extent.
   *
   * @param gridExtent - The grid extent.
   * @param gridWidth - The grid width, in pixels.
   * @param gridHeight - The grid height, in pixels.
   * @param minPixWidth - The minimum width, in pixels, of the resulting extent.
   * @param minPixHeight - The minimum height, in pixels, of the resulting extent.
   * @returns The adjusted extent and pixel
   * size of the adjusted extent.
   */
  fitToGrid(gridExtent, gridWidth, gridHeight, minPixWidth, minPixHeight) {
    const gridDims = gridExtent.dimensions(tmpXY);
    const pixelWidth = gridDims.x / gridWidth;
    const pixelHeight = gridDims.y / gridHeight;
    let leftPixels = Math.floor((this.minX - gridExtent.minX) / pixelWidth);
    let rightPixels = Math.ceil((this.maxX - gridExtent.minX) / pixelWidth);
    let bottomPixels = Math.floor((this.minY - gridExtent.minY) / pixelHeight);
    let topPixels = Math.ceil((this.maxY - gridExtent.minY) / pixelHeight);
    if (minPixWidth !== undefined && minPixHeight !== undefined) {
      const pixelCountX = rightPixels - leftPixels;
      const pixelCountY = topPixels - bottomPixels;
      if (pixelCountX < minPixWidth) {
        const margin = (minPixWidth - pixelCountX) / 2;
        leftPixels -= margin;
        rightPixels += margin;
      }
      if (pixelCountY < minPixHeight) {
        const margin = (minPixHeight - pixelCountY) / 2;
        bottomPixels -= margin;
        topPixels += margin;
      }
    }
    leftPixels = Math.max(0, Math.floor(leftPixels));
    rightPixels = Math.min(gridWidth, Math.ceil(rightPixels));
    bottomPixels = Math.max(0, Math.floor(bottomPixels));
    topPixels = Math.min(gridHeight, Math.ceil(topPixels));
    const west = gridExtent.minX + leftPixels * pixelWidth;
    const east = gridExtent.minX + rightPixels * pixelWidth;
    const south = gridExtent.minY + bottomPixels * pixelHeight;
    const north = gridExtent.minY + topPixels * pixelHeight;
    return {
      extent: new Extent(this.crs, west, east, south, north),
      width: rightPixels - leftPixels,
      height: topPixels - bottomPixels
    };
  }

  /**
   * Sets the values of this extent from a coordinate system and a pair of coordinates.
   * @param crs - The coordinate system to use.
   * @param bottomLeft - The bottom-left corner of the extent.
   * @param topRight - The top-right corner of the extent.
   * @remarks Both coordinates must be in the same coordinate system as this extent.
   */

  /**
   * Sets the values of this extent from an object containing the min/max XY values.
   * @param crs - The coordinate system to use.
   * @param values - The extent limits.
   */

  /**
   * Sets the values of this extent from the min/max XY values.
   * @param crs - The coordinate system to use.
   * @param values - The extent limits.
   * @deprecated Due to ambiguity (not all coordinate systems are north-up), this constructor
   * should not be used.
   */

  /**
   * Sets the values of this extent from the min/max XY values
   * @param crs - The coordinate system to use.
   * @param minX - The X coordinate of the left side of this extent.
   * @param maxX - The X coordinate of the righ side of this extent.
   * @param minY - The Y coordinate of the bottom side of this extent.
   * @param maxY - The Y coordinate of the top side of this extent.
   */

  set(crs, arg0, arg1, arg2, arg3) {
    this._crs = crs;
    if (isCoordinates(arg0) && isCoordinates(arg1)) {
      [this._values[SIDE.LEFT], this._values[SIDE.BOTTOM]] = arg0.values;
      [this._values[SIDE.RIGHT], this._values[SIDE.TOP]] = arg1.values;
    } else if (typeof arg0 === 'object') {
      const obj = arg0;
      if ('west' in obj && 'east' in obj && 'south' in obj && 'north' in obj) {
        // deprecated code path
        this._values[SIDE.LEFT] = obj.west;
        this._values[SIDE.RIGHT] = obj.east;
        this._values[SIDE.BOTTOM] = obj.south;
        this._values[SIDE.TOP] = obj.north;
      } else if ('minX' in obj && 'maxX' in obj && 'minY' in obj && 'maxY' in obj) {
        this._values[SIDE.LEFT] = obj.minX;
        this._values[SIDE.RIGHT] = obj.maxX;
        this._values[SIDE.BOTTOM] = obj.minY;
        this._values[SIDE.TOP] = obj.maxY;
      }
    } else if (typeof arg0 === 'number' && typeof arg1 === 'number' && typeof arg2 === 'number' && typeof arg3 === 'number') {
      this._values[SIDE.LEFT] = arg0;
      this._values[SIDE.RIGHT] = arg1;
      this._values[SIDE.BOTTOM] = arg2;
      this._values[SIDE.TOP] = arg3;
    } else {
      throw new Error(`Unsupported constructor args`);
    }
    return this;
  }
  copy(other) {
    this._crs = other.crs;
    this._values[SIDE.LEFT] = other._values[SIDE.LEFT];
    this._values[SIDE.RIGHT] = other._values[SIDE.RIGHT];
    this._values[SIDE.BOTTOM] = other._values[SIDE.BOTTOM];
    this._values[SIDE.TOP] = other._values[SIDE.TOP];
    return this;
  }

  /** @internal */
  static unionMany(...extents) {
    if (extents == null || extents.length === 0) {
      return null;
    }
    if (extents.length === 1) {
      return extents[0].clone();
    }
    let south = +Infinity;
    let north = -Infinity;
    let east = -Infinity;
    let west = +Infinity;
    let valid = false;
    let crs = null;
    for (let i = 0; i < extents.length; i++) {
      const e = nonNull(extents[i]);
      valid = true;
      if (crs != null) {
        if (!crs.equals(e.crs)) {
          throw new Error(`Unsupported union between different CRSes (${e.crs.id} and ${crs.id} differ)`);
        }
      } else {
        crs = e.crs;
      }
      south = Math.min(e.minY, south);
      north = Math.max(e.maxY, north);
      east = Math.max(e.maxX, east);
      west = Math.min(e.minX, west);
    }
    if (valid) {
      return new Extent(extents[0].crs, west, east, south, north);
    } else {
      return null;
    }
  }
  union(extent) {
    if (extent == null) {
      return;
    }
    if (!extent.crs.equals(this.crs)) {
      throw new Error(`unsupported union between different CRSes (${extent.crs.id} and ${this.crs.id} differ)`);
    }
    const west = extent.minX;
    if (west < this.minX) {
      this._values[SIDE.LEFT] = west;
    }
    const east = extent.maxX;
    if (east > this.maxX) {
      this._values[SIDE.RIGHT] = east;
    }
    const south = extent.minY;
    if (south < this.minY) {
      this._values[SIDE.BOTTOM] = south;
    }
    const north = extent.maxY;
    if (north > this.maxY) {
      this._values[SIDE.TOP] = north;
    }
  }

  /**
   * Expands the extent to contain the specified coordinates.
   *
   * @param coordinates - The coordinates to include
   */
  expandByPoint(coordinates) {
    const coords = coordinates.as(this.crs);
    const we = coords.values[0];
    if (we < this.minX) {
      this._values[SIDE.LEFT] = we;
    }
    if (we > this.maxX) {
      this._values[SIDE.RIGHT] = we;
    }
    const sn = coords.values[1];
    if (sn < this.minY) {
      this._values[SIDE.BOTTOM] = sn;
    }
    if (sn > this.maxY) {
      this._values[SIDE.TOP] = sn;
    }
    return this;
  }

  /**
   * Moves the extent by the provided `x` and `y` values.
   *
   * @param x - the horizontal shift
   * @param y - the vertical shift
   * @returns the modified extent.
   */
  shift(x, y) {
    this._values[SIDE.LEFT] += x;
    this._values[SIDE.RIGHT] += x;
    this._values[SIDE.BOTTOM] += y;
    this._values[SIDE.TOP] += y;
    return this;
  }

  /**
   * Constructs an extent from the specified box.
   *
   * @param crs - the coordinate reference system of the new extent.
   * @param box - the box to read values from
   * @returns the constructed extent.
   */
  static fromBox3(crs, box) {
    return new Extent(crs, {
      west: box.min.x,
      east: box.max.x,
      south: box.min.y,
      north: box.max.y
    });
  }

  /**
   * Returns a [Box3](https://threejs.org/docs/?q=box3#api/en/math/Box3) that matches this extent.
   *
   * @param minHeight - The min height of the box.
   * @param maxHeight - The max height of the box.
   * @returns The box.
   */
  toBox3(minHeight, maxHeight) {
    const min = new Vector3(this.minX, this.minY, minHeight);
    const max = new Vector3(this.maxX, this.maxY, maxHeight);
    const box = new Box3(min, max);
    return box;
  }

  /**
   * Returns the normalized offset from bottom-left in extent of this Coordinates
   *
   * @param coordinate - the coordinate
   * @param target - optional `Vector2` target.
   * If not present a new one will be created.
   * @returns normalized offset in extent
   * @example
   * extent.offsetInExtent(extent.center())
   * // returns `(0.5, 0.5)`.
   */
  offsetInExtent(coordinate, target = new Vector2()) {
    if (!coordinate.crs.equals(this.crs)) {
      throw new Error('unsupported mix');
    }
    const dimX = Math.abs(this.maxX - this.minX);
    const dimY = Math.abs(this.maxY - this.minY);
    const isGeographic = coordinate.crs.isGeographic();
    const x = isGeographic ? coordinate.longitude : coordinate.x;
    const y = isGeographic ? coordinate.latitude : coordinate.y;
    const originX = (x - this.minX) / dimX;
    const originY = (y - this.minY) / dimY;
    target.set(originX, originY);
    return target;
  }

  /**
   * Divides this extent into a regular grid.
   * The number of points in each direction is equal to the number of subdivisions + 1.
   * The points are laid out row-wise, from west to east, and north to south:
   *
   * ```
   * 1 -- 2
   * |    |
   * 3 -- 4
   * ```
   *
   * @param xSubdivs - The number of grid subdivisions in the x-axis.
   * @param ySubdivs - The number of grid subdivisions in the y-axis.
   * @param target - The array to fill.
   * @param stride - The number of elements per item (2 for XY, 3 for XYZ).
   * @returns the target.
   */
  toGrid(xSubdivs, ySubdivs, target, stride) {
    const dims = this.dimensions(tmpXY);
    const west = this.minX;
    const north = this.maxY;

    // The size of an horizontal/vertical step
    const xStep = dims.x / xSubdivs;
    const yStep = dims.y / ySubdivs;

    // The number of vertices in each direction
    const xCount = xSubdivs + 1;
    for (let j = 0; j < ySubdivs + 1; j++) {
      for (let i = 0; i < xCount; i++) {
        const x = west + xStep * i;
        const y = north - yStep * j;
        const index = stride * (xCount * j + i);
        target[index + 0] = x;
        target[index + 1] = y;
      }
    }
    return target;
  }

  /**
   * Subdivides this extents into x and y subdivisions.
   *
   * Notes:
   * - Subdivisions must be strictly positive.
   * - If both subvisions are `1`, an array of one element is returned,
   *  containing a copy of this extent.
   *
   * @param xSubdivs - The number of subdivisions on the X/longitude axis.
   * @param ySubdivs - The number of subdivisions on the Y/latitude axis.
   * @returns the resulting extents.
   * @example
   * const extent = new Extent(CoordinateSystem.epsg3857, 0, 100, 0, 100);
   * extent.split(2, 1);
   * // [0, 50, 0, 50], [50, 100, 50, 100]
   */
  split(xSubdivs, ySubdivs) {
    if (xSubdivs < 1 || ySubdivs < 1) {
      throw new Error('Invalid subdivisions. Must be strictly positive.');
    }
    if (xSubdivs === 1 && ySubdivs === 1) {
      return [this.clone()];
    }
    const dims = this.dimensions();
    const minX = this.minX;
    const minY = this.minY;
    const w = dims.x / xSubdivs;
    const h = dims.y / ySubdivs;
    const crs = this.crs;
    const result = [];
    for (let x = 0; x < xSubdivs; x++) {
      for (let y = 0; y < ySubdivs; y++) {
        const west = minX + x * w;
        const south = minY + y * h;
        const extent = new Extent(crs, west, west + w, south, south + h);
        result.push(extent);
      }
    }
    return result;
  }

  /**
   * The bounds of the Web Mercator (EPSG:3857) projection.
   */
  static get webMercator() {
    return new Extent(CoordinateSystem.epsg3857, -20037508.34, 20037508.34, -20048966.1, 20048966.1);
  }

  /**
   * The bounds of the whole world in the EPSG:4326 projection.
   *
   * @example
   * const bounds = Extent.WGS84;
   * // [-180, 180, -90, 90]
   */
  static get WGS84() {
    return new Extent(CoordinateSystem.epsg4326, -180, 180, -90, 90);
  }

  /**
   * The bounds of the whole sphere in the `'equirectangular'` projection.
   */
  static get fullEquirectangularProjection() {
    // Note that those are the same values as WGS84.
    // However, since panoramic images are not georeferenced,
    // speaking about WGS84 makes no sense.
    return new Extent(CoordinateSystem.equirectangular, -180, 180, -90, 90);
  }

  /**
   * Creates an extent from parameters of a photosphere in the `'equirectangular'` projection for the given image parameters.
   * See [the Google Street View documentation](https://developers.google.com/streetview/spherical-metadata) for additional information.
   * @param params - The parameters of the image. If undefined, then it returns the extent
   * for the full sphere equivalent to {@link fullEquirectangularProjection}
   * @returns The extent of the image in the `'equirectangular'` projection.
   */
  static fromPhotosphere(params) {
    if (params == null) {
      return Extent.fullEquirectangularProjection;
    }
    const west = 360 * (params.croppedAreaLeftPixels / params.fullPanoImageWidthPixels) - 180;
    const north = 90 - 180 * (params.croppedAreaTopPixels / params.fullPanoImageHeightPixels);
    const south = north - 180 * (params.croppedAreaImageHeightPixels / params.fullPanoImageHeightPixels);
    const east = west + 360 * (params.croppedAreaImageWidthPixels / params.fullPanoImageWidthPixels);
    return new Extent(CoordinateSystem.equirectangular, {
      west,
      east,
      south,
      north
    });
  }
}
export default Extent;
export function isCoordinates(obj) {
  return obj != null && obj.isCoordinates === true;
}