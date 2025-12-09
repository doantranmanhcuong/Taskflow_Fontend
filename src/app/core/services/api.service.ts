import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';  // Thêm HttpHeaders
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Fix: Thêm header Bearer token từ localStorage
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),  // Bearer token nếu có
    });
  }

  get<T>(path: string, params?: any) {
    return this.http.get<T>(this.baseUrl + path, { headers: this.getHeaders(), params });
  }

  post<T>(path: string, body: any) {
    return this.http.post<T>(this.baseUrl + path, body, { headers: this.getHeaders() });
  }

  put<T>(path: string, body: any) {
    return this.http.put<T>(this.baseUrl + path, body, { headers: this.getHeaders() });
  }

  delete<T>(path: string) {
    return this.http.delete<T>(this.baseUrl + path, { headers: this.getHeaders() });
  }
}