import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { catchError, map, of, tap } from 'rxjs';

//  ĐỊNH NGHĨA INTERFACE TASK NGAY TẠI ĐÂY
export interface Task {
  id?: string | number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  status: string;
  completedAt?: string | null;
  userId?: number;
  priority?: string;
  color?: string;
  isPinned?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TasksService {  
  constructor(private api: ApiService) {}

  getTasks() {
    return this.api.get<any>('/tasks').pipe(
      map(response => response?.data || [])
    );
  }

  getTask(id: string | number) {
    return this.api.get<any>(`/tasks/${id}`).pipe(
      map(response => response?.data || response)
    );
  }

  createTask(data: Partial<Task>) {
    return this.api.post<any>('/tasks', data);
  }

  updateTask(id: string | number, data: Partial<Task>) {
    return this.api.put<any>(`/tasks/${id}`, data);
  }

  deleteTask(id: string | number) {
    return this.api.delete<any>(`/tasks/${id}`);
  }

  markAsCompleted(id: string | number) {
    return this.api.patch<any>(`/tasks/${id}/complete`, {});
  }

  markAsIncomplete(id: string | number) {
    return this.api.patch<any>(`/tasks/${id}/incomplete`, {});
  }
}