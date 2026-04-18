/*
 * Copyright (c) 2015-2018, IGN France.
 * Copyright (c) 2018-2026, Giro3D team.
 * SPDX-License-Identifier: MIT
 */

import { getCenter } from 'ol/extent';
import { LineString, MultiLineString, MultiPolygon, Polygon } from 'ol/geom';
import { Box3, Group, Sphere, Vector3 } from 'three';
import { mapGeometry } from '../core/FeatureTypes';
import { isElevationLayer } from '../core/layer/ElevationLayer';
import EntityInspector from '../gui/EntityInspector';
import EntityPanel from '../gui/EntityPanel';
import GeometryConverter from '../renderer/geometries/GeometryConverter';
import { isLineStringMesh } from '../renderer/geometries/LineStringMesh';
import { isMultiPolygonMesh } from '../renderer/geometries/MultiPolygonMesh';
import { isPointMesh } from '../renderer/geometries/PointMesh';
import { isPolygonMesh } from '../renderer/geometries/PolygonMesh';
import { isSimpleGeometryMesh } from '../renderer/geometries/SimpleGeometryMesh';
import { isSurfaceMesh } from '../renderer/geometries/SurfaceMesh';
import { computeDistanceToFitSphere, computeZoomToFitSphere } from '../renderer/View';
import OLUtils from '../utils/OpenLayersUtils';
import { isOrthographicCamera, isPerspectiveCamera } from '../utils/predicates';
import { nonNull } from '../utils/tsutils';
import Entity3D from './Entity3D';
const tmpSphere = new Sphere();

/**
 * Map-like object to drape features onto.
 */

/**
 * How the geometry should be draped on the terrain:
 * - `per-feature`: the same elevation offset is applied to the entire feature.
 * Suitable for level geometries, such as buildings, lakes, etc.
 * - `per-vertex`: the elevation is applied to each vertex independently. Suitable for
 * lines that must follow the terrain, such as roads.
 * - `none`: no draping is done, the elevation of the feature is used as is. Suitable for
 * geometries that should not be draped on the terrain, such as flight paths or flying objects,
 * or for 3D geometries that already have a vertical elevation.
 *
 * Note: that `Point` geometries, having only one coordinate, will automatically use the `per-feature` mode.
 */

/**
 * A function to determine the {@link DrapingMode} for each feature.
 */

/**
 * Either returns the same geometry if it already has a XYZ layout, or create an equivalent geometry in the XYZ layout.
 */
