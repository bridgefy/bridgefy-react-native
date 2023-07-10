import {
  Bridgefy,
  BridgefyEvents,
  BridgefyPropagationProfile,
  BridgefyTransmissionModeType,
} from 'bridgefy-react-native';
import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  NativeEventEmitter,
  NativeModules,
  type EmitterSubscription,
  Button,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const bridgefy = new Bridgefy();

export default function App() {
  const [logText, setLog] = React.useState<string>('');

  // Subscribe to Bridgefy real-time events so we can act on them as required.
  React.useEffect(() => {
    function log(text: string, obj: any, error = false) {
      setLog(`${logText}${text} ${JSON.stringify(obj)}\n`);
      if (error) {
        console.error(text, obj);
      } else {
        console.log(text, obj);
      }
    }

    const subscriptions: EmitterSubscription[] = [];
    const eventEmitter = new NativeEventEmitter(
      NativeModules.BridgefyReactNative
    );
    subscriptions.push(
      eventEmitter.addListener(BridgefyEvents.bridgefyDidStart, (event) => {
        log(`bridgefyDidStart`, event);
      })
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailToStart,
        (event) => {
          log(`bridgefyDidFailToStart`, event, true);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(BridgefyEvents.bridgefyDidStop, (event) => {
        log(`bridgefyDidStop`, event);
      })
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailToStop,
        (event) => {
          log(`bridgefyDidFailToStop`, event, true);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidDestroySession,
        (event) => {
          log(`bridgefyDidDestroySession`, event);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailToDestroySession,
        (event) => {
          log(`bridgefyDidFailToDestroySession`, event, true);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(BridgefyEvents.bridgefyDidConnect, (event) => {
        log(`bridgefyDidConnect`, event);
      })
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidDisconnect,
        (event) => {
          log(`bridgefyDidDisconnect`, event);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidEstablishSecureConnection,
        (event) => {
          log(`bridgefyDidEstablishSecureConnection`, event);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailToEstablishSecureConnection,
        (event) => {
          log(`bridgefyDidFailToEstablishSecureConnection`, event, true);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidSendMessage,
        (event) => {
          log(`bridgefyDidSendMessage`, event);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailSendingMessage,
        (event) => {
          log(`bridgefyDidFailSendingMessage`, event, true);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidReceiveData,
        (event) => {
          log(`bridgefyDidReceiveData`, event);
        }
      )
    );
    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidSendDataProgress,
        (event) => {
          log(`bridgefyDidSendDataProgress`, event);
        }
      )
    );

    // Initialize Bridgefy using our API key.
    bridgefy
      .initialize(
        '40a8483d-c2ec-4749-9b09-a85c6957f95e',
        BridgefyPropagationProfile.standard
      )
      .then(() => {
        log('Initialized', {});
      })
      .catch((error) => {
        log(`Initialize error`, error.message, true);
      });

    return () => {
      for (const sub of subscriptions) {
        sub.remove();
      }
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleText}>Bridgefy React Native</Text>
      <View style={styles.buttonBar}>
        <Button title="Start" onPress={() => bridgefy.start()} />
        <Button
          title="Send data"
          onPress={() =>
            bridgefy.send('test', {
              type: BridgefyTransmissionModeType.broadcast,
              uuid: '00000',
            })
          }
        />
      </View>
      <ScrollView style={styles.logTextBox}>
        <Text style={styles.logText}>{logText}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  buttonBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  logText: {
    fontFamily: 'monospace',
    flexGrow: 1,
  },
  logTextBox: {
    padding: 16,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
