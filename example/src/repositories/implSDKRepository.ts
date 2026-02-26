import Bridgefy, {
  type BridgefyLicenseInfo,
  BridgefyOperationMode,
  BridgefyPropagationProfile,
} from 'bridgefy-react-native';
import type { ISDKRepository, SDKEventHandlers } from './SDKRepository';
import type { SDKControlResult, SDKStatusSnapshot } from '../entities';

export class SDKRepository implements ISDKRepository {
  private eventHandlers: SDKEventHandlers = {};

  async checkStatus(): Promise<SDKStatusSnapshot> {
    try {
      const isInitialized = await Bridgefy.isInitialized();
      const isStarted = await Bridgefy.isStarted();
      let userId = '';
      let connectedPeers: string[] = [];
      let operationStatus: BridgefyOperationMode =
        BridgefyOperationMode.FOREGROUND.toUpperCase() as BridgefyOperationMode;
      let licenseExpirationDate: BridgefyLicenseInfo | null = null;
      let exp: string = '';

      if (isInitialized) {
        licenseExpirationDate = await Bridgefy.licenseExpirationDate();
        if (licenseExpirationDate.isValid) {
          exp =
            'Bridgefy license valid at ' +
            new Date(licenseExpirationDate.expirationDate).toDateString();
        }
      }

      if (isStarted) {
        userId = await Bridgefy.currentUserId();
        connectedPeers = (await Bridgefy.connectedPeers()) || [];
        operationStatus = (
          await Bridgefy.getOperationMode()
        ).mode.toUpperCase() as BridgefyOperationMode;
      }

      return {
        isInitialized,
        isStarted,
        userId,
        connectedPeers,
        bridgefyLicenseInfo: exp,
        propagationProfile: BridgefyPropagationProfile.REALTIME,
        operationStatus,
        loading: false,
      };
    } catch (error) {
      console.error('Failed to check SDK status:', error);
      throw error;
    }
  }

  // @ts-ignore
  async initialize(
    apiKey: string,
    logging: boolean,
    operationMode?: BridgefyOperationMode
  ): Promise<SDKControlResult> {
    try {
      const isAlreadyInitialized = await Bridgefy.isInitialized();
      if (isAlreadyInitialized) {
        return {
          success: true,
          message: 'SDK is already initialized',
        };
      }

      await Bridgefy.initialize(apiKey, logging, operationMode);
      return {
        success: true,
        message: 'Bridgefy SDK initialized successfully',
      };
    } catch (error: any) {
      console.error('Failed to initialize SDK:', error);
      return {
        success: false,
        error,
      };
    }
  }

  async start(propagationProfile: string): Promise<SDKControlResult> {
    try {
      const isInitialized = await Bridgefy.isInitialized();
      if (!isInitialized) {
        return {
          success: false,
          error: new Error('Please initialize the SDK first'),
        };
      }

      const isAlreadyStarted = await Bridgefy.isStarted();
      if (isAlreadyStarted) {
        return {
          success: true,
          message: 'SDK is already started',
        };
      }

      await Bridgefy.start(
        undefined,
        propagationProfile as BridgefyPropagationProfile
      );
      return {
        success: true,
        message: 'Bridgefy SDK started successfully',
      };
    } catch (error: any) {
      console.error('Failed to start SDK:', error);
      return {
        success: false,
        error,
      };
    }
  }

  async stop(): Promise<SDKControlResult> {
    try {
      const isStarted = await Bridgefy.isStarted();
      if (!isStarted) {
        return {
          success: true,
          message: 'SDK is not running',
        };
      }

      await Bridgefy.stop();
      return {
        success: true,
        message: 'Bridgefy SDK stopped successfully',
      };
    } catch (error: any) {
      console.error('Failed to stop SDK:', error);
      return {
        success: false,
        error,
      };
    }
  }

  async destroySession(): Promise<SDKControlResult> {
    try {
      const isInitialized = await Bridgefy.isInitialized();
      if (isInitialized) await Bridgefy.destroySession();

      return {
        success: true,
        message: 'Session destroyed successfully',
      };
    } catch (error: any) {
      console.error('Failed to destroy session:', error);
      return {
        success: false,
        error,
      };
    }
  }

  async getConnectedPeers(): Promise<string[]> {
    try {
      return (await Bridgefy.connectedPeers()) || [];
    } catch (error) {
      console.error('Failed to get connected peers:', error);
      throw error;
    }
  }

  subscribeToEvents(handlers: SDKEventHandlers): void {
    this.eventHandlers = handlers;

    Bridgefy.onStart((event) => {
      this.eventHandlers.onStart?.(event.userId);
    });

    Bridgefy.onStop(() => {
      this.eventHandlers.onStop?.();
    });

    Bridgefy.onConnect((event) => {
      this.eventHandlers.onPeerConnect?.(event.userId);
      this.updatePeers();
    });

    Bridgefy.onDisconnect((event) => {
      this.eventHandlers.onPeerDisconnect?.(event.userId);
      this.updatePeers();
    });

    Bridgefy.onConnectedPeers((event) => {
      const peers = Array.isArray(event.peers) ? event.peers : [];
      this.eventHandlers.onPeersUpdated?.(peers);
    });

    Bridgefy.onFailToStart((error) => {
      const err = new Error(
        (error as any)?.message ?? 'Bridgefy failed to start'
      );
      err.name = (error as any)?.name ?? 'BridgefyError';
      (err as any).code = (error as any)?.code;
      (err as any).original = error;
      this.eventHandlers.onStartFailed?.(err);
    });
  }

  unsubscribeFromEvents(): void {
    Bridgefy.removeAllListeners();
    this.eventHandlers = {};
  }

  private async updatePeers(): Promise<void> {
    try {
      const peers = await this.getConnectedPeers();
      this.eventHandlers.onPeersUpdated?.(peers);
    } catch (error) {
      console.error('Failed to update peers:', error);
    }
  }
}
