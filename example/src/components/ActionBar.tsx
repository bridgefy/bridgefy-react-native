import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { logsStyles } from '../styles';

interface ActionBarProps {
  filteredCount: number;
  totalCount: number;
  onClearAll: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  filteredCount,
  totalCount,
  onClearAll,
}) => {
  if (totalCount === 0) return null;

  return (
    <View style={logsStyles.actionBar}>
      <View style={logsStyles.actionBarLeft}>
        <Icon name="list-status" size={18} color="#2196F3" />
        <Text style={logsStyles.actionBarText}>
          {filteredCount} of {totalCount} events
        </Text>
      </View>

      <TouchableOpacity
        style={logsStyles.clearButton}
        onPress={onClearAll}
        activeOpacity={0.7}
      >
        <Icon name="delete" size={18} color="#F44336" />
        <Text style={logsStyles.clearButtonText}>Clear All</Text>
      </TouchableOpacity>
    </View>
  );
};
