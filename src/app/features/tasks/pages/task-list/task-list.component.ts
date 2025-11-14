import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { TasksService } from '../../../../core/services/tasks.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, RouterLink, NavbarComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  loading = true;
  todo: any[] = [];
  done: any[] = [];

  constructor(private tasks: TasksService) {}

  ngOnInit() {
    this.tasks.getTasks().subscribe(list => {
      this.todo = list.filter(t => !t.isDone);
      this.done = list.filter(t => t.isDone);
      this.loading = false;
    });
  }

  markDone(id: string) {
    this.tasks.updateTask(id, { isDone: true }).subscribe(() => this.ngOnInit());
  }

  deleteTask(id: string) {
    this.tasks.deleteTask(id).subscribe(() => this.ngOnInit());
  }
}
