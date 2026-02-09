import { Text, View } from 'react-native';
import { p2pChatStyles } from '../styles';

interface P2PHeaderRightProps {
  peerConnected: boolean;
}

export const P2PHeaderRight: React.FC<P2PHeaderRightProps> = ({
  peerConnected,
}) => {
  return (
    <View style={p2pChatStyles.headerRight}>
      <View
        style={[
          p2pChatStyles.connectionStatus,
          peerConnected
            ? p2pChatStyles.statusConnected
            : p2pChatStyles.statusDisconnected,
        ]}
      />
      <Text style={p2pChatStyles.headerStatus}>
        {peerConnected ? 'Connected' : 'Disconnected'}
      </Text>
    </View>
  );
};
