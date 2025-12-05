import { Alert, Linking } from 'react-native';
import type { IPermissionRepository } from './PermissionRepository';
import type { PermissionCheckResult, PermissionState } from '../entities';

export class PermissionRepositoryIOS implements IPermissionRepository {
  async checkPermissions(): Promise<PermissionState> {
    // iOS doesn't expose runtime permission checks
    return {
      bluetooth: 'unknown',
      location: 'unknown',
    };
  }

  async requestPermissions(): Promise<PermissionCheckResult> {
    this.showIOSAlert();

    return {
      allGranted: false,
      state: await this.checkPermissions(),
    };
  }

  private showIOSAlert(): void {
    Alert.alert(
      'iOS Bluetooth Permissions',
      'iOS Bluetooth permissions are requested automatically when you start using Bridgefy.\n\n' +
        'Make sure you have added NSBluetoothAlwaysUsageDescription to your Info.plist.\n\n' +
        'Go to SDK Status tab and press "Start SDK" to trigger the permission dialog.',
      [{ text: 'OK' }]
    );
  }

  async openAppSettings(): Promise<void> {
    Linking.openSettings();
  }
}
