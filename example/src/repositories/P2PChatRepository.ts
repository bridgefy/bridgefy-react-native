import type { P2PMessage } from '../entities';

export interface IP2PChatRepository {
  getCurrentUserId(): Promise<string>;
  sendP2PMessage(text: string, peerId: string): Promise<string>;
  subscribeToP2PEvents(peerId: string, handlers: P2PEventHandlers): void;
  unsubscribeFromP2PEvents(): void;
}

export interface P2PEventHandlers {
  onMessageReceived?: (message: P2PMessage) => void;
  onPeerConnected?: (peerId: string) => void;
  onPeerDisconnected?: (peerId: string) => void;
  onMessageFailed?: (error: Error) => void;
  onError?: (error: Error) => void;
}
