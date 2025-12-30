// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // Clone request và thêm header Authorization nếu có token
  const authReq = token 
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  // Log request cho debugging
  console.log(`[AuthInterceptor] ${req.method} ${req.url}`, token ? 'with token' : 'no token');

  return next(authReq).pipe(
    catchError((error) => {
      // Xử lý lỗi 401 Unauthorized
      if (error.status === 401) {
        console.warn('[AuthInterceptor] 401 Unauthorized - Redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url }
        });
      }
      
      // Xử lý lỗi 403 Forbidden
      if (error.status === 403) {
        console.warn('[AuthInterceptor] 403 Forbidden - Access denied');
        router.navigate(['/tasks']); 
      }
      
      return throwError(() => error);
    })
  );
};