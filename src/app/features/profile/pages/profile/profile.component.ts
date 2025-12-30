import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { UserService, User, UpdateUserDto } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule,
    RouterLink, 
    NavbarComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  loading = false;
  saving = false;
  message = '';
  errorMessage = '';
  isEditing = false;
  submitted = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
        this.loading = false;
        
        this.authService.updateUser(user);
      },
      error: (error) => {
        console.error('Lỗi khi tải thông tin:', error);
        if (error.status === 401) {
          this.errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          this.authService.logout().subscribe();
        } else {
          this.errorMessage = 'Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.';
        }
        this.loading = false;
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.submitted = false;
    if (!this.isEditing) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.profileForm.patchValue({
      name: this.user?.name || '',
      email: this.user?.email || ''
    });
    this.message = '';
    this.errorMessage = '';
  }

  save(): void {
    this.submitted = true;
    
    this.markFormGroupTouched(this.profileForm);
    
    if (this.profileForm.invalid) {
      this.errorMessage = 'Vui lòng kiểm tra lại thông tin.';
      return;
    }

    const formData = this.profileForm.value;
    const updateData: UpdateUserDto = {};
    
    if (formData.name !== this.user?.name) {
      updateData.name = formData.name;
    }
    
    if (formData.email !== this.user?.email) {
      updateData.email = formData.email;
    }

    if (Object.keys(updateData).length === 0) {
      this.message = 'Không có thay đổi nào để lưu';
      return;
    }

    this.saving = true;
    this.message = '';
    this.errorMessage = '';

    console.log('Gửi dữ liệu cập nhật:', updateData);

    this.userService.updateProfile(updateData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isEditing = false;
        this.submitted = false;
        this.message = 'Cập nhật thành công!';
        this.saving = false;
        
        this.authService.updateUser(updatedUser);
        
        setTimeout(() => {
          this.message = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Lỗi khi cập nhật:', error);
        this.saving = false;

        if (error.status === 401) {
          this.errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
          setTimeout(() => this.authService.logout().subscribe(), 2000);
        } else if (error.error?.message) {
          this.errorMessage = Array.isArray(error.error.message) 
            ? error.error.message.join(', ') 
            : error.error.message;
        } else {
          this.errorMessage = 'Cập nhật thất bại. Vui lòng thử lại.';
        }
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  shouldShowError(fieldName: string): boolean {
    const control = this.profileForm.get(fieldName);
    return !!(control && (control.touched || this.submitted) && control.invalid);
  }

  getAvatarInitial(): string {
    return this.user?.name?.charAt(0).toUpperCase() || 'U';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Chưa cập nhật';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Lỗi khi format date:', error);
      return 'Lỗi định dạng';
    }
  }
}