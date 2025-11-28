/**
 * BridgefyReactNative.ts
 * TurboModule Spec for Bridgefy SDK
 *
 * This spec defines all methods from the Bridgefy SDK for both Android and iOS
 * Based on: https://github.com/bridgefy/bridgefy-react-native
 */

import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

// ==================== ENUMS ====================

export enum BridgefyPropagationProfile {
  STANDARD = 'standard',
  HIGH_DENSITY_NETWORK = 'highDensityNetwork',
  SPARSE_NETWORK = 'sparseNetwork',
  LONG_REACH = 'longReach',
  SHORT_REACH = 'shortReach',
}

export enum BridgefyTransmissionModeType {
  BROADCAST = 'broadcast',
  P2P = 'p2p',
  MESH = 'mesh',
}

export enum BridgefyEvents {
  // Lifecycle Events
  BRIDGEFY_DID_START = 'bridgefyDidStart',
  BRIDGEFY_DID_STOP = 'bridgefyDidStop',
  BRIDGEFY_DID_FAIL_TO_START = 'bridgefyDidFailToStart',
  BRIDGEFY_DID_FAIL_TO_STOP = 'bridgefyDidFailToStop',
  BRIDGEFY_DID_DESTROY_SESSION = 'bridgefyDidDestroySession',
  BRIDGEFY_DID_FAIL_TO_DESTROY_SESSION = 'bridgefyDidFailToDestroySession',

  // Connection Events
  BRIDGEFY_DID_CONNECT = 'bridgefyDidConnect',
  BRIDGEFY_DID_UPDATE_CONNECTED_PEERS = 'bridgefyDidUpdateConnectedPeers',
  BRIDGEFY_DID_DISCONNECT = 'bridgefyDidDisconnect',
  BRIDGEFY_DID_ESTABLISH_SECURE_CONNECTION = 'bridgefyDidEstablishSecureConnection',
  BRIDGEFY_DID_FAIL_TO_ESTABLISH_SECURE_CONNECTION = 'bridgefyDidFailToEstablishSecureConnection',

  // Message Events
  BRIDGEFY_DID_SEND_MESSAGE = 'bridgefyDidSendMessage',
  BRIDGEFY_DID_SEND_DATA_PROGRESS = 'bridgefyDidSendDataProgress',
  BRIDGEFY_DID_FAIL_SENDING_MESSAGE = 'bridgefyDidFailSendingMessage',
  BRIDGEFY_DID_RECEIVE_DATA = 'bridgefyDidReceiveData',
  BRIDGEFY_MESSAGE_RECEIVED = 'bridgefyMessageReceived',

  // License Events
  BRIDGEFY_DID_UPDATE_LICENSE = 'bridgefyDidUpdateLicense',
  BRIDGEFY_DID_FAIL_TO_UPDATE_LICENSE = 'bridgefyDidFailToUpdateLicense',
}

export enum BridgefyErrorCode {
  // Initialization Errors
  INVALID_API_KEY = 'INVALID_API_KEY',
  SESSION_ERROR = 'SESSION_ERROR',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  LICENSE_ERROR = 'LICENSE_ERROR',

  // Connection Errors
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  BLUETOOTH_DISABLED = 'BLUETOOTH_DISABLED',
  LOCATION_PERMISSION_DENIED = 'LOCATION_PERMISSION_DENIED',
  BLUETOOTH_PERMISSION_DENIED = 'BLUETOOTH_PERMISSION_DENIED',

  // Message Errors
  MESSAGE_SEND_FAILED = 'MESSAGE_SEND_FAILED',
  INVALID_MESSAGE = 'INVALID_MESSAGE',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',

  // Service Errors
  SERVICE_NOT_STARTED = 'SERVICE_NOT_STARTED',
  SERVICE_ALREADY_STARTED = 'SERVICE_ALREADY_STARTED',
  DESTROY_SESSION_ERROR = 'DESTROY_SESSION_ERROR',

