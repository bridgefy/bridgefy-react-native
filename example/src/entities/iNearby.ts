export type PeerStatus = 'connected' | 'disconnected' | 'secure';

export interface Peer {
  id: string;
  userId: string;
  status: PeerStatus;
  connectionTime?: number;
  signal?: number;
}

export interface PeerListSnapshot {
  peers: Peer[];
  loading: boolean;
  error?: Error;
}

export class PeerEntity {
  constructor(private readonly peer: Peer) {}

  isConnected(): boolean {
    return this.peer.status === 'connected' || this.peer.status === 'secure';
  }

  isSecure(): boolean {
    return this.peer.status === 'secure';
  }

  canInitiateChat(): boolean {
    return this.isConnected();
  }

  getConnectionDuration(): number {
    if (!this.peer.connectionTime) return 0;
    return Date.now() - this.peer.connectionTime;
  }

  getSignalQuality(): 'excellent' | 'good' | 'poor' {
    const signal = this.peer.signal || 0;
    if (signal > 75) return 'excellent';
    if (signal > 50) return 'good';
    return 'poor';
  }

  getPeer(): Peer {
    return this.peer;
  }

  updateStatus(status: PeerStatus): PeerEntity {
    return new PeerEntity({
      ...this.peer,
      status,
      connectionTime:
        status === 'connected' ? Date.now() : this.peer.connectionTime,
    });
  }
}
