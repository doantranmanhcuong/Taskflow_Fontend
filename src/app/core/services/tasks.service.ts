import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  constructor(private api: ApiService) {}

  getTasks() {
    return this.api.get<any>('/tasks').pipe(
      map(response => {
        console.log('Full API response:', JSON.stringify(response, null, 2));  

        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        } else if (response && response.tasks && Array.isArray(response.tasks)) {
          return response.tasks;
        } else if (response && response.results && Array.isArray(response.results)) {
          return response.results;
        } else if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object' && Object.keys(response).length > 0) {
          const keys = Object.keys(response);
          if (keys.every(key => !isNaN(Number(key)))) {
            const array = keys.map(key => response[key]);
            console.log('Converted object to array:', array);
            return array;
          }
        }

        console.error('Unexpected response format:', response);  
        return []; 
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

  markDone(id: string) {
    return this.api.put<any>(`/tasks/${id}/done`, {}).pipe(
      catchError(err => {
        console.error('Mark done error:', err);
        return of(null);
      })
    );
  }
}