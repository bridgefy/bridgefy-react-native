/**
 * BridgefyEventStore.ts
 *
 * Global event store/context for collecting all SDK events
 * Events are stored centrally and accessible from any screen
 */

import { create } from 'zustand';
import type {
  BridgefyDidSendDataProgress,
  BridgefyUpdatedConnectedEvent,
} from 'bridgefy-react-native';
import {
  type BridgefyConnectEvent,
  type BridgefyDisconnectEvent,
  type BridgefyError,
  BridgefyEvents,
  type BridgefyReceiveDataEvent,
  type BridgefySecureConnectionEvent,
  type BridgefySendMessageEvent,
  type BridgefyStartEvent,
} from 'bridgefy-react-native';

export interface SDKEvent {
  id: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error';
  eventName: string;
  eventKey: string;
  message: string;
  data?: any;
  screen?: string;
}

export interface BridgefyEventStoreState {
  // Events
  events: SDKEvent[];
  addEvent: (event: Omit<SDKEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
  getEventsByType: (
    type: 'info' | 'success' | 'warning' | 'error'
  ) => SDKEvent[];
  getEventsByScreen: (screen: string) => SDKEvent[];

  // SDK Status
  isInitialized: boolean;
  setIsInitialized: (value: boolean) => void;

  isStarted: boolean;
  setIsStarted: (value: boolean) => void;

  currentUserId: string;
  setCurrentUserId: (userId: string) => void;

  connectedPeersCount: number;
  setConnectedPeersCount: (count: number) => void;

  // Statistics
  totalMessagesSent: number;
  setTotalMessagesSent: (count: number) => void;

  totalMessagesReceived: number;
  setTotalMessagesReceived: (count: number) => void;

  // Max events limit
  MAX_EVENTS: number;
}

export const useBridgefyEventStore = create<BridgefyEventStoreState>(
  (set, get) => ({
    MAX_EVENTS: 500,

    events: [],

    addEvent: (event: Omit<SDKEvent, 'id' | 'timestamp'>) => {
      const newEvent: SDKEvent = {
        ...event,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };

      set((state) => {
        const events = [newEvent, ...state.events];
        // Keep only the latest MAX_EVENTS events
        if (events.length > state.MAX_EVENTS) {
          return { events: events.slice(0, state.MAX_EVENTS) };
        }
        return { events };
      });
    },

    clearEvents: () => {
      set({ events: [] });
    },

    getEventsByType: (type) => {
      return get().events.filter((event) => event.type === type);
    },

    getEventsByScreen: (screen) => {
      return get().events.filter((event) => event.screen === screen);
    },

    isInitialized: false,
    setIsInitialized: (value) => set({ isInitialized: value }),

    isStarted: false,
    setIsStarted: (value) => set({ isStarted: value }),

    currentUserId: '',
    setCurrentUserId: (userId) => set({ currentUserId: userId }),

    connectedPeersCount: 0,
    setConnectedPeersCount: (count) => set({ connectedPeersCount: count }),

    totalMessagesSent: 0,
    setTotalMessagesSent: (count) => set({ totalMessagesSent: count }),

    totalMessagesReceived: 0,
    setTotalMessagesReceived: (count) => set({ totalMessagesReceived: count }),
  })
);

/**
 * Helper function to create and add event to store
 */
export const addBridgefyEvent = (
  type: 'info' | 'success' | 'warning' | 'error',
  eventName: string,
  eventKey: string,
  message: string,
  data?: any,
  screen?: string
) => {
  useBridgefyEventStore.getState().addEvent({
    type,
    eventName,
    eventKey,
    message,
    data,
    screen,
  });
};

/**
 * Event listener setup hook
 * Call this once in your main app or a context provider
 */
export const setupBridgefyEventListeners = (Bridgefy: any) => {
  const store = useBridgefyEventStore.getState();

  // Lifecycle Events
  Bridgefy.onStart((event: BridgefyStartEvent) => {
    store.setIsStarted(true);
    store.setCurrentUserId(event.userId);
    addBridgefyEvent(
      'success',
      BridgefyEvents.BRIDGEFY_DID_START,
      'bridgefyDidStart',
      'SDK started successfully',
      event
    );
  });

  Bridgefy.onStop(() => {
    store.setIsStarted(false);
    addBridgefyEvent(
      'info',
      BridgefyEvents.BRIDGEFY_DID_STOP,
      'bridgefyDidStop',
      'SDK stopped'
    );
  });

  Bridgefy.onFailToStart((error: BridgefyError) => {
    store.setIsStarted(false);
    addBridgefyEvent(
      'error',
      BridgefyEvents.BRIDGEFY_DID_FAIL_TO_START,
      'bridgefyDidFailToStart',
      `Failed to start: ${error.message}`,
      error
    );
  });

  Bridgefy.onFailToStop((error: BridgefyError) => {
    addBridgefyEvent(
      'error',
      BridgefyEvents.BRIDGEFY_DID_FAIL_TO_STOP,
      'bridgefyDidFailToStop',
      `Failed to stop: ${error.message}`,
      error
    );
  });

  // Connection Events
  Bridgefy.onConnect((event: BridgefyConnectEvent) => {
    addBridgefyEvent(
      'success',
      BridgefyEvents.BRIDGEFY_DID_CONNECT,
      'bridgefyDidConnect',
      `Peer connected: ${event.userId.substring(0, 12)}...`,
      event
    );
  });

  Bridgefy.onConnectedPeers((event: BridgefyUpdatedConnectedEvent) => {
    addBridgefyEvent(
      'success',
      BridgefyEvents.BRIDGEFY_DID_UPDATE_CONNECTED_PEERS,
      'bridgefyDidUpdateConnectedPeers',
      `Peers connected: ${event.peers.length}...`,
      event
    );
  });

  Bridgefy.onDisconnect((event: BridgefyDisconnectEvent) => {
    addBridgefyEvent(
      'warning',
      BridgefyEvents.BRIDGEFY_DID_DISCONNECT,
      'bridgefyDidDisconnect',
      `Peer disconnected: ${event.userId.substring(0, 12)}...`,
      event
    );
  });

  Bridgefy.onEstablishSecureConnection(
    (event: BridgefySecureConnectionEvent) => {
      addBridgefyEvent(
        'success',
        BridgefyEvents.BRIDGEFY_DID_ESTABLISH_SECURE_CONNECTION,
        'bridgefyDidEstablishSecureConnection',
        `Secure connection established: ${event.userId.substring(0, 12)}...`,
        event
      );
    }
  );

  Bridgefy.onFailToEstablishSecureConnection((error: BridgefyError) => {
    addBridgefyEvent(
      'error',
      BridgefyEvents.BRIDGEFY_DID_FAIL_TO_ESTABLISH_SECURE_CONNECTION,
      'bridgefyDidFailToEstablishSecureConnection',
      `Failed to establish secure connection: ${error.message}`,
      error
    );
  });

  // Message Events
  Bridgefy.onSendMessage((event: BridgefySendMessageEvent) => {
    store.setTotalMessagesSent(store.totalMessagesSent + 1);
    addBridgefyEvent(
      'success',
      BridgefyEvents.BRIDGEFY_DID_SEND_MESSAGE,
      'bridgefyDidSendMessage',
      `Message sent: ${event.messageId.substring(0, 8)}...`,
      event
    );
  });

  Bridgefy.onSendDataProgress((event: BridgefyDidSendDataProgress) => {
    addBridgefyEvent(
      'success',
      BridgefyEvents.BRIDGEFY_DID_SEND_DATA_PROGRESS,
      'bridgefyDidSendDataProgress',
      `Message sent: ${event.messageId.substring(0, 8)}... ${event.position} of: ${event.position}`,
      event
    );
  });

  Bridgefy.onFailSendingMessage((error: BridgefyError) => {
    addBridgefyEvent(
      'error',
      BridgefyEvents.BRIDGEFY_DID_FAIL_SENDING_MESSAGE,
      'bridgefyDidFailSendingMessage',
      `Failed to send message: ${error.message}`,
      error
    );
  });

  Bridgefy.onReceiveData((event: BridgefyReceiveDataEvent) => {
    store.setTotalMessagesReceived(store.totalMessagesReceived + 1);
    addBridgefyEvent(
      'info',
      BridgefyEvents.BRIDGEFY_DID_RECEIVE_DATA,
      'bridgefyDidReceiveData',
      `Message received from ${event.transmissionMode.uuid?.substring(0, 12)}...`,
      event
    );
  });

  // License Events
  Bridgefy.onUpdateLicense(() => {
    addBridgefyEvent(
      'success',
      BridgefyEvents.BRIDGEFY_DID_UPDATE_LICENSE,
      'bridgefyDidUpdateLicense',
      'License updated successfully'
    );
  });

  Bridgefy.onFailToUpdateLicense((error: BridgefyError) => {
    addBridgefyEvent(
      'error',
      BridgefyEvents.BRIDGEFY_DID_FAIL_TO_UPDATE_LICENSE,
      'bridgefyDidFailToUpdateLicense',
      `Failed to update license: ${error.message}`,
      error
    );
  });

  // Session Events
  Bridgefy.onDestroySession?.(() => {
    addBridgefyEvent(
      'info',
      BridgefyEvents.BRIDGEFY_DID_DESTROY_SESSION,
      'bridgefyDidDestroySession',
      'Session destroyed'
    );
  });

  Bridgefy.onFailToDestroySession?.((error: any) => {
    addBridgefyEvent(
      'error',
      BridgefyEvents.BRIDGEFY_DID_FAIL_TO_DESTROY_SESSION,
      'bridgefyDidFailToDestroySession',
      `Failed to destroy session: ${error.message}`,
      error
    );
  });
};
