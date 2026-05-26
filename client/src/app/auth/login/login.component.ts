import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { LoginRequest } from '../../models/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-surface-900 flex items-center justify-center p-4">

      <!-- Background grid pattern -->
      <div class="absolute inset-0 opacity-[0.03]"
           style="background-image: linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, #38bdf8 1px, transparent 1px); background-size: 40px 40px;">
      </div>

      <!-- Card -->
      <div class="relative w-full max-w-md animate-slide-up">

        <!-- Brand header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl
                      bg-sky-500/10 border border-sky-500/20 mb-4">
            <svg class="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
            </svg>
          </div>
          <p class="text-[10px] font-mono font-semibold tracking-widest text-sky-400 uppercase mb-1">IoT / PLM</p>
          <h1 class="text-2xl font-semibold text-slate-100 tracking-tight">Welcome back</h1>
          <p class="text-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        <!-- Form card -->
        <div class="card p-8">

          <!-- Email -->
          <div class="mb-5">
            <label class="form-label">Email address</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
              </svg>
              <input class="form-input pl-10"
                     type="email"
                     placeholder="you@example.com"
                     [(ngModel)]="form.email"
                     (keyup.enter)="submit()"
                     autocomplete="email" />
            </div>
            @if (errors['email']) {
              <p class="form-error">{{ errors['email'] }}</p>
            }
          </div>

          <!-- Password -->
          <div class="mb-6">
            <label class="form-label">Password</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <input class="form-input pl-10"
                     [type]="showPassword() ? 'text' : 'password'"
                     placeholder="••••••••"
                     [(ngModel)]="form.password"
                     (keyup.enter)="submit()"
                     autocomplete="current-password" />
              <button type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      (click)="showPassword.set(!showPassword())">
                @if (showPassword()) {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                }
              </button>
            </div>
            @if (errors['password']) {
              <p class="form-error">{{ errors['password'] }}</p>
            }
          </div>

          <!-- Server error -->
          @if (serverError()) {
            <div class="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-lg
                        bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ serverError() }}
            </div>
          }

          <!-- Submit -->
          <button class="btn-primary btn w-full justify-center text-base py-2.5"
                  (click)="submit()"
                  [disabled]="loading()">
            @if (loading()) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow"></div>
              Signing in...
            } @else {
              Sign in
            }
          </button>

          <!-- Register link -->
          <p class="text-center text-sm text-slate-500 mt-5">
            Don't have an account?
            <a routerLink="/register"
               class="text-sky-400 hover:text-sky-300 font-medium transition-colors ml-1">
              Create one
            </a>
          </p>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private toast       = inject(ToastService);
  private router      = inject(Router);

  form: LoginRequest = { email: '', password: '' };
  errors: Record<string, string> = {};
  loading     = signal(false);
  serverError = signal('');
  showPassword = signal(false);

  validate(): boolean {
    this.errors = {};
    if (!this.form.email?.trim())    this.errors['email']    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(this.form.email)) this.errors['email'] = 'Enter a valid email';
    if (!this.form.password?.trim()) this.errors['password'] = 'Password is required';
    return Object.keys(this.errors).length === 0;
  }

  submit() {
    if (!this.validate()) return;
    this.loading.set(true);
    this.serverError.set('');

    this.authService.login(this.form).subscribe({
      next: (res) => {
        this.toast.success(`Welcome back, ${res.name}!`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.serverError.set(err.error?.message || 'Invalid email or password.');
        this.loading.set(false);
      }
    });
  }
}
