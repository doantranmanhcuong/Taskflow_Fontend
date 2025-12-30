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
        return response?.data || [];
      }),
    );
  }

  getTask(id: string) {
    return this.api.get<any>(`/tasks/${id}`);
  }

  createTask(data: any) {
    return this.api.post<any>('/tasks', data);
  }

  updateTask(id: string, data: any) {
    return this.api.put<any>(`/tasks/${id}`, data);
  }

  deleteTask(id: string) {
    return this.api.delete<any>(`/tasks/${id}`);
  }

  markAsCompleted(id: string) {
  console.log(' Service: markAsCompleted for ID:', id);
  return this.api.patch<any>(`/tasks/${id}/complete`, {});
}

  markAsIncomplete(id: string) {
    return this.api.patch<any>(`/tasks/${id}/incomplete`, {});
  }
}