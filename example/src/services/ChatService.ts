import type { Message } from '../entities';

export class ChatService {
  private readonly messages: Map<string, Message> = new Map();

  addMessage(message: Message): Message[] {
    this.messages.set(message.id, message);
    return this.getMessagesSorted();
  }

  getMessages(): Message[] {
    return Array.from(this.messages.values());
  }

  getMessagesSorted(): Message[] {
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

  hasMessages(): boolean {
    return this.messages.size > 0;
  }

  findMessage(messageId: string): Message | undefined {
    return this.messages.get(messageId);
  }
}
