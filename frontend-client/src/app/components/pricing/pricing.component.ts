import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-24 text-center transition-colors duration-300">
      <div class="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-8 shadow-sm">
        <svg class="w-10 h-10 text-zinc-800 dark:text-zinc-200" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      
      <h1 class="text-[32px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4 uppercase">LANGGANAN & PRICING DIKUNCI</h1>
      <p class="text-[15px] text-zinc-500 dark:text-zinc-400 font-sans max-w-lg mx-auto leading-relaxed mb-10">
        Minimalism AI saat ini berjalan dalam versi **Beta Publik gratis**. Seluruh fitur premium dan sistem pembayaran sementara dikunci. Anda dapat menggunakan model dasar secara penuh tanpa biaya tambahan.
      </p>

      <div class="inline-flex gap-4 select-none">
        <a routerLink="/" class="px-6 py-3 rounded-full text-[13.5px] font-bold border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 no-underline transition-all">
          Kembali ke Beranda
        </a>
        <a routerLink="/chat" class="px-6 py-3 rounded-full text-[13.5px] font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:opacity-90 no-underline transition-all">
          Mulai Chatting (Gratis)
        </a>
      </div>
    </div>
  `
})
export class PricingComponent {
  plans = [
    {
      name: 'Gratis',
      desc: 'Untuk mencoba fitur-fitur',
      price: 'Rp 0',
      period: '',
      features: [
        '15 kredit per hari',
        'Hanya Minimalism Flash',
        'Optimasi prompt dasar',
        'Kecepatan respons standar'
      ],
      cta: 'Mulai sekarang',
      featured: false
    },
    {
      name: 'Pro',
      desc: 'Untuk pengguna AI harian',
      price: 'Rp 49Rb',
      period: 'bulan',
      features: [
        '5.000 kredit per bulan',
        'Akses semua model teks Minimalism',
        'Mesin prompt tingkat lanjut',
        'Kecepatan respons prioritas',
        'Riwayat obrolan disimpan'
      ],
      cta: 'Tingkatkan ke Pro',
      featured: true
    },
    {
      name: 'Ultra',
      desc: 'Untuk pengguna aktif & kreator',
      price: 'Rp 149Rb',
      period: 'bulan',
      features: [
        '20.000 kredit per bulan',
        'Akses semua model teks & riset',
        'Akses model generasi gambar',
        'Kecepatan respons tercepat',
        'Akses API (segera hadir)'
      ],
      cta: 'Pilih Ultra',
      featured: false
    }
  ];
}
