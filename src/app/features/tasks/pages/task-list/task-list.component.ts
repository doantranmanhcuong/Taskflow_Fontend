import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe, TitleCasePipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { TasksService } from '../../../../core/services/tasks.service';
import { CommonModule } from '@angular/common';

import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, NavbarComponent,
    MatCardModule, MatCheckboxModule, MatIconModule, MatProgressSpinnerModule,
    MatSnackBarModule,
    DragDropModule 
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
          // Sắp xếp: Ưu tiên ghim lên trước, sau đó sắp xếp theo thời gian
          list.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            
            const timeA = new Date(a.date + 'T' + (a.time || '00:00')).getTime();
            const timeB = new Date(b.date + 'T' + (b.time || '00:00')).getTime();
            return timeA - timeB; 
          });

          // Phân loại vào 2 cột
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

  drop(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } 
    else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      const task = event.container.data[event.currentIndex];
      
      if (event.container.id === 'doneList') {
        this.callApiToUpdateStatus(task, true);
      } 
      else if (event.container.id === 'todoList') {
        this.callApiToUpdateStatus(task, false);
      }
    }
  }

  private callApiToUpdateStatus(task: any, isCompleting: boolean): void {
    const request$ = isCompleting 
      ? this.tasks.markAsCompleted(task.id) 
      : this.tasks.markAsIncomplete(task.id);

    const successMessage = isCompleting 
      ? 'Đã hoàn thành công việc' 
      : 'Đã đánh dấu chưa hoàn thành';

    request$.subscribe({
      next: () => {
        this.loadTasks(); 
        this.showSuccess(successMessage);
      },
      error: (err: any) => {
        console.error('Toggle status error:', err);
        this.showError('Không thể cập nhật trạng thái');
        this.loadTasks(); 
      }
    });
  }

  toggleTaskStatus(task: any): void {
    const isCompleted = task.status?.toLowerCase() === 'completed';
    this.callApiToUpdateStatus(task, !isCompleted); 
  }

  // ✅ CẬP NHẬT LẠI HÀM GHIM: ĐẢM BẢO ĐỒNG BỘ 100% VỚI BACKEND
  togglePin(task: any, event: Event): void {
    event.stopPropagation(); 
    
    // 1. Cập nhật giao diện ngay lập tức (Optimistic Update)
    const newPinnedStatus = !task.isPinned;
    task.isPinned = newPinnedStatus; 
    this.sortLocalLists();

    // 2. Tạo payload "sạch" để cập nhật, tránh gửi dư dữ liệu bị Gateway chặn
    const payload = {
      isPinned: newPinnedStatus,
      title: task.title,
      status: task.status,
      // Có thể thêm các thuộc tính khác ở đây nếu cần, đảm bảo chúng trùng khớp với DTO
    };

    // 3. Gửi xuống Backend
    this.tasks.updateTask(task.id, payload).subscribe({
      next: () => {
        console.log('Lưu trạng thái ghim vào Database thành công');
        this.showSuccess(newPinnedStatus ? 'Đã ghim công việc' : 'Đã bỏ ghim');
        // 🚀 Bắt buộc load lại danh sách mới từ DB để tránh mất dữ liệu khi chuyển trang
        this.loadTasks(); 
      },
      error: (err: any) => {
        console.error('Lỗi khi lưu ghim:', err);
        // Hoàn tác nếu lỗi
        task.isPinned = !newPinnedStatus; 
        this.sortLocalLists();
        this.showError('Không thể lưu trạng thái ghim vào Database');
      }
    });
  }

  // Hàm sắp xếp nội bộ ngay trên màn hình (không cần gọi API)
  private sortLocalLists(): void {
    const sortFn = (a: any, b: any) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      const timeA = new Date(a.date + 'T' + (a.time || '00:00')).getTime();
      const timeB = new Date(b.date + 'T' + (b.time || '00:00')).getTime();
      return timeA - timeB; 
    };

    this.todo.sort(sortFn);
    this.done.sort(sortFn);
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