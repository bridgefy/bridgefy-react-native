import Bridgefy, { BridgefyOperationMode, type BridgefyOperationModeConfig } from 'bridgefy-react-native';
import type { SDKControlResult } from '../entities';
import type { IOperationRepository } from './OperationRepository';

export class OperationRepository implements IOperationRepository {
  async changeOperationMode(mode: BridgefyOperationModeConfig): Promise<SDKControlResult> {
    try {
      const isStarted = await Bridgefy.isStarted();
      if (!isStarted) {
        return {
          success: false,
          error: new Error('SDK must be started to change operation mode'),
        };
      }

      await Bridgefy.setOperationMode(mode);
      return {
        success: true,
        message: `Operation mode changed to ${mode} successfully`,
      };
    } catch (error: any) {
      console.error('Failed to change operation mode:', error);
      return {
        success: false,
        error,
      };
    }
  }
  async getOperationMode(): Promise<BridgefyOperationMode> {
    try {
      return (await Bridgefy.getOperationMode()).mode.toUpperCase() as BridgefyOperationMode;
    } catch (error) {
      console.error('Failed to get operation mode:', error);
      throw error;
    }
  }
}
