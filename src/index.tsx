import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'bridgefy-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const BridgefyReactNative = NativeModules.BridgefyReactNative
  ? NativeModules.BridgefyReactNative
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

/** Profile that defines a series of properties and rules for the propagation of messages. */
export enum BridgefyPropagationProfile {
  standard = 'standard',
  highDensityNetwork = 'highDensityNetwork',
  sparseNetwork = 'sparseNetwork',
  longReach = 'longReach',
  shortReach = 'shortReach',
}

/** The mode used to propagate a message through nearby devices. */
export enum BridgefyTransmissionModeType {
  /** Deliver a message to a specific recipient only if there's an active connection with it. */
  p2p = 'p2p',
  /** Deliver a message to a specific recipient using nearby devices to propagate it. */
  mesh = 'mesh',
  /** Propagate a message readable by every device that receives it. */
  broadcast = 'broadcast',
}

export interface BridgefyTransmissionMode {
  type: BridgefyTransmissionModeType;
  uuid: string;
}

/** Describes errors in the Bridgefy error domain. */
export enum BridgefyErrorType {
  /** The Bridgefy SDK cannot run in the simulator */
  simulatorIsNotSupported = 'simulatorIsNotSupported',
  /** The Bridgefy SDK is already running */
  alreadyStarted = 'alreadyStarted',
  /** The provided API key is not valid */
  invalidAPIKey = 'invalidAPIKey',
  /** The license is expired */
  expiredLicense = 'expiredLicense',
  /** An error occurred while creating the session */
  sessionError = 'sessionError',
  /** (iOS) The Bridgefy SDK hasn't been started */
  notStarted = 'notStarted',
  /** (iOS) A Bridgefy SDK instance already exists */
  alreadyInstantiated = 'alreadyInstantiated',
  /** (iOS) The Bridgefy SDK is performing the start process */
  startInProgress = 'startInProgress',
  /** (iOS) The Bridgefy SDK service is not started */
  serviceNotStarted = 'serviceNotStarted',
  /** (iOS) Cannot get app's bundle id */
  missingBundleID = 'missingBundleID',
  /** (iOS) An internet connection is required to validate the license */
  internetConnectionRequired = 'internetConnectionRequired',
  /** (iOS) The device's time has been modified */
  inconsistentDeviceTime = 'inconsistentDeviceTime',
  /** (iOS) The user does not allow the use of BLE */
  BLEUsageNotGranted = 'BLEUsageNotGranted',
  /** (iOS) The use of BLE in this device is restricted */
  BLEUsageRestricted = 'BLEUsageRestricted',
  /** (iOS) The BLE antenna has been turned off */
  BLEPoweredOff = 'BLEPoweredOff',
  /** (iOS) The usage of BLE is not supported in the device */
  BLEUnsupported = 'BLEUnsupported',
  /** (iOS) BLE usage failed with an unknown error */
  BLEUnknownError = 'BLEUnknownError',
  /** (iOS) Inconsistent connection */
  inconsistentConnection = 'inconsistentConnection',
  /** (iOS) Connection is already secure */
  connectionIsAlreadySecure = 'connectionIsAlreadySecure',
  /** (iOS) Cannot create secure connection */
  cannotCreateSecureConnection = 'cannotCreateSecureConnection',
  /** (iOS) The length of the data exceed the maximum limit */
  dataLengthExceeded = 'dataLengthExceeded',
  /** (iOS) The data to send is empty */
  dataValueIsEmpty = 'dataValueIsEmpty',
  /** (iOS) The requested peer is not connected */
  peerIsNotConnected = 'peerIsNotConnected',
  /** (iOS) An internal error occurred */
  internalError = 'internalError',
  /** (iOS) An error occurred while validating the license */
  licenseError = 'licenseError',
  /** (iOS) An error occurred while storing data */
  storageError = 'storageError',
  /** (iOS) An error occurred while encoding the message */
  encodingError = 'encodingError',
  /** (iOS) An error occurred while encrypting the message */
  encryptionError = 'encryptionError',
  /** (Android) Missing application ID */
  missingApplicationId = 'missingApplicationId',
  /** (Android) Permission exception */
  permissionException = 'permissionException',
  /** (Android) Registration exception */
  registrationException = 'registrationException',
  /** (Android) Size limit exceeded */
  sizeLimitExceeded = 'sizeLimitExceeded',
  /** (Android) Device capabilities error */
  deviceCapabilities = 'deviceCapabilities',
  /** (Android) Generic exception */
  genericException = 'genericException',
  /** (Android) Inconsistent device time */
  inconsistentDeviceTimeException = 'inconsistentDeviceTimeException',
  /** (Android) Internet connection required */
  internetConnectionRequiredException = 'internetConnectionRequiredException',
  /** (Android) Unknown exception */
  unknownException = 'unknownException',
}

