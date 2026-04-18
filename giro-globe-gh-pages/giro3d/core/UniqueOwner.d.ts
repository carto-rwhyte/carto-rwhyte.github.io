/**
 * Trait for objects that have a unique owner.
 */
interface UniqueOwner<T, Owner = unknown> {
    owner: Owner;
    payload: T;
}
/**
 * Creates an {@link UniqueOwner} object with the specified owner and payload.
 * @param object - The owned payload.
 * @param owner - The owner.
 */
export declare function intoUniqueOwner<T, Owner = unknown>(object: T, owner: Owner): UniqueOwner<T, Owner>;
export default UniqueOwner;
//# sourceMappingURL=UniqueOwner.d.ts.map