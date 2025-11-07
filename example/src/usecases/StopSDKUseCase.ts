import type { SDKControlResult } from "../entities";
import type { ISDKRepository } from "../repositories";

export class StopSDKUseCase {
  constructor(
    private readonly sdkRepository: ISDKRepository
  ) {}

  async execute(): Promise<SDKControlResult> {
    try {
      return await this.sdkRepository.stop();
    } catch (error) {
      console.error('Error stopping SDK:', error);
      throw error;
    }
  }
}
