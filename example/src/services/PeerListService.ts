import type { Peer, PeerStatus } from '../entities';

export class PeerListService {
  private readonly peers: Map<string, Peer> = new Map();

  addOrUpdatePeer(peer: Peer): Peer[] {
    this.peers.set(peer.userId, peer);
    return Array.from(this.peers.values());
  }

  updatePeerStatus(userId: string, status: PeerStatus): Peer[] {
    const existing = this.peers.get(userId);
    if (existing) {
      const updated = {
        ...existing,
        status,
        connectionTime:
          status === 'connected' ? Date.now() : existing.connectionTime,
      };
      this.peers.set(userId, updated);
    }
    return Array.from(this.peers.values());
  }

  removePeer(userId: string): Peer[] {
    this.peers.delete(userId);
    return Array.from(this.peers.values());
  }

  getPeers(): Peer[] {
    return Array.from(this.peers.values());
  }

  getConnectedPeers(): Peer[] {
    return Array.from(this.peers.values()).filter(
      (p) => p.status === 'connected' || p.status === 'secure'
    );
  }

  clear(): void {
    this.peers.clear();
  }
}
