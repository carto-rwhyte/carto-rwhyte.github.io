import type { Color, Matrix4 } from 'three';
export interface IntersectingVolume {
    worldToBoxNdc: Matrix4;
    color: Color;
}
export interface IntersectingVolumeUniform {
    viewToBoxNc: Matrix4;
    color: Color;
}
export interface IntersectingVolumesUniform {
    count: number;
    volumes: IntersectingVolumeUniform[];
}
//# sourceMappingURL=IntersectingVolume.d.ts.map