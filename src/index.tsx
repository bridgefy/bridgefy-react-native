import { NativeEventEmitter, NativeModules } from 'react-native';
import BridgefyReactNative, {
  BridgefyPropagationProfile,
  BridgefyTransmissionModeType,
  BridgefyEvents,
  BridgefyErrorCode,
  BridgefyOperationMode,
  type BridgefyInitConfig,
  type BridgefyTransmissionMode,
  type BridgefyError,
  type BridgefyMessageData,
  type BridgefyStartEvent,
  type BridgefyConnectEvent,
  type BridgefyDisconnectEvent,
  type BridgefySendMessageEvent,
  type BridgefyReceiveDataEvent,
  type BridgefySecureConnectionEvent,
  type BridgefyLicenseInfo,
  type BridgefyUpdatedConnectedEvent,
  type BridgefyDidSendDataProgress,
  type BridgefyOperationModeConfig,
  type BridgefyOperationModeStatus,
} from './NativeBridgefy';

/**
 * index.ts
 *
 * Main export file for Bridgefy React Native TurboModule
 * Provides a clean JavaScript/TypeScript wrapper around the native TurboModule
 */

// Export types and enums
export {
  BridgefyPropagationProfile,
  BridgefyTransmissionModeType,
  BridgefyEvents,
  BridgefyErrorCode,
  BridgefyOperationMode,
  type BridgefyInitConfig,
  type BridgefyTransmissionMode,
  type BridgefyError,
  type BridgefyMessageData,
  type BridgefyStartEvent,
  type BridgefyConnectEvent,
  type BridgefyDisconnectEvent,
  type BridgefySendMessageEvent,
  type BridgefyReceiveDataEvent,
  type BridgefySecureConnectionEvent,
  type BridgefyLicenseInfo,
  type BridgefyUpdatedConnectedEvent,
  type BridgefyDidSendDataProgress,
  type BridgefyOperationModeConfig,
  type BridgefyOperationModeStatus,
};

/**
 * Bridgefy class - JavaScript wrapper for the native TurboModule
 * Provides event emitter capabilities and clean API
 */
export class Bridgefy {
  private eventEmitter: NativeEventEmitter;

  constructor() {
    // Create event emitter for native events
    const module = BridgefyReactNative || NativeModules.BridgefyReactNative;
    this.eventEmitter = new NativeEventEmitter(module);
  }

  /**
   * Initialize the Bridgefy SDK
   */
  async initialize(
    apiKey: string,
    verboseLogging: boolean = false,
    operationMode?: BridgefyOperationMode
  ): Promise<void> {
    const config: BridgefyInitConfig = {
      apiKey,
      verboseLogging,
      operationMode,
    };
    return BridgefyReactNative.initialize(config);
  }

  /**
   * Start the Bridgefy SDK
   */
  async start(
    userId?: string,
    propagationProfile: BridgefyPropagationProfile = BridgefyPropagationProfile.REALTIME
  ): Promise<void> {
    return BridgefyReactNative.start(userId, propagationProfile);
  }

  /**
   * Stop the Bridgefy SDK
   */
  async stop(): Promise<void> {
    return BridgefyReactNative.stop();
  }

  /**
   * Destroy the current session
   */
  async destroySession(): Promise<void> {
    return BridgefyReactNative.destroySession();
  }

  /**
   * Send data through the mesh network
   */
  async send(
    data: string,
    transmissionMode: BridgefyTransmissionMode
  ): Promise<string> {
    return BridgefyReactNative.send(data, transmissionMode);
  }

  /**
   * Send broadcast message (convenience method)
   */
  async sendBroadcast(data: string): Promise<string> {
    const userId = await this.currentUserId();
    return this.send(data, {
      type: BridgefyTransmissionModeType.BROADCAST,
      uuid: userId,
    });
  }

  /**
   * Send P2P message (convenience method)
   */
  async sendP2P(data: string, recipientId: string): Promise<string> {
    return this.send(data, {
      type: BridgefyTransmissionModeType.P2P,
      uuid: recipientId,
    });
  }

  /**
   * Send mesh message (convenience method)
   */
  async sendMesh(data: string, recipientId: string): Promise<string> {
    return this.send(data, {
      type: BridgefyTransmissionModeType.MESH,
      uuid: recipientId,
    });
  }

  /**
   * Establish secure connection with a peer
   */
  async establishSecureConnection(userId: string): Promise<void> {
    return BridgefyReactNative.establishSecureConnection(userId);
  }

  /**
   * Get current user ID
   */
  async currentUserId(): Promise<string> {
    return BridgefyReactNative.currentUserId();
  }

  /**
   * Get list of connected peers
   */
  async connectedPeers(): Promise<string[]> {
    return BridgefyReactNative.connectedPeers();
  }

  /**
   * Get license expiration info
   */
  async licenseExpirationDate(): Promise<BridgefyLicenseInfo> {
    return BridgefyReactNative.licenseExpirationDate();
  }

  /**
   * Update license
   */
  async updateLicense(): Promise<void> {
    return BridgefyReactNative.updateLicense();
  }

