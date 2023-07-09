import {
  Bridgefy,
  BridgefyEvents,
  BridgefyPropagationProfile,
} from 'bridgefy-react-native';
import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  NativeEventEmitter,
  NativeModules,
  type EmitterSubscription,
} from 'react-native';

export default function App() {
  const [result, _setResult] = React.useState<number | undefined>();
  const bridgefy = new Bridgefy();

  // Subscribe to Bridgefy real-time events so we can act on them as required.
  React.useEffect(() => {
    const subscriptions: EmitterSubscription[] = [];
    const eventEmitter = new NativeEventEmitter(
      NativeModules.BridgefyReactNative
    );
    subscriptions.push(
      eventEmitter.addListener(BridgefyEvents.bridgefyDidStart, (event) => {
        console.log(`bridgefyDidStart: ${event}`);
      })
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailToStart,
        (event) => {
          console.error(`bridgefyDidFailToStart: ${event}`);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(BridgefyEvents.bridgefyDidStop, (event) => {
        console.log(`bridgefyDidStop: ${event}`);
      })
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailToStop,
        (event) => {
          console.error(`bridgefyDidFailToStop: ${event}`);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidDestroySession,
        (event) => {
          console.log(`bridgefyDidDestroySession: ${event}`);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailToDestroySession,
        (event) => {
          console.error(`bridgefyDidFailToDestroySession: ${event}`);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(BridgefyEvents.bridgefyDidConnect, (event) => {
        console.log(`bridgefyDidConnect: ${event}`);
      })
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidDisconnect,
        (event) => {
          console.log(`bridgefyDidDisconnect: ${event}`);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidEstablishSecureConnection,
        (event) => {
          console.log(`bridgefyDidEstablishSecureConnection: ${event}`);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailToEstablishSecureConnection,
        (event) => {
          console.error(`bridgefyDidFailToEstablishSecureConnection: ${event}`);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidSendMessage,
        (event) => {
          console.log(`bridgefyDidSendMessage: ${event}`);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailSendingMessage,
        (event) => {
          console.error(`bridgefyDidFailSendingMessage: ${event}`);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidReceiveData,
        (event) => {
          console.log(`bridgefyDidReceiveData: ${event}`);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidSendDataProgress,
        (event) => {
          console.log(`bridgefyDidSendDataProgress: ${event}`);
        }
      )
    );
    return () => {
      for (const sub of subscriptions) {
        sub.remove();
      }
    };
  }, []);

  // Initialize Bridgefy using our API key.
  bridgefy
    .initialize(
      '40a8483d-0000-0000-0000-000000000000',
      BridgefyPropagationProfile.standard
    )
    .then(() => {
      bridgefy.start();
    })
    .catch((error) => {
      console.error(error);
    });

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
