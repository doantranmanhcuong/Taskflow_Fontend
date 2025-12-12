// src/app/shared/components/navbar/navbar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf], // Chỉ có NgIf, không có AsyncPipe
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authSubscription!: Subscription;
  private userSubscription!: Subscription;
  loggedIn = false;
  userName: string = '';

  constructor(
    private auth: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    // Kiểm tra trạng thái ban đầu
    this.checkAuthStatus();
    
    // Subscribe để theo dõi thay đổi trạng thái đăng nhập
    this.authSubscription = this.auth.isLoggedIn$.subscribe((isLoggedIn) => {
      this.loggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.loadUserInfo();
      } else {
        this.userName = '';
      }
    });
    
    // Theo dõi thay đổi thông tin user
    this.userSubscription = this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name || '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  checkAuthStatus(): void {
    this.loggedIn = this.auth.isLoggedIn();
    if (this.loggedIn) {
      this.loadUserInfo();
    }
  }

  loadUserInfo(): void {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.userName = user.name || '';
    }
  }

  logout(): void {
    this.auth.logout().subscribe({
      error: () => {
        // Nếu API fail, vẫn clear local storage
        this.router.navigate(['/auth/login']);
      }
    });
  }

  getAvatarInitial(): string {
    return this.userName?.charAt(0).toUpperCase() || 'U';
  }
}