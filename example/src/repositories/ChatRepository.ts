import type { Message } from "../entities";

export interface IChatRepository {
  getCurrentUserId(): Promise<string>;
  sendMessage(text: string, mode: 'broadcast' | 'direct'): Promise<string>;
  subscribeToMessages(handlers: ChatEventHandlers): void;
  unsubscribeFromMessages(): void;
}

export interface ChatEventHandlers {
  onMessageReceived?: (message: Message) => void;
  onUserIdChanged?: (userId: string) => void;
  onError?: (error: Error) => void;
}
