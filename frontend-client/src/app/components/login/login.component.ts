import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-6 transition-colors duration-300">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8 select-none">
          <div class="w-10 h-10 bg-primary dark:bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white dark:text-black text-sm font-bold">M</span>
          </div>
          <h1 class="text-[24px] font-semibold text-primary dark:text-zinc-50 mb-1">Selamat datang kembali</h1>
          <p class="text-[14px] text-secondary dark:text-zinc-400 font-sans">Masuk ke Minimalism AI</p>
        </div>

        <div *ngIf="errorMsg" class="bg-danger/5 border border-danger/20 text-danger text-[13px] px-4 py-3 rounded-2xl mb-4 font-sans">
          {{ errorMsg }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-[13px] font-medium text-primary dark:text-zinc-300 block mb-1.5 font-sans">Email</label>
            <input type="email" [(ngModel)]="email" placeholder="you@example.com"
                   class="w-full border border-border dark:border-zinc-800 rounded-2xl px-4 py-3 text-[14px] text-primary dark:text-[#ececf1] placeholder-secondary dark:placeholder-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:border-accent dark:focus:border-[#38bdf8] transition-all">
          </div>
          <div>
            <label class="text-[13px] font-medium text-primary dark:text-zinc-300 block mb-1.5 font-sans">Kata Sandi</label>
            <input type="password" [(ngModel)]="password" (keydown.enter)="onLogin()" placeholder="••••••"
                   class="w-full border border-border dark:border-zinc-800 rounded-2xl px-4 py-3 text-[14px] text-primary dark:text-[#ececf1] placeholder-secondary dark:placeholder-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:border-accent dark:focus:border-[#38bdf8] transition-all">
          </div>
          <button (click)="onLogin()" [disabled]="isLoading"
                  class="w-full bg-primary dark:bg-zinc-100 text-white dark:text-black py-3 rounded-full text-[14.5px] font-medium border-none cursor-pointer hover:opacity-90 disabled:opacity-50 transition-all font-sans">
            {{ isLoading ? 'Sedang masuk...' : 'Masuk' }}
          </button>
        </div>

        <p class="text-center text-[13px] text-secondary dark:text-zinc-400 mt-6 font-sans select-none">
          Belum punya akun? 
          <a routerLink="/register" class="text-accent dark:text-[#38bdf8] font-medium no-underline hover:opacity-85">Daftar</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  errorMsg = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    this.errorMsg = '';
    if (!this.email || !this.password) {
      this.errorMsg = 'Silakan isi semua kolom.';
      return;
    }
    this.isLoading = true;
    const result = await this.authService.login(this.email, this.password);
    this.isLoading = false;
    if (result.success) {
      this.router.navigate(['/chat']);
    } else {
      this.errorMsg = result.error || 'Gagal masuk.';
    }
  }
}
