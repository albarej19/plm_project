import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from './services/toast.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html'
})
export class App {
  toastService = inject(ToastService);
  authService = inject(AuthService);

  getInitials(): string {
    const name = this.authService.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  toastBorder(type: string): string {
    if (type === 'success') 
      return '3px solid #10b981';
    if (type === 'error') 
      return '3px solid #ef4444';
    return '3px solid #38bdf8';
  }
}