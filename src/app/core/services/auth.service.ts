import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private api: ApiService) {}

  login(payload: { email: string; password: string }) {
    return this.api.post<any>('/auth/login', payload).pipe(
      tap((res) => {
        if (res?.accessToken) {
          localStorage.setItem('token', res.accessToken);
        }
      })
    );
  }

  register(payload: {
    fullName: string;
    email: string;
    password: string;
  }) {
    return this.api.post<any>('/auth/register', {
      name: payload.fullName,  
      email: payload.email,
      password: payload.password,
    });
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
