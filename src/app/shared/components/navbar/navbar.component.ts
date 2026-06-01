import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

// ✅ BƯỚC 1: Import thư viện Icon và ThemeService
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  // ✅ BƯỚC 2: Khai báo MatIconModule, MatButtonModule vào mảng imports
  imports: [RouterLink, NgIf, MatIconModule, MatButtonModule], 
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
    private router: Router,
    public themeService: ThemeService // ✅ BƯỚC 3: Tiêm ThemeService (phải là public)
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.auth.isLoggedIn$.subscribe((isLoggedIn) => {
      this.loggedIn = isLoggedIn;  
    });
    this.userSubscription = this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name;
      } else {
        this.userName = '';
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

  logout(): void {
    this.auth.logout().subscribe();
  }

  getAvatarInitial(): string {
    return this.userName?.charAt(0).toUpperCase() || 'U';
  }
}