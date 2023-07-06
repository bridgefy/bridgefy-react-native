import { Bridgefy, BridgefyPropagationProfile } from 'bridgefy-react-native';
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

  React.useEffect(() => {
    const subscriptions: EmitterSubscription[] = [];
    const eventEmitter = new NativeEventEmitter(
      NativeModules.BridgefyReactNative
    );
    subscriptions.push(
      eventEmitter.addListener('bridgefyDidStart', (event) => {
        console.log(event);
      })
    );
    subscriptions.push(
      eventEmitter.addListener('bridgefyDidFailToStart', (event) => {
        console.error(event.error);
      })
    );
    return () => {
      for (const sub of subscriptions) {
        sub.remove();
      }
    };
  }, []);

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
