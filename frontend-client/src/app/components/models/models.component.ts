import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  creditCost: number;
  description: string;
  badge?: string;
  strengths: string[];
}

@Component({
  selector: 'app-models',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-16 transition-colors duration-300">
      <div class="text-center mb-12 select-none">
        <h1 class="text-[36px] font-semibold tracking-tight text-primary dark:text-zinc-50 mb-3">Katalog Model</h1>
        <p class="text-[16px] text-secondary dark:text-zinc-400 font-sans">Semua model AI yang Anda butuhkan, di satu tempat. Pilih yang terbaik untuk tugas Anda.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div *ngFor="let model of models" 
             class="bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800/80 rounded-3xl p-6 hover:border-secondary dark:hover:border-zinc-700 transition-colors shadow-sm hover:shadow-md">
          
          <div class="flex items-start justify-between mb-3 select-none">
            <div>
              <h3 class="text-[16px] font-semibold text-primary dark:text-zinc-100 font-sans">{{ model.name }}</h3>
              <p class="text-[12px] text-secondary dark:text-zinc-400 font-sans">{{ model.provider }}</p>
            </div>
            <span *ngIf="model.badge" class="text-[11px] bg-surface dark:bg-zinc-800 text-secondary dark:text-zinc-300 px-2.5 py-1 rounded-full border border-border dark:border-zinc-700 font-medium font-sans">
              {{ model.badge }}
            </span>
          </div>

          <p class="text-[13px] text-secondary dark:text-zinc-400 leading-relaxed mb-4 font-sans">{{ model.description }}</p>
          
          <div class="flex flex-wrap gap-1.5 mb-4 select-none">
            <span *ngFor="let s of model.strengths" class="text-[11px] bg-surface dark:bg-zinc-800 text-secondary dark:text-zinc-300 px-3 py-1 rounded-full font-sans border border-zinc-200/40 dark:border-zinc-800/30">
              {{ s }}
            </span>
          </div>

          <div class="flex items-center justify-between font-sans">
            <span class="text-[13px] font-medium text-primary dark:text-zinc-300">{{ model.creditCost }} kredit/pesan</span>
            <a routerLink="/chat" class="text-[13px] text-accent dark:text-[#38bdf8] font-medium no-underline hover:opacity-80 transition-all">Gunakan model →</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ModelsComponent {
  models: ModelInfo[] = [
    {
      id: 'minimalism-flash', name: 'Minimalism Flash', provider: 'Minimalism AI',
      creditCost: 1, badge: 'Tercepat',
      description: 'Respons sangat cepat untuk tugas sehari-hari. Terbaik untuk pertanyaan cepat, ringkasan, dan curah pendapat.',
      strengths: ['Kecepatan', 'Efisiensi', 'Responsif']
    },
    {
      id: 'minimalism-fast', name: 'Minimalism Fast', provider: 'Minimalism AI',
      creditCost: 2, badge: 'Seimbang',
      description: 'Kinerja seimbang dengan kecepatan tinggi. Sangat baik untuk analisis cepat dan draf terstruktur.',
      strengths: ['Keseimbangan', 'Akurasi', 'Logika']
    },
    {
      id: 'minimalism-think', name: 'Minimalism Think', provider: 'Minimalism AI',
      creditCost: 3, badge: 'Tercerdas',
      description: 'Analisis mendalam multi-pass untuk pemecahan masalah kompleks dan penalaran tingkat tinggi.',
      strengths: ['Penalaran', 'Logika kompleks', 'Analisis']
    },
    {
      id: 'minimalism-lite', name: 'Minimalism Lite', provider: 'Minimalism AI',
      creditCost: 1, badge: 'Ringan',
      description: 'Paling hemat dan ringan untuk kebutuhan obrolan kasual dan tugas sederhana.',
      strengths: ['Hemat', 'Ringan', 'Kasual']
    },
    {
      id: 'minimalism-deep', name: 'Minimalism Deep', provider: 'Minimalism AI',
      creditCost: 3, badge: 'Mendalam',
      description: 'Riset mendalam, analisis komparatif, dan investigasi mendalam untuk topik rumit.',
      strengths: ['Investigasi', 'Konteks Luas', 'Riset']
    }
  ];
}
