/*
 * Copyright (c) 2015-2018, IGN France.
 * Copyright (c) 2018-2026, Giro3D team.
 * SPDX-License-Identifier: MIT
 */

import { get as getProjection } from 'ol/proj';
import CoordinateSystem from '../core/geographic/CoordinateSystem';
import UrlImageSource from './UrlImageSource';

/**
 * Constructor options for {@link WmsSourceOptions}.
 */

/**
 * Create a GetMap URL template from the provided WMS parameters.
 * @internal
 */
export function createGetMapTemplate(params) {
  const layerList = Array.isArray(params.layer) ? params.layer : [params.layer];
  const styleList = params.styles != null ? params.styles.join(',') : '';
  const version = params.version ?? '1.3.0';
  const url = new URL(params.url);
  url.searchParams.append('SERVICE', 'WMS');
  url.searchParams.append('VERSION', version);
  url.searchParams.append('REQUEST', 'GetMap');
  url.searchParams.append('LAYERS', layerList.join(','));
  url.searchParams.append('STYLES', styleList);
  switch (version) {
    case '1.1.1':
      {
        url.searchParams.append('SRS', params.projection);
        url.searchParams.append('BBOX', '{minx},{miny},{maxx},{maxy}');
      }
      break;
    case '1.3.0':
      {
        url.searchParams.append('CRS', params.projection);
        const proj = getProjection(params.projection);
        const axisOrder = proj?.getAxisOrientation();
        switch (axisOrder) {
          case 'neu':
            url.searchParams.append('BBOX', '{miny},{minx},{maxy},{maxx}');
            break;
          default:
            url.searchParams.append('BBOX', '{minx},{miny},{maxx},{maxy}');
            break;
        }
      }
      break;
  }
  url.searchParams.append('WIDTH', '{width}');
  url.searchParams.append('HEIGHT', '{height}');
  url.searchParams.append('FORMAT', params.imageFormat ?? 'image/png');
  const transparent = params.transparent ?? true;
  url.searchParams.append('TRANSPARENT', `${transparent}`);
  if (params.params != null) {
    for (const [key, value] of Object.entries(params.params)) {
      if (key != null && value != null) {
        url.searchParams.append(key, `${value}`);
      }
    }
  }
  return decodeURIComponent(url.toString());
}

/**
 * An image source that is backed by a one or more [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) layer(s).
 * Note: this is a convenient class that simplifies the usage of {@link UrlImageSource}.
 * ```js
 * const source = new WmsSource({
 *      url: 'http://example.com/wms',
 *      projection: 'EPSG:3857',
 *      layer: 'myLayer',
 *      imageFormat: 'image/png',
 * });
 * ```
 */
export default class WmsSource extends UrlImageSource {
  isWmsSource = true;
  type = 'WmsSource';
  /**
   * Creates a {@link WmsSource} from the specified parameters.
   *
   * @param options - The options.
   */
  constructor(options) {
    super({
      ...options,
      urlTemplate: createGetMapTemplate(options),
      crs: CoordinateSystem.get(options.projection)
    });
    this._initialOptions = options;
  }

  /**
   * Sets the `TIME` parameter of the tile requests, and refreshes the source.
   * If `date` is undefined, temporal requests are disabled.
   */
  setTime(date) {
    const options = {
      ...this._initialOptions,
      params: {
        ...this._initialOptions.params,
        TIME: date?.toISOString()
      }
    };
    this.setUrlTemplate(createGetMapTemplate(options));
  }
}
export function isWmsSource(obj) {
  return obj.isWmsSource === true;
}