  // License Errors
  LICENSE_EXPIRED = 'LICENSE_EXPIRED',
  LICENSE_UPDATE_FAILED = 'LICENSE_UPDATE_FAILED',

  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export enum BridgefyOperationMode {
  /**
   * FOREGROUND: SDK runs only when app is in foreground
   * - Lower battery usage
   * - No background service
   * - Simpler lifecycle
   * - Good for testing/development
   */
  FOREGROUND = 'foreground',

  /**
   * BACKGROUND: SDK runs in background service
   * - Continuous mesh networking
   * - Higher battery usage
   * - Foreground service with notification
   * - Survives app backgrounding
   */
  BACKGROUND = 'background',

  /**
   * HYBRID: Foreground in app, background in service
   * - Starts in foreground when app is active
   * - Switches to background service when app backgrounded
   * - Automatic mode switching
   * - Best of both worlds
   */
  HYBRID = 'hybrid',
}

// ==================== TYPES ====================

export type BridgefyInitConfig = {
  apiKey: string;
  verboseLogging?: boolean;
  operationMode?: BridgefyOperationMode;
};

export type BridgefyTransmissionMode = {
  type: BridgefyTransmissionModeType;
  uuid?: string; // Required for P2P, optional for others
};

export type BridgefyError = {
  code: BridgefyErrorCode;
  message: string;
  domain?: string;
  userInfo?: Record<string, any>;
};

export type BridgefyMessageData = {
  senderId: string;
  receiverId?: string;
  data: string;
  messageId: string;
  timestamp: number;
  transmissionMode: BridgefyTransmissionModeType;
};

export type BridgefyStartEvent = {
  userId: string;
};

export type BridgefyConnectEvent = {
  userId: string;
};

export type BridgefyUpdatedConnectedEvent = {
  peers: string[];
};

export type BridgefyDisconnectEvent = {
  userId: string;
};

export type BridgefySendMessageEvent = {
  messageId: string;
};

export type BridgefyDidSendDataProgress = {
  messageId: string;
  position: number;
  of: number;
};

export type BridgefyReceiveDataEvent = {
  data: string;
  messageId: string;
  transmissionMode: BridgefyTransmissionMode;
};

export type BridgefySecureConnectionEvent = {
  userId: string;
};

export type BridgefyLicenseInfo = {
  expirationDate: number; // timestamp in milliseconds
  isValid: boolean;
};

export type BridgefyOperationModeConfig = {
  mode: BridgefyOperationMode;
};

export type BridgefyOperationModeStatus = {
  operationMode: BridgefyOperationMode;
  isInitialized: boolean;
  isStarted: boolean;
  shouldRunInService: boolean;
  debugInfo: string;
  };
// ==================== TURBOMODULE SPEC ====================

export interface Spec extends TurboModule {
  /**
   * Initialize the Bridgefy SDK
   * @param config Configuration object with API key and settings
   * @returns Promise that resolves when initialization is complete
   * @throws BridgefyError if initialization fails
   */
  initialize(config: BridgefyInitConfig): Promise<void>;

  /**
   * Start the Bridgefy SDK with optional user ID and propagation profile
   * @param userId Optional custom user ID (UUID string)
   * @param propagationProfile Propagation profile for mesh network
   * @returns Promise that resolves when SDK starts
   * @throws BridgefyError if start fails
   */
  start(
    userId?: string,
    propagationProfile?: BridgefyPropagationProfile
  ): Promise<void>;

  /**
   * Stop the Bridgefy SDK
   * @returns Promise that resolves when SDK stops
   * @throws BridgefyError if stop fails
   */
  stop(): Promise<void>;

  /**
   * Destroy the current Bridgefy session
   * Terminates all active connections and cleans up resources
   * @returns Promise that resolves when session is destroyed
   * @throws BridgefyError if destroy fails
   */
  destroySession(): Promise<void>;

  /**
   * Send data through the Bridgefy mesh network
   * @param data String data to send (serialize objects to JSON string)
   * @param transmissionMode Transmission mode configuration
   * @returns Promise that resolves with the message ID (UUID string)
   * @throws BridgefyError if send fails
   */
  send(
    data: string,
    transmissionMode: BridgefyTransmissionMode
  ): Promise<string>;

  /**
   * Establish a secure connection with a specific user
   * @param userId The user ID to establish secure connection with
   * @returns Promise that resolves when connection is established
   * @throws BridgefyError if connection fails
   */
  establishSecureConnection(userId: string): Promise<void>;

  /**
   * Get the current user ID
   * @returns Promise that resolves with the current user's UUID string
   * @throws BridgefyError if not initialized
   */
  currentUserId(): Promise<string>;

  /**
   * Get list of currently connected peers
   * @returns Promise that resolves with array of user IDs (UUID strings)
   * @throws BridgefyError if not started
   */
  connectedPeers(): Promise<string[]>;

  /**
   * Get the license expiration date
   * @returns Promise that resolves with license info
   * @throws BridgefyError if license check fails
   */
  licenseExpirationDate(): Promise<BridgefyLicenseInfo>;

  /**
   * Update the Bridgefy license
   * @returns Promise that resolves when license is updated
   * @throws BridgefyError if update fails
   */
  updateLicense(): Promise<void>;

  /**
   * Check if the SDK is initialized
   * @returns Promise that resolves with boolean
   */
  isInitialized(): Promise<boolean>;

  /**
   * Check if the SDK is started
   * @returns Promise that resolves with boolean
   */
  isStarted(): Promise<boolean>;

  /**
   * Add event listener (internal method for native events)
   * This is typically handled by React Native's EventEmitter
   */
  addListener(eventName: string): void;

  /**
   * Remove event listeners (internal method)
   * @param count Number of listeners to remove
   */
  removeListeners(count: number): void;

  setOperationMode(config: BridgefyOperationModeConfig): Promise<BridgefyOperationModeConfig>;
  getOperationMode(): Promise<BridgefyOperationModeConfig>;
  switchToBackground(): Promise<void>;
  switchToForeground(): Promise<void>;
  getOperationStatus(): Promise<BridgefyOperationModeStatus>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('BridgefyReactNative');
