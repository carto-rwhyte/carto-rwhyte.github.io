/**
 * Returns a promise that will resolve after the specified duration.
 *
 * @param duration - The duration, in milliseconds.
 * @returns The promise.
 */
declare function delay(duration: number): Promise<void>;
declare function nextFrame(): Promise<void>;
export declare enum PromiseStatus {
    Fullfilled = "fulfilled",
    Rejected = "rejected"
}
export declare class AbortError extends Error {
    constructor();
}
/**
 * Returns an Error with the 'aborted' reason.
 *
 * @returns The error.
 */
declare function abortError(): Error;
declare function batch<I, O>(items: I[], transformer: (obj: I, index: number) => O | null, options?: {
    outputItems?: O[];
    start?: number;
    signal?: AbortSignal;
}): Promise<O[]>;
declare const _default: {
    delay: typeof delay;
    PromiseStatus: typeof PromiseStatus;
    abortError: typeof abortError;
    nextFrame: typeof nextFrame;
    batch: typeof batch;
};
export default _default;
//# sourceMappingURL=PromiseUtils.d.ts.map