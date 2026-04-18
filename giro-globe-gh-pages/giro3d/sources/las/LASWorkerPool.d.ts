import type { MessageMap, MessageType } from './worker';
import WorkerPool from '../../utils/WorkerPool';
/**
 * A global singleton worker pool that provides LAS processing workers.
 */
export default class LASWorkerPool extends WorkerPool<MessageType, MessageMap> {
    private constructor();
    private static _wasmBinary;
    private static _singleton;
    /**
     * Returns the singleton worker pool, creating it if necessary.
     */
    static get(): Promise<LASWorkerPool>;
    private static createSingleton;
}
//# sourceMappingURL=LASWorkerPool.d.ts.map