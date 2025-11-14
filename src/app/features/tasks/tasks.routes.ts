import { Routes } from '@angular/router';
import { TaskListComponent } from './pages/task-list/task-list.component';
import { TaskEditComponent } from './pages/task-edit/task-edit.component';

export const TASKS_ROUTES: Routes = [
  { path: '', component: TaskListComponent },
  { path: 'create', component: TaskEditComponent },
  { path: ':id/edit', component: TaskEditComponent }
];
