import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfile
} from '../models/models';

const TOKEN_KEY = 'plm_jwt';
const USER_KEY  = 'plm_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private base = '/api/auth';
  private isBrowser: boolean;

  currentUser = signal<AuthResponse | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) 
  {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this.currentUser.set(this.loadUser());
    }
  }

  // Register 
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/register`, data)
      .pipe(tap(res => this.saveSession(res)));
  }

  // Login 
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, data)
      .pipe(tap(res => this.saveSession(res)));
  }

  // Profile 
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/me`);
  }

  // Logout 
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // Token helpers 
  getToken(): string | null {
    if (!this.isBrowser) 
      return null;      //prevent SSR
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    if(this.getToken())
      return true;
    return false;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }

  // Internal helpers 
  private saveSession(res: AuthResponse): void {
    if (!this.isBrowser) return;

    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    this.currentUser.set(res);
  }

  private loadUser(): AuthResponse | null {
    if (!this.isBrowser) 
      return null;

    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}