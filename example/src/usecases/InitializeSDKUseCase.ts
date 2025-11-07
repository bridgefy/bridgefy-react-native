import type { SDKControlResult } from "../entities";
import type { ISDKRepository } from "../repositories";

export class InitializeSDKUseCase {
  constructor(
    private readonly sdkRepository: ISDKRepository
  ) {}

  async execute(apiKey: string, logging: boolean = true): Promise<SDKControlResult> {
    try {
      return await this.sdkRepository.initialize(apiKey, logging);
    } catch (error) {
      console.error('Error initializing SDK:', error);
      throw error;
    }
  }
}
