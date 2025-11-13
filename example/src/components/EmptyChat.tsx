import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { chatStyles } from '../styles';

export const EmptyChat: React.FC = () => {
  return (
    <View style={chatStyles.emptyContainer}>
      <Icon name="chat-outline" size={64} color="#9E9E9E" />
      <Text style={chatStyles.emptyText}>No messages yet</Text>
      <Text style={chatStyles.emptySubtext}>
        Start a conversation by sending a message
      </Text>
    </View>
  );
};
