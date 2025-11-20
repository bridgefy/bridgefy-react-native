import { View, Text, ActivityIndicator } from 'react-native';
import { nearbyStyles } from '../styles';

export const PeerListLoading: React.FC = () => {
  return (
    <View style={nearbyStyles.loadingContainer}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={nearbyStyles.loadingText}>Loading nearby peers...</Text>
    </View>
  );
};