  /**
   * Check if SDK is initialized
   */
  async isInitialized(): Promise<boolean> {
    return BridgefyReactNative.isInitialized();
  }

  /**
   * Check if SDK is started
   */
  async isStarted(): Promise<boolean> {
    return BridgefyReactNative.isStarted();
  }

  async setOperationMode(
    config: BridgefyOperationModeConfig
  ): Promise<BridgefyOperationModeConfig> {
    return BridgefyReactNative.setOperationMode(config);
  }
  async getOperationMode(): Promise<BridgefyOperationModeConfig> {
    return BridgefyReactNative.getOperationMode();
  }
  async switchToBackground(): Promise<void> {
    return BridgefyReactNative.switchToBackground();
  }
  async switchToForeground(): Promise<void> {
    return BridgefyReactNative.switchToForeground();
  }
  async getOperationStatus(): Promise<BridgefyOperationModeStatus> {
    return BridgefyReactNative.getOperationStatus();
  }

  /**
   * Add event listener
   */
  addEventListener(
    eventName: BridgefyEvents,
    listener: (event: any) => void
  ): { remove: () => void } {
    const subscription = this.eventEmitter.addListener(eventName, listener);
    return {
      remove: () => subscription.remove(),
    };
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(eventName?: BridgefyEvents): void {
    if (eventName) {
      this.eventEmitter.removeAllListeners(eventName);
    } else {
      // Remove all listeners for all events
      Object.values(BridgefyEvents).forEach((event) => {
        this.eventEmitter.removeAllListeners(event);
      });
    }
  }

  /**
   * Event listener helpers for common events
   */

  onStart(listener: (event: BridgefyStartEvent) => void) {
    return this.addEventListener(BridgefyEvents.BRIDGEFY_DID_START, listener);
  }

  onStop(listener: () => void) {
    return this.addEventListener(BridgefyEvents.BRIDGEFY_DID_STOP, listener);
  }

  onFailToStart(listener: (error: BridgefyError) => void) {
    return this.addEventListener(
      BridgefyEvents.BRIDGEFY_DID_FAIL_TO_START,
      listener
    );
  }

  onFailToStop(listener: (error: BridgefyError) => void) {
    return this.addEventListener(
      BridgefyEvents.BRIDGEFY_DID_FAIL_TO_STOP,
      listener
    );
  }

  onConnect(listener: (event: BridgefyConnectEvent) => void) {
    return this.addEventListener(BridgefyEvents.BRIDGEFY_DID_CONNECT, listener);
  }

  onConnectedPeers(listener: (event: BridgefyUpdatedConnectedEvent) => void) {
    return this.addEventListener(
      BridgefyEvents.BRIDGEFY_DID_UPDATE_CONNECTED_PEERS,
      listener
    );
  }

  onDisconnect(listener: (event: BridgefyDisconnectEvent) => void) {
    return this.addEventListener(
      BridgefyEvents.BRIDGEFY_DID_DISCONNECT,
      listener
    );
  }

  onSendMessage(listener: (event: BridgefySendMessageEvent) => void) {
    return this.addEventListener(
      BridgefyEvents.BRIDGEFY_DID_SEND_MESSAGE,
      listener
    );
  }

  onSendDataProgress(listener: (event: BridgefyDidSendDataProgress) => void) {
    return this.addEventListener(
      BridgefyEvents.BRIDGEFY_DID_SEND_DATA_PROGRESS,
      listener
    );
  }

  onFailSendingMessage(
    listener: (error: BridgefyError & { messageId: string }) => void
  ) {
    return this.addEventListener(
      BridgefyEvents.BRIDGEFY_DID_FAIL_SENDING_MESSAGE,
      listener
    );
  }

  onReceiveData(listener: (event: BridgefyReceiveDataEvent) => void) {
    return this.addEventListener(
      BridgefyEvents.BRIDGEFY_DID_RECEIVE_DATA,
      listener
    );
  }

  onEstablishSecureConnection(
    listener: (event: BridgefySecureConnectionEvent) => void
  ) {
    return this.addEventListener(
      BridgefyEvents.BRIDGEFY_DID_ESTABLISH_SECURE_CONNECTION,
      listener
    );
  }

  onFailToEstablishSecureConnection(
    listener: (error: BridgefyError & { userId: string }) => void
  ) {
    return this.addEventListener(
      BridgefyEvents.BRIDGEFY_DID_FAIL_TO_ESTABLISH_SECURE_CONNECTION,
      listener
    );
  }

  onUpdateLicense(listener: () => void) {
    return this.addEventListener(
      BridgefyEvents.BRIDGEFY_DID_UPDATE_LICENSE,
      listener
    );
  }

  onFailToUpdateLicense(listener: (error: BridgefyError) => void) {
    return this.addEventListener(
      BridgefyEvents.BRIDGEFY_DID_FAIL_TO_UPDATE_LICENSE,
      listener
    );
  }
}

// Export default instance for convenience
export default new Bridgefy();
