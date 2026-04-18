import type { Box3, BufferAttribute, Float32BufferAttribute, Vector3 } from 'three';
import type { GetMemoryUsageContext } from '../core/MemoryUsage';
import type { GetNodeDataOptions, PointCloudAttribute, PointCloudMetadata, PointCloudNode, PointCloudNodeData, PointCloudSource } from './PointCloudSource';
import { PointCloudSourceBase } from './PointCloudSource';
export default class StaticPointCloudSource extends PointCloudSourceBase implements PointCloudSource {
    type: string;
    readonly isStaticPointCloudSource: true;
    private readonly _origin;
    private readonly _bounds;
    private readonly _positions;
    private readonly _pointCount;
    private readonly _spacing;
    private readonly _attributes;
    private readonly _attributeBuffers;
    constructor(params: {
        bounds: Box3;
        origin: Vector3;
        positions: Float32BufferAttribute;
        attributes: Array<{
            attribute: PointCloudAttribute;
            data: BufferAttribute;
        }>;
        spacing: number;
    });
    protected initializeOnce(): Promise<this>;
    getHierarchy(): Promise<PointCloudNode>;
    getMetadata(): Promise<PointCloudMetadata>;
    getNodeData(params: GetNodeDataOptions): Promise<PointCloudNodeData>;
    get progress(): number;
    get loading(): boolean;
    dispose(): void;
    getMemoryUsage(context: GetMemoryUsageContext): void;
}
//# sourceMappingURL=StaticPointCloudSource.d.ts.map