import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { RegisterRequest } from '../../models/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-surface-900 flex items-center justify-center p-4">

      <!-- Background grid -->
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
          <h1 class="text-2xl font-semibold text-slate-100 tracking-tight">Create account</h1>
          <p class="text-sm text-slate-500 mt-1">Start managing your device fleet</p>
        </div>

        <!-- Form card -->
        <div class="card p-8">

          <!-- Full name -->
          <div class="mb-5">
            <label class="form-label">Full name</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <input class="form-input pl-10"
                     type="text"
                     placeholder="John Doe"
                     [(ngModel)]="form.name"
                     autocomplete="name" />
            </div>
            @if (errors['name']) { <p class="form-error">{{ errors['name'] }}</p> }
          </div>

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
                     autocomplete="email" />
            </div>
            @if (errors['email']) { <p class="form-error">{{ errors['email'] }}</p> }
          </div>

          <!-- Password -->
          <div class="mb-5">
            <label class="form-label">Password</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <input class="form-input pl-10"
                     [type]="showPassword() ? 'text' : 'password'"
                     placeholder="Min. 6 characters"
                     [(ngModel)]="form.password"
                     autocomplete="new-password" />
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
            @if (errors['password']) { <p class="form-error">{{ errors['password'] }}</p> }
          </div>

          <!-- Confirm password -->
          <div class="mb-6">
            <label class="form-label">Confirm password</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <input class="form-input pl-10"
                     [type]="showPassword() ? 'text' : 'password'"
                     placeholder="Repeat password"
                     [(ngModel)]="confirmPassword"
                     (keyup.enter)="submit()"
                     autocomplete="new-password" />
            </div>
            @if (errors['confirm']) { <p class="form-error">{{ errors['confirm'] }}</p> }
          </div>

          <!-- Password strength indicator -->
          @if (form.password.length > 0) {
            <div class="mb-5 -mt-3">
              <div class="flex gap-1 mb-1">
                @for (i of [1,2,3,4]; track i) {
                  <div class="h-1 flex-1 rounded-full transition-colors duration-300"
                       [class.bg-red-500]="passwordStrength() === 1 && i === 1"
                       [class.bg-amber-500]="passwordStrength() === 2 && i <= 2"
                       [class.bg-sky-500]="passwordStrength() === 3 && i <= 3"
                       [class.bg-emerald-500]="passwordStrength() === 4"
                       [class.bg-slate-700]="i > passwordStrength()">
                  </div>
                }
              </div>
              <p class="text-[10px] font-mono"
                 [class.text-red-400]="passwordStrength() === 1"
                 [class.text-amber-400]="passwordStrength() === 2"
                 [class.text-sky-400]="passwordStrength() === 3"
                 [class.text-emerald-400]="passwordStrength() === 4">
                {{ strengthLabel() }}
              </p>
            </div>
          }

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
              Creating account...
            } @else {
              Create account
            }
          </button>

          <!-- Login link -->
          <p class="text-center text-sm text-slate-500 mt-5">
            Already have an account?
            <a routerLink="/login"
               class="text-sky-400 hover:text-sky-300 font-medium transition-colors ml-1">
              Sign in
            </a>
          </p>

        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private toast       = inject(ToastService);
  private router      = inject(Router);

  form: RegisterRequest = { name: '', email: '', password: '' };
  confirmPassword = '';
  errors: Record<string, string> = {};
  loading      = signal(false);
  serverError  = signal('');
  showPassword = signal(false);

  passwordStrength(): number {
    const p = this.form.password;
    if (p.length < 6) return 1;
    let score = 1;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(score, 4);
  }

  strengthLabel(): string {
    return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.passwordStrength()];
  }

  validate(): boolean {
    this.errors = {};
    if (!this.form.name?.trim())     this.errors['name']     = 'Name is required';
    else if (this.form.name.trim().length < 2) this.errors['name'] = 'Name must be at least 2 characters';
    if (!this.form.email?.trim())    this.errors['email']    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(this.form.email)) this.errors['email'] = 'Enter a valid email';
    if (!this.form.password)         this.errors['password'] = 'Password is required';
    else if (this.form.password.length < 6) this.errors['password'] = 'Password must be at least 6 characters';
    if (this.form.password !== this.confirmPassword) this.errors['confirm'] = 'Passwords do not match';
    return Object.keys(this.errors).length === 0;
  }

  submit() {
    if (!this.validate()) return;
    this.loading.set(true);
    this.serverError.set('');

    this.authService.register(this.form).subscribe({
      next: (res) => {
        this.toast.success(`Account created! Welcome, ${res.name}!`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.serverError.set(err.error?.message || 'Registration failed. Try again.');
        this.loading.set(false);
      }
    });
  }
}
