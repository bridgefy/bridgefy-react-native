import type { SDKStatusSnapshot } from '../entities';
import type { ISDKRepository } from '../repositories';

export class CheckSDKStatusUseCase {
  constructor(private readonly sdkRepository: ISDKRepository) {}

  async execute(): Promise<SDKStatusSnapshot> {
    try {
      const result = await this.sdkRepository.checkStatus();
      return result;
    } catch (error) {
      console.error('Error checking SDK status:', error);
      throw error;
    }
  }
}
