import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common'; 
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon'; 
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { TasksService, Task } from '../../../../core/services/tasks.service'; 

@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, RouterLink, NavbarComponent, MatIconModule], 
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss']
})
export class TaskEditComponent implements OnInit {
  id: string | null = null;
  
  // KHỞI TẠO DỮ LIỆU MẶC ĐỊNH
  task: Partial<Task> = { 
    title: '', 
    description: '', 
    date: '',
    time: '',
    color: '#3b82f6', // Mặc định xanh dương
    isPinned: false
  };

  availableColors = [
    { name: 'Xanh dương', value: '#3b82f6' },
    { name: 'Đỏ (Quan trọng)', value: '#ef4444' },
    { name: 'Xanh lá (Cá nhân)', value: '#10b981' },
    { name: 'Vàng (Học tập)', value: '#f59e0b' },
    { name: 'Tím (Khác)', value: '#8b5cf6' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tasks: TasksService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    
    if (this.id) {
      // TRƯỜNG HỢP SỬA CÔNG VIỆC: Lấy dữ liệu cũ đổ lên form
      this.tasks.getTask(this.id).subscribe({
        next: (res) => {
          this.task = {
            title: res.title,
            description: res.description,
            date: this.formatDateForInput(res.date), // Format chuẩn ngày
            time: this.formatTimeForInput(res.time), // Format chuẩn giờ
            color: res.color || '#3b82f6', 
            isPinned: res.isPinned || false
          };
        },
        error: (err) => {
          console.error('Lỗi khi tải task:', err);
          alert('Không thể tải thông tin công việc');
        }
      });
    } else {
      // TRƯỜNG HỢP TẠO MỚI CÔNG VIỆC
      const params = this.route.snapshot.queryParams;
      this.task.date = params['date'] || this.getTodayDate();
      this.task.time = params['time'] || this.getCurrentTime();
    }
  }

  // ✅ XỬ LÝ ĐỊNH DẠNG NGÀY CHO THẺ INPUT TYPE="DATE"
  private formatDateForInput(dateValue: any): string {
    if (!dateValue) return this.getTodayDate();
    
    // Nếu BE trả về đúng định dạng YYYY-MM-DD
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue.substring(0, 10);
    }

    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {}
    
    return this.getTodayDate();
  }

  // ✅ XỬ LÝ ĐỊNH DẠNG GIỜ CHO THẺ INPUT TYPE="TIME"
  private formatTimeForInput(timeValue: any): string {
    if (!timeValue) return this.getCurrentTime();
    
    if (typeof timeValue === 'string') {
      const match = timeValue.match(/^(\d{2}):(\d{2})/);
      if (match) return `${match[1]}:${match[2]}`;
    }
    
    return this.getCurrentTime();
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  private getCurrentTime(): string {
    const now = new Date();
    const hours = ('0' + now.getHours()).slice(-2);
    const minutes = ('0' + now.getMinutes()).slice(-2);
    return `${hours}:${minutes}`;
  }

  save() {
    if (!this.task.title?.trim()) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }
    if (!this.task.date) {
      alert('Vui lòng chọn ngày');
      return;
    }

    const request$ = this.id 
      ? this.tasks.updateTask(this.id, this.task) 
      : this.tasks.createTask(this.task);

    request$.subscribe({
      next: () => {
        alert(this.id ? 'Cập nhật thành công!' : 'Tạo công việc thành công!');
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        alert('Lỗi: ' + (err.error?.message || err.message));
      }
    });
  }
}