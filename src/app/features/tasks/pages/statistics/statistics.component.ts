import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { TasksService, Task } from '../../../../core/services/tasks.service';
import { MatIconModule } from '@angular/material/icon';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, BaseChartDirective, MatIconModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  allTasks: Task[] = [];
  
  totalTasks = 0;
  completedTasks = 0;
  pendingTasks = 0;
  completionRate = 0;

  timeRange: 'week' | 'month' = 'week';

  // Cấu hình Biểu đồ Tròn (Pie Chart)
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#9ca3af' } },
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [ 'Đã hoàn thành', 'Cần làm' ],
    datasets: [ { data: [0, 0], backgroundColor: ['#3b82f6', '#ef4444'] } ]
  };
  public pieChartType: ChartType = 'pie';

  constructor(private tasksService: TasksService) {}

  ngOnInit(): void {
    this.tasksService.getTasks().subscribe({
      next: (tasks) => {
        this.allTasks = tasks || [];
        this.calculateStats();
      },
      error: (err) => console.error('Lỗi tải data thống kê:', err)
    });
  }

  onTimeRangeChange() {
    this.calculateStats();
  }

  private calculateStats() {
    const now = new Date();
    const pastDate = new Date();

    if (this.timeRange === 'week') {
      pastDate.setDate(now.getDate() - 7);
    } else {
      pastDate.setDate(now.getDate() - 30);
    }

    // Đưa thời gian về đầu ngày để tính cho chuẩn
    pastDate.setHours(0, 0, 0, 0);

    const filteredTasks = this.allTasks.filter(task => {
      if (!task.date) return false;
      const taskDate = new Date(task.date); 
      return taskDate >= pastDate && taskDate <= now;
    });

    this.totalTasks = filteredTasks.length;
    this.completedTasks = filteredTasks.filter(t => t.status?.toLowerCase() === 'completed').length;
    this.pendingTasks = this.totalTasks - this.completedTasks;
    
    this.completionRate = this.totalTasks === 0 ? 0 : Math.round((this.completedTasks / this.totalTasks) * 100);

    // Cập nhật mảng data cho biểu đồ vẽ lại
    this.pieChartData = {
      labels: [ 'Đã hoàn thành', 'Cần làm' ],
      datasets: [ { 
        data: [this.completedTasks, this.pendingTasks],
        backgroundColor: ['#10b981', '#ef4444'], // Xanh lá, Đỏ
        hoverBackgroundColor: ['#059669', '#dc2626'],
        borderWidth: 0 // Xóa viền trắng của biểu đồ
      } ]
    };
  }
}