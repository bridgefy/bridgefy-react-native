import { Platform, ScrollView, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { permissionStyles } from '../styles';
import { usePermissions } from '../hooks';
import { AndroidPermissionsContent } from '../components/AndroidPermissionsContent';
import { IOSPermissionsContent } from '../components/IOSPermissionsContent';

export default function PermissionsScreen() {
  const {
    permissions,
    androidVersion,
    checkPermissions,
    requestPermissions,
    openSettings,
  } = usePermissions();

  return (
    <ScrollView style={permissionStyles.container}>
      <View style={permissionStyles.content}>
        <View style={permissionStyles.header}>
          <Icon name="shield-check" size={64} color="#2196F3" />
          <Text style={permissionStyles.title}>Permissions Required</Text>
          <Text style={permissionStyles.subtitle}>
            Bridgefy needs Bluetooth{' '}
            {Platform.OS === 'android' && 'and Location'} permissions
          </Text>
        </View>

        {Platform.OS === 'android' ? (
          <AndroidPermissionsContent
            permissions={permissions}
            androidVersion={androidVersion}
            onRequestPermissions={requestPermissions}
            onCheckStatus={checkPermissions}
            onOpenSettings={openSettings}
          />
        ) : (
          <IOSPermissionsContent
            onOpenSettings={openSettings}
            onRequestPermissions={requestPermissions}
          />
        )}
      </View>
    </ScrollView>
  );
}
