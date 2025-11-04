/**
 * PermissionsScreen.tsx - Updated
 *
 * Platform-specific permission handling for iOS and Android
 * Android: Bluetooth + Location permissions (version-specific)
 * iOS: Bluetooth permissions with Info.plist requirements
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable'
  | 'unknown';

interface PermissionState {
  bluetooth: PermissionStatus;
  location: PermissionStatus;
  bluetoothScan?: PermissionStatus;
  bluetoothConnect?: PermissionStatus;
  bluetoothAdvertise?: PermissionStatus;
}

export default function PermissionsScreen() {
  const [permissions, setPermissions] = useState<PermissionState>({
    bluetooth: 'unknown',
    location: 'unknown',
  });
  const [androidVersion, setAndroidVersion] = useState<number>(0);

  useEffect(() => {
    if (Platform.OS === 'android') {
      setAndroidVersion(Platform.Version as number);
    }
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const status = await checkAndroidPermissions();
      setPermissions(status);
    } else {
      // iOS - Bluetooth permissions are checked when CBCentralManager is initialized
      // No runtime permission check API available
      setPermissions({
        bluetooth: 'unknown',
        location: 'unknown',
      });
    }
  };

  const checkAndroidPermissions = async (): Promise<PermissionState> => {
    const androidVersion = Platform.Version as number;

    if (androidVersion >= 31) {
      // Android 12+ (API 31+)
      const bluetoothScan = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      );
      const bluetoothConnect = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );
      const bluetoothAdvertise = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE
      );
      const location = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      return {
        bluetooth: bluetoothScan && bluetoothConnect ? 'granted' : 'denied',
        location: location ? 'granted' : 'denied',
        bluetoothScan: bluetoothScan ? 'granted' : 'denied',
        bluetoothConnect: bluetoothConnect ? 'granted' : 'denied',
        bluetoothAdvertise: bluetoothAdvertise ? 'granted' : 'denied',
      };
    } else {
      // Android < 12 (API < 31)
      const location = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      return {
        bluetooth: 'granted', // No runtime permission needed for Bluetooth on Android < 12
        location: location ? 'granted' : 'denied',
      };
    }
  };

  const requestAndroidPermissions = async () => {
    const androidVersion = Platform.Version as number;

    try {
      if (androidVersion >= 31) {
        // Android 12+ (API 31+)
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const allGranted = Object.values(results).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );

        if (allGranted) {
          Alert.alert('Success', 'All Bluetooth permissions granted');
        } else {
          const denied = Object.entries(results)
            .filter(
              ([, status]) => status !== PermissionsAndroid.RESULTS.GRANTED
            )
            .map(([perm]) => perm.split('.').pop());

          Alert.alert(
            'Permissions Denied',
            `The following permissions were denied: ${denied.join(', ')}\n\nPlease enable them in Settings.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: openAppSettings },
            ]
          );
        }

        await checkPermissions();
      } else {
        // Android < 12 (API < 31)
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Success', 'Location permission granted');
        } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Permission Blocked',
            'Location permission is blocked. Please enable it in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: openAppSettings },
            ]
          );
        } else {
          Alert.alert(
            'Denied',
            'Location permission is required for Bluetooth scanning'
          );
        }

        await checkPermissions();
      }
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const requestIOSPermissions = () => {
    Alert.alert(
      'iOS Bluetooth Permissions',
      'iOS Bluetooth permissions are requested automatically when you start using Bridgefy.\n\n' +
        'Make sure you have added NSBluetoothAlwaysUsageDescription to your Info.plist.\n\n' +
        'Go to SDK Status tab and press "Start SDK" to trigger the permission dialog.',
      [{ text: 'OK' }]
    );
  };

  const openAppSettings = () => {
    Linking.openSettings();
  };

  const getStatusIcon = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return <Icon name="check-circle" size={24} color="#4CAF50" />;
      case 'denied':
      case 'blocked':
        return <Icon name="close-circle" size={24} color="#F44336" />;
      case 'unavailable':
        return <Icon name="minus-circle" size={24} color="#9E9E9E" />;
      default:
        return <Icon name="help-circle" size={24} color="#FFC107" />;
    }
  };

  const getStatusText = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return 'Granted';
      case 'denied':
        return 'Denied';
      case 'blocked':
        return 'Blocked';
      case 'unavailable':
        return 'Not Available';
      default:
        return 'Unknown';
    }
  };

  const renderAndroidPermissions = () => (
    <>
      <View style={styles.infoCard}>
        <Icon name="android" size={24} color="#3DDC84" />
        <Text style={styles.infoText}>
          Android {androidVersion >= 31 ? '12+' : '< 12'} (API Level{' '}
          {androidVersion})
        </Text>
      </View>

      {androidVersion >= 31 ? (
        <>
          <View style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <Icon name="bluetooth-scan" size={32} color="#2196F3" />
              <Text style={styles.permissionTitle}>Bluetooth Scan</Text>
            </View>
            <Text style={styles.permissionDescription}>
              Required to discover nearby Bluetooth devices (Android 12+)
            </Text>
            <View style={styles.statusRow}>
              {getStatusIcon(permissions.bluetoothScan || 'unknown')}
              <Text style={styles.statusText}>
                {getStatusText(permissions.bluetoothScan || 'unknown')}
              </Text>
            </View>
          </View>

          <View style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <Icon name="bluetooth-connect" size={32} color="#2196F3" />
              <Text style={styles.permissionTitle}>Bluetooth Connect</Text>
            </View>
            <Text style={styles.permissionDescription}>
              Required to connect to nearby Bluetooth devices (Android 12+)
            </Text>
            <View style={styles.statusRow}>
              {getStatusIcon(permissions.bluetoothConnect || 'unknown')}
              <Text style={styles.statusText}>
                {getStatusText(permissions.bluetoothConnect || 'unknown')}
              </Text>
            </View>
          </View>

          <View style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <Icon name="bluetooth-audio" size={32} color="#2196F3" />
              <Text style={styles.permissionTitle}>Bluetooth Advertise</Text>
            </View>
            <Text style={styles.permissionDescription}>
              Required to make device discoverable (Android 12+)
            </Text>
            <View style={styles.statusRow}>
              {getStatusIcon(permissions.bluetoothAdvertise || 'unknown')}
              <Text style={styles.statusText}>
                {getStatusText(permissions.bluetoothAdvertise || 'unknown')}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.permissionCard}>
          <View style={styles.permissionHeader}>
            <Icon name="bluetooth" size={32} color="#2196F3" />
            <Text style={styles.permissionTitle}>Bluetooth</Text>
          </View>
          <Text style={styles.permissionDescription}>
            No runtime permission needed for Bluetooth on Android {'<'} 12
          </Text>
          <View style={styles.statusRow}>
            {getStatusIcon('granted')}
            <Text style={styles.statusText}>Granted (System Permission)</Text>
          </View>
        </View>
      )}

      <View style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <Icon name="map-marker" size={32} color="#2196F3" />
          <Text style={styles.permissionTitle}>Location</Text>
        </View>
        <Text style={styles.permissionDescription}>
          Required for Bluetooth scanning on all Android versions (Android
          limitation)
        </Text>
        <View style={styles.statusRow}>
          {getStatusIcon(permissions.location)}
          <Text style={styles.statusText}>
            {getStatusText(permissions.location)}
          </Text>
        </View>
      </View>
    </>
  );

  const renderIOSPermissions = () => (
    <>
      <View style={styles.infoCard}>
        <Icon name="apple" size={24} color="#000" />
        <Text style={styles.infoText}>iOS - Bluetooth Permissions</Text>
      </View>

      <View style={styles.iosInfoCard}>
        <Icon name="information" size={32} color="#2196F3" />
        <Text style={styles.iosInfoTitle}>How iOS Bluetooth Works</Text>
        <Text style={styles.iosInfoText}>
          • iOS requests Bluetooth permission automatically when you start using
          it
          {'\n\n'}• Permission dialog appears when initializing CBCentralManager
          {'\n\n'}• Required Info.plist keys:{'\n'}-
          NSBluetoothAlwaysUsageDescription{'\n'}-
          NSBluetoothPeripheralUsageDescription (iOS {'<'} 13)
          {'\n\n'}• Background mode: UIBackgroundModes with "bluetooth-central"
        </Text>
      </View>

      <View style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <Icon name="bluetooth" size={32} color="#2196F3" />
          <Text style={styles.permissionTitle}>Bluetooth</Text>
        </View>
        <Text style={styles.permissionDescription}>
          Bluetooth permission is requested automatically when starting the SDK
        </Text>
        <View style={styles.statusRow}>
          <Icon name="alert-circle" size={24} color="#FF9800" />
          <Text style={styles.statusText}>Automatic (No Manual Request)</Text>
        </View>
      </View>

      <View style={styles.warningCard}>
        <Icon name="alert" size={24} color="#FF9800" />
        <Text style={styles.warningText}>
          <Text style={styles.warningBold}>Important: </Text>
          Go to the "SDK Status" tab and tap "Start SDK" to trigger the
          Bluetooth permission dialog.
        </Text>
      </View>
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name="shield-check" size={64} color="#2196F3" />
          <Text style={styles.title}>Permissions Required</Text>
          <Text style={styles.subtitle}>
            Bridgefy needs Bluetooth
            {Platform.OS === 'android' && ' and Location'} permissions
          </Text>
        </View>

        <View style={styles.permissionsList}>
          {Platform.OS === 'android'
            ? renderAndroidPermissions()
            : renderIOSPermissions()}
        </View>

        {Platform.OS === 'android' ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={requestAndroidPermissions}
            >
              <Icon name="shield-check" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>
                Request All Permissions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={checkPermissions}
            >
              <Icon name="refresh" size={20} color="#2196F3" />
              <Text style={styles.secondaryButtonText}>Check Status</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={openAppSettings}
            >
              <Icon name="cog" size={20} color="#2196F3" />
              <Text style={styles.secondaryButtonText}>Open App Settings</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={requestIOSPermissions}
            >
              <Icon name="information" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>
                How to Enable Permissions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={openAppSettings}
            >
              <Icon name="cog" size={20} color="#2196F3" />
              <Text style={styles.secondaryButtonText}>Open App Settings</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  iosInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iosInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 12,
    marginBottom: 8,
  },
  iosInfoText: {
    fontSize: 13,
    color: '#616161',
    lineHeight: 20,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
  warningBold: {
    fontWeight: 'bold',
  },
  permissionsList: {
    marginBottom: 24,
  },
  permissionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginLeft: 12,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 14,
    elevation: 2,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
