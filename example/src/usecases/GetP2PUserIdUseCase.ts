import type { IP2PChatRepository } from "../repositories";

export class GetP2PUserIdUseCase {
  constructor(
    private readonly p2pChatRepository: IP2PChatRepository
  ) {}

  async execute(): Promise<string> {
    try {
      return await this.p2pChatRepository.getCurrentUserId();
    } catch (error) {
      console.error('Error getting user ID:', error);
      throw error;
    }
  }
}
