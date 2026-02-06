import type { BridgefyOperationMode } from "bridgefy-react-native";

export type SDKState =
  | 'uninitialized'
  | 'initializing'
  | 'initialized'
  | 'starting'
  | 'started'
  | 'stopping'
  | 'stopped'
  | 'error';

export interface SDKStatusSnapshot {
  isInitialized: boolean;
  isStarted: boolean;
  userId: string;
  connectedPeers: string[];
  propagationProfile: string;
  operationStatus: BridgefyOperationMode;
  loading: boolean;
  error?: string;
}

export interface SDKControlResult {
  success: boolean;
  message?: string;
  error?: Error;
}

export class SDKLifecycle {
  constructor(
    private readonly state: SDKState,
    private readonly userId: string = '',
    private readonly connectedPeers: string[] = []
  ) {}

  canInitialize(): boolean {
    return this.state === 'uninitialized';
  }

  canStart(): boolean {
    return this.state === 'initialized';
  }

  canStop(): boolean {
    return this.state === 'started';
  }

  canDestroy(): boolean {
    return this.state === 'initialized' || this.state === 'stopped';
  }

  getState(): SDKState {
    return this.state;
  }

  getUserId(): string {
    return this.userId;
  }

  getPeers(): string[] {
    return this.connectedPeers;
  }

  getPeerCount(): number {
    return this.connectedPeers.length;
  }
}
