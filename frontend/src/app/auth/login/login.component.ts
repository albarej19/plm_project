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
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  form: LoginRequest = { email: '', password: '' };
  errors: Record<string, string> = {};
  loading = signal(false);
  serverError = signal('');
  showPassword = signal(false);

  validate(): boolean {
    this.errors = {};
    if (!this.form.email?.trim()) 
      this.errors['email'] = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(this.form.email)) 
      this.errors['email'] = 'Enter a valid email';
    if (!this.form.password?.trim()) 
      this.errors['password'] = 'Password is required';
    return Object.keys(this.errors).length === 0;
  }

  submit() {
    if (!this.validate()) 
      return;
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