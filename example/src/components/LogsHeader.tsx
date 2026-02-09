import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { EventStats as EventStatsComponent } from './EventStats';
import type { EventStats } from '../entities/iSDKEvent';
import { logsStyles } from '../styles';

interface LogsHeaderProps {
  totalEvents: number;
  stats: EventStats;
}

export const LogsHeader: React.FC<LogsHeaderProps> = ({
  totalEvents,
  stats,
}) => {
  return (
    <View style={logsStyles.headerSection}>
      <View style={logsStyles.headerTop}>
        <View>
          <Text style={logsStyles.headerTitle}>SDK Events</Text>
          <Text style={logsStyles.headerSubtitle}>
            Total: {totalEvents} events
          </Text>
        </View>
        <Icon name="calendar-multiple" size={28} color="#2196F3" />
      </View>

      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={{ marginTop: 12 }}>
        <EventStatsComponent stats={stats} />
      </View>
    </View>
  );
};
