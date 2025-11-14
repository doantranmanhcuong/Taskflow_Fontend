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
  task = { title: '', description: '', date: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tasks: TasksService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.tasks.getTask(this.id).subscribe(res => this.task = res);
    }
  }

  save() {
    if (this.id) {
      this.tasks.updateTask(this.id, this.task).subscribe(() => this.router.navigate(['/tasks']));
    } else {
      this.tasks.createTask(this.task).subscribe(() => this.router.navigate(['/tasks']));
    }
  }
}
