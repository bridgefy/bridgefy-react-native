import {useEffect} from 'react';
import {BridgefyEvents} from 'bridgefy-react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {
  type EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';

import {TabNavigator} from '../routes';
import {useSdkStore} from '../store';
import {
  type IDidConnectOut,
  type IDidDisconnectedOut,
  type IDidEstablishSecureConnectionOut,
  type IDidFailOut,
  type IDidReceiveDataOut,
  type IDidSendDataProgressOut,
  type IDidSendMessageOut,
  type IDidStartOut,
  LogType,
  OriginMessage,
} from '../../domain';
import {StartStopButton} from '../components';

const Stack = createStackNavigator();

export const HomeScreen = () => {
  const changeIsStarted = useSdkStore(state => state.changeIsStarted);
  const changeUserId = useSdkStore(state => state.changeUserId);
  const addLog = useSdkStore(state => state.addLog);
  const addMessage = useSdkStore(state => state.addMessage);
  const stopSdk = useSdkStore(state => state.stop);

  useEffect(() => {
    const subscriptions: EmitterSubscription[] = [];
    const eventEmitter = new NativeEventEmitter(
      Platform.OS === 'ios' ? NativeModules.BridgefyReactNative : null,
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidConnect,
        ({userId}: IDidConnectOut) => {
          addLog({
            text: `A user with id ${userId} has connected`,
            type: LogType.success,
          });
        },
      ),
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidEstablishSecureConnection,
        ({userId}: IDidEstablishSecureConnectionOut) => {
          addLog({
            text: `didEstablishSecureConnection: ${userId}`,
            type: LogType.normal,
          });
        },
      ),
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidDisconnect,
        ({userId}: IDidDisconnectedOut) => {
          addLog({
            text: `didDisconnect: ${userId}`,
            type: LogType.finish,
          });
        },
      ),
    );
    subscriptions.push(
      eventEmitter.addListener(BridgefyEvents.bridgefyDidDestroySession, () => {
        addLog({
          text: 'didDestroySession',
          type: LogType.normal,
        });
      }),
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidStart,
        ({userId}: IDidStartOut) => {
          changeIsStarted(true);
          changeUserId(userId);
          addLog({
            text: `didStart ${userId}`,
            type: LogType.success,
          });
        },
      ),
    );
    subscriptions.push(
      eventEmitter.addListener(BridgefyEvents.bridgefyDidStop, () => {
        changeIsStarted(false);
        changeUserId();
        addLog({
          text: 'didStop',
          type: LogType.finish,
        });
      }),
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidSendDataProgress,
        ({messageId, position, of}: IDidSendDataProgressOut) => {
          addLog({
            text: `didSendDataProgress: ${messageId}, ${position}, ${of}`,
            type: LogType.normal,
          });
        },
      ),
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidSendMessage,
        ({messageId}: IDidSendMessageOut) => {
          addLog({
            text: `didSendMessage: ${messageId}`,
            type: LogType.success,
          });
        },
      ),
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidReceiveData,
        ({data, messageId, transmissionMode}: IDidReceiveDataOut) => {
          addMessage({
            body: data,
            origin: OriginMessage.other,
            messageId,
          });
          addLog({
            text: `didReceiveData: ${data}, ${messageId}, ${JSON.stringify(
              transmissionMode,
            )}`,
            type: LogType.normal,
          });
        },
      ),
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailSendingMessage,
        ({error}: IDidFailOut) => {
          addLog({
            text: `didFailSendingMessage ${JSON.stringify(error)}`,
            type: LogType.error,
          });
        },
      ),
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailToDestroySession,
        ({error}: IDidFailOut) => {
          addLog({
            text: `didFailToDestroySession ${JSON.stringify(error)}`,
            type: LogType.error,
          });
        },
      ),
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailToEstablishSecureConnection,
        ({error}: IDidFailOut) => {
          addLog({
            text: `didFailToEstablishSecureConnection ${JSON.stringify(error)}`,
            type: LogType.error,
          });
        },
      ),
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailToStart,
        ({error}: IDidFailOut) => {
          addLog({
            text: `didFailToStart ${JSON.stringify(error)}`,
            type: LogType.error,
          });
        },
      ),
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailToStop,
        ({error}: IDidFailOut) => {
          addLog({
            text: `didFailToStop ${JSON.stringify(error)}`,
            type: LogType.error,
          });
        },
      ),
    );
    return () => {
      for (const sub of subscriptions) {
        sub.remove();
      }
      stopSdk();
      // bridgefy = null;
    };
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        title: 'Bridgefy React',
        headerTitleAlign: 'left',
        headerStyle: {
          elevation: 0,
          shadowColor: 'transparent',
        },
        headerRight: () => <StartStopButton />,
      }}>
      <Stack.Screen name="Home" component={TabNavigator} />
    </Stack.Navigator>
  );
};
