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

// ✅ BƯỚC 1: IMPORT DRAG DROP MODULE
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, NavbarComponent,
    MatCardModule, MatCheckboxModule, MatIconModule, MatProgressSpinnerModule,
    MatSnackBarModule,
    DragDropModule // ✅ THÊM VÀO ĐÂY
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

  // ✅ BƯỚC 2: HÀM XỬ LÝ SỰ KIỆN KÉO THẢ (DRAG & DROP)
  drop(event: CdkDragDrop<any[]>): void {
    // Trường hợp 1: Người dùng kéo thả thay đổi vị trí TRONG CÙNG 1 CỘT (vd: đổi thứ tự ưu tiên)
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } 
    // Trường hợp 2: Người dùng kéo thẻ SANG CỘT KHÁC (Cần làm -> Đã xong, hoặc ngược lại)
    else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // Lấy data của task vừa được kéo thả
      const task = event.container.data[event.currentIndex];
      
      // Nếu thả vào cột "Đã hoàn thành" (dựa vào id của DropList mà ta sẽ định nghĩa ở HTML)
      if (event.container.id === 'doneList') {
        this.callApiToUpdateStatus(task, true);
      } 
      // Nếu thả vào cột "Cần làm"
      else if (event.container.id === 'todoList') {
        this.callApiToUpdateStatus(task, false);
      }
    }
  }

  // ✅ BƯỚC 3: TÁCH LOGIC GỌI API RA THÀNH HÀM RIÊNG
  private callApiToUpdateStatus(task: any, isCompleting: boolean): void {
    const request$ = isCompleting 
      ? this.tasks.markAsCompleted(task.id) 
      : this.tasks.markAsIncomplete(task.id);

    const successMessage = isCompleting 
      ? 'Đã hoàn thành công việc' 
      : 'Đã đánh dấu chưa hoàn thành';

    request$.subscribe({
      next: () => {
        // Có thể gọi lại loadTasks() để đồng bộ ngày giờ (completedAt) từ DB lên,
        // Nhưng nếu muốn UI mượt hơn, bạn có thể tự cập nhật property completedAt ở client.
        this.loadTasks(); 
        this.showSuccess(successMessage);
      },
      error: (err: any) => {
        console.error('Toggle status error:', err);
        this.showError('Không thể cập nhật trạng thái');
        this.loadTasks(); // Rollback UI nếu lỗi
      }
    });
  }

  // Vẫn giữ lại hàm toggle bằng checkbox phòng khi user muốn click
  toggleTaskStatus(task: any): void {
    const isCompleted = task.status?.toLowerCase() === 'completed';
    this.callApiToUpdateStatus(task, !isCompleted); // Đảo ngược trạng thái hiện tại
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