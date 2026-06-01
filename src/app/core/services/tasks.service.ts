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

  // ✅ CẬP NHẬT: Xử lý dữ liệu trả về để bóc tách trường 'data'
  getTask(id: string | number) {
    return this.api.get<any>(`/tasks/${id}`).pipe(
      map(response => {
        // Backend trả về { data: { id: 1, title: '...', ... } }
        return response?.data || response;
      })
    );
  }

  createTask(data: any) {
    return this.api.post<any>('/tasks', data);
  }

  updateTask(id: string | number, data: any) {
    return this.api.put<any>(`/tasks/${id}`, data);
  }

  deleteTask(id: string | number) {
    return this.api.delete<any>(`/tasks/${id}`);
  }

  markAsCompleted(id: string | number) {
    console.log(' Service: markAsCompleted for ID:', id);
    return this.api.patch<any>(`/tasks/${id}/complete`, {});
  }

  markAsIncomplete(id: string | number) {
    return this.api.patch<any>(`/tasks/${id}/incomplete`, {});
  }
}