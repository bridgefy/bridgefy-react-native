import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { PermissionState } from '../entities';
import { PermissionStatusItem } from './PermissionStatusItem';
import { permissionStyles } from '../styles';

interface AndroidPermissionsContentProps {
  permissions: PermissionState;
  androidVersion: number;
  onRequestPermissions: () => void;
  onCheckStatus: () => void;
  onOpenSettings: () => void;
}

export const AndroidPermissionsContent: React.FC<AndroidPermissionsContentProps> = ({
  permissions,
  androidVersion,
  onRequestPermissions,
  onCheckStatus,
  onOpenSettings,
}) => {
  const isAndroid12Plus = androidVersion >= 31;

  return (
    <View style={permissionStyles.container}>
      <View style={permissionStyles.infoCard}>
        <Icon name="android" size={24} color="#3DDC84" />
        <Text style={permissionStyles.infoText}>
          Android {isAndroid12Plus ? '12+' : '< 12'} (API Level {androidVersion})
        </Text>
      </View>

      {isAndroid12Plus ? (
        <>
          <PermissionStatusItem
            title="Bluetooth Scan"
            description="Required to discover nearby Bluetooth devices (Android 12+)"
            icon='bluetooth-scan'
            status={permissions.bluetoothScan || 'unknown'}
          />
          <PermissionStatusItem
            title="Bluetooth Connect"
            description="Required to connect to nearby Bluetooth devices (Android 12+)"
            icon='bluetooth-connect'
            status={permissions.bluetoothConnect || 'unknown'}
          />
          <PermissionStatusItem
            title="Bluetooth Advertise"
            description="Required to make device discoverable (Android 12+)"
            icon='bluetooth-audio'
            status={permissions.bluetoothAdvertise || 'unknown'}
          />
        </>
      ) : (
        <PermissionStatusItem
          title="Bluetooth"
          description="No runtime permission needed for Bluetooth on Android < 12"
          icon='bluetooth'
          status="granted"
        />
      )}

      <PermissionStatusItem
        title="Location"
        description="Required for Bluetooth scanning on all Android versions (Android limitation)"
        icon='map-marker'
        status={permissions.location}
      />

      <View style={permissionStyles.permissionsList}>
        <TouchableOpacity
          style={[permissionStyles.button, permissionStyles.primaryButton]}
          onPress={onRequestPermissions}
        >
          <Icon name="shield-check" size={20} color="#fff" />
          <Text style={permissionStyles.primaryButtonText}>Request All Permissions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[permissionStyles.button, permissionStyles.secondaryButton]}
          onPress={onCheckStatus}
        >
          <Icon name="refresh" size={20} color="#2196F3" />
          <Text style={permissionStyles.secondaryButtonText}>Check Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[permissionStyles.button, permissionStyles.secondaryButton]}
          onPress={onOpenSettings}
        >
          <Icon name="cog" size={20} color="#2196F3" />
          <Text style={permissionStyles.secondaryButtonText}>Open App Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
