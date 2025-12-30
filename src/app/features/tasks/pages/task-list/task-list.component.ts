import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe, TitleCasePipe, SlicePipe } from '@angular/common'; 
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';  
import { MatCheckboxModule } from '@angular/material/checkbox';  
import { MatIconModule } from '@angular/material/icon';  
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';  
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // THÊM
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { TasksService } from '../../../../core/services/tasks.service';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, NavbarComponent,
    MatCardModule, MatCheckboxModule, MatIconModule, MatProgressSpinnerModule, 
    MatSnackBarModule
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  loading: boolean = true;  
  todo: any[] = []; 
  done: any[] = [];  

  constructor(
    private tasks: TasksService,
    private snackBar: MatSnackBar 
  ) {}

  ngOnInit(): void {  
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.tasks.getTasks().subscribe({
      next: (list: any[]) => {
        this.todo = [];
        this.done = [];

        if (list && Array.isArray(list)) {
          list.forEach(task => {
            const isCompleted = task.status?.toLowerCase() === 'completed';
            if (isCompleted) {
              this.done.push(task);
            } else {
              this.todo.push(task);
            }
          });
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Load tasks error:', err);
        this.loading = false;
        this.showError('Không thể tải danh sách công việc');
      }
    });
  }

  toggleTaskStatus(task: any): void {
    const taskId = task.id;
    const isCompleted = task.status?.toLowerCase() === 'completed';
    const request$ = isCompleted 
      ? this.tasks.markAsIncomplete(taskId) 
      : this.tasks.markAsCompleted(taskId);

    const successMessage = isCompleted 
      ? 'Đã đánh dấu chưa hoàn thành' 
      : 'Đã hoàn thành công việc';
    request$.subscribe({
      next: () => {
        this.loadTasks(); 
        this.showSuccess(successMessage);
      },
      error: (err: any) => {
        console.error('Toggle status error:', err);
        this.showError('Không thể cập nhật trạng thái');
      }
    });
  }

  deleteTask(task: any): void {  
  const taskId = task.id;
  
  if (!taskId) {
    console.error('Task không có ID:', task);
    return;
  }

  if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
    this.tasks.deleteTask(taskId).subscribe({
      next: () => {
        this.loadTasks();
        this.showSuccess('Đã xóa công việc');
      },
      error: (err: any) => {
        console.error('Delete task error:', err);
        this.showError('Không thể xóa công việc');
      }
    });
  }
}

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}