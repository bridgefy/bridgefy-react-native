export type MessageStatus = 'sending' | 'sent' | 'failed';
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface P2PMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  isMine: boolean;
  status: MessageStatus;
}

export interface P2PChatSnapshot {
  messages: P2PMessage[];
  currentUserId: string;
  peerId: string;
  peerName: string;
  peerConnected: boolean;
  sending: boolean;
  error?: Error;
}

export interface PeerInfo {
  id: string;
  name: string;
  connected: boolean;
}

export class P2PMessageEntity {
  constructor(
    private readonly message: P2PMessage
  ) {}

  getId(): string {
    return this.message.id;
  }

  getText(): string {
    return this.message.text;
  }

  getStatus(): MessageStatus {
    return this.message.status;
  }

  isMine(): boolean {
    return this.message.isMine;
  }

  isSending(): boolean {
    return this.message.status === 'sending';
  }

  isSent(): boolean {
    return this.message.status === 'sent';
  }

  hasFailed(): boolean {
    return this.message.status === 'failed';
  }

  canRetry(): boolean {
    return this.hasFailed();
  }

  updateStatus(status: MessageStatus): P2PMessageEntity {
    return new P2PMessageEntity({
      ...this.message,
      status,
    });
  }

  getMessage(): P2PMessage {
    return this.message;
  }

  static create(
    id: string,
    text: string,
    senderId: string,
    isMine: boolean,
    status: MessageStatus = 'sent'
  ): P2PMessageEntity {
    return new P2PMessageEntity({
      id,
      text,
      senderId,
      timestamp: Date.now(),
      isMine,
      status,
    });
  }
}

