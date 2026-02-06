import React from 'react';
import { Alert, Platform, ScrollView, Text, View } from 'react-native';
import { useSDKStatus } from '../hooks/useSDKStatus';
import { StatusCard } from '../components/StatusCard';
import { InfoCard } from '../components/InfoCard';
import { ControlButton } from '../components/ControlButton';
import { PeersList } from '../components/PeersList';
import { statusStyles } from '../styles';
import { BridgefyOperationMode } from 'bridgefy-react-native';

export default function StatusScreen() {
  const {
    status,
    error,
    checkStatus,
    initialize,
    start,
    stop,
    destroySession,
    changeOperationMode,
  } = useSDKStatus();

  const handleDestroySession = () => {
    Alert.alert(
      'Confirm Action',
      'Are you sure you want to destroy the session? This cannot be undone.',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Destroy',
          onPress: destroySession,
          style: 'destructive',
        },
      ]
    );
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error.message);
    }
  });

  return (
    <View style={statusStyles.container}>
      <ScrollView style={statusStyles.content}>
        <Text style={statusStyles.sectionTitle}>Status</Text>
        <View style={statusStyles.statusCard}>
          {/* Status Cards */}
          <StatusCard title="Initialized" isActive={status.isInitialized} />
          <StatusCard title="Started" isActive={status.isStarted} />

          {/* Info Cards */}
          {!!status.userId && (
            <InfoCard
              label="Your User ID"
              value={status.userId}
              icon="identifier"
            />
          )}

          <InfoCard
            label="Connected Peers"
            value={status.connectedPeers.length.toString()}
            icon="lan-connect"
          />
          <InfoCard
            label="Propagation Profile"
            value={status.propagationProfile}
            icon="sync"
          />
          <InfoCard
            label="Operation mode"
            value={status.operationStatus}
            icon="arrange-send-backward"
          />
        </View>

        {/* Control Buttons */}
        <View style={statusStyles.controlsSection}>
          <Text style={statusStyles.sectionTitle}>Controls</Text>

          {!status.isInitialized && (
            <ControlButton
              title="Initialize SDK"
              icon="power"
              onPress={initialize}
              loading={status.loading}
              variant="init"
            />
          )}

          {status.isInitialized && !status.isStarted && (
            <ControlButton
              title="Start SDK"
              icon="play"
              onPress={start}
              loading={status.loading}
              variant="start"
            />
          )}

          {status.isStarted && (
            <ControlButton
              title="Stop SDK"
              icon="stop"
              onPress={stop}
              loading={status.loading}
              variant="stop"
            />
          )}

          {status.isInitialized && (
            <ControlButton
              title="Destroy Session"
              icon="delete"
              onPress={handleDestroySession}
              loading={status.loading}
              variant="destroy"
            />
          )}

          {status.isStarted &&
            Platform.OS === 'android' &&
            status.operationStatus !==
              BridgefyOperationMode.BACKGROUND.toUpperCase() && (
              <ControlButton
                title="Set background mode"
                icon="arrange-send-to-back"
                onPress={changeOperationMode.bind(
                  null,
                  BridgefyOperationMode.BACKGROUND
                )}
                loading={status.loading}
                variant="background"
              />
            )}

          {status.isStarted &&
            Platform.OS === 'android' &&
            status.operationStatus !==
              BridgefyOperationMode.FOREGROUND.toUpperCase() && (
              <ControlButton
                title="Set foreground mode"
                icon="arrange-send-backward"
                onPress={changeOperationMode.bind(
                  null,
                  BridgefyOperationMode.FOREGROUND
                )}
                loading={status.loading}
                variant="foreground"
              />
            )}

          <ControlButton
            title="Refresh Status"
            icon="refresh"
            onPress={checkStatus}
            loading={status.loading}
            variant="refresh"
          />
        </View>

        {/* Peers List */}
        <PeersList peers={status.connectedPeers} />

        {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
