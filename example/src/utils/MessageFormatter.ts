export class MessageFormatter {
  static formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static formatUserId(userId: string, length: number = 8): string {
    if (!userId) return 'Unknown';
    return userId.substring(0, length);
  }

  static getTransmissionModeIcon(mode: string): string {
    switch (mode) {
      case 'broadcast':
        return 'broadcast';
      case 'p2p':
        return 'account';
      default:
        return 'wifi';
    }
  }

  static getTransmissionModeLabel(mode: string): string {
    switch (mode) {
      case 'broadcast':
        return 'Broadcast';
      case 'direct':
        return 'Direct';
      case 'mesh':
        return 'Mesh';
      default:
        return 'Unknown';
    }
  }

  static truncateMessage(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
