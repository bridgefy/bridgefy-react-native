import type { SDKControlResult } from '../entities';
import type { ISDKRepository } from '../repositories';

export class StartSDKUseCase {
  constructor(private readonly sdkRepository: ISDKRepository) {}

  async execute(propagationProfile: string): Promise<SDKControlResult> {
    try {
      return await this.sdkRepository.start(propagationProfile);
    } catch (error) {
      console.error('Error starting SDK:', error);
      throw error;
    }
  }
}
