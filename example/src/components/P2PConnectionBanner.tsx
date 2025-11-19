import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { p2pChatStyles } from '../styles';

interface P2PConnectionBannerProps {
  peerConnected: boolean;
}

export const P2PConnectionBanner: React.FC<P2PConnectionBannerProps> = ({
  peerConnected,
}) => {
  if (peerConnected) return null;

  return (
    <View style={p2pChatStyles.disconnectedBanner}>
      <Icon name="alert-circle" size={20} color="#F44336" />
      <Text style={p2pChatStyles.disconnectedText}>
        Peer disconnected - messages may not be delivered
      </Text>
    </View>
  );
};
