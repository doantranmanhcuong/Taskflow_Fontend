// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { 
  HttpClient, 
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

  get<T>(path: string, params?: any): Observable<T> {
    const options = { params: this.createParams(params) };
    return this.http.get<T>(`${this.baseUrl}${path}`, options)
      .pipe(catchError(this.handleError)); // Gọi hàm xử lý lỗi ở dưới
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  patch<T>(path: string, body: any = {}): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`)
      .pipe(catchError(this.handleError));
  }

  uploadFile<T>(path: string, file: File, data?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    if (data) {
      Object.keys(data).forEach(key => formData.append(key, data[key]));
    }
    return this.http.post<T>(`${this.baseUrl}${path}`, formData)
      .pipe(catchError(this.handleError));
  }

  private createParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          if (Array.isArray(params[key])) {
            params[key].forEach((value: any) => httpParams = httpParams.append(key, value.toString()));
          } else {
            httpParams = httpParams.set(key, params[key].toString());
          }
        }
      });
    }
    return httpParams;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Đã xảy ra lỗi không xác định';
    
    if (error.error instanceof ErrorEvent) {
      // Lỗi phía Client
      errorMessage = `Lỗi kết nối: ${error.error.message}`;
    } else {
      // Lỗi từ Server - Dịch sang tiếng Việt
      switch (error.status) {
        case 0:
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra mạng.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Dữ liệu gửi đi không hợp lệ.';
          break;
        case 401:
          // Interceptor đã redirect rồi, nhưng ta vẫn trả về text để UI biết nếu cần
          errorMessage = 'Phiên đăng nhập hết hạn.';
          break;
        case 403:
          errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
          break;
        case 404:
          errorMessage = 'Không tìm thấy dữ liệu yêu cầu.';
          break;
        case 409:
          errorMessage = error.error?.message || 'Dữ liệu bị trùng lặp.';
          break;
        case 422:
          errorMessage = error.error?.message || 'Dữ liệu không đúng định dạng.';
          break;
        case 500:
          errorMessage = 'Máy chủ gặp sự cố. Vui lòng thử lại sau.';
          break;
        default:
          errorMessage = error.error?.message || `Lỗi lạ (${error.status})`;
      }
    }
    
    console.error('API Error Details:', error);
    
    // Trả về object lỗi chuẩn để Component (VD: trang Login) hứng được và hiện lên
    return throwError(() => ({
      status: error.status,
      message: errorMessage, // Component sẽ lấy cái này để hiện popup
      error: error.error
    }));
  }
}