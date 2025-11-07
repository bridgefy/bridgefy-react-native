export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable' | 'unknown';

export interface PermissionState {
  bluetooth: PermissionStatus;
  location: PermissionStatus;
  bluetoothScan?: PermissionStatus;
  bluetoothConnect?: PermissionStatus;
  bluetoothAdvertise?: PermissionStatus;
}

export interface PermissionCheckResult {
  allGranted: boolean;
  state: PermissionState;
  denied?: string[];
}

export enum PermissionType {
  BLUETOOTH = 'bluetooth',
  BLUETOOTH_SCAN = 'bluetoothScan',
  BLUETOOTH_CONNECT = 'bluetoothConnect',
  BLUETOOTH_ADVERTISE = 'bluetoothAdvertise',
  LOCATION = 'location',
}

export class Permission {
  constructor(
    public type: PermissionType,
    public status: PermissionStatus,
    public description: string,
    public isRequired: boolean
  ) {}

  isGranted(): boolean {
    return this.status === 'granted';
  }

  isDenied(): boolean {
    return this.status === 'denied' || this.status === 'blocked';
  }
}
