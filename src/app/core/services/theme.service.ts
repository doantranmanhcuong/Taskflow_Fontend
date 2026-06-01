import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'taskflow-theme';
  public isDarkMode = false;

  // ✅ Sử dụng hàm inject() hiện đại của Angular thay vì dùng Decorator @Inject
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.loadTheme();
  }

  toggleTheme() {
    // Chỉ thao tác với DOM và LocalStorage nếu đang ở trên Trình duyệt
    if (isPlatformBrowser(this.platformId)) {
      this.isDarkMode = !this.isDarkMode;
      if (this.isDarkMode) {
        document.body.classList.add('dark-theme');
        localStorage.setItem(this.THEME_KEY, 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem(this.THEME_KEY, 'light');
      }
    }
  }

  private loadTheme() {
    // Chỉ đọc LocalStorage nếu đang ở trên Trình duyệt
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      if (savedTheme === 'dark') {
        this.isDarkMode = true;
        document.body.classList.add('dark-theme');
      }
    }
  }
}