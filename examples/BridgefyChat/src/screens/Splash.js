import React, { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import Pulse from 'react-native-pulse';

export default function Splash({ route, navigation }) {
  useEffect(() => {
    const { bridgefy } = route.params;
    setTimeout(() => {
      initBridgefy().then(() => {
        checkLogin();
      });
    }, 2000);

    const checkLogin = async () => {
      AsyncStorage.getItem('USERID').then((id) => {
        if (id !== null) {
          navigation.navigate('Main');
        } else {
          navigation.navigate('Login');
        }
      });
    };

    const initBridgefy = async () => {
      await requestMultiple([
        PERMISSIONS.IOS.LOCATION_ALWAYS,
        PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      ]).then((_statutes) => {
        bridgefy.initialize('YOUR_API_KEY_HERE', true).catch((e) => {
          Alert.alert('Error to initialize Bridegfy SDK' + e.message);
        });
      });
    };
  }, [route, navigation]);

  return (
    <View style={styles.container}>
      <Pulse
        color="red"
        numPulses={3}
        diameter={400}
        speed={20}
        duration={2000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {},
});
