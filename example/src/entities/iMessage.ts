export type TransmissionMode = 'broadcast' | 'direct' | 'mesh';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  isMine: boolean;
  transmissionMode: TransmissionMode;
}

export interface ChatSnapshot {
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  error?: Error;
}

export class MessageEntity {
  constructor(private readonly message: Message) {}

  getId(): string {
    return this.message.id;
  }

  getText(): string {
    return this.message.text;
  }

  getSenderId(): string {
    return this.message.senderId;
  }

  getTimestamp(): number {
    return this.message.timestamp;
  }

  isMine(): boolean {
    return this.message.isMine;
  }

  getTransmissionMode(): TransmissionMode {
    return this.message.transmissionMode;
  }

  getFormattedTime(): string {
    const date = new Date(this.message.timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getFormattedSenderId(): string {
    return this.message.senderId.substring(0, 8);
  }

  getMessage(): Message {
    return this.message;
  }

  static create(
    id: string,
    text: string,
    senderId: string,
    isMine: boolean,
    transmissionMode: TransmissionMode = 'broadcast'
  ): MessageEntity {
    return new MessageEntity({
      id,
      text,
      senderId,
      timestamp: Date.now(),
      isMine,
      transmissionMode,
    });
  }
}
