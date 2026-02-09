import type { IChatRepository } from '../repositories';

export class GetCurrentUserIdUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(): Promise<string> {
    try {
      return await this.chatRepository.getCurrentUserId();
    } catch (error) {
      console.error('Error getting current user ID:', error);
      throw error;
    }
  }
}
