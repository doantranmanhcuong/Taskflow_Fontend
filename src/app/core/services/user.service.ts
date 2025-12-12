// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    return this.api.put<User>('/users/profile', data);
  }

  // Thêm các method khác nếu cần
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