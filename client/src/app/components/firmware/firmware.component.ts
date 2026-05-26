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
  template: `
    <!-- Header -->
    <div class="flex items-start justify-between mb-8">
      <div>
        <p class="text-[10px] font-mono font-semibold tracking-widest uppercase text-slate-500 mb-1">PLM / FIRMWARE</p>
        <h1 class="text-2xl font-semibold text-slate-100 tracking-tight">Firmware Catalog</h1>
        <p class="text-sm text-slate-400 mt-1">{{ firmwareList().length }} versions registered</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="badge" [class]="isAdmin() ? 'badge-purple' : 'badge-info'">
          {{ isAdmin() ? 'ADMIN' : 'USER — view only' }}
        </span>
        @if (isAdmin()) {
          <button class="btn-primary btn" (click)="openCreate()">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Add Version
          </button>
        }
      </div>
    </div>

    <div class="grid grid-cols-[1fr_320px] gap-5 items-start">

      <!-- Table -->
      <div class="card overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center py-16">
            <div class="w-6 h-6 border-2 border-slate-700 border-t-sky-500 rounded-full animate-spin-slow"></div>
          </div>
        } @else if (firmwareList().length === 0) {
          <div class="text-center py-16">
            <p class="text-4xl mb-3 opacity-20">▣</p>
            <p class="text-sm text-slate-400">No firmware versions yet</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="tbl-head"><tr>
                <th>#</th><th>Version</th><th>Notes</th><th>Released</th>
                @if (isAdmin()) { <th>Actions</th> }
              </tr></thead>
              <tbody class="tbl-body">
                @for (fw of firmwareList(); track fw.id; let i = $index) {
                  <tr>
                    <td class="font-mono text-xs text-slate-600">{{ fw.id }}</td>
                    <td>
                      <div class="flex items-center gap-2">
                        <span class="badge badge-info text-sm">{{ fw.version }}</span>
                        @if (i === 0) { <span class="badge badge-purple text-[10px]">LATEST</span> }
                      </div>
                    </td>
                    <td class="text-slate-400 text-xs max-w-xs truncate">{{ fw.notes || '—' }}</td>
                    <td class="font-mono text-xs text-slate-500">{{ formatDate(fw.releasedAt) }}</td>
                    @if (isAdmin()) {
                      <td>
                        <div class="flex gap-2">
                          <button class="btn-secondary btn btn-sm" (click)="openEdit(fw)">Edit</button>
                          <button class="btn-danger btn btn-sm" (click)="confirmDelete(fw)">✕</button>
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

      <!-- SemVer Compare (available to all) -->
      <div class="card p-6">
        <p class="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500 mb-1">SemVer Compare</p>
        <p class="text-xs text-slate-500 mb-5">
          Test the <code class="font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">compareSemVer()</code> method
        </p>
        <div class="space-y-4">
          <div>
            <label class="form-label">Version 1</label>
            <input class="form-input" [(ngModel)]="cmpV1" placeholder="e.g. 1.9.0" />
          </div>
          <div>
            <label class="form-label">Version 2</label>
            <input class="form-input" [(ngModel)]="cmpV2" placeholder="e.g. 1.10.0" />
          </div>
          <button class="btn-secondary btn w-full justify-center" (click)="compare()">Compare →</button>
        </div>
        @if (cmpResult()) {
          <div class="mt-5 p-4 bg-surface-700 rounded-xl border border-slate-700/60">
            <p class="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-600 mb-2">Result</p>
            <p class="text-4xl font-mono font-light mb-2"
               [class.text-emerald-400]="cmpResult()?.result === 1"
               [class.text-red-400]="cmpResult()?.result === -1"
               [class.text-sky-400]="cmpResult()?.result === 0">
              {{ cmpResult()?.result === 0 ? '=' : cmpResult()?.result === 1 ? '>' : '<' }}
            </p>
            <p class="text-xs text-slate-400">{{ cmpResult()?.message }}</p>
          </div>
        }
      </div>
    </div>

    <!-- Create/Edit Modal -->
    @if (showModal()) {
      <div class="modal-backdrop" (click)="closeModal($event)">
        <div class="modal-box mx-4">
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-700/60">
            <h2 class="text-base font-semibold text-slate-100">{{ editingFw() ? 'Edit Firmware' : 'Add Firmware Version' }}</h2>
            <button class="text-slate-500 hover:text-slate-200 transition-colors text-xl" (click)="showModal.set(false)">✕</button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div>
              <label class="form-label">Version String</label>
              <input class="form-input" [(ngModel)]="form.version" placeholder="e.g. 2.1.0" />
              @if (formErrors['version']) { <p class="form-error">{{ formErrors['version'] }}</p> }
            </div>
            <div>
              <label class="form-label">Release Notes</label>
              <textarea class="form-input resize-none" rows="3" [(ngModel)]="form.notes"
                placeholder="Describe what changed..."></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-slate-700/60">
            <button class="btn-secondary btn" (click)="showModal.set(false)">Cancel</button>
            <button class="btn-primary btn" (click)="save()" [disabled]="saving()">
              {{ saving() ? 'Saving...' : (editingFw() ? 'Update' : 'Add Version') }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Modal -->
    @if (showDeleteModal()) {
      <div class="modal-backdrop" (click)="closeDeleteModal($event)">
        <div class="modal-box mx-4 max-w-sm">
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-700/60">
            <h2 class="text-base font-semibold text-red-400">Delete Firmware</h2>
            <button class="text-slate-500 hover:text-slate-200 text-xl" (click)="showDeleteModal.set(false)">✕</button>
          </div>
          <div class="px-6 py-5">
            <p class="text-sm text-slate-400">
              Delete firmware <span class="font-semibold text-slate-200">{{ fwToDelete()?.version }}</span>?
              Devices using it will lose their firmware assignment.
            </p>
          </div>
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-slate-700/60">
            <button class="btn-secondary btn" (click)="showDeleteModal.set(false)">Cancel</button>
            <button class="btn-danger btn" (click)="deleteFirmware()" [disabled]="saving()">
              {{ saving() ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class FirmwareComponent implements OnInit {
  private api   = inject(ApiService);
  private toast  = inject(ToastService);
  private auth   = inject(AuthService);

  isAdmin = () => this.auth.isAdmin();

  firmwareList = signal<Firmware[]>([]);
  loading = signal(true); saving = signal(false);
  showModal = signal(false); showDeleteModal = signal(false);
  editingFw = signal<Firmware | null>(null); fwToDelete = signal<Firmware | null>(null);
  cmpResult = signal<any>(null); cmpV1 = ''; cmpV2 = '';
  form: FirmwareRequest = { version: '', notes: '' };
  formErrors: Record<string, string> = {};

  ngOnInit() { this.loadFirmware(); }

  loadFirmware() {
    this.loading.set(true);
    this.api.getFirmwareList().subscribe({
      next: fw => { this.firmwareList.set(fw); this.loading.set(false); },
      error: () => { this.toast.error('Failed to load firmware'); this.loading.set(false); }
    });
  }

  openCreate() { this.form = { version: '', notes: '' }; this.formErrors = {}; this.editingFw.set(null); this.showModal.set(true); }
  openEdit(fw: Firmware) { this.form = { version: fw.version, notes: fw.notes }; this.formErrors = {}; this.editingFw.set(fw); this.showModal.set(true); }
  confirmDelete(fw: Firmware) { this.fwToDelete.set(fw); this.showDeleteModal.set(true); }

  validate(): boolean {
    this.formErrors = {};
    if (!this.form.version?.trim()) this.formErrors['version'] = 'Version is required';
    return Object.keys(this.formErrors).length === 0;
  }

  save() {
    if (!this.validate()) return;
    this.saving.set(true);
    const editing = this.editingFw();
    const call = editing ? this.api.updateFirmware(editing.id, this.form) : this.api.createFirmware(this.form);
    call.subscribe({
      next: () => { this.toast.success(editing ? 'Firmware updated' : 'Firmware added'); this.showModal.set(false); this.saving.set(false); this.loadFirmware(); },
      error: (err) => { this.toast.error(err.error?.message || 'Save failed'); this.saving.set(false); }
    });
  }

  deleteFirmware() {
    const fw = this.fwToDelete(); if (!fw) return;
    this.saving.set(true);
    this.api.deleteFirmware(fw.id).subscribe({
      next: () => { this.toast.success('Firmware deleted'); this.showDeleteModal.set(false); this.saving.set(false); this.loadFirmware(); },
      error: (err) => { this.toast.error(err.error?.message || 'Delete failed'); this.saving.set(false); }
    });
  }

  compare() {
    if (!this.cmpV1 || !this.cmpV2) { this.toast.info('Enter both version strings'); return; }
    this.api.compareSemVer(this.cmpV1, this.cmpV2).subscribe({
      next: res => this.cmpResult.set(res),
      error: () => this.toast.error('Compare failed')
    });
  }

  closeModal(e?: MouseEvent) { if (e && (e.target as HTMLElement).className.includes('modal-backdrop')) this.showModal.set(false); }
  closeDeleteModal(e?: MouseEvent) { if (e && (e.target as HTMLElement).className.includes('modal-backdrop')) this.showDeleteModal.set(false); }
  formatDate(ts: string): string { return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
}