function cloneAsXYZIfRequired(geometry) {
  if (geometry.getLayout() === 'XYZ') {
    // No need to clone.
    return geometry;
  }
  const stride = geometry.getStride();
  const vertexCount = geometry.getFlatCoordinates().length / stride;
  const flat = new Array(vertexCount * 3);
  switch (geometry.getType()) {
    case 'LineString':
      return new LineString(flat, 'XYZ');
    case 'Polygon':
      {
        const ends = geometry.getEnds().map(end => end / stride * 3);
        return new Polygon(flat, 'XYZ', ends);
      }
    case 'MultiLineString':
      {
        const ends = geometry.getEnds().map(end => end / stride * 3);
        return new MultiLineString(flat, 'XYZ', ends);
      }
    case 'MultiPolygon':
      {
        const endss = geometry.getEndss().map(ends => ends.map(end => end / stride * 3));
        return new MultiPolygon(flat, 'XYZ', endss);
      }
  }
  throw new Error();
}
function getRootMesh(obj) {
  let current = obj;
  while (isSimpleGeometryMesh(current.parent)) {
    current = current.parent;
  }
  if (isSimpleGeometryMesh(current)) {
    return current;
  }
  return null;
}
function getFeatureElevation(geometry, provider) {
  let center;
  if (geometry.getType() === 'Point') {
    center = geometry.getCoordinates();
  } else if (geometry.getType() === 'Circle') {
    center = geometry.getCenter();
  } else {
    center = getCenter(geometry.getExtent());
  }
  const [x, y] = center;
  const sample = provider.getElevationFast(x, y);
  return sample?.elevation ?? 0;
}
function isGeometrySupported(g) {
  switch (g.getType()) {
    case 'Point':
    case 'LineString':
    case 'Polygon':
    case 'MultiPoint':
    case 'MultiLineString':
    case 'MultiPolygon':
      return true;
    default:
      return false;
  }
}
function applyPerVertexDraping(geometry, provider) {
  const coordinates = geometry.getFlatCoordinates();
  const stride = geometry.getStride();

  // We have to possibly clone the geometry because OpenLayers does
  // not allow changing the layout of an existing geometry, leading to issues.
  const clone = cloneAsXYZIfRequired(geometry.clone());
  const coordinateCount = coordinates.length / stride;
  const xyz = new Array(coordinateCount * 3);
  let k = 0;
  for (let i = 0; i < coordinates.length; i += stride) {
    const x = coordinates[i + 0];
    const y = coordinates[i + 1];
    const sample = provider.getElevationFast(x, y);
    const z = sample?.elevation ?? 0;
    xyz[k + 0] = x;
    xyz[k + 1] = y;
    xyz[k + 2] = z;
    k += 3;
  }
  clone.setFlatCoordinates('XYZ', xyz);
  return clone;
}
function getStableFeatureId(feature) {
  const existing = feature.getId();
  if (existing != null) {
    return existing.toString();
  }
  const fid = feature.get('fid');
  if (fid != null) {
    return `${fid}`;
  }
  throw new Error('not implemented');
}
/**
 * Loads 3D features from a {@link FeatureSource} and displays them on top
 * of a map or map-like entity, by taking terrain into account.
 *
 * To drape features on custom entities, they must implement the {@link MapLike} interface.
 *
 * ## Performance warning
 *
 * This entity is experimental and might suffer performance issues when loading many features.
 * Notably be careful when setting the {@link minLod} value. If this value is too low, this could cause
 * many features to be loaded (especially when used with streamed data, such as WFS servers).
 *
 * It is recommended to experiment with a high `minLod` value then decrease it progressively.
 *
 * @experimental
 */
export default class DrapedFeatureCollection extends Entity3D {
  type = 'DrapedFeatureCollection';
  isDrapedFeatureCollection = true;
  _map = null;
  _activeTiles = new Map();
  _objectOptions = {
    castShadow: false,
    receiveShadow: false
  };
  _features = new Map();
  get loadedFeatures() {
    return this._features.size;
  }
  _shouldCleanup = false;
  _sortedTiles = null;
  _minLod = 0;

  /**
   * The minimum tile LOD (level of detail) to display the features.
   * If zero, then features are always displayed, since root tiles have LOD zero.
   */
  get minLod() {
    return this._minLod;
  }
  set minLod(v) {
    this._minLod = v >= 0 ? v : 0;
  }
  constructor(options) {
    super(new Group());
    this._drapingMode = options.drapingMode ?? 'per-vertex';
    this._extrusionCallback = options.extrusionOffset;
    this._source = options.source;
    this._style = options.style;
    this._minLod = options.minLod ?? this._minLod;
    this._eventHandlers = {
      onTileCreated: this.onTileCreated.bind(this),
      onTileDeleted: this.onTileDeleted.bind(this),
      onElevationLoaded: this.onElevationLoaded.bind(this),
      onTextureLoaded: this.notifyChange.bind(this),
      onSourceUpdated: this.onSourceUpdated.bind(this),
      onLayerAdded: this.onLayerAdded.bind(this),
      onLayerRemoved: this.onLayerRemoved.bind(this),
      onLayerVisibilityChanged: this.onLayerVisibilityChanged.bind(this)
    };
    this._geometryConverter = new GeometryConverter({
      shadedSurfaceMaterialGenerator: options.shadedSurfaceMaterialGenerator,
      unshadedSurfaceMaterialGenerator: options.unshadedSurfaceMaterialGenerator,
      lineMaterialGenerator: options.lineMaterialGenerator,
      pointMaterialGenerator: options.pointMaterialGenerator
    });
    this._geometryConverter.addEventListener('texture-loaded', this._eventHandlers.onTextureLoaded);
    this._source.addEventListener('updated', this._eventHandlers.onSourceUpdated);
  }
  traverseGeometries(callback) {
    this.traverse(obj => {
      if (isSimpleGeometryMesh(obj)) {
        callback(obj);
      }
    });
  }

