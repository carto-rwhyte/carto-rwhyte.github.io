import type { BaseMessageMap, Message, SuccessResponse } from '../../utils/WorkerPool';
import type { PotreePointCloudAttribute } from './attributes';
import type { BufferAttributeDescriptor } from './bin';
export type MessageType = 'ReadBinFile';
export interface TypedMessage<K extends MessageType, T> extends Message<T> {
    type: K;
}
type ReadBinFileMessage = TypedMessage<'ReadBinFile', {
    buffer: ArrayBuffer;
    info: {
        positionAttribute: PotreePointCloudAttribute;
        attributes: PotreePointCloudAttribute[];
        pointByteSize: number;
    };
}>;
type ReadBinFileResponse = SuccessResponse<{
    position: BufferAttributeDescriptor;
    attributes: BufferAttributeDescriptor[];
}>;
export interface MessageMap extends BaseMessageMap<MessageType> {
    ReadBinFile: {
        payload: ReadBinFileMessage['payload'];
        response: ReadBinFileResponse['payload'];
    };
}
export {};
//# sourceMappingURL=worker.d.ts.map