import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../../../../core/services/tasks.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';

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
    NavbarComponent
  ],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss']
})
export class CalendarViewComponent implements OnInit {
  
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  
  // Biến lưu ngày đang chọn để hiển thị ra HTML (nếu cần)
  currentDate = new Date();

  calendarOptions: CalendarOptions = {
    // 1. CỐ ĐỊNH LUÔN LÀ VIEW NGÀY (CÓ GIỜ)
    initialView: 'timeGridDay', 
    plugins: [timeGridPlugin, interactionPlugin],
    
    // 2. TẮT THANH ĐIỀU HƯỚNG MẶC ĐỊNH (để dùng Datepicker của mình)
    headerToolbar: false, 

    // 3. Cấu hình cột giờ
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    allDaySlot: false, // Ẩn dòng "Cả ngày" cho gọn
    nowIndicator: true, // Hiện vạch đỏ chỉ giờ hiện tại
    defaultTimedEventDuration: '00:30', // Mặc định mỗi task chỉ dài 30 phút
    forceEventDuration: true,
    displayEventEnd: false,
    selectable: true,
    events: [],

    // Xử lý click vào khung giờ trống -> Tạo Task mới
    dateClick: (arg) => this.handleDateClick(arg),
    
    eventClick: (arg) => this.handleEventClick(arg),
  };

  constructor(
    private tasksService: TasksService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.tasksService.getTasks().subscribe({
      next: (tasks: any[]) => {
        const events = tasks.map(task => {
          // Xử lý ngày giờ start
          let start = task.date;
          if (task.time) {
            start += `T${task.time.toString().substring(0, 5)}`; 
          }

          return {
            id: task.id, 
            title: task.title,
            start: start,
            backgroundColor: (task.status && task.status.toLowerCase() === 'completed') ? '#26e245ff' : '#b61012ff',
            borderColor: 'transparent'
          };
        });
        this.calendarOptions.events = events;
      },
      error: (err) => console.error(err)
    });
  }

  onDateSelected(event: any) {
    const selectedDate = event.value;
    if (selectedDate && this.calendarComponent) {
      this.currentDate = selectedDate;
      const calendarApi = this.calendarComponent.getApi();
      
      // Chỉ đơn giản là nhảy tới ngày đó (Giao diện vẫn giữ nguyên là cột giờ)
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

  handleEventClick(arg: any) {
    const taskId = arg.event.id; 

    console.log('🔵 Click vào Task -> ID:', taskId);
    if (taskId) {
      this.router.navigate(['/tasks', taskId, 'edit']);
    } else {
      console.error('Lỗi: Không tìm thấy ID của task này');
    }
  }
}