  /**
   * Updates the styles of the  given objects, or all objects if unspecified.
   * @param objects - The objects to update.
   */
  updateStyles(objects) {
    if (objects != null) {
      objects.forEach(obj => {
        if (obj.userData.parentEntity === this) {
          this.updateStyle(getRootMesh(obj));
        }
      });
    } else {
      this._features.forEach(v => {
        if (v.mesh) {
          this.updateStyle(v.mesh);
        }
      });
    }

    // Make sure new materials have the correct opacity
    this.updateOpacity();
    this.notifyChange(this);
  }
  updateStyle(obj) {
    if (!obj) {
      return;
    }
    const feature = obj.userData.feature;
    const style = this.getStyle(feature);
    const commonOptions = {
      origin: obj.geometryOrigin
    };
    switch (obj.type) {
      case 'PointMesh':
        this._geometryConverter.updatePointMesh(obj, {
          ...commonOptions,
          ...style?.point
        });
        break;
      case 'PolygonMesh':
      case 'MultiPolygonMesh':
        {
          const extrusionOffset = this.getExtrusionOffset(feature);
          const options = {
            ...commonOptions,
            ...style,
            extrusionOffset
          };
          if (isPolygonMesh(obj)) {
            this._geometryConverter.updatePolygonMesh(obj, options);
          } else if (isMultiPolygonMesh(obj)) {
            this._geometryConverter.updateMultiPolygonMesh(obj, options);
          }
        }
        break;
      case 'LineStringMesh':
        this._geometryConverter.updateLineStringMesh(obj, {
          ...commonOptions,
          ...style?.stroke
        });
        break;
      case 'MultiLineStringMesh':
        this._geometryConverter.updateMultiLineStringMesh(obj, {
          ...commonOptions,
          ...style?.stroke
        });
        break;
    }

    // Since changing the style of the feature might create additional objects,
    // we have to use this method again.
    this.prepare(obj, feature, style);
  }
  updateObjectOption(key, value) {
    if (this._objectOptions[key] !== value) {
      this._objectOptions[key] = value;
      this.traverseGeometries(mesh => {
        mesh.traverse(obj => {
          obj.castShadow = this._objectOptions.castShadow;
          obj.receiveShadow = this._objectOptions.receiveShadow;
        });
      });
      this.notifyChange(this);
    }
  }

  /**
   * Toggles the `.castShadow` property on objects generated by this entity.
   *
   * Note: shadow maps require normal attributes on objects.
   */
  get castShadow() {
    return this._objectOptions.castShadow;
  }
  set castShadow(v) {
    this.updateObjectOption('castShadow', v);
  }

  /**
   * Toggles the `.receiveShadow` property on objects generated by this entity.
   *
   * Note: shadow maps require normal attributes on objects.
   */
  get receiveShadow() {
    return this._objectOptions.receiveShadow;
  }
  set receiveShadow(v) {
    this.updateObjectOption('receiveShadow', v);
  }
  onSourceUpdated() {
    this._features.forEach(v => {
      v.mesh?.dispose();
      v.mesh?.removeFromParent();
    });
    this._features.clear();
    for (const tile of [...this._activeTiles.values()]) {
      this.registerTile(tile, true);
    }
  }
  async preprocess() {
    await this._source.initialize({
      targetCoordinateSystem: this.instance.coordinateSystem
    });
  }

