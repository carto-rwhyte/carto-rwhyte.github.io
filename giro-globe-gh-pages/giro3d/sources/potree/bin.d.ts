import type { Box3 } from 'three';
import { type PotreePointCloudAttribute } from './attributes';
export interface BufferAttributeDescriptor {
    array: ArrayBuffer;
    dimension: number;
    normalized: boolean;
}
export interface ParseResult {
    positionBuffer: BufferAttributeDescriptor;
    attributeBuffers: BufferAttributeDescriptor[];
    localBoundingBox?: Box3;
}
export declare function readBinFile(buffer: ArrayBuffer, pointByteSize: number, positionAttribute: PotreePointCloudAttribute, attributes: PotreePointCloudAttribute[]): ParseResult;
//# sourceMappingURL=bin.d.ts.map