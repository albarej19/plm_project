import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Device, DeviceRequest, Firmware, FirmwareRequest,
  ChangeLog, ChangeLogRequest, LastChangePerDevice, DeviceStatusStats
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = '/api';
  constructor(private http: HttpClient) {}

  getDevices(status?: string): Observable<Device[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Device[]>(`${this.base}/devices`, { params });
  }
  getDevice(id: number): Observable<Device> {
    return this.http.get<Device>(`${this.base}/devices/${id}`);
  }
  createDevice(data: DeviceRequest): Observable<Device> {
    return this.http.post<Device>(`${this.base}/devices`, data);
  }
  updateDevice(id: number, data: DeviceRequest): Observable<Device> {
    return this.http.put<Device>(`${this.base}/devices/${id}`, data);
  }
  deleteDevice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/devices/${id}`);
  }
  getOutdatedDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.base}/devices/outdated-firmware`);
  }
  getNoFirmwareDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.base}/devices/no-firmware`);
  }
  getDeviceStatsByStatus(): Observable<DeviceStatusStats> {
    return this.http.get<DeviceStatusStats>(`${this.base}/devices/stats/by-status`);
  }

  getFirmwareList(): Observable<Firmware[]> {
    return this.http.get<Firmware[]>(`${this.base}/firmware`);
  }
  createFirmware(data: FirmwareRequest): Observable<Firmware> {
    return this.http.post<Firmware>(`${this.base}/firmware`, data);
  }
  updateFirmware(id: number, data: FirmwareRequest): Observable<Firmware> {
    return this.http.put<Firmware>(`${this.base}/firmware/${id}`, data);
  }
  deleteFirmware(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/firmware/${id}`);
  }
  compareSemVer(v1: string, v2: string): Observable<any> {
    return this.http.get(`${this.base}/firmware/compare`, {
      params: new HttpParams().set('v1', v1).set('v2', v2)
    });
  }

  getChangeLogs(deviceId?: number): Observable<ChangeLog[]> {
    let params = new HttpParams();
    if (deviceId) params = params.set('deviceId', deviceId);
    return this.http.get<ChangeLog[]>(`${this.base}/changelogs`, { params });
  }
  appendChangeLog(data: ChangeLogRequest): Observable<ChangeLog> {
    return this.http.post<ChangeLog>(`${this.base}/changelogs`, data);
  }
  getLastChangePerDevice(): Observable<LastChangePerDevice[]> {
    return this.http.get<LastChangePerDevice[]>(`${this.base}/changelogs/last-per-device`);
  }

   promoteToAdmin(userId: number): Observable<any> {
    return this.http.patch(`${this.base}/auth/users/${userId}/promote`, {});
  }
  demoteToUser(userId: number): Observable<any> {
    return this.http.patch(`${this.base}/auth/users/${userId}/demote`, {});
  }
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/auth/users`);
  }
}

  // ── User management (ADMIN only) ───────────────────────────────────────────
 
