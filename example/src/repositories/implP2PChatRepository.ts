import Bridgefy from 'bridgefy-react-native';
import type { IP2PChatRepository, P2PEventHandlers } from './P2PChatRepository';
import type { P2PMessage } from '../entities';

export class P2PChatRepository implements IP2PChatRepository {
  private eventHandlers: P2PEventHandlers = {};

  async getCurrentUserId(): Promise<string> {
    try {
      const userId = await Bridgefy.currentUserId();
      if (!userId) {
        throw new Error('Unable to retrieve user ID');
      }
      return userId;
    } catch (error) {
      console.error('Failed to get current user ID:', error);
      throw error;
    }
  }

  async sendP2PMessage(text: string, peerId: string): Promise<string> {
    try {
      const messageId = await Bridgefy.sendP2P(text, peerId);
      return messageId;
    } catch (error) {
      console.error('Failed to send P2P message:', error);
      throw error;
    }
  }

  subscribeToP2PEvents(peerId: string, handlers: P2PEventHandlers): void {
    this.eventHandlers = handlers;

    // Escuchar mensajes recibidos
    Bridgefy.onReceiveData((event) => {
      // Solo procesar mensajes del peer específico
      if (event.transmissionMode?.uuid === peerId) {
        const message: P2PMessage = {
          id: event.messageId || `msg-${Date.now()}-${Math.random()}`,
          text: event.data,
          senderId: event.transmissionMode.uuid,
          timestamp: Date.now(),
          isMine: false,
          status: 'sent',
        };

        this.eventHandlers.onMessageReceived?.(message);
      }
    });

    // Escuchar desconexiones del peer
    Bridgefy.onDisconnect((event) => {
      if (event.userId === peerId) {
        console.log('Peer disconnected:', peerId);
        this.eventHandlers.onPeerDisconnected?.(peerId);
      }
    });

    // Escuchar reconexiones del peer
    Bridgefy.onConnect((event) => {
      if (event.userId === peerId) {
        console.log('Peer connected:', peerId);
        this.eventHandlers.onPeerConnected?.(peerId);
      }
    });

    // Escuchar fallos en el envío
    Bridgefy.onFailSendingMessage((error) => {
      console.error('Failed to send message:', error);
      const err: Error & { messageId?: string } = Object.assign(
        new Error(error?.message ?? 'Failed to send message'),
        error
      );
      this.eventHandlers.onMessageFailed?.(err);
    });
  }

  unsubscribeFromP2PEvents(): void {
    Bridgefy.removeAllListeners();
    this.eventHandlers = {};
  }
}
