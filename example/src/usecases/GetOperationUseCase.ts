import type { BridgefyOperationMode } from 'bridgefy-react-native';
import type { IOperationRepository } from '../repositories';

export class GetOperationUseCase {
  constructor(private readonly operationRepository: IOperationRepository) {}

  async execute(): Promise<BridgefyOperationMode> {
    try {
      return await this.operationRepository.getOperationMode();
    } catch (error) {
      console.error('Error opening settings:', error);
      throw error;
    }
  }
}
