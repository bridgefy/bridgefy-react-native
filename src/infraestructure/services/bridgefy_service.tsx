import type { BridgefyTransmissionMode } from 'bridgefy-react-native';
import type { IInitializeIn, IStartIn } from '../interfaces';

export interface BridgefyService {
  initialize(params: IInitializeIn): Promise<void>;
  start(params?: IStartIn): Promise<void>;
  stop(): Promise<void>;
  destroySession(): Promise<void>;
  updateLicense(): Promise<void>;
  send(
    data: string,
    transmissionMode: BridgefyTransmissionMode
  ): Promise<string>;
  establishSecureConnection(userId: string): Promise<void>;
  currentUserId(): Promise<string>;
  connectedPeers(): Promise<string[]>;
  licenseExpirationDate(): Promise<Date>;
  isInitialized(): Promise<boolean>;
  isStarted(): Promise<boolean>;
}
