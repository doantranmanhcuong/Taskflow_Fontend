import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private api: ApiService) {}

  getMe() {
    return this.api.get<any>('/users/me');
  }

  updateMe(data: any) {
    return this.api.put<any>('/users/me', data);
  }
}
