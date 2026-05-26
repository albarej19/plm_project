import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { Device, Firmware, DeviceRequest } from '../../models/models';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Header -->
    <div class="flex items-start justify-between mb-8">
      <div>
        <p class="text-[10px] font-mono font-semibold tracking-widest uppercase text-slate-500 mb-1">PLM / DEVICES</p>
        <h1 class="text-2xl font-semibold text-slate-100 tracking-tight">Devices</h1>
        <p class="text-sm text-slate-400 mt-1">{{ filtered().length }} of {{ devices().length }} devices shown</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Role badge -->
        <span class="badge" [class]="isAdmin() ? 'badge-purple' : 'badge-info'">
          {{ isAdmin() ? 'ADMIN' : 'USER — view only' }}
        </span>
        <!-- Only ADMIN sees this button -->
        @if (isAdmin()) {
          <button class="btn-primary btn" (click)="openCreate()">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Register Device
          </button>
        }
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input class="form-input pl-9 w-56" placeholder="Search name, serial..."
               [(ngModel)]="searchTerm" (ngModelChange)="applyFilter()" />
      </div>
      <select class="form-input w-40" [(ngModel)]="statusFilter" (ngModelChange)="applyFilter()">
        <option value="">All status</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </select>
      <select class="form-input w-44" [(ngModel)]="firmwareFilter" (ngModelChange)="applyFilter()">
        <option value="">All firmware</option>
        <option value="none">No firmware</option>
        <option value="has">Has firmware</option>
      </select>
      <div class="flex-1"></div>
      <button class="btn-secondary btn btn-sm" (click)="loadDevices()">↺ Refresh</button>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      @if (loading()) {
        <div class="flex justify-center py-16">
          <div class="w-6 h-6 border-2 border-slate-700 border-t-sky-500 rounded-full animate-spin-slow"></div>
        </div>
      } @else if (filtered().length === 0) {
        <div class="text-center py-16">
          <p class="text-4xl mb-3 opacity-20">⬡</p>
          <p class="text-sm text-slate-400">No devices found</p>
          <p class="text-xs text-slate-600 mt-1">
            {{ isAdmin() ? 'Register your first device to get started' : 'No devices match your filter' }}
          </p>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="tbl-head"><tr>
              <th>#</th><th>Name</th><th>Serial</th><th>Status</th><th>Firmware</th><th>Registered</th>
              @if (isAdmin()) { <th>Actions</th> }
            </tr></thead>
            <tbody class="tbl-body">
              @for (d of filtered(); track d.id) {
                <tr>
                  <td class="font-mono text-xs text-slate-600">{{ d.id }}</td>
                  <td class="font-medium text-slate-200">{{ d.name }}</td>
                  <td class="font-mono text-xs text-slate-400">{{ d.serialNumber }}</td>
                  <td>
                    <span class="badge" [class]="d.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'">
                      <span class="w-1.5 h-1.5 rounded-full"
                            [class.bg-emerald-400]="d.status === 'ACTIVE'"
                            [class.bg-red-400]="d.status === 'INACTIVE'"></span>
                      {{ d.status }}
                    </span>
                  </td>
                  <td>
                    @if (d.firmware) {
                      <span class="badge badge-info">{{ d.firmware.version }}</span>
                    } @else {
                      <span class="text-xs text-slate-600">— none</span>
                    }
                  </td>
                  <td class="font-mono text-xs text-slate-500">{{ formatDate(d.createdAt) }}</td>
                  @if (isAdmin()) {
                    <td>
                      <div class="flex gap-2">
                        <button class="btn-secondary btn btn-sm" (click)="openEdit(d)">Edit</button>
                        <button class="btn-danger btn btn-sm" (click)="confirmDelete(d)">✕</button>
                      </div>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Create / Edit Modal (ADMIN only) -->
    @if (showModal()) {
      <div class="modal-backdrop" (click)="closeModal($event)">
        <div class="modal-box mx-4">
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-700/60">
            <h2 class="text-base font-semibold text-slate-100">{{ editingDevice() ? 'Edit Device' : 'Register Device' }}</h2>
            <button class="text-slate-500 hover:text-slate-200 transition-colors text-xl leading-none" (click)="showModal.set(false)">✕</button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Device Name</label>
                <input class="form-input" [(ngModel)]="form.name" placeholder="e.g. Temperature Sensor A1" />
                @if (formErrors['name']) { <p class="form-error">{{ formErrors['name'] }}</p> }
              </div>
              <div>
                <label class="form-label">Serial Number</label>
                <input class="form-input" [(ngModel)]="form.serialNumber" placeholder="e.g. SN-001" />
                @if (formErrors['serialNumber']) { <p class="form-error">{{ formErrors['serialNumber'] }}</p> }
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Status</label>
                <select class="form-input" [(ngModel)]="form.status">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label class="form-label">Firmware Version</label>
                <select class="form-input" [(ngModel)]="form.firmwareVersionId">
                  <option [ngValue]="null">— No firmware —</option>
                  @for (fw of firmwareList(); track fw.id) {
                    <option [ngValue]="fw.id">{{ fw.version }}</option>
                  }
                </select>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-slate-700/60">
            <button class="btn-secondary btn" (click)="showModal.set(false)">Cancel</button>
            <button class="btn-primary btn" (click)="saveDevice()" [disabled]="saving()">
              {{ saving() ? 'Saving...' : (editingDevice() ? 'Update Device' : 'Register Device') }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirm Modal (ADMIN only) -->
    @if (showDeleteModal()) {
      <div class="modal-backdrop" (click)="closeDeleteModal($event)">
        <div class="modal-box mx-4 max-w-sm">
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-700/60">
            <h2 class="text-base font-semibold text-red-400">Delete Device</h2>
            <button class="text-slate-500 hover:text-slate-200 transition-colors text-xl" (click)="showDeleteModal.set(false)">✕</button>
          </div>
          <div class="px-6 py-5">
            <p class="text-sm text-slate-400">
              Are you sure you want to delete
              <span class="font-semibold text-slate-200">{{ deviceToDelete()?.name }}</span>?
              All associated change logs will also be deleted.
            </p>
          </div>
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-slate-700/60">
            <button class="btn-secondary btn" (click)="showDeleteModal.set(false)">Cancel</button>
            <button class="btn-danger btn" (click)="deleteDevice()" [disabled]="saving()">
              {{ saving() ? 'Deleting...' : 'Delete Device' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class DevicesComponent implements OnInit {
  private api  = inject(ApiService);
  private toast = inject(ToastService);
  private auth  = inject(AuthService);

  isAdmin = () => this.auth.isAdmin();

  devices = signal<Device[]>([]);
  filtered = signal<Device[]>([]);
  firmwareList = signal<Firmware[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  showDeleteModal = signal(false);
  editingDevice = signal<Device | null>(null);
  deviceToDelete = signal<Device | null>(null);

  searchTerm = ''; statusFilter = ''; firmwareFilter = '';
  form: DeviceRequest = { name: '', serialNumber: '', status: 'ACTIVE', firmwareVersionId: null };
  formErrors: Record<string, string> = {};

  ngOnInit() {
    this.loadDevices();
    this.api.getFirmwareList().subscribe(fw => this.firmwareList.set(fw));
  }

  loadDevices() {
    this.loading.set(true);
    this.api.getDevices().subscribe({
      next: devs => { this.devices.set(devs); this.applyFilter(); this.loading.set(false); },
      error: () => { this.toast.error('Failed to load devices'); this.loading.set(false); }
    });
  }

  applyFilter() {
    let r = this.devices();
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      r = r.filter(d => d.name.toLowerCase().includes(q) || d.serialNumber.toLowerCase().includes(q));
    }
    if (this.statusFilter) r = r.filter(d => d.status === this.statusFilter);
    if (this.firmwareFilter === 'none') r = r.filter(d => !d.firmware);
    if (this.firmwareFilter === 'has')  r = r.filter(d => !!d.firmware);
    this.filtered.set(r);
  }

  openCreate() {
    this.form = { name: '', serialNumber: '', status: 'ACTIVE', firmwareVersionId: null };
    this.formErrors = {};
    this.editingDevice.set(null);
    this.showModal.set(true);
  }

  openEdit(d: Device) {
    this.form = { name: d.name, serialNumber: d.serialNumber, status: d.status, firmwareVersionId: d.firmware?.id ?? null };
    this.formErrors = {};
    this.editingDevice.set(d);
    this.showModal.set(true);
  }

  confirmDelete(d: Device) { this.deviceToDelete.set(d); this.showDeleteModal.set(true); }

  validate(): boolean {
    this.formErrors = {};
    if (!this.form.name?.trim()) this.formErrors['name'] = 'Name is required';
    if (!this.form.serialNumber?.trim()) this.formErrors['serialNumber'] = 'Serial number is required';
    return Object.keys(this.formErrors).length === 0;
  }

  saveDevice() {
    if (!this.validate()) return;
    this.saving.set(true);
    const editing = this.editingDevice();
    const call = editing ? this.api.updateDevice(editing.id, this.form) : this.api.createDevice(this.form);
    call.subscribe({
      next: () => { this.toast.success(editing ? 'Device updated' : 'Device registered'); this.showModal.set(false); this.saving.set(false); this.loadDevices(); },
      error: (err) => { this.toast.error(err.error?.message || 'Save failed'); this.saving.set(false); }
    });
  }

  deleteDevice() {
    const d = this.deviceToDelete();
    if (!d) return;
    this.saving.set(true);
    this.api.deleteDevice(d.id).subscribe({
      next: () => { this.toast.success('Device deleted'); this.showDeleteModal.set(false); this.saving.set(false); this.loadDevices(); },
      error: (err) => { this.toast.error(err.error?.message || 'Delete failed'); this.saving.set(false); }
    });
  }

  closeModal(event?: MouseEvent) {
    if (event && (event.target as HTMLElement).className.includes('modal-backdrop')) this.showModal.set(false);
  }
  closeDeleteModal(event?: MouseEvent) {
    if (event && (event.target as HTMLElement).className.includes('modal-backdrop')) this.showDeleteModal.set(false);
  }
  formatDate(ts: string): string {
    return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
