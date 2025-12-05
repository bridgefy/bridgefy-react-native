import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { logsStyles } from '../styles';

interface EmptyEventsListProps {
  hasEvents: boolean;
}

export const EmptyEventsList: React.FC<EmptyEventsListProps> = ({
  hasEvents,
}) => {
  return (
    <View style={logsStyles.emptyContainer}>
      <Icon name="file-document-outline" size={64} color="#9E9E9E" />
      <Text style={logsStyles.emptyText}>
        {hasEvents ? 'No Matching Events' : 'No Events Yet'}
      </Text>
      <Text style={logsStyles.emptySubtext}>
        {hasEvents
          ? 'Try adjusting filters or search'
          : 'SDK events will appear here'}
      </Text>
    </View>
  );
};
