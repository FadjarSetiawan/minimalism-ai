import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  size: number;
  density: number;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <!-- 1. HERO AREA WITH ANTIGRAVITY PARTICLES -->
    <div class="relative w-full overflow-hidden bg-white dark:bg-zinc-950 border-b border-border dark:border-zinc-800/80 py-24 md:py-32 transition-colors duration-300"
         (mousemove)="onMouseMove($event)"
         (mouseleave)="onMouseLeave()">
      
      <!-- Interactive 2D Particle Canvas -->
      <canvas #heroCanvas class="absolute inset-0 pointer-events-none z-0"></canvas>
      
      <!-- Hero Content Wrapper -->
      <div class="max-w-3xl mx-auto px-6 text-center relative z-10 select-none">
        
        <h1 class="text-[48px] md:text-[64px] font-semibold leading-[1.05] tracking-tight text-primary dark:text-zinc-50 mb-6 selection:bg-accent/15">
          Simple. Fast.<br>Eficience.
        </h1>
        
        <p class="text-[18px] text-secondary dark:text-zinc-400 leading-relaxed max-w-xl mx-auto mb-10 selection:bg-accent/15 font-sans">
          Asisten AI versi minimalis untuk produktivitas optimal Anda. 
          Tanpa kerumitan, tanpa gangguan, dengan privasi yang sepenuhnya terjaga.
        </p>
        
        <div class="flex items-center justify-center gap-4">
          <a routerLink="/register" class="bg-primary dark:bg-zinc-100 text-white dark:text-black px-6 py-3 rounded-full text-[15px] font-medium no-underline hover:opacity-90 transition-all shadow-sm hover:shadow">
            Mulai gratis
          </a>
          <a routerLink="/pricing" class="text-primary dark:text-zinc-200 text-[15px] font-medium no-underline hover:opacity-75 transition-all">
            Lihat harga →
          </a>
        </div>
      </div>
    </div>

    <!-- 2. MODEL LOGOS STRIP -->
    <section class="max-w-4xl mx-auto px-6 py-12 border-b border-border dark:border-zinc-800/80 transition-colors duration-300">
      <p class="text-center text-[11px] text-secondary dark:text-zinc-500 uppercase tracking-widest mb-8 font-medium">Pilihan Model Minimalism</p>
      <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12 select-none">
        <div *ngFor="let model of modelNames" class="text-[13px] text-secondary dark:text-zinc-400 font-medium hover:text-primary dark:hover:text-zinc-100 transition-colors cursor-default">
          {{ model }}
        </div>
      </div>
    </section>

    <!-- 3. INTERACTIVE SECTION: THE ROUTING NODE GRAPH -->
    <section class="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center transition-colors duration-300">
      <div>
        <span class="text-[11px] bg-surface dark:bg-zinc-900 text-secondary dark:text-zinc-400 px-3 py-1 rounded-full border border-border dark:border-zinc-900 font-medium uppercase tracking-wider block w-fit mb-4">
          Kecerdasan Terfokus
        </span>
        <h2 class="text-[36px] font-semibold tracking-tight text-primary dark:text-zinc-50 leading-tight mb-6 font-sans">
          Asisten AI minimalis<br>untuk produktivitas murni.
        </h2>
        <p class="text-[15px] text-secondary dark:text-zinc-400 leading-relaxed mb-8">
          Minimalism AI hadir sebagai asisten AI tunggal yang dirancang dengan antarmuka bersih. Kami menghapus semua distraksi visual dan memfokuskan model kami pada efisiensi tugas harian Anda.
        </p>

        <div class="space-y-4">
          <!-- Flash Card -->
          <div class="flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer bg-surface dark:bg-zinc-900/40 border-border dark:border-zinc-800 hover:border-secondary dark:hover:border-zinc-700"
               (mouseenter)="activeNode = 'flash'" (mouseleave)="activeNode = null">
            <div class="text-[20px] mt-0.5 text-accent dark:text-[#38bdf8]">✦</div>
            <div>
              <h4 class="text-[14px] font-semibold text-primary dark:text-zinc-200 mb-1">Minimalism Flash (Kecepatan & Responsif)</h4>
              <p class="text-[13px] text-secondary dark:text-zinc-400">Respons sangat cepat untuk draf cepat, perbaikan teks, dan tugas harian ringan.</p>
            </div>
          </div>
          
          <!-- Think Card -->
          <div class="flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer bg-surface dark:bg-zinc-900/40 border-border dark:border-zinc-800 hover:border-secondary dark:hover:border-zinc-700"
               (mouseenter)="activeNode = 'think'" (mouseleave)="activeNode = null">
            <div class="text-[20px] mt-0.5 text-accent dark:text-[#38bdf8]">✦</div>
            <div>
              <h4 class="text-[14px] font-semibold text-primary dark:text-zinc-200 mb-1">Minimalism Think (Penalaran Mendalam)</h4>
              <p class="text-[13px] text-secondary dark:text-zinc-400">Diaktifkan ketika tugas Anda memerlukan analisis mendalam dan pemecahan masalah logis yang kompleks.</p>
            </div>
          </div>

          <!-- Deep Card -->
          <div class="flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer bg-surface dark:bg-zinc-900/40 border-border dark:border-zinc-800 hover:border-secondary dark:hover:border-zinc-700"
               (mouseenter)="activeNode = 'deep'" (mouseleave)="activeNode = null">
            <div class="text-[20px] mt-0.5 text-accent dark:text-[#38bdf8]">✦</div>
            <div>
              <h4 class="text-[14px] font-semibold text-primary dark:text-zinc-200 mb-1">Minimalism Deep (Riset Lanjutan)</h4>
              <p class="text-[13px] text-secondary dark:text-zinc-400">Khusus untuk riset komparatif mendalam, investigasi kode terperinci, dan analisis luas.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- PRODUCT IMAGE MOCKUP DISPLAY -->
      <div class="flex items-center justify-center relative transition-all duration-300 select-none">
        <img src="assets/images/Kecerdasan Terfokus - White.png" class="w-full max-w-[520px] h-auto object-contain dark:hidden transition-all duration-300" alt="Kecerdasan Terfokus">
        <img src="assets/images/Kecerdasan Terfokus -  Black.png" class="w-full max-w-[520px] h-auto object-contain hidden dark:block transition-all duration-300" alt="Kecerdasan Terfokus">
      </div>
    </section>

    <!-- 4. INTERACTIVE SECTION: WORKSPACE USE CASES (TAB SYSTEM) -->
    <section class="bg-surface dark:bg-zinc-900/30 py-24 border-y border-border dark:border-zinc-800/80 transition-colors duration-300">
      <div class="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        <!-- Left Side Tab Selectors (5 cols) -->
        <div class="lg:col-span-5 space-y-6">
          <span class="text-[11px] bg-white dark:bg-zinc-900 text-secondary dark:text-zinc-400 px-3 py-1 rounded-full border border-border dark:border-zinc-900 font-medium uppercase tracking-wider block w-fit mb-4">
            Ruang Kerja Interaktif
          </span>
          <h2 class="text-[36px] font-semibold tracking-tight text-primary dark:text-zinc-50 leading-tight">
            Didesain untuk cara kerja Anda yang sebenarnya.
          </h2>
          
          <div class="flex flex-col gap-2 pt-4 select-none">
            <button *ngFor="let tab of tabs" 
                    (click)="activeTab = tab.id"
                    class="w-full text-left p-4 rounded-2xl transition-all border outline-none cursor-pointer"
                    [class.bg-white]="activeTab === tab.id"
                    [class.dark:bg-[#1e1e24]]="activeTab === tab.id"
                    [class.border-border]="activeTab === tab.id"
                    [class.dark:border-zinc-800]="activeTab === tab.id"
                    [class.border-transparent]="activeTab !== tab.id"
                    [class.dark:border-transparent]="activeTab !== tab.id">
              <span class="text-[11px] uppercase tracking-wider font-semibold"
                    [class.text-accent]="activeTab === tab.id"
                    [class.dark:text-[#38bdf8]]="activeTab === tab.id"
                    [class.text-secondary]="activeTab !== tab.id"
                    [class.dark:text-zinc-500]="activeTab !== tab.id">
                {{ tab.tag }}
              </span>
              <h4 class="text-[15px] font-semibold text-primary dark:text-zinc-200 mt-1 mb-0.5">{{ tab.title }}</h4>
              <p class="text-[13px] text-secondary dark:text-zinc-400">{{ tab.desc }}</p>
            </button>
          </div>
        </div>

        <!-- Right Side Mock Workspace (7 cols) -->
        <div class="lg:col-span-7 bg-white dark:bg-zinc-950 rounded-3xl border border-border dark:border-zinc-800 p-6 shadow-sm min-h-[380px] flex flex-col justify-between transition-colors duration-300">
          <div class="flex items-center justify-between border-b border-border dark:border-zinc-900 pb-4 mb-4 select-none">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800"></span>
            </div>
            <span class="text-[11px] text-secondary dark:text-zinc-500 font-mono">minimalism-ai/workspace</span>
          </div>

          <!-- Dynamic Mock Content based on selected tab -->
          <div class="flex-1 flex flex-col justify-center py-4">
            <ng-container *ngIf="activeTab === 'creative'">
              <div class="space-y-4">
                <div class="flex gap-3">
                  <div class="w-6 h-6 bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-xl flex items-center justify-center text-[10px] font-mono font-bold dark:text-zinc-400">U</div>
                  <div class="bg-surface dark:bg-zinc-900/50 rounded-2xl p-3 text-[13px] text-primary dark:text-zinc-300 border border-transparent dark:border-zinc-900">Tolong buatkan teks landing page untuk jam tangan mewah minimalis.</div>
                </div>
                <div class="flex gap-3">
                  <div class="w-6 h-6 bg-primary dark:bg-zinc-100 text-white dark:text-black rounded-xl flex items-center justify-center text-[10px] font-mono font-bold">M</div>
                  <div class="bg-surface/50 dark:bg-zinc-900/30 border border-border dark:border-zinc-800 rounded-2xl p-3 text-[13px] text-primary dark:text-zinc-300 leading-relaxed">
                    <strong>Hening. Presisi. Abadi.</strong><br>
                    Lebih dari sekadar penunjuk waktu. Ini adalah pernyataan dari apa yang tidak perlu diucapkan. Dibuat dengan baja tahan karat kelas medis dan dial safir tanpa pantulan.
                  </div>
                </div>
              </div>
            </ng-container>

            <ng-container *ngIf="activeTab === 'coding'">
              <div class="font-mono text-[12px] bg-surface dark:bg-zinc-900/50 p-4 rounded-2xl border border-border dark:border-zinc-800/80 overflow-x-auto text-primary dark:text-zinc-300">
                <p class="text-[#0071E3] dark:text-[#38bdf8]">// Mengoptimalkan pencarian dengan Binary Search</p>
                <p><span class="text-secondary">function</span> <span class="text-primary dark:text-zinc-100">binarySearch</span>(arr: <span class="text-secondary">number[]</span>, target: <span class="text-secondary">number</span>): <span class="text-secondary">number</span> &#123;</p>
                <p class="pl-4">let left = 0, right = arr.length - 1;</p>
                <p class="pl-4">while (left &lt;= right) &#123;</p>
                <p class="pl-8">const mid = Math.floor((left + right) / 2);</p>
                <p class="pl-8">if (arr[mid] === target) return mid;</p>
                <p class="pl-8">if (arr[mid] &lt; target) left = mid + 1;</p>
                <p class="pl-8">else right = mid - 1;</p>
                <p class="pl-4">&#125;</p>
                <p class="pl-4">return -1;</p>
                <p>&#125;</p>
              </div>
            </ng-container>

            <ng-container *ngIf="activeTab === 'analysis'">
              <div class="space-y-4">
                <div class="bg-surface dark:bg-zinc-900/50 border border-border dark:border-zinc-800 rounded-3xl p-4">
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-[10px] uppercase tracking-wider font-semibold text-secondary dark:text-zinc-500 font-mono">Optimasi Margin Token</span>
                    <span class="text-[10.5px] bg-success/10 text-success dark:text-green-400 px-2 py-0.5 rounded-md border border-success/20 dark:border-green-500/20 font-medium">Terverifikasi</span>
                  </div>
                  <div class="grid grid-cols-3 gap-4 text-center">
                    <div class="bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-border dark:border-zinc-800/80">
                      <div class="text-[10px] text-secondary dark:text-zinc-500">Biaya Grosir</div>
                      <div class="text-[15px] font-semibold text-primary dark:text-zinc-100">Rp 45/K</div>
                    </div>
                    <div class="bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-border dark:border-zinc-800/80">
                      <div class="text-[10px] text-secondary dark:text-zinc-500">Harga Eceran</div>
                      <div class="text-[15px] font-semibold text-primary dark:text-zinc-100">Rp 120/K</div>
                    </div>
                    <div class="bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-border dark:border-zinc-800/80">
                      <div class="text-[10px] text-secondary dark:text-zinc-500">Margin Keuntungan</div>
                      <div class="text-[15px] font-semibold text-accent dark:text-[#38bdf8]">+166%</div>
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>
          </div>

          <div class="border-t border-border dark:border-zinc-900 pt-4 flex justify-between items-center select-none">
            <span class="text-[11px] text-secondary dark:text-zinc-500">Model Aktif: {{ activeTab === 'creative' ? 'Minimalism Flash' : activeTab === 'coding' ? 'Minimalism Deep' : 'Minimalism Think' }}</span>
            <a routerLink="/register" class="text-[12px] bg-primary dark:bg-zinc-100 text-white dark:text-black px-4 py-1.5 rounded-full no-underline hover:opacity-90 transition-all font-medium">Coba Ruang Kerja</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. INTERACTIVE SECTION: PRIVACY SHIELD SANDBOX -->
    <section class="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center transition-colors duration-300">
      
      <!-- Interactive Sandbox SVG Viewport (7 cols) -->
      <div class="lg:col-span-7 bg-surface dark:bg-zinc-900/40 rounded-3xl border border-border dark:border-zinc-800 p-8 flex flex-col justify-between h-[380px] relative overflow-hidden transition-colors duration-300">
        <div class="flex items-center justify-between z-10 select-none">
          <span class="text-[10.5px] font-mono text-secondary dark:text-zinc-500">SIMULATOR_PEMBATAS_KEAMANAN</span>
          <button (click)="togglePrivacy()" 
                  class="bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-full px-4 py-1.5 text-[11px] font-medium hover:border-secondary dark:hover:border-zinc-500 cursor-pointer outline-none transition-all dark:text-zinc-300">
            Ubah Mode: <span class="font-bold text-accent dark:text-[#38bdf8]">{{ privacyMode === 'secure' ? 'Tanpa Pelatihan (Aktif)' : 'Cloud Standar (Bocor)' }}</span>
          </button>
        </div>

        <!-- SVG Sandbox Metaphor -->
        <svg class="w-full h-48 z-10" viewBox="0 0 500 200">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" [attr.fill]="documentClassList().contains('dark') ? '#38bdf8' : '#0071E3'"/>
            </marker>
          </defs>

          <!-- Cloud database destination -->
          <rect x="380" y="60" width="80" height="80" rx="18" ry="18" fill="#FFFFFF" [attr.fill]="documentClassList().contains('dark') ? '#27272a' : '#FFFFFF'" stroke="#E5E5E7" [attr.stroke]="documentClassList().contains('dark') ? '#3f3f46' : '#E5E5E7'" stroke-width="2"/>
          <text x="420" y="105" fill="#1D1D1F" [attr.fill]="documentClassList().contains('dark') ? '#ececf1' : '#1D1D1F'" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">Database Pelatihan</text>

          <!-- Input Origin -->
          <circle cx="60" cy="100" r="24" fill="#1D1D1F" [attr.fill]="documentClassList().contains('dark') ? '#ffffff' : '#1D1D1F'"/>
          <text x="60" y="103" fill="white" [attr.fill]="documentClassList().contains('dark') ? '#000000' : '#ffffff'" font-size="8.5" font-weight="bold" text-anchor="middle" font-family="monospace">Prompt</text>

          <!-- Pathway connection lines -->
          <path d="M 84,100 L 230,100" stroke="#E5E5E7" [attr.stroke]="documentClassList().contains('dark') ? '#33333b' : '#E5E5E7'" stroke-dasharray="4" stroke-width="2" class="transition-all duration-300"/>
          
          <!-- Dynamic Shield Guardrail -->
          <g *ngIf="privacyMode === 'secure'" class="transition-all duration-500">
            <line x1="250" y1="40" x2="250" y2="160" stroke="#0071E3" [attr.stroke]="documentClassList().contains('dark') ? '#38bdf8' : '#0071E3'" stroke-width="4" stroke-linecap="round"/>
            <text x="250" y="30" fill="#0071E3" [attr.fill]="documentClassList().contains('dark') ? '#38bdf8' : '#0071E3'" font-size="9" font-weight="bold" text-anchor="middle" font-family="sans-serif">Pelindung Tanpa Data</text>
            <!-- Bouncing return arrow -->
            <path d="M 230,100 L 150,60" stroke="#0071E3" [attr.stroke]="documentClassList().contains('dark') ? '#38bdf8' : '#0071E3'" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
            <text x="190" y="50" fill="#0071E3" [attr.fill]="documentClassList().contains('dark') ? '#38bdf8' : '#0071E3'" font-size="8" font-family="sans-serif">Tetap Pribadi</text>
          </g>

          <g *ngIf="privacyMode === 'leaked'" class="transition-all duration-500">
            <line x1="230" y1="100" x2="380" y2="100" stroke="#FF3B30" stroke-width="2" stroke-dasharray="4"/>
            <text x="300" y="90" fill="#FF3B30" font-size="8.5" font-family="sans-serif">Bocor untuk Pelatihan</text>
          </g>
        </svg>

        <div class="bg-white dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-2xl p-3.5 z-10 transition-colors duration-300 font-sans">
          <p class="text-[12.5px] text-secondary dark:text-zinc-400 leading-relaxed">
            {{ privacyMode === 'secure' ? '🔒 Prompt Anda diproses dengan aman. Model dilarang menyimpan atau melatih data dari konten Anda.' : '⚠️ Rute AI standar mungkin menggunakan data pribadi Anda untuk melatih model sumber terbuka mendatang.' }}
          </p>
        </div>
      </div>

      <!-- Right Description Side (5 cols) -->
      <div class="lg:col-span-5">
        <span class="text-[11px] bg-surface dark:bg-zinc-900 text-secondary dark:text-zinc-400 px-3 py-1 rounded-full border border-border dark:border-zinc-900 font-medium uppercase tracking-wider block w-fit mb-4">
          Privasi Mutlak
        </span>
        <h2 class="text-[36px] font-semibold tracking-tight text-primary dark:text-zinc-50 leading-tight mb-6 font-sans">
          Data Anda tidak pernah<br>digunakan untuk pelatihan.
        </h2>
        <p class="text-[15px] text-secondary dark:text-zinc-400 leading-relaxed mb-8">
          Keamanan tingkat perusahaan secara standar. Kami membuat terowongan API pribadi yang aman dengan penyedia cloud LLM kami, memastikan setiap karakter yang diketik dikecualikan secara permanen dari semua proses pembelajaran buatan di masa mendatang.
        </p>
        <a routerLink="/register" class="inline-block bg-primary dark:bg-zinc-100 text-white dark:text-black px-6 py-3 rounded-full text-[14.5px] font-medium no-underline hover:opacity-90">
          Amankan ruang kerja Anda
        </a>
      </div>
    </section>

    <!-- 6. VALUE PROPS -->
    <section class="max-w-6xl mx-auto px-6 py-20 border-t border-border dark:border-zinc-800/80 transition-colors duration-300">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div *ngFor="let prop of valueProps" class="text-center bg-surface dark:bg-zinc-900/40 border border-border dark:border-zinc-900 p-8 rounded-3xl hover:border-secondary dark:hover:border-zinc-800 transition-all">
          <div class="text-[32px] mb-3 text-primary dark:text-zinc-200">{{ prop.icon }}</div>
          <h3 class="text-[16px] font-semibold text-primary dark:text-zinc-200 mb-2">{{ prop.title }}</h3>
          <p class="text-[14px] text-secondary dark:text-zinc-400 leading-relaxed">{{ prop.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 7. CTA BANNER -->
    <section class="max-w-4xl mx-auto px-6 py-24 text-center select-none">
      <h2 class="text-[36px] md:text-[42px] font-semibold tracking-tight text-primary dark:text-zinc-50 mb-4 leading-tight">Siap untuk menyederhanakan alur kerja AI Anda?</h2>
      <p class="text-[16px] text-secondary dark:text-zinc-400 mb-8 font-sans">Tingkat gratis disertakan. Tidak diperlukan kartu kredit.</p>
      <a routerLink="/register" class="inline-block bg-primary dark:bg-zinc-100 text-white dark:text-black px-8 py-3.5 rounded-full text-[15px] font-medium no-underline hover:opacity-90 transition-all font-sans shadow-sm hover:shadow">
        Buat akun gratis
      </a>
    </section>
  `
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  modelNames = ['Minimalism Flash', 'Minimalism Fast', 'Minimalism Think', 'Minimalism Lite', 'Minimalism Deep'];
  
  valueProps = [
    { icon: '◎', title: 'Antarmuka Minimalis', desc: 'Fokus pada apa yang penting untuk produktivitas Anda. Tanpa menu rumit, tanpa fitur tambahan yang tidak berguna.' },
    { icon: '◉', title: 'Lebih hemat hingga 60%', desc: 'Kami membeli token API secara grosir dan memberikan penghematan kepada Anda. Setiap model, dengan sebagian kecil dari harga ritel.' },
    { icon: '◈', title: 'Tanpa pelatihan data', desc: 'Percakapan Anda tidak pernah digunakan untuk melatih model AI apa pun. Privasi penuh, tanpa pengecualian.' }
  ];

  tabs = [
    { id: 'creative', tag: 'Suite Kreatif', title: 'Pemasaran & Penulisan', desc: 'Buat salinan copywriting yang bersih atau balasan email yang elegan menggunakan templat khusus Minimalism Flash.' },
    { id: 'coding', tag: 'Konsol Pengembang', title: 'Arsitektur & Pemrograman', desc: 'Hasilkan pelindung bug, periksa kompleksitas kode, dan buat draf tes melalui model Minimalism Deep.' },
    { id: 'analysis', tag: 'Studio Analisis', title: 'Data & Model Keuangan', desc: 'Urai margin dan data spreadsheet keuangan menggunakan model Minimalism Think yang mendalam.' }
  ];

  // Interactive UI states
  activeNode: string | null = null;
  activeTab = 'creative';
  privacyMode = 'secure';

  // Particle System settings
  private particles: Particle[] = [];
  private animationFrameId!: number;
  private ctx!: CanvasRenderingContext2D;
  private mouse = { x: null as number | null, y: null as number | null, radius: 160 };
  private time = 0;

  documentClassList(): DOMTokenList {
    return document.documentElement.classList;
  }

  ngAfterViewInit() {
    this.initCanvas();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.setupCanvasSize();
    this.generateParticles();
  }

  togglePrivacy() {
    this.privacyMode = this.privacyMode === 'secure' ? 'leaked' : 'secure';
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;
    this.ctx = context;

    this.setupCanvasSize();
    this.generateParticles();
    this.animate();
  }

  private setupCanvasSize() {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
  }

  private generateParticles() {
    const canvas = this.canvasRef.nativeElement;
    this.particles = [];
    const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 8000));

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const density = Math.random() * 1.5 + 0.5;

      this.particles.push({
        x,
        y,
        homeX: x,
        homeY: y,
        vx: 0,
        vy: 0,
        size: Math.random() * 1.5 + 1.2,
        density
      });
    }
  }

  onMouseMove(event: MouseEvent) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }

  onMouseLeave() {
    this.mouse.x = null;
    this.mouse.y = null;
  }

  private animate() {
    this.time += 0.005;
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.documentElement.classList.contains('dark');
    const colorRGB = isDark ? '255, 255, 255' : '29, 29, 31';

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      const driftX = p.homeX + Math.sin(this.time * p.density + i) * 15;
      const driftY = p.homeY + Math.cos(this.time * p.density + i) * 15;

      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.mouse.radius) {
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          const dirX = dx / (distance || 1);
          const dirY = dy / (distance || 1);

          p.vx -= dirX * force * p.density * 1.8;
          p.vy -= dirY * force * p.density * 1.8;
        }
      }

      p.vx *= 0.92;
      p.vy *= 0.92;

      p.x += p.vx + (driftX - p.x) * 0.04;
      p.y += p.vy + (driftY - p.y) * 0.04;

      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80) {
          const alpha = (80 - dist) / 80 * (isDark ? 0.08 : 0.06);
          this.ctx.strokeStyle = `rgba(${colorRGB}, ${alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }

      this.ctx.fillStyle = `rgba(${colorRGB}, ${(isDark ? 0.1 : 0.15) + (p.density * 0.2)})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}
