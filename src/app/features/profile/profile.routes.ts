// src/app/features/profile/profile.routes.ts
import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard } from '../../core/guards/auth.guard';

export const PROFILE_ROUTES: Routes = [
  { 
    path: '', 
    component: ProfileComponent,
    canActivate: [AuthGuard] 
  }
];