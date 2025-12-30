import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';  // Fix: Add catchError, throwError
import { ApiService } from './api.service';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
  phone?: string;
  avatar?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  phone?: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private api: ApiService) {}

  getProfile(): Observable<User> {
    return this.api.get<User>('/users/profile');
  }

  updateProfile(data: UpdateUserDto): Observable<User> {
    console.log('[USER-SERVICE] Sending updateProfile dto:', data);  // Fix: Log dto to debug password sent
    return this.api.put<User>('/users/profile', data).pipe(
      tap(response => console.log('[USER-SERVICE] updateProfile success:', response)),  // Fix: Log success
      catchError(err => {
        console.error('[USER-SERVICE] updateProfile error:', err);  // Fix: Log error
        return throwError(() => err);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.api.put('/users/change-password', {
      currentPassword,
      newPassword
    });
  }

  updateAvatar(file: File): Observable<any> {
    return this.api.uploadFile('/users/avatar', file);
  }
}