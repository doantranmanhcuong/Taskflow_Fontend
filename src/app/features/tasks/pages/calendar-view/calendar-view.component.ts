import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventDropArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../../../../core/services/tasks.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    CommonModule, 
    FullCalendarModule, 
    MatDatepickerModule, 
    MatNativeDateModule, 
    MatFormFieldModule, 
    MatInputModule,
    FormsModule,
    NavbarComponent,
    MatSnackBarModule
  ],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss']
})
export class CalendarViewComponent implements OnInit {
  
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  currentDate = new Date();

  // ✅ KHAI BÁO BIẾN ĐỂ THEO DÕI CLICK / DOUBLE CLICK
  clickTimeout: any = null;

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridDay', 
    plugins: [timeGridPlugin, interactionPlugin],
    headerToolbar: false, 
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    allDaySlot: false, 
    nowIndicator: true, 
    defaultTimedEventDuration: '00:30', 
    forceEventDuration: true,
    displayEventEnd: false,
    selectable: true,
    editable: true, 
    eventDurationEditable: false,

    // TÙY BIẾN GIAO DIỆN
    eventContent: (arg) => {
      const isCompleted = arg.event.extendedProps['status'] === 'completed';
      const statusClass = isCompleted ? 'done' : 'todo';
      
      // ✅ Bỏ class nút bấm, chỉ để lại icon hiển thị trạng thái
      const iconHtml = isCompleted 
        ? `<span class="status-icon" title="Đã hoàn thành">✅</span>` 
        : `<span class="status-icon" title="Chưa hoàn thành">⏳</span>`; // Dùng đồng hồ cát hoặc ô vuông

      return {
        html: `
          <div class="modern-event ${statusClass}">
            <div class="event-time">
              ${iconHtml}
              ${arg.timeText}
            </div>
            <div class="event-title">${arg.event.title}</div>
          </div>
        `
      };
    },

    events: [],

    dateClick: (arg) => this.handleDateClick(arg),
    eventClick: (arg) => this.handleEventClick(arg),
    eventDrop: (arg) => this.handleEventDrop(arg),
  };

  constructor(
    private tasksService: TasksService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.tasksService.getTasks().subscribe({
      next: (tasks: any[]) => {
        const events = tasks.map(task => {
          let start = task.date;
          if (task.time) {
            start += `T${task.time.toString().substring(0, 5)}`; 
          }

          const isCompleted = task.status && task.status.toLowerCase() === 'completed';

          return {
            id: task.id, 
            title: task.title,
            start: start,
            extendedProps: {
              status: isCompleted ? 'completed' : 'pending'
            }
          };
        });
        this.calendarOptions.events = events;
      },
      error: (err) => {
        console.error('Lỗi tải sự kiện:', err);
        this.showMessage('Lỗi tải lịch', 'error');
      }
    });
  }

  onDateSelected(event: any) {
    const selectedDate = event.value;
    if (selectedDate && this.calendarComponent) {
      this.currentDate = selectedDate;
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.gotoDate(selectedDate); 
    }
  }

  handleDateClick(arg: any) {
    const dateObj = new Date(arg.dateStr);
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    const selectedDate = `${year}-${month}-${day}`;

    const hours = ('0' + dateObj.getHours()).slice(-2);
    const minutes = ('0' + dateObj.getMinutes()).slice(-2);
    const selectedTime = `${hours}:${minutes}`;

    this.router.navigate(['/tasks/create'], { 
      queryParams: { 
        date: selectedDate,
        time: selectedTime 
      } 
    });
  }

  // ✅ LOGIC XỬ LÝ NHẤN 1 LẦN VÀ NHẤN ĐÚP (2 LẦN)
  handleEventClick(arg: any) {
    const taskId = arg.event.id;
    const isCompleted = arg.event.extendedProps['status'] === 'completed';

    if (this.clickTimeout) {
      // 1. NHẤN LẦN 2 (Trong khoảng thời gian chờ) -> ĐÂY LÀ DOUBLE CLICK
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;

      // Chuyển sang trang Edit
      if (taskId) {
        this.router.navigate(['/tasks', taskId, 'edit']);
      }

    } else {
      // 2. NHẤN LẦN 1 -> Đợi 250ms xem người dùng có nhấn thêm lần nữa không
      this.clickTimeout = setTimeout(() => {
        
        // Nếu qua 250ms mà không có lần nhấn thứ 2 -> ĐÂY LÀ SINGLE CLICK
        this.clickTimeout = null;
        
        // Đổi trạng thái hoàn thành/chưa hoàn thành
        if (taskId) {
          this.toggleTaskStatus(taskId, isCompleted);
        }
        
      }, 250); // Khoảng thời gian 250ms là chuẩn cho thao tác Double Click
    }
  }

  handleEventDrop(arg: EventDropArg) {
    const taskId = arg.event.id;
    const newDateObj = arg.event.start;
    
    if (newDateObj && taskId) {
      const year = newDateObj.getFullYear();
      const month = ('0' + (newDateObj.getMonth() + 1)).slice(-2);
      const day = ('0' + newDateObj.getDate()).slice(-2);
      const updatedDate = `${year}-${month}-${day}`;

      const hours = ('0' + newDateObj.getHours()).slice(-2);
      const minutes = ('0' + newDateObj.getMinutes()).slice(-2);
      const updatedTime = `${hours}:${minutes}`;

      const updateData = { date: updatedDate, time: updatedTime };
      
      this.tasksService.updateTask(taskId, updateData).subscribe({
        next: () => {
          this.showMessage('Đã cập nhật ngày/giờ');
        },
        error: (err) => {
          console.error('Lỗi khi kéo thả:', err);
          arg.revert(); 
          this.showMessage('Lỗi cập nhật', 'error');
        }
      });
    }
  }

  toggleTaskStatus(taskId: string, currentlyCompleted: boolean) {
    const request$ = currentlyCompleted
      ? this.tasksService.markAsIncomplete(taskId)
      : this.tasksService.markAsCompleted(taskId);

    request$.subscribe({
      next: () => {
        this.showMessage(currentlyCompleted ? 'Đã bỏ đánh dấu hoàn thành' : 'Đã hoàn thành công việc');
        this.loadEvents(); 
      },
      error: (err) => {
        console.error('Lỗi khi đổi trạng thái:', err);
        this.showMessage('Lỗi cập nhật', 'error');
      }
    });
  }

  private showMessage(msg: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(msg, 'Đóng', {
      duration: 2500,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}