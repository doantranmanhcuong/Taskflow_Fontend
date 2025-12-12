// File: src/app/core/services/tasks.service.ts
// ĐẢM BẢO export đúng tên class là 'TasksService'

import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TasksService {  
  constructor(private api: ApiService) {}

  getTasks() {
    return this.api.get<any>('/tasks').pipe(
      map(response => {
        console.log('Full API response:', response);
        return response?.data || [];
      }),
      catchError(err => {
        console.error('Get tasks error:', err);
        return of([]);
      })
    );
  }

  getTask(id: string) {
    return this.api.get<any>(`/tasks/${id}`).pipe(
      catchError(err => {
        console.error('Get task error:', err);
        return of(null);
      })
    );
  }

  createTask(data: any) {
    return this.api.post<any>('/tasks', data).pipe(
      catchError(err => {
        console.error('Create task error:', err);
        return of(null);
      })
    );
  }

  updateTask(id: string, data: any) {
    return this.api.put<any>(`/tasks/${id}`, data).pipe(
      catchError(err => {
        console.error('Update task error:', err);
        return of(null);
      })
    );
  }

  deleteTask(id: string) {
    return this.api.delete<any>(`/tasks/${id}`).pipe(
      catchError(err => {
        console.error('Delete task error:', err);
        return of(null);
      })
    );
  }

  markAsCompleted(id: string) {
  console.log(' Service: markAsCompleted for ID:', id);
  return this.api.patch<any>(`/tasks/${id}/complete`, {}).pipe(
    tap(response => {
      console.log(' Service Response:', response);
    }),
    catchError(err => {
      console.error(' Service Error:', err);
      return of(null);
    })
  );
}

  markAsIncomplete(id: string) {
    return this.api.patch<any>(`/tasks/${id}/incomplete`, {}).pipe(
      catchError(err => {
        console.error('Mark as incomplete error:', err);
        return of(null);
      })
    );
  }
}