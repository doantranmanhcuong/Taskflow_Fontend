import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';  // Optional cho logout redirect

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());  // Reactive state
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private api: ApiService, private router?: Router) {}  // Router optional

  login(payload: { email: string; password: string }): Observable<any> {
    return this.api.post<any>('/auth/login', payload).pipe(
      tap((res) => {
        if (res?.access_token) {  // Fix: access_token từ BE response
          localStorage.setItem('token', res.access_token);
          this.isLoggedInSubject.next(true);
        }
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
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
    if (this.router) {  // Optional redirect login
      this.router.navigate(['/login']);
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}