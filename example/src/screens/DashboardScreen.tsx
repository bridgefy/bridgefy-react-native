/**
 * DashboardScreen.tsx
 *
 * Global dashboard showing real-time SDK status and statistics
 * Displays all events from the global event store
 */

import { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useBridgefyEventStore } from '../BridgefyEventStore';

export default function DashboardScreen() {
  const {
    events,
    isInitialized,
    isStarted,
    currentUserId,
    connectedPeersCount,
    totalMessagesSent,
    totalMessagesReceived,
    clearEvents,
  } = useBridgefyEventStore();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const getEventStats = () => {
    const infoCount = events.filter((e) => e.type === 'info').length;
    const successCount = events.filter((e) => e.type === 'success').length;
    const warningCount = events.filter((e) => e.type === 'warning').length;
    const errorCount = events.filter((e) => e.type === 'error').length;

    return { infoCount, successCount, warningCount, errorCount };
  };

  const stats = getEventStats();
  const lastEvent = events[0];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Status Cards */}
        <View style={styles.statusGrid}>
          <View
            style={[
              styles.statusCard,
              isInitialized ? styles.statusCardSuccess : styles.statusCardError,
            ]}
          >
            <Icon
              name="power"
              size={32}
              color={isInitialized ? '#4CAF50' : '#F44336'}
            />
            <Text style={styles.statusCardLabel}>Initialized</Text>
            <Text style={styles.statusCardValue}>
              {isInitialized ? 'Yes' : 'No'}
            </Text>
          </View>

          <View
            style={[
              styles.statusCard,
              isStarted ? styles.statusCardSuccess : styles.statusCardError,
            ]}
          >
            <Icon
              name="play-circle"
              size={32}
              color={isStarted ? '#4CAF50' : '#F44336'}
            />
            <Text style={styles.statusCardLabel}>Started</Text>
            <Text style={styles.statusCardValue}>
              {isStarted ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={[styles.statusCard, styles.statusCardInfo]}>
            <Icon name="account" size={32} color="#2196F3" />
            <Text style={styles.statusCardLabel}>Peers</Text>
            <Text style={styles.statusCardValue}>{connectedPeersCount}</Text>
          </View>

          <View style={[styles.statusCard, styles.statusCardInfo]}>
            <Icon name="message" size={32} color="#2196F3" />
            <Text style={styles.statusCardLabel}>Messages</Text>
            <Text style={styles.statusCardValue}>
              {totalMessagesSent + totalMessagesReceived}
            </Text>
          </View>
        </View>

        {/* User ID */}
        {currentUserId && (
          <View style={styles.userIdCard}>
            <Text style={styles.userIdLabel}>Your User ID</Text>
            <Text style={styles.userIdValue} numberOfLines={2}>
              {currentUserId}
            </Text>
          </View>
        )}

        {/* Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="send" size={24} color="#2196F3" />
              <Text style={styles.statValue}>{totalMessagesSent}</Text>
              <Text style={styles.statLabel}>Sent</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="download" size={24} color="#2196F3" />
              <Text style={styles.statValue}>{totalMessagesReceived}</Text>
              <Text style={styles.statLabel}>Received</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="alert-circle" size={24} color="#FF9800" />
              <Text style={styles.statValue}>{stats.warningCount}</Text>
              <Text style={styles.statLabel}>Warnings</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="close-circle" size={24} color="#F44336" />
              <Text style={styles.statValue}>{stats.errorCount}</Text>
              <Text style={styles.statLabel}>Errors</Text>
            </View>
          </View>
        </View>

        {/* Event Summary */}
        <View style={styles.eventSummarySection}>
          <View style={styles.eventSummaryHeader}>
            <Text style={styles.sectionTitle}>Events Summary</Text>
            <Text style={styles.eventCount}>{events.length}</Text>
          </View>

          <View style={styles.eventTypeGrid}>
            <View style={styles.eventTypeCard}>
              <Icon name="information" size={20} color="#2196F3" />
              <Text style={styles.eventTypeValue}>{stats.infoCount}</Text>
              <Text style={styles.eventTypeLabel}>Info</Text>
            </View>
            <View style={styles.eventTypeCard}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.eventTypeValue}>{stats.successCount}</Text>
              <Text style={styles.eventTypeLabel}>Success</Text>
            </View>
            <View style={styles.eventTypeCard}>
              <Icon name="alert" size={20} color="#FF9800" />
              <Text style={styles.eventTypeValue}>{stats.warningCount}</Text>
              <Text style={styles.eventTypeLabel}>Warning</Text>
            </View>
            <View style={styles.eventTypeCard}>
              <Icon name="close-circle" size={20} color="#F44336" />
              <Text style={styles.eventTypeValue}>{stats.errorCount}</Text>
              <Text style={styles.eventTypeLabel}>Error</Text>
            </View>
          </View>
        </View>

        {/* Last Event */}
        {lastEvent && (
          <View style={styles.lastEventSection}>
            <Text style={styles.sectionTitle}>Last Event</Text>
            <View style={styles.eventCard}>
              <Icon
                name={
                  lastEvent.type === 'success'
                    ? 'check-circle'
                    : lastEvent.type === 'error'
                      ? 'close-circle'
                      : lastEvent.type === 'warning'
                        ? 'alert'
                        : 'information'
                }
                size={28}
                color={
                  lastEvent.type === 'success'
                    ? '#4CAF50'
                    : lastEvent.type === 'error'
                      ? '#F44336'
                      : lastEvent.type === 'warning'
                        ? '#FF9800'
                        : '#2196F3'
                }
              />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{lastEvent.eventName}</Text>
                <Text style={styles.eventMessage}>{lastEvent.message}</Text>
                <Text style={styles.eventTime}>
                  {new Date(lastEvent.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Clear Events Button */}
        {events.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              clearEvents();
            }}
          >
            <Icon name="delete-sweep" size={20} color="#fff" />
            <Text style={styles.clearButtonText}>Clear All Events</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statusCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  statusCardError: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  statusCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  statusCardLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 8,
  },
  statusCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 4,
  },
  userIdCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userIdLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  userIdValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#757575',
    marginTop: 4,
  },
  eventSummarySection: {
    marginBottom: 20,
  },
  eventSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  eventTypeGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  eventTypeCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventTypeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 6,
  },
  eventTypeLabel: {
    fontSize: 11,
    color: '#757575',
    marginTop: 4,
  },
  lastEventSection: {
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
  },
  eventMessage: {
    fontSize: 13,
    color: '#616161',
    marginTop: 4,
    lineHeight: 18,
  },
  eventTime: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 6,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 14,
    gap: 8,
    marginBottom: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
