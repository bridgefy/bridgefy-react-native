import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { nearbyStyles } from '../styles';

interface PeerListHeaderProps {
  connectedCount: number;
  onRefresh: () => void;
}

export const PeerListHeader: React.FC<PeerListHeaderProps> = ({
  connectedCount,
  onRefresh,
}) => {
  return (
    <View style={nearbyStyles.header}>
      <View style={nearbyStyles.headerContent}>
        <Icon name="bluetooth-audio" size={24} color="#2196F3" />
        <View style={nearbyStyles.headerText}>
          <Text style={nearbyStyles.headerTitle}>Nearby Peers</Text>
          <Text style={nearbyStyles.headerCount}>
            {connectedCount} {connectedCount === 1 ? 'peer' : 'peers'} connected
          </Text>
        </View>
      </View>
      <TouchableOpacity style={nearbyStyles.refreshIcon} onPress={onRefresh}>
        <Icon name="refresh" size={24} color="#2196F3" />
      </TouchableOpacity>
    </View>
  );
};
