/*
 * Copyright (c) 2015-2018, IGN France.
 * Copyright (c) 2018-2026, Giro3D team.
 * SPDX-License-Identifier: MIT
 */

import * as copc from 'copc';
import { createErrorResponse } from '../../utils/WorkerPool';
import { getLazPerf, setLazPerfWasmBinary } from './config';
import { getPerPointFilters } from './filter';
import { readColor, readPosition, readScalarAttribute } from './readers';
async function decompressChunk(chunk, metadata) {
  const lazPerf = await getLazPerf();
  return copc.Las.PointData.decompressChunk(new Uint8Array(chunk), metadata, lazPerf);
}
async function decompressFile(chunk) {
  const lazPerf = await getLazPerf();
  return copc.Las.PointData.decompressFile(new Uint8Array(chunk), lazPerf);
}
function processDecodeChunkMessage(msg) {
  decompressChunk(msg.payload.buffer, msg.payload.metadata).then(buf => {
    const response = {
      requestId: msg.id,
      payload: buf.buffer
    };
    postMessage(response, {
      transfer: [buf.buffer]
    });
  }).catch(err => {
    postMessage(createErrorResponse(msg.id, err));
  });
}
function processDecodeFileMessage(msg) {
  decompressFile(msg.payload.buffer).then(buf => {
    const response = {
      requestId: msg.id,
      payload: buf.buffer
    };
    postMessage(response, {
      transfer: [buf.buffer]
    });
  }).catch(err => {
    console.error(err);
    postMessage(createErrorResponse(msg.id, err));
  });
}
export function createLasView(buffer, header, eb, include) {
  const view = copc.Las.View.create(buffer, header, eb, include);
  if (eb) {
    const newDimensions = {};
    for (const [name, dimension] of Object.entries(view.dimensions)) {
      let actualDimension = dimension;
      const extrabyte = eb.find(extra => extra.name === name);
      if (extrabyte) {
        if (extrabyte.type === 'signed' || extrabyte.type === 'unsigned') {
          if (typeof extrabyte.scale === 'number' && extrabyte.scale !== 1 || typeof extrabyte.offset === 'number' && extrabyte.offset !== 0) {
            // If a LAS ExtraByte is a scaled integer, then we need to store its scaled value in a float,
            // otherwise we might lose precision.
            actualDimension = {
              type: 'float',
              size: 4
            };
          }
        }
      }
      newDimensions[name] = actualDimension;
    }
    view.dimensions = newDimensions;
  }
  return view;
}
export function readView(options) {
  const {
    view,
    filters,
    origin,
    attributes,
    compressColors
  } = options;
  const stride = options.stride ?? 1;
  const perPointFilters = getPerPointFilters(filters ?? [], view);
  let position = undefined;
  if (options.position) {
    const data = readPosition(view, origin, stride, perPointFilters);
    const localBoundingBox = [data.localBoundingBox.min.x, data.localBoundingBox.min.y, data.localBoundingBox.min.z, data.localBoundingBox.max.x, data.localBoundingBox.max.y, data.localBoundingBox.max.z];
    position = {
      buffer: data.buffer,
      localBoundingBox
    };
  }
  const attributesBuffers = attributes.map(attribute => {
    switch (attribute.interpretation) {
      case 'color':
        return readColor(view, stride, compressColors, perPointFilters);
        break;
      case 'classification':
      case 'unknown':
        return readScalarAttribute(view, attribute, stride, perPointFilters);
        break;
    }
  });
  return {
    position,
    attributes: attributesBuffers
  };
}
function processReadViewMessage(msg) {
  const {
    buffer,
    metadata,
    header,
    eb,
    include
  } = msg.payload;
  decompressChunk(buffer, metadata).then(bin => {
    const view = createLasView(bin, header, eb, include);
    const payload = readView({
      ...msg.payload,
      view
    });
    const response = {
      requestId: msg.id,
      payload
    };
    const transfer = [...payload.attributes];
    if (payload.position) {
      transfer.push(payload.position.buffer);
    }
    postMessage(response, {
      transfer
    });
  }).catch(err => {
    console.error(err);
    postMessage(createErrorResponse(msg.id, err));
  });
}
onmessage = event => {
  const message = event.data;
  switch (message.type) {
    case 'DecodeLazChunk':
      processDecodeChunkMessage(message);
      break;
    case 'DecodeLazFile':
      processDecodeFileMessage(message);
      break;
    case 'ReadView':
      processReadViewMessage(message);
      break;
    case 'SetWasmBinary':
      setLazPerfWasmBinary(message.buffer);
      break;
  }
};