/**
 * These events are available via subscriptions to the `NativeEventEmitter` using the
 * `NativeModules.BridgefyReactNative` component. See README for further instructions.
 */
export enum BridgefyEvents {
  /**
   * This function is called when the BridgefySDK has been started.
   */
  bridgefyDidStart = 'bridgefyDidStart',
  /**
   * This function is called when an error occurred while starting the BridgefySDK.
   */
  bridgefyDidFailToStart = 'bridgefyDidFailToStart',
  /**
   * This function is called when the BridgefySDK has been stopped.
   */
  bridgefyDidStop = 'bridgefyDidStop',
  /**
   * This function is called when an error occurred while stopping the BridgefySDK.
   */
  bridgefyDidFailToStop = 'bridgefyDidFailToStop',
  /**
   * The current session was destroyed
   */
  bridgefyDidDestroySession = 'bridgefyDidDestroySession',
  /**
   * An error occurred while destroying the current session
   */
  bridgefyDidFailToDestroySession = 'bridgefyDidFailToDestroySession',
  /**
   * This function is called to notify a new connection.
   */
  bridgefyDidConnect = 'bridgefyDidConnect',
  /**
   * This function is called to notify a disconnection.
   */
  bridgefyDidDisconnect = 'bridgefyDidDisconnect',
  /**
   * This function is called to notify when an on-demand secure connection was established.
   */
  bridgefyDidEstablishSecureConnection = 'bridgefyDidEstablishSecureConnection',
  /**
   * This function is called to notify when an on-demand secure connection could not be established.
   */
  bridgefyDidFailToEstablishSecureConnection = 'bridgefyDidFailToEstablishSecureConnection',
  /**
   * This function is called when you confirm the sending of the message
   */
  bridgefyDidSendMessage = 'bridgefyDidSendMessage',
  /**
   * This function is called when the message could not be sent
   */
  bridgefyDidFailSendingMessage = 'bridgefyDidFailSendingMessage',
  /**
   * This function is called when a new message is received
   */
  bridgefyDidReceiveData = 'bridgefyDidReceiveData',
  /**
   * (Android) Called when there is progress while transmitting data.
   */
  bridgefyDidSendDataProgress = 'bridgefyDidSendDataProgress',
}

/**
 * Bridgefy
 */
export class Bridgefy {
  /**
   * Initialize the SDK
   * @param apiKey API key
   * @param verboseLogging The log level.
   */
  async initialize(apiKey: string, verboseLogging: boolean): Promise<void> {
    return BridgefyReactNative.initialize(apiKey, verboseLogging);
  }

  /**
   * Start Bridgefy SDK operations
   */
  async start(
    userId?: string,
    propagationProfile: BridgefyPropagationProfile = BridgefyPropagationProfile.standard
  ): Promise<void> {
    return BridgefyReactNative.start(userId, propagationProfile);
  }

  /**
   * Stop Bridgefy SDK operations
   */
  async stop(): Promise<void> {
    return BridgefyReactNative.stop();
  }

  /**
   * Destroy current session
   */
  async destroySession(): Promise<void> {
    return BridgefyReactNative.destroySession();
  }

  /**
   * Update license
   */
  async updateLicense(): Promise<void> {
    return BridgefyReactNative.updateLicense();
  }

  /**
   * Function used to send data using a ``TransmissionMode``. This method returns a UUID to identify
   * the message sent.
   * @param data The message data
   * @param transmissionMode The mode used to propagate a message through nearby devices.
   * @returns The id of the message that was sent.
   */
  async send(
    data: string,
    transmissionMode: BridgefyTransmissionMode
  ): Promise<string> {
    const result = await BridgefyReactNative.send(data, transmissionMode);
    return result.messageId;
  }

  /**
   * Establishes a secure connection with the specified user
   * @param userId The UUID of the user with whom a secure connection should be established.
   */
  async establishSecureConnection(userId: string): Promise<void> {
    return BridgefyReactNative.establishSecureConnection(userId);
  }

  /**
   * Get current user Id
   * @returns User Id
   */
  async currentUserId(): Promise<string> {
    const result = await BridgefyReactNative.currentUserId();
    return result.userId;
  }

  /**
   * Returns connected peers
   * @returns List of connected peers
   */
  async connectedPeers(): Promise<string[]> {
    const result = await BridgefyReactNative.connectedPeers();
    return result.connectedPeers;
  }

  /**
   * Returns license expiration date
   * @returns Expiration date
   */
  async licenseExpirationDate(): Promise<Date> {
    const result = await BridgefyReactNative.licenseExpirationDate();
    return new Date(result.licenseExpirationDate as number);
  }

  async isInitialized(): Promise<boolean> {
    return BridgefyReactNative.isInitialized();
  }

  async isStarted(): Promise<boolean> {
    return BridgefyReactNative.isStarted();
  }
}