  /**
   * Sets the draping target.
   */
  attach(map) {
    if (this._map != null) {
      throw new Error('a map is already attached to this entity');
    }
    this._map = map;
    map.addEventListener('tile-created', this._eventHandlers.onTileCreated);
    map.addEventListener('tile-deleted', this._eventHandlers.onTileDeleted);
    map.addEventListener('elevation-loaded', this._eventHandlers.onElevationLoaded);
    map.addEventListener('layer-added', this._eventHandlers.onLayerAdded);
    map.addEventListener('layer-removed', this._eventHandlers.onLayerRemoved);
    map.addEventListener('layer-visibility-changed', this._eventHandlers.onLayerVisibilityChanged);
    map.traverseTiles(tile => {
      this.registerTile(tile);
    });
    return this;
  }
  getSortedTiles() {
    if (this._sortedTiles == null) {
      this._sortedTiles = [...this._activeTiles.values()];
      this._sortedTiles.sort((t0, t1) => t0.lod - t1.lod);
    }
    return this._sortedTiles;
  }
  detach() {
    if (this._map == null) {
      throw new Error('no map is attached to this entity');
    }
    this._map.removeEventListener('tile-created', this._eventHandlers.onTileCreated);
    this._map.removeEventListener('tile-deleted', this._eventHandlers.onTileDeleted);
    this._map.removeEventListener('elevation-loaded', this._eventHandlers.onElevationLoaded);
    this._map.traverseTiles(tile => {
      this.unregisterTile(tile);
    });
    this._map = null;
    return this;
  }
  updateVisibility() {
    super.updateVisibility();
    if (this.visible) {
      this.registerAllTiles();
    }
  }
  onLayerAdded({
    layer
  }) {
    if (isElevationLayer(layer)) {
      this.registerAllTiles(true);
    }
  }
  onLayerRemoved({
    layer
  }) {
    if (isElevationLayer(layer)) {
      this.registerAllTiles(true);
    }
  }
  onLayerVisibilityChanged({
    layer
  }) {
    if (isElevationLayer(layer)) {
      this.registerAllTiles(true);
    }
  }
  onTileCreated({
    tile
  }) {
    this.registerTile(tile);
  }
  onTileDeleted({
    tile
  }) {
    this.unregisterTile(tile);
  }
  onElevationLoaded({
    tile
  }) {
    this.registerTile(tile, true);
  }
  registerAllTiles(forceRecreateMeshes = false) {
    if (this._map) {
      this._map.traverseTiles(tile => {
        this.registerTile(tile, forceRecreateMeshes);
      });
    }
  }
  registerTile(tile, forceRecreateMeshes = false) {
    if (!this.visible || this.frozen) {
      return;
    }
    if (!this._activeTiles.has(tile.id) || forceRecreateMeshes) {
      this._activeTiles.set(tile.id, tile);
      this._sortedTiles = null;
      if (tile.lod >= this._minLod) {
        this.loadFeaturesOnExtent(tile.extent).then(features => {
          if (this._activeTiles.has(tile.id)) {
            this.loadMeshes(features, tile.lod, forceRecreateMeshes);
          }
        });
      }
    }
  }
  loadMeshes(features, lod, forceRecreateMeshes = false) {
    for (const feature of features) {
      const geometry = feature.getGeometry();
      if (geometry) {
        const id = getStableFeatureId(feature);
        if (!this._features.has(id)) {
          const extent = OLUtils.fromOLExtent(geometry.getExtent(), this.instance.coordinateSystem);
          this._features.set(id, {
            feature,
            mesh: undefined,
            originalZ: 0,
            extent,
            sampledLod: lod
          });
        }
        const existing = nonNull(this._features.get(id));
        if (forceRecreateMeshes || !existing.mesh || existing.sampledLod < lod) {
          this.loadFeatureMesh(id, existing);
          existing.sampledLod = lod;
        }
      }
    }
    this.notifyChange();
  }
  prepare(mesh, feature, style) {
    mesh.traverse(obj => {
      obj.userData.feature = feature;
      obj.userData.style = style;
      obj.castShadow = this._objectOptions.castShadow;
      obj.receiveShadow = this._objectOptions.receiveShadow;
      this.assignRenderOrder(obj);
    });
    this.onObjectCreated(mesh);
  }
  getPointOptions(style) {
    const pointStyle = style?.point;
    return {
      color: pointStyle?.color,
      pointSize: pointStyle?.pointSize,
      renderOrder: pointStyle?.renderOrder,
      sizeAttenuation: pointStyle?.sizeAttenuation,
      depthTest: pointStyle?.depthTest,
      image: pointStyle?.image,
      opacity: pointStyle?.opacity
    };
  }
  getExtrusionOffset(feature) {
    let extrusionOffset = undefined;
    if (this._extrusionCallback != null) {
      extrusionOffset = typeof this._extrusionCallback === 'function' ? this._extrusionCallback(feature) : this._extrusionCallback;
    }
    return extrusionOffset;
  }
  getPolygonOptions(feature, style) {
    return {
      fill: style?.fill,
      stroke: style?.stroke,
      extrusionOffset: this.getExtrusionOffset(feature)
    };
  }
  getLineOptions(style) {
    return {
      ...style?.stroke
    };
  }
  getStyle(feature) {
    if (typeof this._style === 'function') {
      return this._style(feature);
    }
    return this._style;
  }
  createMesh(feature, geometry) {
    const style = this.getStyle(feature);
    const converter = this._geometryConverter;
    const result = mapGeometry(geometry, {
      processPoint: p => converter.build(p, this.getPointOptions(style)),
      processPolygon: p => converter.build(p, this.getPolygonOptions(feature, style)),
      processLineString: p => converter.build(p, this.getLineOptions(style)),
      processMultiPolygon: p => converter.build(p, this.getPolygonOptions(feature, style)),
      processMultiLineString: p => converter.build(p, this.getLineOptions(style)),
      fallback: g => {
        throw new Error(`unsupported geometry type: ${g.getType()}`);
      }
    });
    if (result) {
      this.prepare(result, feature, style);
    }
    return result;
  }

