import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { P2PFormatter } from '../utils';
import { p2pChatStyles } from '../styles';

interface P2PEmptyChatProps {
  peerId: string;
}

export const P2PEmptyChat: React.FC<P2PEmptyChatProps> = ({ peerId }) => {
  return (
    <View style={p2pChatStyles.emptyContainer}>
      <Icon name="chat-processing-outline" size={64} color="#9E9E9E" />
      <Text style={p2pChatStyles.emptyText}>Start a Conversation</Text>
      <Text style={p2pChatStyles.emptySubtext}>
        Send a message to {P2PFormatter.formatPeerId(peerId)}
      </Text>
    </View>
  );
};
