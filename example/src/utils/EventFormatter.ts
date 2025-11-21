export class EventFormatter {
  static formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  static formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  }

  static formatDataLength(length: number): string {
    if (length === 0) return '';
    if (length > 100) return ' (truncated)';
    return '';
  }

  static truncateEventName(name: string, maxLength: number = 20): string {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  }

  static getEventTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
    };
    return labels[type] || 'Unknown';
  }
}
