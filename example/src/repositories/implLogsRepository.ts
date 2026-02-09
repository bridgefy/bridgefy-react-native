import { useBridgefyEventStore } from '../BridgefyEventStore';
import type { SDKEvent } from '../entities/iSDKEvent';
import type { ILogsRepository } from './ILogsRepository';

export class LogsRepository implements ILogsRepository {
  private listeners: ((events: SDKEvent[]) => void)[] = [];

  async getEvents(): Promise<SDKEvent[]> {
    try {
      const store = useBridgefyEventStore.getState();
      return store.events;
    } catch (error) {
      console.error('Failed to get events:', error);
      throw error;
    }
  }

  async getEventsByType(type: SDKEvent['type']): Promise<SDKEvent[]> {
    try {
      const store = useBridgefyEventStore.getState();
      return store.getEventsByType(type);
    } catch (error) {
      console.error('Failed to get events by type:', error);
      throw error;
    }
  }

  async clearEvents(): Promise<void> {
    try {
      const store = useBridgefyEventStore.getState();
      store.clearEvents();
    } catch (error) {
      console.error('Failed to clear events:', error);
      throw error;
    }
  }

  subscribeToEvents(handler: (events: SDKEvent[]) => void): void {
    this.listeners.push(handler);

    // Suscribirse al store global
    const store = useBridgefyEventStore;
    store.subscribe((state) => {
      handler(state.events);
    });
  }

  unsubscribeFromEvents(): void {
    this.listeners = [];
  }
}
