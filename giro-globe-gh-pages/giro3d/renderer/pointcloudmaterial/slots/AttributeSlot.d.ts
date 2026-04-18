export interface AttributePropertiesUniform {
    weight: number;
}
export declare abstract class AttributeSlot {
    readonly attributeName: string;
    abstract uniform: AttributePropertiesUniform;
    protected abstract get hasAttribute(): boolean;
    private _wantedWeight;
    protected constructor(attributeName: string);
    set weight(value: number);
    get actualWeight(): number;
    set actualWeight(value: number);
    protected updateActualWeight(): void;
}
//# sourceMappingURL=AttributeSlot.d.ts.map