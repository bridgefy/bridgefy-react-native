import type { IP2PChatRepository } from "../repositories";

export class SendP2PMessageUseCase {
  constructor(
    private readonly p2pChatRepository: IP2PChatRepository
  ) {}

  async execute(text: string, peerId: string): Promise<string> {
    if (!text || text.trim().length === 0) {
      throw new Error('Message text cannot be empty');
    }

    if (!peerId || peerId.trim().length === 0) {
      throw new Error('Peer ID is required');
    }

    try {
      return await this.p2pChatRepository.sendP2PMessage(text.trim(), peerId);
    } catch (error) {
      console.error('Error sending P2P message:', error);
      throw error;
    }
  }
}
