export type EventType = 'info' | 'success' | 'warning' | 'error';
export type FilterType = 'all' | 'info' | 'success' | 'warning' | 'error';

export interface SDKEvent {
  id: string;
  eventName: string;
  eventKey: string;
  message: string;
  type: EventType;
  timestamp: number;
  data?: any;
  screen?: string;
}

export interface EventStats {
  all: number;
  info: number;
  success: number;
  warning: number;
  error: number;
}

export interface LogsSnapshot {
  events: SDKEvent[];
  filteredEvents: SDKEvent[];
  stats: EventStats;
  filter: FilterType;
  searchText: string;
  loading: boolean;
}

export class SDKEventEntity {
  constructor(
    private readonly event: SDKEvent
  ) {}

  getId(): string {
    return this.event.id;
  }

  getType(): EventType {
    return this.event.type;
  }

  getEventName(): string {
    return this.event.eventName;
  }

  getMessage(): string {
    return this.event.message;
  }

  getFormattedTime(): string {
    const date = new Date(this.event.timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  getFormattedDate(): string {
    const date = new Date(this.event.timestamp);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  }

  getTruncatedData(maxLength: number = 100): string {
    if (!this.event.data) return '';
    const stringified = JSON.stringify(this.event.data);
    if (stringified.length <= maxLength) return stringified;
    return stringified.substring(0, maxLength) + '...';
  }

  getDataLength(): number {
    if (!this.event.data) return 0;
    return JSON.stringify(this.event.data).length;
  }

  matchesSearch(searchText: string): boolean {
    const search = searchText.toLowerCase();
    return (
      this.event.message.toLowerCase().includes(search) ||
      this.event.eventName.toLowerCase().includes(search) ||
      this.event.eventKey.toLowerCase().includes(search)
    );
  }

  getEvent(): SDKEvent {
    return this.event;
  }
}

