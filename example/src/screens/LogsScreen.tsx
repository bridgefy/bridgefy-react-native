/**
 * LogsScreen-Updated.tsx
 *
 * Updated Logs Screen connected to BridgefyEventStore
 * Displays all SDK events collected globally from the event store
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useBridgefyEventStore, SDKEvent } from '../BridgefyEventStore';

type FilterType = 'all' | 'info' | 'success' | 'warning' | 'error';

interface FilterStats {
  all: number;
  info: number;
  success: number;
  warning: number;
  error: number;
}

export default function LogsScreen() {
  const { events, clearEvents, getEventsByType } = useBridgefyEventStore();

  const [filter, setFilter] = useState<FilterType>('all');
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState<FilterStats>({
    all: 0,
    info: 0,
    success: 0,
    warning: 0,
    error: 0,
  });
  const flatListRef = useRef<FlatList>(null);

  // Update stats whenever events change
  useEffect(() => {
    setStats({
      all: events.length,
      info: getEventsByType('info').length,
      success: getEventsByType('success').length,
      warning: getEventsByType('warning').length,
      error: getEventsByType('error').length,
    });
  }, [events, getEventsByType]);

  // Auto-scroll to top when new event arrives
  useEffect(() => {
    if (events.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [events.length]);

  const getFilteredEvents = (): SDKEvent[] => {
    let filtered = events;

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter((event) => event.type === filter);
    }

    // Apply search filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.message.toLowerCase().includes(search) ||
          event.eventName.toLowerCase().includes(search) ||
          event.eventKey.toLowerCase().includes(search)
      );
    }

    return filtered;
  };

  const getTypeIcon = (type: SDKEvent['type']) => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: '#4CAF50' };
      case 'error':
        return { name: 'alert-circle', color: '#F44336' };
      case 'warning':
        return { name: 'alert', color: '#FF9800' };
      default:
        return { name: 'information', color: '#2196F3' };
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderEventItem = ({ item }: { item: SDKEvent }) => {
    const icon = getTypeIcon(item.type);

    return (
      <View style={styles.eventItem}>
        <View style={styles.eventIcon}>
          <Icon name={icon.name} size={20} color={icon.color} />
        </View>

        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {item.eventName}
            </Text>
            <Text style={styles.eventTime}>{formatTime(item.timestamp)}</Text>
          </View>

          <Text style={styles.eventMessage} numberOfLines={2}>
            {item.message}
          </Text>

          {item.data && (
            <View style={styles.eventDataContainer}>
              <Text style={styles.eventDataLabel}>Data:</Text>
              <Text style={styles.eventData} numberOfLines={2}>
                {JSON.stringify(item.data).substring(0, 100)}
                {JSON.stringify(item.data).length > 100 ? '...' : ''}
              </Text>
            </View>
          )}

          {item.screen && (
            <Text style={styles.eventScreen}>Screen: {item.screen}</Text>
          )}
        </View>

        <View
          style={[styles.eventTypeIndicator, { backgroundColor: icon.color }]}
        />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="text-box-outline" size={64} color="#BDBDBD" />
      <Text style={styles.emptyText}>
        {events.length === 0 ? 'No Events Yet' : 'No Matching Events'}
      </Text>
      <Text style={styles.emptySubtext}>
        {events.length === 0
          ? 'SDK events will appear here'
          : 'Try adjusting filters or search'}
      </Text>
    </View>
  );

  const filteredEvents = getFilteredEvents();

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>SDK Events</Text>
            <Text style={styles.headerSubtitle}>Total: {stats.all} events</Text>
          </View>
          <View style={styles.statsDisplay}>
            <View style={styles.statBadge}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.statBadgeText}>{stats.success}</Text>
            </View>
            <View style={styles.statBadge}>
              <Icon name="alert" size={16} color="#FF9800" />
              <Text style={styles.statBadgeText}>{stats.warning}</Text>
            </View>
            <View style={styles.statBadge}>
              <Icon name="alert-circle" size={16} color="#F44336" />
              <Text style={styles.statBadgeText}>{stats.error}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {(['all', 'info', 'success', 'warning', 'error'] as FilterType[]).map(
          (type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                filter === type && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(type)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === type && styles.filterButtonTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
                {type === 'all' ? ` (${stats.all})` : ` (${stats[type]})`}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {/* Events List */}
      <FlatList
        ref={flatListRef}
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.eventsList,
          filteredEvents.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        onContentSizeChange={() => {
          if (filteredEvents.length > 0 && flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: false });
          }
        }}
      />

      {/* Bottom Action Bar */}
      {events.length > 0 && (
        <View style={styles.actionBar}>
          <View style={styles.actionBarLeft}>
            <Icon name="database" size={18} color="#757575" />
            <Text style={styles.actionBarText}>
              {filteredEvents.length} of {events.length} events
            </Text>
          </View>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              clearEvents();
              setFilter('all');
            }}
          >
            <Icon name="delete-sweep" size={18} color="#F44336" />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  statsDisplay: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  statBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    minHeight: 60,
    maxHeight: 60,
  },
  filterContent: {
    padding: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginRight: 4,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  eventsList: {
    padding: 12,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9E9E9E',
    marginTop: 8,
    textAlign: 'center',
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'flex-start',
  },
  eventIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    flex: 1,
    marginRight: 8,
  },
  eventTime: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  eventMessage: {
    fontSize: 13,
    color: '#212121',
    lineHeight: 18,
    marginBottom: 6,
  },
  eventDataContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 8,
    marginBottom: 4,
  },
  eventDataLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 2,
  },
  eventData: {
    fontSize: 11,
    color: '#616161',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  eventScreen: {
    fontSize: 10,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  eventTypeIndicator: {
    width: 3,
    height: '100%',
    borderRadius: 3,
    marginLeft: 8,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
  },
  actionBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBarText: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 13,
    color: '#F44336',
    fontWeight: '600',
  },
});
