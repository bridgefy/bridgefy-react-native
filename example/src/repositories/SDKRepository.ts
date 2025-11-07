import type { SDKControlResult, SDKStatusSnapshot } from "../entities";

export interface ISDKRepository {
  checkStatus(): Promise<SDKStatusSnapshot>;
  initialize(apiKey: string, logging: boolean): Promise<SDKControlResult>;
  start(propagationProfile: string): Promise<SDKControlResult>;
  stop(): Promise<SDKControlResult>;
  destroySession(): Promise<SDKControlResult>;
  getConnectedPeers(): Promise<string[]>;
  subscribeToEvents(handlers: SDKEventHandlers): void;
  unsubscribeFromEvents(): void;
}

export interface SDKEventHandlers {
  onStart?: (userId: string) => void;
  onStop?: () => void;
  onPeerConnect?: (userId: string) => void;
  onPeerDisconnect?: (userId: string) => void;
  onPeersUpdated?: (peers: string[]) => void;
  onStartFailed?: (error: Error) => void;
}
