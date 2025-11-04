/**
 * NearbyScreen.tsx
 *
 * Display nearby connected nodes/peers
 * Tap on a peer to open P2P chat
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Bridgefy from 'bridgefy-react-native';

interface Peer {
  id: string;
  userId: string;
  status: 'connected' | 'disconnected' | 'secure';
  connectionTime?: number;
  signal?: number;
}

export default function NearbyScreen({ navigation }: any) {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);

  useEffect(() => {
    loadPeers();
    setupListeners();

    return () => {
      Bridgefy.removeAllListeners();
    };
  }, []);

  const setupListeners = () => {
    Bridgefy.onConnect((event) => {
      console.log('Peer connected:', event.userId);
      setPeers((prev) => {
        const existing = prev.find((p) => p.userId === event.userId);
        if (existing) {
          return prev.map((p) =>
            p.userId === event.userId
              ? { ...p, status: 'connected', connectionTime: Date.now() }
              : p
          );
        } else {
          return [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              userId: event.userId,
              status: 'connected',
              connectionTime: Date.now(),
              signal: Math.floor(Math.random() * 40) + 60, // Simulate signal 60-100
            },
          ];
        }
      });
    });

    Bridgefy.onEstablishSecureConnection((event)=> {
      setPeers((prev) => {
        const existing = prev.find((p) => p.userId === event.userId);
        if (existing) {
          return prev.map((p) =>
            p.userId === event.userId
              ? { ...p, status: 'secure', connectionTime: Date.now() }
              : p
          );
        } else {
          return [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              userId: event.userId,
              status: 'connected',
              connectionTime: Date.now(),
              signal: Math.floor(Math.random() * 40) + 60, // Simulate signal 60-100
            },
          ];
        }
      });
    });

    Bridgefy.onDisconnect((event) => {
      console.log('Peer disconnected:', event.userId);
      setPeers((prev) =>
        prev.map((p) =>
          p.userId === event.userId ? { ...p, status: 'disconnected' } : p
        )
      );
    });
  };

  const loadPeers = async () => {
    try {
      setLoading(true);
      const connectedPeers = await Bridgefy.connectedPeers();
      const peerList: Peer[] = connectedPeers.map((userId, index) => ({
        id: `${index}-${userId}`,
        userId,
        status: 'connected',
        connectionTime: Date.now() - Math.random() * 60000, // Random connection time
        signal: Math.floor(Math.random() * 40) + 60,
      }));
      setPeers(peerList);
    } catch (error) {
      console.error('Failed to load peers:', error);
      Alert.alert('Error', 'Failed to load connected peers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPeers();
    setRefreshing(false);
  }, []);

  const handlePeerPress = (peer: Peer) => {
    if (peer.status !== 'connected') {
      Alert.alert('Error', 'Peer is not connected');
      return;
    }
    setSelectedPeer(peer);
    navigation.navigate('P2PChat', { peerId: peer.userId, peerName: peer.userId });
  };

  const handleEstablishSecureConnection = async (peer: Peer) => {
    try {
      await Bridgefy.establishSecureConnection(peer.userId);
      Alert.alert('Success', 'Establishing secure connection with peer');
    } catch (error: any) {
      Alert.alert('Error', `Failed to establish secure connection: ${error.message}`);
    }
  };

  const formatConnectionTime = (timestamp?: number) => {
    if (!timestamp) return 'Unknown';
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const formatUserId = (userId: string) => {
    return userId.substring(0, 12) + '...';
  };

  const renderPeer = ({ item }: { item: Peer }) => (
    <TouchableOpacity
      style={[styles.peerCard, item.status === 'disconnected' && styles.peerCardDisabled]}
      onPress={() => handlePeerPress(item)}
      disabled={item.status === 'disconnected'}
    >
      <View style={styles.peerHeader}>
        <View style={styles.peerInfo}>
          <View
            style={[
              styles.statusIndicator,
              item.status === 'connected' ? styles.statusConnected : styles.statusDisconnected,
            ]}
          />
          <View style={styles.peerDetails}>
            <Text style={styles.peerId} numberOfLines={1}>
              {formatUserId(item.userId)}
            </Text>
            <Text style={styles.peerSubtext}>
              Connected {formatConnectionTime(item.connectionTime)}
            </Text>
          </View>
        </View>
        <View style={styles.signalContainer}>
          <Icon
            name={item.signal! > 75 ? 'signal' : item.signal! > 50 ? 'signal-2' : 'signal-1'}
            size={20}
            color={item.signal! > 75 ? '#4CAF50' : item.signal! > 50 ? '#FF9800' : '#F44336'}
          />
          <Text style={styles.signalText}>{item.signal}%</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.chatButton]}
          onPress={() => handlePeerPress(item)}
        >
          <Icon name="message-text" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secureButton]}
          onPress={() => handleEstablishSecureConnection(item)}
        >
          <Icon name="lock" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Secure Channel</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bluetooth-off" size={64} color="#BDBDBD" />
      <Text style={styles.emptyText}>No Peers Nearby</Text>
      <Text style={styles.emptySubtext}>
        Make sure Bridgefy is started and there are other devices nearby
      </Text>
    </View>
  );

  if (loading && peers.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading nearby peers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="bluetooth" size={32} color="#2196F3" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Nearby Peers</Text>
            <Text style={styles.headerCount}>{peers.filter(p => p.status === 'connected').length} connected</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshIcon} onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={peers}
        renderItem={renderPeer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.peersList,
          peers.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  headerCount: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  refreshIcon: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  peersList: {
    padding: 16,
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
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  peerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  peerCardDisabled: {
    opacity: 0.5,
  },
  peerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  peerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusConnected: {
    backgroundColor: '#4CAF50',
  },
  statusDisconnected: {
    backgroundColor: '#F44336',
  },
  peerDetails: {
    flex: 1,
  },
  peerId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  peerSubtext: {
    fontSize: 13,
    color: '#757575',
  },
  signalContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  signalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  chatButton: {
    backgroundColor: '#2196F3',
  },
  secureButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
