import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LastChangePerDevice } from '../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl:  './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  loading = signal(true);
  totalDevices = signal(0);
  activeCount = signal(0);
  inactiveCount = signal(0);
  outdatedCount = signal(0);
  noFwCount = signal(0);
  lastChanges = signal<LastChangePerDevice[]>([]);

  activePercent = () => this.totalDevices() === 0 ? 0 : Math.round((this.activeCount() / this.totalDevices()) * 100);
  inactivePercent = () => 100 - this.activePercent();

  ngOnInit() { 
    this.loadAll(); 
  }

  loadAll() {
    this.loading.set(true);
    forkJoin({
      stats: this.api.getDeviceStatsByStatus(),
      outdated: this.api.getOutdatedDevices(),
      noFw: this.api.getNoFirmwareDevices(),
      lastChanges: this.api.getLastChangePerDevice()
    }).subscribe({
      next: ({ stats, outdated, noFw, lastChanges }) => {
        const active = stats['ACTIVE'] ?? 0;
        const inactive = stats['INACTIVE'] ?? 0;
        this.activeCount.set(active);
        this.inactiveCount.set(inactive);
        this.totalDevices.set(active + inactive);
        this.outdatedCount.set(outdated.length);
        this.noFwCount.set(noFw.length);
        this.lastChanges.set(lastChanges);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
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
      minute: '2-digit' 
    });
  }
}