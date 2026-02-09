import type { PermissionState } from '../entities';
import type { IPermissionRepository } from '../repositories';

export class CheckPermissionsUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(): Promise<PermissionState> {
    try {
      const permissions = await this.permissionRepository.checkPermissions();
      return permissions;
    } catch (error) {
      console.error('Error checking permissions:', error);
      throw error;
    }
  }
}
