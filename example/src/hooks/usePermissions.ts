import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  PermissionRepositoryAndroid,
  PermissionRepositoryIOS,
} from '../repositories';
import {
  CheckPermissionsUseCase,
  OpenSettingsUseCase,
  RequestPermissionsUseCase,
} from '../usecases';
import type { PermissionCheckResult, PermissionState } from '../entities';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionState>({
    bluetooth: 'unknown',
    location: 'unknown',
  });

  const [loading, setLoading] = useState(false);
  const [androidVersion] = useState(Platform.Version as number);

  // Inicializar repositorio según plataforma
  const repository =
    Platform.OS === 'android'
      ? new PermissionRepositoryAndroid()
      : new PermissionRepositoryIOS();

  const checkPermissionsUseCase = new CheckPermissionsUseCase(repository);
  const requestPermissionsUseCase = new RequestPermissionsUseCase(repository);
  const openSettingsUseCase = new OpenSettingsUseCase(repository);

  useEffect(() => {
    checkPermissions();
    // @ts-ignore
  }, [checkPermissions]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkPermissions = async () => {
    setLoading(true);
    try {
      const result = await checkPermissionsUseCase.execute();
      setPermissions(result);
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async (): Promise<PermissionCheckResult> => {
    setLoading(true);
    try {
      const result = await requestPermissionsUseCase.execute();
      setPermissions(result.state);
      return result;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const openSettings = async () => {
    try {
      await openSettingsUseCase.execute();
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  };

  return {
    permissions,
    loading,
    androidVersion,
    checkPermissions,
    requestPermissions,
    openSettings,
  };
};
