import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { nearbyStyles } from '../styles';

export const EmptyPeersList: React.FC = () => {
  return (
    <View style={nearbyStyles.emptyContainer}>
      <Icon name="bluetooth-off" size={64} color="#9E9E9E" />
      <Text style={nearbyStyles.emptyText}>No Peers Nearby</Text>
      <Text style={nearbyStyles.emptySubtext}>
        Make sure Bridgefy is started and there are other devices nearby
      </Text>
    </View>
  );
};
