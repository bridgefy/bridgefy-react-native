export class PeerFormatter {
  static formatConnectionTime(timestamp?: number): string {
    if (!timestamp) return 'Unknown';

    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  }

  static formatUserId(userId: string, length: number = 12): string {
    if (userId.length <= length) return userId;
    return userId.substring(0, length) + '...';
  }

  static getSignalIcon(signal: number = 0): {
    icon: string;
    color: string;
  } {
    if (signal > 75) {
      return { icon: 'signal', color: '#4CAF50' };
    }
    if (signal > 50) {
      return { icon: 'signal-2', color: '#FF9800' };
    }
    return { icon: 'signal-1', color: '#F44336' };
  }
}
