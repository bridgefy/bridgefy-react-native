import Bridgefy from 'bridgefy-react-native';
import type { Peer } from '../entities';
import { PeerListService } from '../services';
import type { IPeerRepository, PeerEventHandlers } from './PeerRepository';

export class PeerRepository implements IPeerRepository {
  private eventHandlers: PeerEventHandlers = {};
  private readonly peerListService = new PeerListService();

  async getPeers(): Promise<Peer[]> {
    try {
      const connectedPeers = await Bridgefy.connectedPeers();

      if (!Array.isArray(connectedPeers)) {
        return [];
      }

      const peerList: Peer[] = connectedPeers.map((userId, index) => ({
        id: `${index}-${userId}`,
        userId,
        status: 'connected',
        connectionTime: Date.now() - Math.random() * 60000,
        signal: Math.floor(Math.random() * 40) + 60,
      }));

      return peerList;
    } catch (error) {
      console.error('Failed to get peers:', error);
      throw error;
    }
  }

  async establishSecureConnection(userId: string): Promise<void> {
    try {
      await Bridgefy.establishSecureConnection(userId);
    } catch (error) {
      console.error('Failed to establish secure connection:', error);
      throw error;
    }
  }

  subscribeToEvents(handlers: PeerEventHandlers): void {
    this.eventHandlers = handlers;

    Bridgefy.onConnect((event) => {
      console.log('Peer connected:', event.userId);
      const peer: Peer = {
        id: `${Date.now()}-${Math.random()}`,
        userId: event.userId,
        status: 'connected',
        connectionTime: Date.now(),
        signal: Math.floor(Math.random() * 40) + 60,
      };

      this.peerListService.addOrUpdatePeer(peer);
      this.eventHandlers.onPeerConnect?.(event.userId);
      this.eventHandlers.onPeersUpdated?.(this.peerListService.getPeers());
    });

    Bridgefy.onEstablishSecureConnection((event) => {
      console.log('Secure connection established:', event.userId);
      this.peerListService.updatePeerStatus(event.userId, 'secure');
      this.eventHandlers.onSecureConnection?.(event.userId);
      this.eventHandlers.onPeersUpdated?.(this.peerListService.getPeers());
    });

    Bridgefy.onDisconnect((event) => {
      console.log('Peer disconnected:', event.userId);
      this.peerListService.updatePeerStatus(event.userId, 'disconnected');
      this.eventHandlers.onPeerDisconnect?.(event.userId);
      this.eventHandlers.onPeersUpdated?.(this.peerListService.getPeers());
    });
  }

  unsubscribeFromEvents(): void {
    Bridgefy.removeAllListeners();
    this.eventHandlers = {};
  }
}
