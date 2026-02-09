import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { statusStyles } from '../styles';

interface StatusCardProps {
  title: string;
  isActive: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({ title, isActive }) => {
  const color = isActive ? '#4CAF50' : '#F44336';
  const statusText = isActive ? 'Active' : 'Inactive';

  return (
    <View style={statusStyles.statusRow}>
      <Icon name="information" size={24} color={color} />
      <Text style={statusStyles.statusLabel}>{title}</Text>
      <Text style={[statusStyles.statusValue, { color }]}>{statusText}</Text>
    </View>
  );
};
