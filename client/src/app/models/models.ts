export interface Firmware {
  id: number;
  version: string;
  notes: string;
  releasedAt: string;
}

export interface Device {
  id: number;
  name: string;
  serialNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
  firmware: Firmware | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeLog {
  id: number;
  deviceId: number;
  deviceName: string;
  action: string;
  description: string;
  ts: string;
}

export interface LastChangePerDevice {
  deviceId: number;
  deviceName: string;
  lastAction: string;
  lastTs: string;
}

export interface DeviceStatusStats {
  ACTIVE?: number;
  INACTIVE?: number;
}

export interface DeviceRequest {
  name: string;
  serialNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
  firmwareVersionId: number | null;
}

export interface FirmwareRequest {
  version: string;
  notes: string;
}

export interface ChangeLogRequest {
  deviceId: number;
  action: string;
  description: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ── Auth models ────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}
