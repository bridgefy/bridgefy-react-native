import type { SDKEvent } from "../entities/iSDKEvent";

export interface ILogsRepository {
  getEvents(): Promise<SDKEvent[]>;
  getEventsByType(type: string): Promise<SDKEvent[]>;
  clearEvents(): Promise<void>;
  subscribeToEvents(handler: (events: SDKEvent[]) => void): void;
  unsubscribeFromEvents(): void;
}
