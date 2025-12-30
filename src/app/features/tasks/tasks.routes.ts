import { Routes } from '@angular/router';
import { TaskListComponent } from './pages/task-list/task-list.component';
import { TaskEditComponent } from './pages/task-edit/task-edit.component';
import { CalendarViewComponent } from './pages/calendar-view/calendar-view.component';


export const TASKS_ROUTES: Routes = [
  { path: '', component: TaskListComponent },
  { path: 'create', component: TaskEditComponent },
  { path: 'calendar', component: CalendarViewComponent },
  { path: ':id/edit', component: TaskEditComponent }
];
