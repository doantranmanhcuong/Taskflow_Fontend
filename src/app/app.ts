import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  // ✅ Tiêm ThemeService vào constructor để kích hoạt loadTheme() ngay lập tức
  constructor(private themeService: ThemeService) {}
}