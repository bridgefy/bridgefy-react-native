import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import type { Peer } from '../entities';
import { PeerRepository, type PeerEventHandlers } from '../repositories';
import { EstablishSecureConnectionUseCase, GetPeersUseCase } from '../usecases';

export const usePeerList = () => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const repositoryRef = useRef(new PeerRepository());
  const repository = repositoryRef.current;

  const getPeersUseCase = new GetPeersUseCase(repository);
  const establishSecureConnectionUseCase = new EstablishSecureConnectionUseCase(repository);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Initializing peer list hook');

        // Cargar peers inicial
        const initialPeers = await getPeersUseCase.execute();
        setPeers(initialPeers);

        // Suscribirse a eventos
        const eventHandlers: PeerEventHandlers = {
          onPeerConnect: (userId: string) => {
            console.log('Peer connected event:', userId);
          },
          onPeerDisconnect: (userId: string) => {
            console.log('Peer disconnected event:', userId);
          },
          onSecureConnection: (userId: string) => {
            console.log('Secure connection event:', userId);
          },
          onPeersUpdated: (updatedPeers) => {
            setPeers(updatedPeers);
          },
          onError: (err) => {
            setError(err);
          },
        };

        repository.subscribeToEvents(eventHandlers);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load peers');
        setError(error);
        console.error('Hook initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      repository.unsubscribeFromEvents();
    };
  }, []);

  const loadPeers = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const updatedPeers = await getPeersUseCase.execute();
      setPeers(updatedPeers);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh peers');
      setError(error);
      Alert.alert('Error', 'Failed to load peers. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const establishSecureConnection = async (peerId: string) => {
    try {
      setError(null);
      await establishSecureConnectionUseCase.execute(peerId);
      console.log('Successfully initiated secure connection with ***', peerId);
      Alert.alert('Success', 'Establishing secure connection with peer');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to establish secure connection');
      setError(error);
      Alert.alert('Error', error.message);
    }
  };

  const getConnectedPeersCount = (): number => {
    return peers.filter((p) => p.status === 'connected' || p.status === 'secure').length;
  };

  return {
    peers,
    loading,
    refreshing,
    error,
    loadPeers,
    establishSecureConnection,
    getConnectedPeersCount,
  };
};
