import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (!this.fullName || !this.email || !this.password) {
      this.error = 'Vui lòng nhập đầy đủ thông tin.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Mật khẩu xác nhận không khớp.';
      return;
    }

    this.loading = true;

    this.auth
      .register({
        fullName: this.fullName,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Đăng ký thất bại';
        },
      });
  }
}
