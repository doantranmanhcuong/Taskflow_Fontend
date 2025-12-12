// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { 
  HttpClient, 
  HttpHeaders, 
  HttpParams,
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl || 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  // Tạo headers với token
  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Lấy token từ nhiều nguồn
  private getToken(): string | null {
    return localStorage.getItem('token') || 
           localStorage.getItem('access_token') ||
           sessionStorage.getItem('token');
  }

  // GET request
  get<T>(path: string, params?: any): Observable<T> {
    const options = {
      headers: this.getHeaders(),
      params: this.createParams(params)
    };
    
    return this.http.get<T>(`${this.baseUrl}${path}`, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  // POST request
  post<T>(path: string, body: any): Observable<T> {
    const options = {
      headers: this.getHeaders()
    };
    
    return this.http.post<T>(`${this.baseUrl}${path}`, body, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  // PUT request
  put<T>(path: string, body: any): Observable<T> {
    const options = {
      headers: this.getHeaders()
    };
    
    return this.http.put<T>(`${this.baseUrl}${path}`, body, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  // PATCH request
  patch<T>(path: string, body: any = {}): Observable<T> {
    const options = {
      headers: this.getHeaders()
    };
    
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  // DELETE request
  delete<T>(path: string): Observable<T> {
    const options = {
      headers: this.getHeaders()
    };
    
    return this.http.delete<T>(`${this.baseUrl}${path}`, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Upload file (nếu cần)
  uploadFile<T>(path: string, file: File, data?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
    }

    const headers = new HttpHeaders();
    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<T>(`${this.baseUrl}${path}`, formData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Tạo HttpParams từ object
  private createParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          if (Array.isArray(params[key])) {
            // Xử lý array parameters
            params[key].forEach((value: any) => {
              httpParams = httpParams.append(key, value.toString());
            });
          } else {
            httpParams = httpParams.set(key, params[key].toString());
          }
        }
      });
    }
    
    return httpParams;
  }

  // Xử lý lỗi
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Đã xảy ra lỗi không xác định';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Yêu cầu không hợp lệ';
          break;
        case 401:
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          break;
        case 403:
          errorMessage = 'Bạn không có quyền truy cập tài nguyên này';
          break;
        case 404:
          errorMessage = 'Không tìm thấy tài nguyên yêu cầu';
          break;
        case 409:
          errorMessage = error.error?.message || 'Xung đột dữ liệu';
          break;
        case 422:
          errorMessage = error.error?.message || 'Dữ liệu không hợp lệ';
          break;
        case 500:
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
          break;
        default:
          errorMessage = error.error?.message || `Lỗi server: ${error.status}`;
      }
    }
    
    console.error('API Error:', error);
    
    // Trả về error object với thông tin chi tiết
    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error,
      url: error.url
    }));
  }
}