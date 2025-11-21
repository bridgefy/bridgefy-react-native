import { ScrollView, TouchableOpacity, Text } from 'react-native';
import type { EventStats, FilterType } from '../entities/iSDKEvent';
import { logsStyles } from '../styles';

interface FilterTabsProps {
  activeFilter: FilterType;
  stats: EventStats;
  onFilterChange: (filter: FilterType) => void;
}

const FILTER_TYPES: FilterType[] = ['all', 'info', 'success', 'warning', 'error'];

export const FilterTabs: React.FC<FilterTabsProps> = ({
  activeFilter,
  stats,
  onFilterChange,
}) => {
  const getCount = (type: FilterType): number => {
    return stats[type];
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={logsStyles.filterContainer}
      contentContainerStyle={logsStyles.filterContent}
    >
      {FILTER_TYPES.map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            logsStyles.filterButton,
            activeFilter === type && logsStyles.filterButtonActive,
          ]}
          onPress={() => onFilterChange(type)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              logsStyles.filterButtonText,
              activeFilter === type && logsStyles.filterButtonTextActive,
            ]}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} ({getCount(type)})
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
