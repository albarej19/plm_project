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
  templateUrl: './devices.component.html'
})
export class DevicesComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private auth = inject(AuthService);

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

  searchTerm = '';
  statusFilter = '';
  firmwareFilter = '';
  form: DeviceRequest = { name: '', serialNumber: '', status: 'ACTIVE', firmwareVersionId: null };
  formErrors: Record<string, string> = {};

  ngOnInit() {
    this.loadDevices();
    this.api.getFirmwareList().subscribe(fw => this.firmwareList.set(fw));
  }

  loadDevices() {
    this.loading.set(true);
    this.api.getDevices().subscribe({
      next: devs => {
        this.devices.set(devs);
        this.applyFilter();
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load devices');
        this.loading.set(false);
      }
    });
  }

  applyFilter() {
    let r = this.devices();
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      r = r.filter(d => d.name.toLowerCase().includes(q) || d.serialNumber.toLowerCase().includes(q));
    }
    if (this.statusFilter)
      r = r.filter(d => d.status === this.statusFilter);

    if (this.firmwareFilter === 'none')
      r = r.filter(d => !d.firmware);
    if (this.firmwareFilter === 'has')
      r = r.filter(d => !!d.firmware);
    this.filtered.set(r);
  }

  openCreate() {
    this.form = { name: '', serialNumber: '', status: 'ACTIVE', firmwareVersionId: null };
    this.formErrors = {};
    this.editingDevice.set(null);
    this.showModal.set(true);
  }

  openEdit(d: Device) {
    this.form = {
      name: d.name,
      serialNumber: d.serialNumber,
      status: d.status,
      firmwareVersionId: d.firmware?.id ?? null
    };
    this.formErrors = {};
    this.editingDevice.set(d);
    this.showModal.set(true);
  }

  confirmDelete(d: Device) {
    this.deviceToDelete.set(d);
    this.showDeleteModal.set(true);
  }

  validate(): boolean {
    this.formErrors = {};
    if (!this.form.name?.trim())
      this.formErrors['name'] = 'Name is required';
    if (!this.form.serialNumber?.trim())
      this.formErrors['serialNumber'] = 'Serial number is required';
    return Object.keys(this.formErrors).length === 0;
  }

  saveDevice() {
    if (!this.validate())
      return;
    this.saving.set(true);
    const editing = this.editingDevice();
    const call = editing ? this.api.updateDevice(editing.id, this.form) : this.api.createDevice(this.form);
    call.subscribe({
      next: () => {
        this.toast.success(editing ? 'Device updated' : 'Device registered');
        this.showModal.set(false);
        this.saving.set(false);
        this.loadDevices();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Save failed');
        this.saving.set(false);
      }
    });
  }

  deleteDevice() {
    const d = this.deviceToDelete();
    if (!d)
      return;
    this.saving.set(true);
    this.api.deleteDevice(d.id).subscribe({
      next: () => {
        this.toast.success('Device deleted');
        this.showDeleteModal.set(false);
        this.saving.set(false);
        this.loadDevices();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Delete failed');
        this.saving.set(false);
      }
    });
  }

  closeModal(event?: MouseEvent) {
    if (event && (event.target as HTMLElement).className.includes('modal-backdrop'))
      this.showModal.set(false);
  }
  closeDeleteModal(event?: MouseEvent) {
    if (event && (event.target as HTMLElement).className.includes('modal-backdrop'))
      this.showDeleteModal.set(false);
  }
  formatDate(ts: string): string {
    return new Date(ts).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}