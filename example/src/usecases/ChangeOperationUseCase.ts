import type { BridgefyOperationModeConfig } from 'bridgefy-react-native';
import type { IOperationRepository } from '../repositories';
import type { SDKControlResult } from '../entities';

export class ChangeOperationUseCase {
  constructor(private readonly operationRepository: IOperationRepository) {}

  async execute(mode: BridgefyOperationModeConfig): Promise<SDKControlResult> {
    try {
      return await this.operationRepository.changeOperationMode(mode);
    } catch (error) {
      console.error('Error opening settings:', error);
      throw error;
    }
  }
}
