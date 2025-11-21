import type { EventType } from "../entities/iSDKEvent";

export interface IconConfig {
  name: string;
  color: string;
}

export class EventDisplayService {
  getTypeIcon(type: EventType): IconConfig {
    const iconMap: Record<EventType, IconConfig> = {
      success: { name: 'check-circle', color: '#4CAF50' },
      error: { name: 'alert-circle', color: '#F44336' },
      warning: { name: 'alert', color: '#FF9800' },
      info: { name: 'information', color: '#2196F3' },
    };
    return iconMap[type];
  }

  getTypeColor(type: EventType): string {
    const colorMap: Record<EventType, string> = {
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FF9800',
      info: '#2196F3',
    };
    return colorMap[type];
  }

  getTypeLabel(type: EventType): string {
    const labels: Record<EventType, string> = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
    };
    return labels[type];
  }
}
