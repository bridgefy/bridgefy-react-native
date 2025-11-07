// presentation/components/InfoCard.tsx
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { statusStyles } from '../styles';

interface InfoCardProps {
  label: string;
  value: string;
  icon?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ label, value, icon = 'information' }) => {
  return (
    <View style={statusStyles.infoCard}>
      <View style={statusStyles.statusRow}>
        <Icon name={icon} size={20} color="#2196F3" />
        <Text style={statusStyles.infoLabel}>{label}</Text>
      </View>
      <Text style={statusStyles.infoValue}>{value}</Text>
    </View>
  );
};
