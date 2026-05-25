import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { ChangeLog, Device, ChangeLogRequest } from '../../models/models';

@Component({
  selector: 'app-changelogs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './changelogs.component.html'
})

export class ChangelogsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private auth = inject(AuthService);

  isAdmin = () => this.auth.isAdmin();

  logs = signal<ChangeLog[]>([]); 
  filtered = signal<ChangeLog[]>([]);
  devices = signal<Device[]>([]);
  loading = signal(true); 
  saving = signal(false);
  showAppendModal = signal(false);

  searchTerm = ''; 
  deviceFilter = ''; 
  actionFilter = '';
  appendForm: ChangeLogRequest = { deviceId: 0, action: '', description: '' };
  formErrors: Record<string, string> = {};

  ngOnInit() {
    this.loadLogs();
    this.api.getDevices().subscribe(d => this.devices.set(d));
  }

  loadLogs() {
    this.loading.set(true);
    this.api.getChangeLogs().subscribe({
      next: logs => { 
        this.logs.set(logs); 
        this.applyFilter(); 
        this.loading.set(false); 
      },
      error: () => { 
        this.toast.error('Failed to load logs'); 
        this.loading.set(false); 
      }
    });
  }

  applyFilter() {
    let r = this.logs();
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      r = r.filter(l => l.deviceName.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || (l.description || '').toLowerCase().includes(q));
    }
    if (this.deviceFilter) 
      r = r.filter(l => l.deviceId === +this.deviceFilter);
    if (this.actionFilter) 
      r = r.filter(l => l.action === this.actionFilter);
    this.filtered.set(r);
  }

  validate(): boolean {
    this.formErrors = {};
    if (!this.appendForm.deviceId) 
      this.formErrors['deviceId'] = 'Select a device';
    if (!this.appendForm.action?.trim()) 
      this.formErrors['action'] = 'Action is required';
    return Object.keys(this.formErrors).length === 0;
  }

  appendLog() {
    if (!this.validate()) 
      return;
    this.saving.set(true);
    this.api.appendChangeLog(this.appendForm).subscribe({
      next: () => { 
        this.toast.success('Log appended'); 
        this.showAppendModal.set(false); 
        this.appendForm = { deviceId: 0, action: '', description: '' }; 
        this.saving.set(false); 
        this.loadLogs(); 
      },
      error: (err) => { 
        this.toast.error(err.error?.message || 'Append failed'); 
        this.saving.set(false); 
      }
    });
  }

  closeModal(e?: MouseEvent) { 
    if (e && (e.target as HTMLElement).className.includes('modal-backdrop')) 
      this.showAppendModal.set(false); 
  }

  actionBadge(action: string): string {
    if (action.includes('CREATED')) 
      return 'badge badge-info';
    if (action.includes('STATUS')) 
      return 'badge badge-amber';
    if (action.includes('FIRMWARE')) 
      return 'badge badge-purple';
    return 'badge badge-info';
  }

  formatDate(ts: string): string {
    return new Date(ts).toLocaleString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }
}