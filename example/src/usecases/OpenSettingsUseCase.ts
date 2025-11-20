import type { IPermissionRepository } from "../repositories";

export class OpenSettingsUseCase {
  constructor(
    private readonly permissionRepository: IPermissionRepository
  ) {}

  async execute(): Promise<void> {
    try {
      await this.permissionRepository.openAppSettings();
    } catch (error) {
      console.error('Error opening settings:', error);
      throw error;
    }
  }
}
