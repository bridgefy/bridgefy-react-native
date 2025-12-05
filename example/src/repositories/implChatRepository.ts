import Bridgefy from 'bridgefy-react-native';
import type { ChatEventHandlers, IChatRepository } from './ChatRepository';
import type { Message, TransmissionMode } from '../entities';

export class ChatRepository implements IChatRepository {
  private eventHandlers: ChatEventHandlers = {};

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

  async sendMessage(text: string): Promise<string> {
    try {
      return await Bridgefy.sendBroadcast(text);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  subscribeToMessages(handlers: ChatEventHandlers): void {
    this.eventHandlers = handlers;

    Bridgefy.onReceiveData((event) => {
      const message: Message = {
        id: event.messageId || `msg-${Date.now()}-${Math.random()}`,
        text: event.data,
        senderId: event.transmissionMode?.uuid || 'unknown',
        timestamp: Date.now(),
        isMine: false,
        transmissionMode: (event.transmissionMode?.type ||
          'broadcast') as TransmissionMode,
      };

      this.eventHandlers.onMessageReceived?.(message);
    });

    Bridgefy.onStart((event) => {
      console.log('Bridgefy started with user ID:', event.userId);
      this.eventHandlers.onUserIdChanged?.(event.userId);
    });
  }

  unsubscribeFromMessages(): void {
    Bridgefy.removeAllListeners();
    this.eventHandlers = {};
  }
}
