import {FlatList, Platform} from 'react-native';
import {create} from 'zustand';
import {Bridgefy, BridgefyTransmissionModeType} from 'bridgefy-react-native';
import {
  checkMultiple,
  openSettings,
  requestMultiple,
  PERMISSIONS,
} from 'react-native-permissions';

import {EnvironmentConfig} from '../../config';
import {ILog, IMessage, ISdkStart, LogType, OriginMessage} from '../../domain';

const permissions =
  Platform.OS === 'android'
    ? [
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      ]
    : [PERMISSIONS.IOS.LOCATION_ALWAYS, PERMISSIONS.IOS.BLUETOOTH];

export interface SdkState {
  bridgefy: Bridgefy;
  arePermissionsGranted: boolean;

  isStarted: boolean;
  userId?: string;
  isSdkInitialized: boolean;

  logList: ILog[];
  scrollLogList?: React.RefObject<FlatList>;

  messageList: IMessage[];
  scrollMessageList?: React.RefObject<FlatList>;

  checkPermissions: (withLog?: boolean) => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;

  initializedSdk: () => Promise<boolean>;
  start: (params: ISdkStart) => Promise<void>;
  stop: () => Promise<void>;
  addLog: (log: ILog) => void;
  clearLogs: () => void;
  changeIsStarted: (isStarted: boolean) => void;
  changeUserId: (userId?: string) => void;

  addMessage: (message: IMessage) => Promise<void>;
  sendMessage: (input: string) => Promise<void>;
}

export const useSdkStore = create<SdkState>()((set, get) => ({
  bridgefy: new Bridgefy(),
  arePermissionsGranted: false,

  isStarted: false,
  isSdkInitialized: false,

  logList: [],
  // scrollLogList: useRef<FlatList>(null),

  messageList: [],

  checkPermissions: async (withLog = true): Promise<boolean> => {
    const {addLog} = get();

    let granted = true;
    const statuses = await checkMultiple(permissions);
    Object.entries(statuses).forEach(item => {
      if (item[1] !== 'granted') {
        granted = false;
        if (withLog) {
          addLog({
            text: `The permission ${item[0]} is not granted`,
            type: LogType.error,
          });
        }
      }
    });
    set({arePermissionsGranted: granted});
    return granted;
  },
  requestPermissions: async (): Promise<boolean> => {
    const {checkPermissions} = get();
    let isGranted = await checkPermissions(false);
    if (isGranted) {
      return true;
    }

    await requestMultiple(permissions);
    isGranted = await checkPermissions();
    if (!isGranted) {
      await openSettings();
    }
    return isGranted;
  },

  initializedSdk: async (): Promise<boolean> => {
    const {isSdkInitialized, bridgefy, requestPermissions, addLog} = get();
    try {
      const arePermissionsGranted = await requestPermissions();
      if (!arePermissionsGranted || isSdkInitialized) {
        return true;
      }

      await bridgefy.initialize({
        apiKey: EnvironmentConfig.apikey,
        verboseLogging: false,
      });
      set({isSdkInitialized: true});
      return true;
    } catch (error) {
      set({isSdkInitialized: false});
      addLog({
        text: `isInitialized error: ${error}`,
        type: LogType.error,
      });
      return false;
    }
  },
  start: async () => {
    const {addLog, bridgefy, isSdkInitialized} = get();
    try {
      if (!isSdkInitialized) {
        addLog({
          text: 'Bridgefy is not initialized',
          type: LogType.error,
        });
        return;
      }
      await bridgefy.start();
    } catch (error) {
      addLog({
        text: `Started error: ${error}`,
        type: LogType.error,
      });
    }
  },
  changeIsStarted: (isStarted: boolean) => {
    set({isStarted});
  },
  changeUserId: (userId?: string) => {
    set({userId});
  },
  stop: async () => {
    const {addLog, bridgefy} = get();
    try {
      const initialize = await bridgefy.isInitialized();
      if (!initialize) {
        return;
      }

      const isStarted = await bridgefy.isStarted();
      if (!isStarted) {
        return;
      }

      await bridgefy.stop();
    } catch (error) {
      addLog({
        text: `Stopped error: ${error}`,
        type: LogType.error,
      });
    }
  },
  addLog: ({text, type = LogType.normal}: ILog) => {
    const {logList, scrollLogList} = get();
    logList.push({text, type});

    set({logList});
    scrollLogList?.current?.forceUpdate();
  },
  clearLogs: () => {
    set({logList: []});
  },

  addMessage: async (message: IMessage) => {
    const {scrollMessageList, messageList} = get();
    messageList.push(message);

    set({messageList});
    scrollMessageList?.current?.forceUpdate();
  },
  sendMessage: async (text: string) => {
    const {addMessage, bridgefy} = get();

    if (!text) {
      return;
    }
    const userId = await bridgefy.currentUserId();
    if (!userId) {
      return;
    }

    const myMessage: IMessage = {
      body: text,
      origin: OriginMessage.me,
    };
    await bridgefy.send(text, {
      type: BridgefyTransmissionModeType.broadcast,
      uuid: userId,
    });
    addMessage(myMessage);
  },
}));
