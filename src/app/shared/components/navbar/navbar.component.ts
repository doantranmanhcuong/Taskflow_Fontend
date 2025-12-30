// src/app/shared/components/navbar/navbar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf], 
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
    this.authSubscription = this.auth.isLoggedIn$.subscribe((isLoggedIn) => {
      this.loggedIn = isLoggedIn;  
    });
    this.userSubscription = this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name;
      }
      else{
        this.userName='';
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