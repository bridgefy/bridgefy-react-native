// import { P2PMessage, MessageStatus } from '../../domain/types/P2PMessage';

import type { MessageStatus, P2PMessage } from "../entities";

export class P2PMessageService {
  private readonly messages: Map<string, P2PMessage> = new Map();

  addMessage(message: P2PMessage): P2PMessage[] {
    this.messages.set(message.id, message);
    return this.getMessagesSorted();
  }

  updateMessageStatus(messageId: string, status: MessageStatus): P2PMessage[] {
    const message = this.messages.get(messageId);
    if (message) {
      this.messages.set(messageId, { ...message, status });
    }
    return this.getMessagesSorted();
  }

  updateMessageId(oldId: string, newId: string, status: MessageStatus = 'sent'): P2PMessage[] {
    const message = this.messages.get(oldId);
    if (message) {
      this.messages.delete(oldId);
      this.messages.set(newId, { ...message, id: newId, status });
    }
    return this.getMessagesSorted();
  }

  markAllSendingAsFailed(): P2PMessage[] {
    for (const [id, message] of this.messages) {
      if (message.status === 'sending') {
        this.messages.set(id, { ...message, status: 'failed' });
      }
    }
    return this.getMessagesSorted();
  }

  getMessages(): P2PMessage[] {
    return Array.from(this.messages.values());
  }

  getMessagesSorted(): P2PMessage[] {
    return Array.from(this.messages.values()).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  clearMessages(): void {
    this.messages.clear();
  }

  getMessageCount(): number {
    return this.messages.size;
  }

  getPendingMessagesCount(): number {
    return Array.from(this.messages.values()).filter(
      (m) => m.status === 'sending'
    ).length;
  }

  getFailedMessagesCount(): number {
    return Array.from(this.messages.values()).filter(
      (m) => m.status === 'failed'
    ).length;
  }
}
