import type { SDKControlResult } from '../entities';
import type { ISDKRepository } from '../repositories';
import { BridgefyOperationMode } from 'bridgefy-react-native';

export class InitializeSDKUseCase {
  constructor(private readonly sdkRepository: ISDKRepository) {}

  async execute(
    apiKey: string,
    logging: boolean = true,
    operationMode: BridgefyOperationMode | null
  ): Promise<SDKControlResult> {
    try {
      return await this.sdkRepository.initialize(
        apiKey,
        logging,
        operationMode
      );
    } catch (error) {
      console.error('Error initializing SDK:', error);
      throw error;
    }
  }
}
