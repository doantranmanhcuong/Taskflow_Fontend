import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, NgIf, UpperCasePipe, RouterLink, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading = false;
  saving = false;
  message = '';

  constructor(private users: UserService) {}

  ngOnInit(): void {
    this.loading = true;
    this.users.getMe().subscribe({
      next: (u) => { this.user = u; this.loading = false; },
      error: () => this.loading = false
    });
  }

  save() {
    this.saving = true;
    this.users.updateMe(this.user).subscribe({
      next: () => { this.saving = false; this.message = 'Cập nhật thành công!'; },
      error: () => { this.saving = false; this.message = 'Lỗi!'; }
    });
  }
}
