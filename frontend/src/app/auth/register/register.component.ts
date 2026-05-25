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
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  form: RegisterRequest = { name: '', email: '', password: '' };
  confirmPassword = '';
  errors: Record<string, string> = {};
  loading = signal(false);
  serverError = signal('');
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
    if (!this.form.name?.trim())
      this.errors['name'] = 'Name is required';
    else if (this.form.name.trim().length < 2)
      this.errors['name'] = 'Name must be at least 2 characters';

    if (!this.form.email?.trim()) 
      this.errors['email'] = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(this.form.email)) 
      this.errors['email'] = 'Enter a valid email';

    if (!this.form.password) 
      this.errors['password'] = 'Password is required';
    else if (this.form.password.length < 6) 
      this.errors['password'] = 'Password must be at least 6 characters';

    if (this.form.password !== this.confirmPassword) 
      this.errors['confirm'] = 'Passwords do not match';
    return Object.keys(this.errors).length === 0;
  }

  submit() {
    if (!this.validate()) 
      return;
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