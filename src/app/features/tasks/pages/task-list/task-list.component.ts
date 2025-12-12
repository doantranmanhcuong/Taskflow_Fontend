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
    NgIf, NgFor, DatePipe, TitleCasePipe, SlicePipe,
    RouterLink,
    MatCardModule, MatCheckboxModule, MatIconModule, MatProgressSpinnerModule, CommonModule,
    MatSnackBarModule, 
    NavbarComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  loading: boolean = true;  
  todo: any[] = [];  // Tasks có status !== 'COMPLETED'
  done: any[] = [];  // Tasks có status === 'COMPLETED'

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
        if (list && Array.isArray(list)) {
         this.todo = list.filter((t: any) => {
          const status = t.status ? t.status.toLowerCase() : '';
          return status !== 'completed';
        });
        
        this.done = list.filter((t: any) => {
          const status = t.status ? t.status.toLowerCase() : '';
          return status === 'completed';
        });
        
        console.log('📊 Todo:', this.todo.length, 'Done:', this.done.length);
      } else {
        this.todo = [];
        this.done = [];
      }
      this.loading = false;
    },
    error: (err: any) => {  
      console.error('Load tasks error:', err);
      this.todo = [];
      this.done = [];
      this.loading = false;
    }
  });
}

toggleTaskStatus(task: any): void {  
  const taskId = task.id || task._id;
  
  // SỬA: Kiểm tra hoa/thường
  const isCompleted = task.status && 
                     task.status.toLowerCase() === 'completed';
  
  if (isCompleted) {
    this.tasks.markAsIncomplete(taskId).subscribe({
      next: () => {
        this.loadTasks();
        this.showSuccess('Đã bỏ đánh dấu hoàn thành');
      },
      error: (err: any) => {
        console.error('Mark incomplete error:', err);
        this.showError('Không thể cập nhật trạng thái');
      }
    });
  } else {
    this.tasks.markAsCompleted(taskId).subscribe({
      next: () => {
        this.loadTasks();
        this.showSuccess('Đã đánh dấu hoàn thành');
      },
      error: (err: any) => {
        console.error('Mark completed error:', err);
        this.showError('Không thể cập nhật trạng thái');
      }
    });
  }
}

  deleteTask(task: any): void {  
  const taskId = task.id || task._id;
  
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

  // Helper methods cho notifications
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