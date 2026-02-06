// application/usecases/RequestPermissionsUseCase.ts
// import { IPermissionRepository } from '../repositories/PermissionRepository';
// import { PermissionCheckResult } from '../types/Permission';

import type { PermissionCheckResult } from '../entities';
import type { IPermissionRepository } from '../repositories';

export class RequestPermissionsUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(): Promise<PermissionCheckResult> {
    try {
      const result = await this.permissionRepository.requestPermissions();
      return result;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      throw error;
    }
  }
}
