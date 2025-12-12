// src/app/features/profile/pages/profile/profile.component.ts
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
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    }, { 
      validators: this.passwordMatchValidator,
      updateOn: 'submit' // ← Validate khi submit
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
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
    } else {
      // Reset password fields khi vào chế độ edit
      this.profileForm.patchValue({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }

  resetForm(): void {
    this.profileForm.patchValue({
      name: this.user?.name || '',
      email: this.user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    this.message = '';
    this.errorMessage = '';
  }

  save(): void {
    // Đánh dấu là đã submit
    this.submitted = true;
    
    // Đánh dấu tất cả fields là touched
    this.markFormGroupTouched(this.profileForm);
    
    // === THÊM PHẦN NÀY: Manual validation cho password ===
    const currentPassword = this.profileForm.get('currentPassword')?.value;
    const newPassword = this.profileForm.get('newPassword')?.value;
    const confirmPassword = this.profileForm.get('confirmPassword')?.value;
    
    // Clear errors trước
    this.profileForm.get('newPassword')?.setErrors(null);
    
    // Nếu có nhập newPassword (dù có currentPassword hay không)
    if (newPassword && newPassword.trim() !== '') {
      // Check độ dài tối thiểu
      if (newPassword.length < 6) {
        this.profileForm.get('newPassword')?.setErrors({ 
          minlength: { 
            requiredLength: 6, 
            actualLength: newPassword.length 
          } 
        });
        this.profileForm.get('newPassword')?.markAsTouched();
      }
      // Check format chữ + số (theo backend DTO)
      else if (!/^(?=.*[A-Za-z])(?=.*\d).*$/.test(newPassword)) { // ← THÊM ^ và .*$ ĐỂ MATCH FULL STRING
        this.profileForm.get('newPassword')?.setErrors({ 
          pattern: true 
        });
        this.profileForm.get('newPassword')?.markAsTouched();
      }
    }
    
    // Check nếu có newPassword nhưng không có currentPassword
    if (newPassword && newPassword.trim() !== '' && 
        (!currentPassword || currentPassword.trim() === '')) {
      this.profileForm.get('currentPassword')?.setErrors({ 
        required: true 
      });
      this.profileForm.get('currentPassword')?.markAsTouched();
    }
    
    // Check confirmPassword
    if (newPassword && newPassword.trim() !== '' && 
        confirmPassword && confirmPassword.trim() !== '' && 
        newPassword !== confirmPassword) {
      this.profileForm.setErrors({ passwordMismatch: true });
      this.profileForm.get('confirmPassword')?.markAsTouched();
    }
    
    // Nếu có currentPassword nhưng không có newPassword (chỉ verify)
    if (currentPassword && currentPassword.trim() !== '' && 
        (!newPassword || newPassword.trim() === '')) {
      // Hợp lệ, không error
    }
    
    // Nếu form invalid, hiển thị lỗi và dừng lại
    if (this.profileForm.invalid) {
      console.log('Form invalid, hiển thị validation errors');
      this.errorMessage = 'Vui lòng kiểm tra lại thông tin.';
      return;
    }

    // Form hợp lệ, tiếp tục xử lý...
    const formData = this.profileForm.value;
    const updateData: UpdateUserDto = {};
    
    // Luôn gửi name và email nếu có thay đổi
    if (formData.name !== this.user?.name) {
      updateData.name = formData.name;
    }
    
    if (formData.email !== this.user?.email) {
      updateData.email = formData.email;
    }

    // Xử lý password theo logic của DTO backend
    if (formData.currentPassword && formData.currentPassword.trim() !== '') {
      updateData.currentPassword = formData.currentPassword;
      
      if (formData.newPassword && formData.newPassword.trim() !== '') {
        updateData.newPassword = formData.newPassword;
      }
    }

    // Nếu không có thay đổi gì
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
        
        // Reset password fields sau khi thành công
        this.profileForm.patchValue({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Tự động ẩn message sau 3 giây
        setTimeout(() => {
          this.message = '';
        }, 3000);
      },
      error: (error) => {
  console.error('Lỗi khi cập nhật:', error);
  this.saving = false;

  // BẮT LỖI 400 TỪ BACKEND – HIỆN ĐỎ ĐẸP NGAY!
  if (error.status === 400) {
    this.errorMessage = error.error?.message || 'Mật khẩu hiện tại không đúng';
    return;
  }

  // Các lỗi khác
  if (error.error?.message) {
    this.errorMessage = Array.isArray(error.error.message) 
      ? error.error.message.join(', ') 
      : error.error.message;
  } else if (error.status === 401) {
    this.errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
    setTimeout(() => this.authService.logout().subscribe(), 2000);
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

  // Phương thức helper để kiểm tra field có nên hiển thị lỗi không
  shouldShowError(fieldName: string): boolean {
    const control = this.profileForm.get(fieldName);
    return !!(control && (control.touched || this.submitted) && control.invalid);
  }

  // THÊM: Phương thức để lấy error message cụ thể cho newPassword
  getNewPasswordError(): string {
    const control = this.profileForm.get('newPassword');
    if (!control?.errors) return '';
    
    if (control.errors['minlength']) {
      return `Mật khẩu mới phải có ít nhất ${control.errors['minlength'].requiredLength} ký tự`;
    }
    if (control.errors['pattern']) {
      return 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số';
    }
    return '';
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