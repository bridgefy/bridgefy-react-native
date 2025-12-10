import type { BridgefyOperationMode, BridgefyOperationModeConfig } from 'bridgefy-react-native';
import type { SDKControlResult } from '../entities';

export interface IOperationRepository {
  changeOperationMode(mode: BridgefyOperationModeConfig): Promise<SDKControlResult>;
  getOperationMode(): Promise<BridgefyOperationMode>;
}
