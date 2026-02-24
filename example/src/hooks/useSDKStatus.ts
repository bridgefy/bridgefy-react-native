import { useEffect, useRef, useState } from 'react';
import {
  BridgefyOperationMode,
  BridgefyPropagationProfile,
} from 'bridgefy-react-native';
import type { SDKStatusSnapshot } from '../entities';
import {
  type SDKEventHandlers,
  SDKRepository,
  OperationRepository,
  type ISDKRepository,
} from '../repositories';
import {
  ChangeOperationUseCase,
  CheckSDKStatusUseCase,
  DestroySessionUseCase,
  InitializeSDKUseCase,
  StartSDKUseCase,
  StopSDKUseCase,
} from '../usecases';
import { EnvironmentConfig } from '../config';

export const useSDKStatus = () => {
  const [status, setStatus] = useState<SDKStatusSnapshot>({
    isInitialized: false,
    isStarted: false,
    userId: '',
    connectedPeers: [],
    propagationProfile: BridgefyPropagationProfile.REALTIME,
    bridgefyLicenseInfo: '',
    operationStatus:
      BridgefyOperationMode.HYBRID.toUpperCase() as BridgefyOperationMode,
    loading: false,
  });

  const [error, setError] = useState<Error | null>(null);
  const repositoryRef = useRef(new SDKRepository());
  const repository = repositoryRef.current;
  const repositoryOperRef = useRef(new OperationRepository());
  const repositoryOper = repositoryOperRef.current;

  // Inicializar use cases

  const checkStatusUseCase = new CheckSDKStatusUseCase(
    repository as ISDKRepository
  );
  const initializeUseCase = new InitializeSDKUseCase(
    repository as ISDKRepository
  );
  const startUseCase = new StartSDKUseCase(repository as ISDKRepository);
  const stopUseCase = new StopSDKUseCase(repository as ISDKRepository);
  const destroyUseCase = new DestroySessionUseCase(
    repository as ISDKRepository
  );
  const changeOperationUseCase = new ChangeOperationUseCase(repositoryOper);

  useEffect(() => {
    const initialize = async () => {
      try {
        await checkStatusUseCase.execute().then((result) => {
          setStatus(result);
        });

        // Suscribirse a eventos
        const eventHandlers: SDKEventHandlers = {
          onStart: (userId) => {
            setStatus((prev) => ({
              ...prev,
              isStarted: true,
              userId,
            }));
          },
          onStop: () => {
            setStatus((prev) => ({
              ...prev,
              isStarted: false,
              userId: '',
              connectedPeers: [],
            }));
          },
          onPeerConnect: () => {
            // Se actualiza a través de onPeersUpdated
          },
          onPeerDisconnect: () => {
            // Se actualiza a través de onPeersUpdated
          },
          onPeersUpdated: (peers) => {
            setStatus((prev) => ({
              ...prev,
              connectedPeers: peers,
            }));
          },
          onStartFailed: (err) => {
            setError(err);
            setStatus((prev) => ({
              ...prev,
              loading: false,
            }));
          },
        };

        repository.subscribeToEvents(eventHandlers);
      } catch (err) {
        console.error('Hook initialization error:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    };

    initialize();

    return () => {
      repository.unsubscribeFromEvents();
    };
  }, []);

  const checkStatus = async () => {
    try {
      setError(null);
      const result = await checkStatusUseCase.execute();
      const operationStatus = await repositoryOper.getOperationMode();
      setStatus({
        ...result,
        operationStatus,
      });
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const error =
        err instanceof Error ? err : new Error('Check status failed');
      setError(error);
    }
  };

  const initialize = async () => {
    try {
      setError(null);
      setStatus((prev) => ({ ...prev, loading: true }));
      const result = await initializeUseCase.execute(
        EnvironmentConfig.apikey,
        true,
        BridgefyOperationMode.HYBRID
      );

      if (result.success) {
        setStatus((prev) => ({
          ...prev,
          isInitialized: true,
          loading: false,
        }));
      } else {
        throw result.error || new Error('Failed to initialize');
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const error = err instanceof Error ? err : new Error('Initialize failed');
      setError(error);
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  const start = async () => {
    try {
      setError(null);
      setStatus((prev) => ({ ...prev, loading: true }));
      const result = await startUseCase.execute(
        BridgefyPropagationProfile.REALTIME
      );

      if (result.success) {
        setStatus((prev) => ({
          ...prev,
          isStarted: true,
          loading: false,
        }));
      } else {
        throw result.error || new Error('Failed to start');
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const error = err instanceof Error ? err : new Error('Start failed');
      setError(error);
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  const stop = async () => {
    try {
      setError(null);
      setStatus((prev) => ({ ...prev, loading: true }));
      const result = await stopUseCase.execute();

      if (result.success) {
        setStatus((prev) => ({
          ...prev,
          isStarted: false,
          userId: '',
          connectedPeers: [],
          loading: false,
        }));
      } else {
        throw result.error || new Error('Failed to stop');
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const error = err instanceof Error ? err : new Error('Stop failed');
      setError(error);
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  const destroySession = async () => {
    try {
      setError(null);
      setStatus((prev) => ({ ...prev, loading: true }));
      const result = await destroyUseCase.execute();

      if (result.success) {
        setStatus({
          isInitialized: false,
          isStarted: false,
          userId: '',
          connectedPeers: [],
          propagationProfile: BridgefyPropagationProfile.REALTIME,
          bridgefyLicenseInfo: '',
          operationStatus:
            BridgefyOperationMode.FOREGROUND.toUpperCase() as BridgefyOperationMode,
          loading: false,
        });
      } else {
        throw result.error || new Error('Failed to destroy session');
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const error =
        err instanceof Error ? err : new Error('Destroy session failed');
      setError(error);
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  const changeOperationMode = async (
    mode: BridgefyOperationMode
  ): Promise<void> => {
    try {
      setError(null);
      setStatus((prev) => ({ ...prev, loading: true }));
      const result = await changeOperationUseCase.execute({ mode });

      if (result.success) {
        setStatus((prev) => ({
          ...prev,
          operationStatus: mode,
          loading: false,
        }));
      } else {
        throw result.error || new Error('Failed to change operation mode');
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const error =
        err instanceof Error ? err : new Error('Change operation mode failed');
      setError(error);
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  return {
    status,
    error,
    checkStatus,
    initialize,
    start,
    stop,
    destroySession,
    changeOperationMode,
  };
};
