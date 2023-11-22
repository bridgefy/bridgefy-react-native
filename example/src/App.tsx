import {
  Bridgefy,
  BridgefyEvents,
  BridgefyPropagationProfile,
  BridgefyTransmissionModeType,
} from 'bridgefy-react-native';
import * as RNPermissions from 'react-native-permissions';
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  type EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const bridgefy = new Bridgefy();

export default function App() {
  const [logText, setLog] = useState<string>('');
  const userId = useRef<string>('');
  const scrollViewLogs = useRef<ScrollView>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [started, setStarted] = useState<boolean>(false);

  const log = (event: string, body: any, error = false) => {
    setLog(`${logText}${event} ${JSON.stringify(body)}\n`);
    scrollViewLogs.current?.scrollToEnd();
    if (error) {
      console.error(event, body);
    } else {
      console.log(event, body);
    }
  };

  // Subscribe to Bridgefy real-time events so we can act on them as required.
  useEffect(() => {
    const subscriptions: EmitterSubscription[] = [];
    const eventEmitter = new NativeEventEmitter(
      NativeModules.BridgefyReactNative
    );
    subscriptions.push(
      eventEmitter.addListener(BridgefyEvents.bridgefyDidStart, (event) => {
        userId.current = event.userId;
        log(`bridgefyDidStart`, event);
        bridgefy.isStarted().then((value) => {
          setStarted(value);
        });
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
        log(`bridgefyDidStop`, "Bridgefy stopped.");
        setStarted(false);
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

    RNPermissions.requestMultiple([
      RNPermissions.PERMISSIONS.IOS.LOCATION_ALWAYS,
      RNPermissions.PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
      RNPermissions.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      RNPermissions.PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
      RNPermissions.PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      RNPermissions.PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
    ]).then((_statuses) => {
      // Initialize Bridgefy using our API key.
      bridgefy
        .initialize('YOUR_API_KEY_HERE', true)
        .then(() => {
          bridgefy
            .isInitialized()
            .then((value) => {
              log(
                `isInitialized`,
                'SDK isInitialized: ' + JSON.stringify(value),
                false
              );
              setInitialized(value);
            })
            .catch((error) => {
              log(`isInitialized error`, error.message, true);
            });
        })
        .catch((error) => {
          log(`Initialize error`, error.message, true);
        });
    });

    return () => {
      for (const sub of subscriptions) {
        sub.remove();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleText}>Bridgefy React Native</Text>
      <View style={styles.buttonBar}>
        <Button
          disabled={!initialized || started}
          title="Start"
          onPress={() =>
            bridgefy.start().catch((error) => {
              log(`Started error`, error.message, true);
            })
          }
        />
        <Button
          disabled={!initialized || !started}
          title="Stop"
          onPress={() =>
            bridgefy.stop().catch((error) => {
              log(`Stopped error`, error.message, true);
            })
          }
        />
        <Button
          title="Send data"
          disabled={initialized && !started}
          onPress={() =>
            bridgefy
              .send('Hello world', {
                type: BridgefyTransmissionModeType.broadcast,
                uuid: userId.current,
              })
              .then((result) => {
                log(`Sent message`, result);
              })
          }
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.logTextBox}
        ref={scrollViewLogs}
      >
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
    color: 'black',
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
    color: 'black',
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
