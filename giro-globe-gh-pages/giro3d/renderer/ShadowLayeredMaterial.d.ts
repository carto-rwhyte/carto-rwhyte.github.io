import LayeredMaterial from './LayeredMaterial';
export type ShadowMode = 'distance' | 'depth';
type LayeredMaterialConstructorParams = ConstructorParameters<typeof LayeredMaterial>[0];
interface ConstructorParams extends LayeredMaterialConstructorParams {
    source: LayeredMaterial;
    shadowMode: ShadowMode;
}
export default class ShadowLayeredMaterial extends LayeredMaterial {
    private readonly _shadowMode;
    private readonly _source;
    readonly isMeshDistanceMaterial: boolean;
    readonly isMeshDepthMaterial: boolean;
    constructor(opts: ConstructorParams);
    private copyElevationParameters;
    onBeforeRender(): void;
}
export {};
//# sourceMappingURL=ShadowLayeredMaterial.d.ts.map