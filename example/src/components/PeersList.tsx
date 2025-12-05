import { ScrollView, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { statusStyles } from '../styles';

interface PeersListProps {
  peers: string[];
}

export const PeersList: React.FC<PeersListProps> = ({ peers }) => {
  if (peers.length === 0) {
    return null;
  }

  return (
    <View style={statusStyles.peersSection}>
      <Text style={statusStyles.sectionTitle}>
        Connected Peers ({peers.length})
      </Text>
      <ScrollView>
        {peers.map((peer, index) => (
          <View key={`${peer}-${index}`} style={statusStyles.peerItem}>
            <Icon name="bluetooth" size={20} color="#2196F3" />
            <Text style={statusStyles.peerText}>{peer}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
