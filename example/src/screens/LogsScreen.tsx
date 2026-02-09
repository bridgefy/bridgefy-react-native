import { useRef } from 'react';
import { FlatList, View } from 'react-native';
import { useLogs } from '../hooks/useLogs';
import { EventsList } from '../components/EventsList';
import { FilterTabs } from '../components/FilterTabs';
import { ActionBar } from '../components/ActionBar';
import { LogsHeader } from '../components/LogsHeader';
import { logsStyles } from '../styles';

export default function LogsScreen() {
  const { events, filter, stats, filteredEvents, setFilter, clearEvents } =
    useLogs();

  const flatListRef = useRef<FlatList>(null);

  const handleClearAll = () => {
    clearEvents();
  };

  return (
    <View style={logsStyles.container}>
      {/* Header */}
      <LogsHeader totalEvents={stats.all} stats={stats} />

      {/* Filter Tabs */}
      <FilterTabs
        activeFilter={filter}
        stats={stats}
        onFilterChange={setFilter}
      />

      {/* Events List */}
      <EventsList events={filteredEvents} listRef={flatListRef} />

      {/* Action Bar */}
      <ActionBar
        filteredCount={filteredEvents.length}
        totalCount={events.length}
        onClearAll={handleClearAll}
      />
    </View>
  );
}
