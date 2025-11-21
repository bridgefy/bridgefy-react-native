import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { EventStats as EventStatsType } from '../entities/iSDKEvent';
import { logsStyles } from '../styles';

interface EventStatsProps {
  stats: EventStatsType;
}

export const EventStats: React.FC<EventStatsProps> = ({ stats }) => {
  return (
    <View style={logsStyles.statsDisplay}>
      <View style={logsStyles.statBadge}>
        <Icon name="check-circle" size={14} color="#4CAF50" />
        <Text style={logsStyles.statBadgeText}>{stats.success}</Text>
      </View>

      <View style={logsStyles.statBadge}>
        <Icon name="alert" size={14} color="#FF9800" />
        <Text style={logsStyles.statBadgeText}>{stats.warning}</Text>
      </View>

      <View style={logsStyles.statBadge}>
        <Icon name="alert-circle" size={14} color="#F44336" />
        <Text style={logsStyles.statBadgeText}>{stats.error}</Text>
      </View>
    </View>
  );
};
