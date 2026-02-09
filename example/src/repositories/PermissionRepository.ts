import type { PermissionCheckResult, PermissionState } from '../entities';

export interface IPermissionRepository {
  checkPermissions(): Promise<PermissionState>;
  requestPermissions(): Promise<PermissionCheckResult>;
  openAppSettings(): Promise<void>;
}