  // We override this because the render order of the features depends on their style,
  // so we have to cumulate that with the render order of the entity.
  assignRenderOrder(obj) {
    const renderOrder = this.renderOrder;

    // Note that the final render order of the mesh is the sum of
    // the entity's render order and the style's render order(s).
    if (isSurfaceMesh(obj)) {
      const relativeRenderOrder = obj.userData.style?.fill?.renderOrder ?? 0;
      obj.renderOrder = renderOrder + relativeRenderOrder;
    } else if (isLineStringMesh(obj)) {
      const relativeRenderOrder = obj.userData.style?.stroke?.renderOrder ?? 0;
      obj.renderOrder = renderOrder + relativeRenderOrder;
    } else if (isPointMesh(obj)) {
      const relativeRenderOrder = obj.userData.style?.point?.renderOrder ?? 0;
      obj.renderOrder = renderOrder + relativeRenderOrder;
    }
  }
  getDrapingMode(feature) {
    if (typeof this._drapingMode === 'function') {
      return this._drapingMode(feature);
    }
    return this._drapingMode;
  }
  loadFeatureMesh(id, existing) {
    const geometry = existing.feature.getGeometry();
    if (geometry == null) {
      console.warn(`No geometry for feature ${id}`);
      return;
    }
    if (!isGeometrySupported(geometry)) {
      console.warn(`Unsupported geometry type for feature ${id} (${geometry.getType()})`);
      return;
    }
    const drapingMode = this.getDrapingMode(existing.feature);
    let actualGeometry = geometry;
    let shouldReplaceMesh = false;
    let verticalOffset = 0;
    const map = nonNull(this._map);
    if (drapingMode === 'per-feature' || drapingMode === 'per-vertex' && geometry.getType() === 'Point') {
      // Note that point is necessarily per feature, since there is only one vertex
      actualGeometry = geometry;
      verticalOffset = getFeatureElevation(geometry, map);
    } else if (drapingMode === 'per-vertex') {
      shouldReplaceMesh = true;
      actualGeometry = applyPerVertexDraping(geometry, map);
    }

    // We have to entirely recreate the mesh because
    // the vertices will have different elevations
    if (shouldReplaceMesh && existing.mesh) {
      existing.mesh.dispose();
      existing.mesh.removeFromParent();
      existing.mesh = undefined;
    }

    // The mesh needs to be (re)created
    if (existing.mesh === undefined) {
      const newMesh = this.createMesh(existing.feature, actualGeometry);
      existing.originalZ = newMesh?.position.z ?? 0;
      if (newMesh) {
        existing.mesh = newMesh;
        existing.mesh.name = id;
        this.object3d.add(existing.mesh);
      }
    }
    if (existing.mesh) {
      // When a single elevation value is applied to the entire mesh,
      // then we can simply translate the Mesh itself, rather than recreate it.
      if (verticalOffset !== 0) {
        existing.mesh.position.setZ(existing.originalZ + verticalOffset);
      }
      existing.mesh.updateMatrix();
      existing.mesh.updateMatrixWorld(true);
    }
  }
  unregisterTile(tile) {
    const actuallyDeleted = this._activeTiles.delete(tile.id);
    if (actuallyDeleted) {
      this._sortedTiles = null;
      this._shouldCleanup = true;
      this.notifyChange(this);
    }
  }
  async loadFeaturesOnExtent(extent) {
    const result = await this._source.getFeatures({
      extent
    });
    return result.features;
  }
  postUpdate() {
    if (this._shouldCleanup) {
      this._shouldCleanup = false;
      this.cleanup();
    }
  }
  cleanup() {
    const sorted = this.getSortedTiles();
    const features = [...this._features.values()];
    for (const block of features) {
      let stillUsed = false;
      for (const tile of sorted) {
        if (tile.lod >= this._minLod && tile.extent.intersectsExtent(block.extent)) {
          stillUsed = true;
          break;
        }
      }
      if (!stillUsed && block.mesh) {
        block.mesh.dispose();
        block.mesh.removeFromParent();
        block.mesh = undefined;
      }
    }
  }
  getDefaultPointOfView({
    camera
  }) {
    const bounds = new Box3().setFromObject(this.object3d);
    const sphere = bounds.getBoundingSphere(tmpSphere);
    let orthographicZoom = 1;
    let distance;
    if (isOrthographicCamera(camera)) {
      orthographicZoom = computeZoomToFitSphere(camera, sphere.radius);
      // In orthographic camera, the actual distance has no effect on the size
      // of objects, but it does have an effect on clipping planes.
      // Let's compute a reasonable distance to put the camera.
      distance = sphere.radius;
    } else if (isPerspectiveCamera(camera)) {
      distance = computeDistanceToFitSphere(camera, sphere.radius);
    } else {
      return null;
    }

    // To avoid a perfectly vertical camera axis that would cause a gimbal lock.

    const origin = new Vector3(sphere.center.x, sphere.center.y - 0.01, distance);
    const target = sphere.center;
    const result = {
      origin,
      target,
      orthographicZoom
    };
    return Object.freeze(result);
  }
  dispose() {
    this.detach();
    this._geometryConverter.dispose({
      disposeMaterials: true,
      disposeTextures: true
    });
    this.traverseMeshes(mesh => {
      mesh.geometry.dispose();
    });
  }
}
class DrapedFeatureCollectionInspector extends EntityInspector {
  constructor(gui, instance, entity) {
    super(gui, instance, entity, {
      visibility: true,
      opacity: true,
      boundingBoxColor: true,
      boundingBoxes: true
    });
    this.addController(entity, 'loadedFeatures');
  }
}
EntityPanel.registerInspector('DrapedFeatureCollection', DrapedFeatureCollectionInspector);