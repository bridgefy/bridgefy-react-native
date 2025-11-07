import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { permissionStyles } from '../styles';

interface IOSPermissionsContentProps {
  onOpenSettings: () => void;
}

export const IOSPermissionsContent: React.FC<IOSPermissionsContentProps> = ({
  onOpenSettings,
}) => {
  return (
    <ScrollView style={permissionStyles.container}>
      <Text style={permissionStyles.subtitle}>iOS - Bluetooth Permissions</Text>

      <View style={permissionStyles.infoCard}>
        <Text style={permissionStyles.iosInfoTitle}>How iOS Bluetooth Works</Text>
        <Text style={permissionStyles.iosInfoText}>
          • iOS requests Bluetooth permission automatically when you start using it{'\n\n'}
          • Permission dialog appears when initializing CBCentralManager{'\n\n'}
          • Required Info.plist keys:{'\n'}- NSBluetoothAlwaysUsageDescription{'\n'}-
          NSBluetoothPeripheralUsageDescription (iOS &lt; 13){'\n\n'}
          • Background mode: UIBackgroundModes with "bluetooth-central"
        </Text>
      </View>

      <View style={permissionStyles.warningCard}>
        <Text style={permissionStyles.warningText}>Important</Text>
        <Text style={permissionStyles.warningBold}>
          Go to the "SDK Status" tab and tap "Start SDK" to trigger the Bluetooth
          permission dialog.
        </Text>
      </View>

      <TouchableOpacity
        style={[permissionStyles.button, permissionStyles.primaryButton]}
        onPress={onOpenSettings}
      >
        <Text style={permissionStyles.secondaryButtonText}>Open App Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
