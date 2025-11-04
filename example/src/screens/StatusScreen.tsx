/**
 * StatusScreen.tsx
 *
 * Screen showing SDK status with Start/Stop controls
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Bridgefy, { BridgefyPropagationProfile } from 'bridgefy-react-native';

export default function StatusScreen() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [propagationProfile] = useState<BridgefyPropagationProfile>(
    BridgefyPropagationProfile.STANDARD
  );

  useEffect(() => {
    checkStatus();
    setupListeners();
    return () => {
      Bridgefy.removeAllListeners();
    };
  }, []);

  const setupListeners = () => {
    Bridgefy.onStart((event) => {
      console.log('Bridgefy started:', event.userId);
      setUserId(event.userId);
      setIsStarted(true);
      updateConnectedPeers();
    });

    Bridgefy.onStop(() => {
      console.log('Bridgefy stopped');
      setIsStarted(false);
      setConnectedPeers([]);
    });

    Bridgefy.onConnect((event) => {
      console.log('Peer connected:', event.userId);
      updateConnectedPeers();
    });

    Bridgefy.onDisconnect((event) => {
      console.log('Peer disconnected:', event.userId);
      updateConnectedPeers();
    });

    Bridgefy.onConnectedPeers((event) => {
      console.log('Connected peers:', event.peers.length);
      setConnectedPeers(event.peers);
    });

    Bridgefy.onFailToStart((error) => {
      // Alert.alert('Error', `Failed to start: ${error.message}`);
      setLoading(false);
    });
  };

  const checkStatus = async () => {
    try {
      const initialized = await Bridgefy.isInitialized();
      const started = await Bridgefy.isStarted();

      setIsInitialized(initialized);
      setIsStarted(started);

      if (started) {
        const id = await Bridgefy.currentUserId();
        setUserId(id);
        updateConnectedPeers();
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  const updateConnectedPeers = async () => {
    try {
      const peers = await Bridgefy.connectedPeers();
      setConnectedPeers(peers);
    } catch (error) {
      console.error('Failed to get connected peers:', error);
    }
  };

  const handleInitialize = async () => {
    if (isInitialized) {
      // Alert.alert('Info', 'SDK is already initialized');
      return;
    }

    setLoading(true);
    try {
      await Bridgefy.initialize('20ef12d5-9b06-4762-a581-3f2348fa1f0b', true);
      setIsInitialized(true);
      // Alert.alert('Success', 'Bridgefy SDK initialized');
    } catch (error: any) {
      // Alert.alert('Error', `Failed to initialize: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!isInitialized) {
      // Alert.alert('Error', 'Please initialize the SDK first');
      return;
    }

    if (isStarted) {
      // Alert.alert('Info', 'SDK is already started');
      return;
    }

    setLoading(true);
    try {
      await Bridgefy.start(undefined, propagationProfile);
      // Alert.alert('Success', 'Bridgefy SDK started');
    } catch (error: any) {
      // Alert.alert('Error', `Failed to start: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!isStarted) {
      // Alert.alert('Info', 'SDK is not running');
      return;
    }

    setLoading(true);
    try {
      await Bridgefy.stop();
      // Alert.alert('Success', 'Bridgefy SDK stopped');
    } catch (error: any) {
      // Alert.alert('Error', `Failed to stop: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDestroySession = async () => {
    Alert.alert('Confirm', 'Are you sure you want to destroy the session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Destroy',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await Bridgefy.destroySession();
            setIsInitialized(false);
            setIsStarted(false);
            setUserId('');
            setConnectedPeers([]);
            // Alert.alert('Success', 'Session destroyed');
          } catch (error: any) {
            // Alert.alert('Error', `Failed to destroy session: ${error.message}`);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: boolean) => (status ? '#4CAF50' : '#F44336');
  const getStatusText = (status: boolean) => (status ? 'Active' : 'Inactive');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Status Cards */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Icon
              name="information"
              size={24}
              color={getStatusColor(isInitialized)}
            />
            <Text style={styles.statusLabel}>Initialized:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: getStatusColor(isInitialized) },
              ]}
            >
              {getStatusText(isInitialized)}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Icon
              name="play-circle"
              size={24}
              color={getStatusColor(isStarted)}
            />
            <Text style={styles.statusLabel}>Started:</Text>
            <Text
              style={[styles.statusValue, { color: getStatusColor(isStarted) }]}
            >
              {getStatusText(isStarted)}
            </Text>
          </View>

          {userId ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>User ID</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {userId}
              </Text>
            </View>
          ) : null}

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Connected Peers</Text>
            <Text style={styles.infoValue}>{connectedPeers.length}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Propagation Profile</Text>
            <Text style={styles.infoValue}>{propagationProfile}</Text>
          </View>
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Controls</Text>

          {!isInitialized && (
            <TouchableOpacity
              style={[styles.button, styles.initButton]}
              onPress={handleInitialize}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="power" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Initialize SDK</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {isInitialized && !isStarted && (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={handleStart}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="play" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Start SDK</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {isStarted && (
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleStop}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="stop" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Stop SDK</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {isInitialized && (
            <TouchableOpacity
              style={[styles.button, styles.destroyButton]}
              onPress={handleDestroySession}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="delete" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Destroy Session</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.refreshButton]}
            onPress={checkStatus}
            disabled={loading}
          >
            <Icon name="refresh" size={20} color="#2196F3" />
            <Text style={styles.refreshButtonText}>Refresh Status</Text>
          </TouchableOpacity>
        </View>

        {/* Connected Peers List */}
        {connectedPeers.length > 0 && (
          <View style={styles.peersSection}>
            <Text style={styles.sectionTitle}>Connected Peers</Text>
            {connectedPeers.map((peer, index) => (
              <View key={index} style={styles.peerItem}>
                <Icon name="account-circle" size={24} color="#2196F3" />
                <Text style={styles.peerText} numberOfLines={1}>
                  {peer}
                </Text>
              </View>
            ))}
          </View>
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
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    color: '#212121',
    marginLeft: 12,
    flex: 1,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  controlsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  initButton: {
    backgroundColor: '#2196F3',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#FF9800',
  },
  destroyButton: {
    backgroundColor: '#F44336',
  },
  refreshButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  refreshButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  peersSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  peerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  peerText: {
    fontSize: 14,
    color: '#212121',
    marginLeft: 12,
    flex: 1,
  },
});
