import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe, TitleCasePipe } from '@angular/common'; 
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';  
import { MatCheckboxModule } from '@angular/material/checkbox';  
import { MatIconModule } from '@angular/material/icon';  
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';  
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { TasksService } from '../../../../core/services/tasks.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    NgIf, NgFor, DatePipe, TitleCasePipe,
    RouterLink,
    MatCardModule, MatCheckboxModule, MatIconModule, MatProgressSpinnerModule,
    NavbarComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  loading: boolean = true;  
  todo: any[] = [];  
  done: any[] = [];  

  constructor(private tasks: TasksService) {}

  ngOnInit(): void {  
    this.loadTasks();
  }

  loadTasks(): void {  
    this.loading = true;
    this.tasks.getTasks().subscribe({
      next: (list: any[]) => {  
        if (list && Array.isArray(list)) {
          this.todo = list.filter((t: any) => !t.isDone);  
          this.done = list.filter((t: any) => t.isDone);
        } else {
          console.error('Tasks response not array:', list);
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

  markDone(id: string): void {  
    this.tasks.updateTask(id, { isDone: true }).subscribe({
      next: () => this.loadTasks(),
      error: (err: any) => console.error('Mark done error:', err)
    });
  }

  deleteTask(id: string): void {  
    this.tasks.deleteTask(id).subscribe({
      next: () => this.loadTasks(),
      error: (err: any) => console.error('Delete task error:', err)
    });
  }
}