import type { MessageMap, MessageType } from './worker';
import WorkerPool from '../../utils/WorkerPool';
export default class PotreeWorkerPool extends WorkerPool<MessageType, MessageMap> {
    private static _singleton;
    private static create;
    static get(): Promise<PotreeWorkerPool>;
}
//# sourceMappingURL=PotreeWorkerPool.d.ts.map