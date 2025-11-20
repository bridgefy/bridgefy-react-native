export class P2PFormatter {
  static formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static formatPeerId(peerId: string, length: number = 12): string {
    if (!peerId) return 'Unknown';
    if (peerId.length <= length) return peerId;
    return peerId.substring(0, length) + '...';
  }

  static getMessageStatusIcon(status: 'sending' | 'sent' | 'failed'): string {
    switch (status) {
      case 'sending':
        return 'clock-outline';
      case 'sent':
        return 'check';
      case 'failed':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  }

  static getMessageStatusColor(status: 'sending' | 'sent' | 'failed'): string {
    switch (status) {
      case 'sending':
        return 'rgba(255, 255, 255, 0.7)';
      case 'sent':
        return 'rgba(255, 255, 255, 0.9)';
      case 'failed':
        return '#FF5252';
      default:
        return '#9E9E9E';
    }
  }
}
