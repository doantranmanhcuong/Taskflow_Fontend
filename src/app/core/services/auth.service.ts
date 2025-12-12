// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private api: ApiService, 
    private router: Router
  ) {
    // Tự động load user profile nếu đã đăng nhập
    if (this.isLoggedIn() && !this.getStoredUser()) {
      this.loadUserProfile();
    }
  }

  // ============ PUBLIC METHODS ============

  login(payload: { email: string; password: string }): Observable<any> {
    return this.api.post<any>('/auth/login', payload).pipe(
      tap((res) => {
        this.handleLoginSuccess(res);
      })
    );
  }

  register(payload: {
    fullName: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.api.post<any>('/auth/register', {
      name: payload.fullName,
      email: payload.email,
      password: payload.password,
    }).pipe(
      tap((res) => {
        this.handleLoginSuccess(res);
      })
    );
  }

  logout(): Observable<any> {
    return this.api.post('/auth/logout', {}).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token') || 
           localStorage.getItem('access_token');
  }

  // Public method để cập nhật user
  updateUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // ============ PRIVATE METHODS ============

  private handleLoginSuccess(res: any): void {
    if (res?.access_token) {
      localStorage.setItem('token', res.access_token);
      
      if (res.user) {
        this.updateUser(res.user);
      } else if (res.access_token) {
        // Nếu response không có user info, load từ API
        this.loadUserProfile();
      }
      
      this.isLoggedInSubject.next(true);
    }
  }

  private getStoredUser(): User | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    return null;
  }

  private loadUserProfile(): void {
    this.api.get<User>('/users/profile').subscribe({
      next: (user) => {
        this.updateUser(user);
      },
      error: (error) => {
        console.error('Failed to load user profile:', error);
        if (error.status === 401) {
          this.clearAuth();
        }
      }
    });
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }
}