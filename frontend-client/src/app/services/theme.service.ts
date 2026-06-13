import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDark = false;

  constructor() {
    // Load persisted preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.enableDarkMode();
    } else if (savedTheme === 'light') {
      this.disableDarkMode();
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        this.enableDarkMode();
      } else {
        this.disableDarkMode();
      }
    }
  }

  public isDarkMode(): boolean {
    return this.isDark;
  }

  public toggleTheme(): void {
    if (this.isDark) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  private enableDarkMode(): void {
    this.isDark = true;
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  }

  private disableDarkMode(): void {
    this.isDark = false;
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  }
}
