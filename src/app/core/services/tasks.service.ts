import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  constructor(private api: ApiService) {}

  getTasks() {
    return this.api.get<any[]>('/tasks');
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

  markDone(id: string) {
    return this.api.put<any>(`/tasks/${id}/done`, {});
  }
}
