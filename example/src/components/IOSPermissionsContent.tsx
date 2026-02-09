import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { permissionStyles } from '../styles';

interface IOSPermissionsContentProps {
  onOpenSettings: () => void;
  onRequestPermissions: () => void;
}

export const IOSPermissionsContent: React.FC<IOSPermissionsContentProps> = ({
  onOpenSettings,
  onRequestPermissions,
}) => {
  return (
    <ScrollView style={permissionStyles.container}>
      <View style={permissionStyles.infoCard}>
        <Icon name="apple" size={24} color="#000" />
        <Text style={permissionStyles.infoText}>
          iOS - Bluetooth Permissions
        </Text>
      </View>

      <View style={permissionStyles.iosInfoCard}>
        <View style={permissionStyles.permissionHeader}>
          <Icon name="information" size={32} color="#2196F3" />
          <Text style={permissionStyles.iosInfoTitle}>
            How iOS Bluetooth Works
          </Text>
        </View>
        <Text style={permissionStyles.iosInfoText}>
          • iOS requests Bluetooth permission automatically when you start using
          it
          {'\n\n'}• Permission dialog appears when initializing CBCentralManager
          {'\n\n'}• Required Info.plist keys:{'\n'}-
          NSBluetoothAlwaysUsageDescription{'\n'}-
          NSBluetoothPeripheralUsageDescription (iOS {'<'} 13)
          {'\n\n'}• Background mode: UIBackgroundModes with "bluetooth-central"
        </Text>
      </View>

      <View style={permissionStyles.permissionCard}>
        <View style={permissionStyles.permissionHeader}>
          <Icon name="bluetooth" size={32} color="#2196F3" />
          <Text style={permissionStyles.permissionTitle}>Bluetooth</Text>
        </View>
        <Text style={permissionStyles.permissionDescription}>
          Bluetooth permission is requested automatically when starting the SDK
        </Text>
        <View style={permissionStyles.statusRow}>
          <Icon name="alert-circle" size={24} color="#FF9800" />
          <Text style={permissionStyles.statusText}>
            Automatic (No Manual Request)
          </Text>
        </View>
      </View>

      <View style={permissionStyles.warningCard}>
        <Icon name="alert" size={24} color="#FF9800" />
        <Text style={permissionStyles.warningText}>
          <Text style={permissionStyles.warningBold}>Important: </Text>
          Go to the "SDK Status" tab and tap "Start SDK" to trigger the
          Bluetooth permission dialog.
        </Text>
      </View>

      <TouchableOpacity
        style={[permissionStyles.button, permissionStyles.primaryButton]}
        onPress={onRequestPermissions}
      >
        <Icon name="information" size={20} color="#fff" />
        <Text style={permissionStyles.primaryButtonText}>
          How to Enable Permissions
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[permissionStyles.button, permissionStyles.secondaryButton]}
        onPress={onOpenSettings}
      >
        <Icon name="cog" size={20} color="#2196F3" />
        <Text style={permissionStyles.secondaryButtonText}>
          Open App Settings
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
