import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { Firmware, FirmwareRequest } from '../../models/models';

@Component({
  selector: 'app-firmware',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './firmware.component.html'
})
export class FirmwareComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private auth = inject(AuthService);

  isAdmin = () => this.auth.isAdmin();

  firmwareList = signal<Firmware[]>([]);
  loading = signal(true); 
  saving = signal(false);
  showModal = signal(false); 
  showDeleteModal = signal(false);
  editingFw = signal<Firmware | null>(null); 
  fwToDelete = signal<Firmware | null>(null);
  cmpResult = signal<any>(null); 
  cmpV1 = ''; 
  cmpV2 = '';
  form: FirmwareRequest = { version: '', notes: '' };
  formErrors: Record<string, string> = {};

  //ngOnInit() -> runs once after component loads
  ngOnInit() { this.loadFirmware(); }

  //ngOnChanges() -> runs when input properties change.
  //ngOnDestroy() -> runs before component is removed.

  loadFirmware() {
    this.loading.set(true);
    this.api.getFirmwareList().subscribe({
      next: fw => { 
        this.firmwareList.set(fw); 
        this.loading.set(false); 
      },
      error: () => { 
        this.toast.error('Failed to load firmware'); 
        this.loading.set(false); 
      }
    });
  }

  openCreate() { 
    this.form = { version: '', notes: '' }; 
    this.formErrors = {}; 
    this.editingFw.set(null); 
    this.showModal.set(true); 
  }

  openEdit(fw: Firmware) { 
    this.form = { version: fw.version, notes: fw.notes }; 
    this.formErrors = {}; 
    this.editingFw.set(fw); 
    this.showModal.set(true); 
  }
  confirmDelete(fw: Firmware) { 
    this.fwToDelete.set(fw); 
    this.showDeleteModal.set(true); 
  }

  validate(): boolean {
    this.formErrors = {};
    if (!this.form.version?.trim()) 
      this.formErrors['version'] = 'Version is required';
    return Object.keys(this.formErrors).length === 0;
  }

  save() {
    if (!this.validate()) return;
    this.saving.set(true);
    const editing = this.editingFw();
    const call = editing ? this.api.updateFirmware(editing.id, this.form) : this.api.createFirmware(this.form);
    call.subscribe({
      next: () => { 
        this.toast.success(editing ? 'Firmware updated' : 'Firmware added'); 
        this.showModal.set(false); 
        this.saving.set(false); 
        this.loadFirmware(); 
      },
      error: (err) => { 
        this.toast.error(err.error?.message || 'Save failed'); 
        this.saving.set(false); 
      }
    });
  }

  deleteFirmware() {
    const fw = this.fwToDelete(); if (!fw) return;
    this.saving.set(true);
    this.api.deleteFirmware(fw.id).subscribe({
      next: () => { 
        this.toast.success('Firmware deleted'); 
        this.showDeleteModal.set(false); 
        this.saving.set(false); 
        this.loadFirmware(); 
      },
      error: (err) => { 
        this.toast.error(err.error?.message || 'Delete failed'); 
        this.saving.set(false); 
      }
    });
  }

  compare() {
    if (!this.cmpV1 || !this.cmpV2) { 
      this.toast.info('Enter both version strings'); 
      return; 
     }
    this.api.compareSemVer(this.cmpV1, this.cmpV2).subscribe({
      next: res => this.cmpResult.set(res),
      error: () => this.toast.error('Compare failed')
    });
  }

  closeModal(e?: MouseEvent) { 
    if (e && (e.target as HTMLElement).className.includes('modal-backdrop')) 
      this.showModal.set(false); 
  }

  closeDeleteModal(e?: MouseEvent) { 
    if (e && (e.target as HTMLElement).className.includes('modal-backdrop')) 
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