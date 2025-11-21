import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SDKEventEntity, type SDKEvent } from '../entities/iSDKEvent';
import { EventDisplayService } from '../services';
import { logsStyles } from '../styles';

interface EventItemProps {
  event: SDKEvent;
}

export const EventItem: React.FC<EventItemProps> = ({ event }) => {
  const entity = new SDKEventEntity(event);
  const displayService = new EventDisplayService();
  const icon = displayService.getTypeIcon(event.type);

  return (
    <View style={logsStyles.eventItem}>
      <View style={logsStyles.eventIcon}>
        <Icon name={icon.name} size={20} color={icon.color} />
      </View>

      <View style={logsStyles.eventContent}>
        <View style={logsStyles.eventHeader}>
          <Text style={logsStyles.eventTitle}>{event.eventName}</Text>
          <Text style={logsStyles.eventTime}>{entity.getFormattedTime()}</Text>
        </View>

        <Text style={logsStyles.eventMessage}>{event.message}</Text>

        {event.data && (
          <View style={logsStyles.eventDataContainer}>
            <Text style={logsStyles.eventDataLabel}>Data:</Text>
            <Text style={logsStyles.eventData} numberOfLines={2}>
              {entity.getTruncatedData()}
            </Text>
            {entity.getDataLength() > 100 && (
              <Text style={logsStyles.eventDataLabel}>... (truncated)</Text>
            )}
          </View>
        )}

        {event.screen && (
          <Text style={logsStyles.eventScreen}>Screen: {event.screen}</Text>
        )}
      </View>

      <View
        style={[
          logsStyles.eventTypeIndicator,
          { backgroundColor: displayService.getTypeColor(event.type) },
        ]}
      />
    </View>
  );
};
