import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PermissionStatus } from '../entities';
import { permissionStyles } from '../styles';

interface PermissionStatusItemProps {
  title: string;
  description: string;
  icon: string;
  status: PermissionStatus;
}

export const PermissionStatusItem: React.FC<PermissionStatusItemProps> = ({
  title,
  description,
  icon,
  status,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const getIcon = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return <Icon name="check-circle" size={24} color="#4CAF50" />;
      case 'denied':
      case 'blocked':
        return <Icon name="close-circle" size={24} color="#F44336" />;
      case 'unavailable':
        return <Icon name="alert-circle" size={24} color="#FF9800" />;
      default:
        return <Icon name="help-circle" size={24} color="#9E9E9E" />;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const getStatusText = (status: PermissionStatus): string => {
    const statusMap: Record<PermissionStatus, string> = {
      granted: 'Granted',
      denied: 'Denied',
      blocked: 'Blocked',
      unavailable: 'Not Available',
      unknown: 'Unknown',
    };
    return statusMap[status];
  };

  return (
    <View style={permissionStyles.permissionCard}>
      <View style={permissionStyles.permissionHeader}>
        <Icon name={icon} size={32} color="#2196F3" />
        <Text style={permissionStyles.permissionTitle}>{title}</Text>
      </View>
      <Text style={permissionStyles.permissionDescription}>{description}</Text>
      <View style={permissionStyles.statusRow}>
        {getIcon(status)}
        <Text style={permissionStyles.statusText}>{getStatusText(status)}</Text>
      </View>
    </View>
  );
};
