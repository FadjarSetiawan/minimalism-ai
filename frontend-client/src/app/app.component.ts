import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <div class="min-h-screen bg-white dark:bg-zinc-950 text-primary dark:text-zinc-50 font-sans flex flex-col transition-colors duration-300">
      
      <!-- Clean Header -->
      <header *ngIf="!isChatPage()" class="sticky top-0 z-50 bg-white/85 dark:bg-zinc-950/80 backdrop-blur-md border-b border-border dark:border-zinc-800">
        <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          
          <!-- Logo -->
          <a routerLink="/" class="flex items-center no-underline">
            <img src="assets/images/Logo Brand Minimalism black.png" class="block dark:hidden h-6 w-auto object-contain" alt="Minimalism AI">
            <img src="assets/images/Logo Brand Minimalism white.png" class="hidden dark:block h-6 w-auto object-contain" alt="Minimalism AI">
          </a>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-8">
            <a routerLink="/models" class="text-[13px] text-secondary dark:text-zinc-400 hover:text-primary dark:hover:text-zinc-100 no-underline">Model</a>
            <a routerLink="/pricing" class="text-[13px] text-secondary dark:text-zinc-400 hover:text-primary dark:hover:text-zinc-100 no-underline">Harga</a>
          </nav>

          <!-- Right Actions -->
          <div class="flex items-center gap-3.5">
            <!-- Theme Toggle Button -->
            <button (click)="themeService.toggleTheme()" 
                    title="Ubah Tema"
                    class="w-8 h-8 rounded-full border border-border dark:border-zinc-800 flex items-center justify-center bg-transparent cursor-pointer text-secondary dark:text-zinc-400 hover:text-primary dark:hover:text-zinc-100 transition-all">
              <!-- Sun Icon -->
              <svg *ngIf="themeService.isDarkMode()" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <!-- Moon Icon -->
              <svg *ngIf="!themeService.isDarkMode()" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>

            <ng-container *ngIf="!authService.getCurrentUser()">
              <a routerLink="/login" class="text-[13px] text-secondary dark:text-zinc-400 hover:text-primary dark:hover:text-zinc-100 no-underline">Masuk</a>
              <a routerLink="/register" class="text-[13px] bg-primary dark:bg-zinc-100 text-white dark:text-black px-4 py-1.5 rounded-full no-underline hover:opacity-90">Mulai</a>
            </ng-container>
            
            <ng-container *ngIf="authService.getCurrentUser()">
              <a routerLink="/chat" class="text-[13px] bg-primary dark:bg-zinc-100 text-white dark:text-black px-4 py-1.5 rounded-full no-underline hover:opacity-90">Buka Chat</a>
              <button (click)="logout()" class="text-[13px] text-secondary dark:text-zinc-400 hover:text-primary dark:hover:text-zinc-100 border-none bg-transparent cursor-pointer">Keluar</button>
            </ng-container>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-grow flex flex-col">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer *ngIf="!isChatPage()" class="border-t border-border dark:border-zinc-800 mt-20">
        <div class="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <p class="text-[12px] text-secondary dark:text-zinc-400">&copy; 2026 Minimalism AI. Hak cipta dilindungi undang-undang.</p>
          <p class="text-[12px] text-secondary dark:text-zinc-400">Data Anda tidak pernah digunakan untuk pelatihan.</p>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {
  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  isChatPage(): boolean {
    return this.router.url.startsWith('/chat');
  }

  logout() {
    this.authService.logout();
    window.location.href = '/';
  }
}
