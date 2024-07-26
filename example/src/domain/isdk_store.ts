import {
  BridgefyErrorType,
  BridgefyPropagationProfile,
  BridgefyTransmissionMode,
} from 'bridgefy-react-native';

interface IBridgefyError {
  code: BridgefyErrorType;
  details?: number;
  message?: string;
}

export interface ISdkStart {
  userId?: string;
  propagationProfile?: BridgefyPropagationProfile;
}
export interface IDidStartOut {
  userId: string;
}
export interface IDidFailOut {
  error: IBridgefyError;
}
export interface IDidReceiveDataOut {
  data: string;
  messageId: string;
  transmissionMode: BridgefyTransmissionMode;
}
export interface IDidSendMessageOut {
  messageId: string;
}
export interface IDidSendDataProgressOut {
  messageId: string;
  position: number;
  of: number;
}
export interface IDidConnectOut extends IDidStartOut {}
export interface IDidDisconnectedOut extends IDidStartOut {}
export interface IDidEstablishSecureConnectionOut extends IDidStartOut {}
