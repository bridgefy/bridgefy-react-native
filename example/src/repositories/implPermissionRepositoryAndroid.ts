import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import type { PermissionCheckResult, PermissionState } from '../entities';
import type { IPermissionRepository } from './PermissionRepository';

export class PermissionRepositoryAndroid implements IPermissionRepository {
  private readonly androidVersion: number = Platform.Version as number;

  async checkPermissions(): Promise<PermissionState> {
    if (this.androidVersion >= 31) {
      return this.checkAndroid12Plus();
    } else {
      return this.checkAndroidLegacy();
    }
  }

  private async checkAndroid12Plus(): Promise<PermissionState> {
    const [bluetoothScan, bluetoothConnect, bluetoothAdvertise, location] =
      await Promise.all([
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN),
        PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        ),
        PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE
        ),
        PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        ),
        PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        ),
      ]);

    return {
      bluetooth: bluetoothScan && bluetoothConnect ? 'granted' : 'denied',
      location: location ? 'granted' : 'denied',
      bluetoothScan: bluetoothScan ? 'granted' : 'denied',
      bluetoothConnect: bluetoothConnect ? 'granted' : 'denied',
      bluetoothAdvertise: bluetoothAdvertise ? 'granted' : 'denied',
    };
  }

  private async checkAndroidLegacy(): Promise<PermissionState> {
    const location = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    return {
      bluetooth: 'granted',
      location: location ? 'granted' : 'denied',
    };
  }

  async requestPermissions(): Promise<PermissionCheckResult> {
    try {
      if (this.androidVersion >= 31) {
        return await this.requestAndroid12Plus();
      } else {
        return await this.requestAndroidLegacy();
      }
    } catch (error) {
      console.error('Permission request error:', error);
      throw error;
    }
  }

  private async requestAndroid12Plus(): Promise<PermissionCheckResult> {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    ]);

    const allGranted = Object.values(results).every(
      (status) => status === PermissionsAndroid.RESULTS.GRANTED
    );

    const denied = Object.entries(results)
      .filter(([, status]) => status !== PermissionsAndroid.RESULTS.GRANTED)
      .map(([perm]) => perm.split('.').pop() || '');

    if (allGranted) {
      Alert.alert('Success', 'All Bluetooth permissions granted');
    } else {
      Alert.alert(
        'Permissions Denied',
        `The following permissions were denied: ${denied.join(', ')}\n\nPlease enable them in Settings.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => this.openAppSettings() },
        ]
      );
    }

    const state = await this.checkPermissions();

    return {
      allGranted,
      state,
      denied: denied.length > 0 ? denied : undefined,
    };
  }

  private async requestAndroidLegacy(): Promise<PermissionCheckResult> {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    let allGranted = false;
    const denied: string[] = [];

    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('Success', 'Location permission granted');
      allGranted = true;
    } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        'Permission Blocked',
        'Location permission is blocked. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => this.openAppSettings() },
        ]
      );
      denied.push('ACCESS_FINE_LOCATION');
    } else {
      Alert.alert(
        'Denied',
        'Location permission is required for Bluetooth scanning'
      );
      denied.push('ACCESS_FINE_LOCATION');
    }

    const state = await this.checkPermissions();

    return {
      allGranted,
      state,
      denied: denied.length > 0 ? denied : undefined,
    };
  }

  async openAppSettings(): Promise<void> {
    await Linking.openSettings();
  }
}
