import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },

  // Auth pages (no guard — redirect to dashboard if already logged in) 
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Protected pages (require valid JWT) 
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'devices',
    canActivate: [authGuard],
    loadComponent: () => import('./components/devices/devices.component').then(m => m.DevicesComponent)
  },
  {
    path: 'firmware',
    canActivate: [authGuard],
    loadComponent: () => import('./components/firmware/firmware.component').then(m => m.FirmwareComponent)
  },
  {
    path: 'changelogs',
    canActivate: [authGuard],
    loadComponent: () => import('./components/changelogs/changelogs.component').then(m => m.ChangelogsComponent)
  },
  { 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];