// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.routes').then(m => m.HOME_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'tasks',
    loadChildren: () =>
      import('./features/tasks/tasks.routes').then(m => m.TASKS_ROUTES),
    canActivate: [AuthGuard] 
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES),
    canActivate: [AuthGuard] 
  },
  // Route mặc định
  { path: '**', redirectTo: '' }
];