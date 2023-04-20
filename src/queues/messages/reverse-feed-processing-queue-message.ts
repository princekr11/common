export enum ReverseFeedProcessingQueueMessageEventType {
  REVERSE_FEED_PROCESSING = 'REVERSE_FEED_PROCESSING',
  RTA_HOLDING_FEED_PROCESSING = 'RTA_HOLDING_FEED_PROCESSING'
}
export class ReverseFeedProcessingQueueMessage {
  eventType: ReverseFeedProcessingQueueMessageEventType;
  reverseFeedId?: number;
  rtaHoldingId?: number;
}
