import type { IChatRepository } from '../repositories';

export class SendMessageUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(
    text: string,
    mode: 'broadcast' | 'direct' = 'broadcast'
  ): Promise<string> {
    if (!text || text.trim().length === 0) {
      throw new Error('Message text cannot be empty');
    }

    try {
      return await this.chatRepository.sendMessage(text.trim(), mode);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}
