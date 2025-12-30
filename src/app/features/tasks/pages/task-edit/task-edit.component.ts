import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { TasksService } from '../../../../core/services/tasks.service';

@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink, NavbarComponent],
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss']
})
export class TaskEditComponent implements OnInit {
  id: string | null = null;
  task: any = { 
    title: '', 
    description: '', 
    date: '',
    time: '' 
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tasks: TasksService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    
    if (this.id) {
      this.tasks.getTask(this.id).subscribe({
        next: (res) => {
          this.task = {
            title: res.title,
            description: res.description,
            date: this.formatDateForInput(res.date),
            time: this.formatTimeForInput(res.time)
          }
        },
        error: (err) => {
          alert('Không thể tải thông tin công việc');
        }
      });
    } else {
      const params = this.route.snapshot.queryParams;
      this.task.date = params['date'] || this.getTodayDate();
      this.task.time = params['time'] || this.getCurrentTime();
    }
  }

  private formatDateForInput(dateValue: any): string {
    if (!dateValue) return this.getTodayDate();
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return this.getTodayDate();
      
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      return this.getTodayDate();
    }
  }

  private formatTimeForInput(timeValue: any): string {
    if (!timeValue) return this.getCurrentTime();
    
    // Nếu time là string "HH:mm" hoặc "HH:mm:ss"
    if (typeof timeValue === 'string') {
      // Lấy phần HH:mm
      const match = timeValue.match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        const hours = ('0' + match[1]).slice(-2);
        const minutes = ('0' + match[2]).slice(-2);
        return `${hours}:${minutes}`;
      }
    }
    
    // Nếu time là Date object
    if (timeValue instanceof Date) {
      const hours = ('0' + timeValue.getHours()).slice(-2);
      const minutes = ('0' + timeValue.getMinutes()).slice(-2);
      return `${hours}:${minutes}`;
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
    console.log('Saving task with time:', this.task);
    
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

    // 2. Gọi subscribe 1 lần duy nhất
    request$.subscribe({
      next: () => {
        alert(this.id ? 'Cập nhật thành công!' : 'Tạo công việc thành công!');
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        console.error('Save error:', err);
        alert('Lỗi: ' + (err.error?.message || err.message));
      }
    });
  }
}