import type { SDKControlResult } from '../entities';
import type { ISDKRepository } from '../repositories';

export class DestroySessionUseCase {
  constructor(private readonly sdkRepository: ISDKRepository) {}

  async execute(): Promise<SDKControlResult> {
    try {
      return await this.sdkRepository.destroySession();
    } catch (error) {
      console.error('Error destroying session:', error);
      throw error;
    }
  }
}
