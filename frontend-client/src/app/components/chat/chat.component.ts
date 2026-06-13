import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { AiService } from '../../services/ai.service';
import { ThemeService } from '../../services/theme.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: Date;
  complexityAnalysis?: string;
  unitTests?: string;
  isTyping?: boolean;
  renderedHtml?: string;
  codeBlocks?: any[];
}

interface OpenFile {
  name: string;
  path: string;
  content: string;
  active: boolean;
}

interface WireflowNode {
  id: string;
  title: string;
  type: 'text' | 'image' | 'video' | 'crop';
  content: string;
  posX: number;
  posY: number;
  outputConnections: string[];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-screen w-screen flex bg-[#f3f4f6] dark:bg-[#09090b] font-sans text-zinc-800 dark:text-zinc-200 overflow-hidden relative transition-colors duration-300">
      
      <!-- LEFT SIDEBAR: CHROME & HISTORY -->
      <aside [class.w-64]="!sidebarCollapsed && !sidebarHidden" 
             [class.w-16]="sidebarCollapsed && !sidebarHidden" 
             [class.w-0]="sidebarHidden"
             class="bg-white dark:bg-[#101012] border-r border-zinc-200/80 dark:border-zinc-800/50 flex flex-col justify-between select-none overflow-hidden transition-all duration-300 z-30">
        
        <div class="flex-1 flex flex-col min-h-0">
          <!-- Sleek branding header -->
          <div *ngIf="!sidebarCollapsed" class="p-5 flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center font-bold text-white dark:text-black text-sm shadow-sm">M</div>
            <span class="text-sm font-extrabold tracking-wider text-zinc-900 dark:text-white uppercase">Minimalism AI</span>
          </div>

          <div *ngIf="sidebarCollapsed" class="p-5 flex justify-center">
            <div class="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center font-bold text-white dark:text-black text-sm shadow-sm">M</div>
          </div>

          <!-- History & Navigation items lists -->
          <div *ngIf="!sidebarCollapsed" class="flex-1 overflow-y-auto px-4 mt-2 select-none min-h-0">
            <div class="space-y-1 text-[12px]">
              <!-- New Chat Action inside list -->
              <button (click)="startNewChat()" class="w-full text-left py-2.5 px-3 mb-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-400 transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-bold border border-zinc-200/50 dark:border-zinc-800/50 hover-lift">
                <span class="text-sm">+</span> Chat Baru
              </button>

              <div *ngFor="let chat of chatHistory; let i = index"
                   (click)="loadChat(i)"
                   class="py-2.5 px-3 rounded-xl cursor-pointer text-zinc-700 dark:text-zinc-300 flex items-center justify-between group sidebar-item-anim hover-scale"
                   [class.font-bold]="i === activeChat"
                   [ngClass]="i === activeChat ? 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/50 font-bold' : ''">
                <div class="flex items-center gap-2 truncate">
                  <svg class="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span class="truncate pr-1.5">{{ chat.title }}</span>
                </div>
                <!-- Delete chat button, visible on hover -->
                <button (click)="deleteChatSession(i, $event)" 
                        title="Hapus Chat"
                        class="opacity-0 group-hover:opacity-100 hover:text-red-500 bg-transparent border-none cursor-pointer transition-opacity p-0.5 flex items-center text-zinc-500 flex-shrink-0">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              <p *ngIf="chatHistory.length === 0" class="text-zinc-500 dark:text-zinc-600 italic px-3 text-[10.5px]">Tidak ada sesi aktif.</p>
            </div>
          </div>
        </div>

        <!-- BOTTOM CONTROLLER: METRICS & UPGRADE REMOVED, keeping only clean tool controls -->
        <div class="p-4 bg-transparent select-none border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col gap-3">
          <!-- Credit Track Indicator -->
          <div *ngIf="!sidebarCollapsed" class="flex flex-col gap-1 px-1">
            <div class="flex justify-between items-center text-[10.5px] font-bold tracking-wide text-zinc-500 dark:text-zinc-500 uppercase">
              <span>Sisa Kredit</span>
              <span>{{ creditsRemaining }}/15</span>
            </div>
            <div class="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50">
              <div class="bg-zinc-800 dark:bg-zinc-200 h-full rounded-full transition-all duration-500" 
                   [style.width.%]="(creditsRemaining / 15) * 100"></div>
            </div>
          </div>

          <!-- Mini collapsed credit tracker icon for collapsed state -->
          <div *ngIf="sidebarCollapsed" class="flex justify-center py-1" title="Sisa Kredit: {{ creditsRemaining }} prompt">
            <span class="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/50">
              {{ creditsRemaining }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <!-- Theme Toggle Icon -->
            <button (click)="themeService.toggleTheme()" 
                    title="Ubah Tema" 
                    class="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white border-none bg-transparent cursor-pointer transition-all">
              <!-- Sun Icon -->
              <svg *ngIf="themeService.isDarkMode()" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <!-- Moon Icon -->
              <svg *ngIf="!themeService.isDarkMode()" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>
            
            <!-- Collapse / Expand Button -->
            <button (click)="cycleSidebarMode()" 
                    title="Perkecil Sidebar" 
                    class="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white border-none bg-transparent cursor-pointer transition-all">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </button>

            <!-- Settings Panel Toggle Button (only for chat) -->
            <button (click)="toggleRightSidebar('settings')" 
                    title="Buka Pengaturan" 
                    class="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white border-none bg-transparent cursor-pointer transition-all"
                    [ngClass]="showPromptsSidebar && rightSidebarTab === 'settings' ? 'text-zinc-900 dark:text-white' : ''">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- CENTER VIEWPORT: CHAT ONLY -->
      <main class="flex-1 flex flex-col bg-[#f9fafb] dark:bg-[#09090b] overflow-hidden relative transition-colors duration-300">
        
        <!-- HEADER BAR -->
        <header class="h-14 bg-white/80 dark:bg-[#101012]/80 border-b border-zinc-200/80 dark:border-zinc-800/50 backdrop-blur-md px-6 flex items-center justify-between select-none z-10 font-sans">
          <div class="flex items-center gap-3">
            <button *ngIf="sidebarHidden" (click)="cycleSidebarMode()" class="bg-transparent border-none text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white p-1 cursor-pointer transition-all">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </button>
            <h2 class="text-[13.5px] font-extrabold tracking-wide uppercase dark:text-zinc-200">
              Minimalism Chat
            </h2>
          </div>

          <div class="flex items-center gap-2">
            <!-- Credit indicator in header -->
            <div class="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#101012] border border-zinc-200/60 dark:border-zinc-800/60 px-3.5 py-1.5 rounded-full select-none flex items-center gap-1.5 shadow-sm">
              <span class="w-1.5 h-1.5 rounded-full" [ngClass]="creditsRemaining > 3 ? 'bg-green-500' : 'bg-red-500'"></span>
              <span>SISA KREDIT: {{ creditsRemaining }} / 15</span>
            </div>

            <!-- Settings Toggler only -->
            <button (click)="toggleRightSidebar('settings')" 
                    [class.bg-zinc-200]="showPromptsSidebar"
                    [class.dark:bg-zinc-800]="showPromptsSidebar"
                    class="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-700 dark:text-zinc-400 px-4 py-1.5 rounded-full text-[11px] font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-all flex items-center gap-1.5 hover-lift">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>PENGATURAN</span>
            </button>
          </div>
        </header>

        <!-- VIEW 1: UNIFIED GENERAL CHAT -->
        <div class="flex-1 flex flex-col h-full bg-[#f9fafb] dark:bg-[#09090b] overflow-hidden relative">
          
          <div class="flex-1 overflow-y-auto" #messageContainer>
            <!-- BLANK STATE: Clean Minimalist Chat Area -->
            <div class="h-full flex flex-col items-center justify-center p-6 select-none" *ngIf="messages.length === 0">
              <div class="text-center max-w-lg w-full mb-8">
                <div class="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-white dark:bg-[#101012] shadow-sm border border-zinc-200/80 dark:border-zinc-800/80">
                  <svg class="w-8 h-8 text-zinc-800 dark:text-zinc-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h1 class="text-[26px] font-extrabold text-zinc-900 dark:text-zinc-50 tracking-wider uppercase mb-2">MINIMALISM AI</h1>
                <p class="text-[13.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans max-w-md mx-auto">
                  Bagaimana saya bisa membantu Anda hari ini? Kirim pesan untuk memulai.
                </p>
              </div>
            </div>

            <!-- Messages Log Feed -->
            <div *ngIf="messages.length > 0" class="max-w-3xl mx-auto px-6 py-6 space-y-6">
              <div *ngFor="let msg of messages; let i = index" class="flex flex-col animate-fade-in-up">
                <span class="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 px-1 font-bold">
                  {{ msg.role === 'user' ? 'Anda' : 'Minimalism AI' }}
                </span>
                <div class="p-6 rounded-[24px] transition-all duration-300 text-[14.5px] leading-relaxed"
                     [ngClass]="msg.role === 'assistant' ? 'bg-white dark:bg-[#101012] border border-zinc-200/80 dark:border-zinc-800/50 shadow-sm text-zinc-800 dark:text-[#ececf1]' : 'bg-zinc-100 dark:bg-[#18181b] border border-zinc-200/40 dark:border-zinc-800/40 text-zinc-800 dark:text-[#ececf1]'">
                  
                  <!-- Markdown blocks inside chat feed -->
                  <div class="font-sans break-words selection:bg-zinc-200 dark:selection:bg-zinc-700/80" 
                       [class.typing-cursor]="msg.isTyping"
                       [innerHTML]="getSafeHtml(msg, i)"></div>
                </div>
              </div>
              
              <!-- Loader calculating system answers -->
              <div *ngIf="isLoading" class="flex items-center gap-2 bg-white dark:bg-[#101012] border border-zinc-200/80 dark:border-zinc-800/50 p-5 rounded-3xl w-fit text-[12.5px] text-zinc-600 dark:text-zinc-500 animate-pulse shadow-sm">
                <div class="w-1.5 h-1.5 bg-zinc-800 dark:bg-zinc-200 rounded-full animate-bounce"></div>
                <div class="w-1.5 h-1.5 bg-zinc-800 dark:bg-zinc-200 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div class="w-1.5 h-1.5 bg-zinc-800 dark:bg-zinc-200 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                <span class="ml-1.5 font-sans font-bold text-zinc-800 dark:text-zinc-200">[BERPIKIR...]</span>
              </div>
            </div>
          </div>
 
          <!-- Bottom Floating Input Bar -->
          <div class="p-6 bg-gradient-to-t from-white/90 to-white/0 dark:from-[#09090b]/90 dark:to-[#09090b]/0 backdrop-blur-sm select-none">
            <div class="max-w-3xl mx-auto flex flex-col gap-2">
              <div class="chat-input-container flex items-center gap-3 bg-white dark:bg-[#101012] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl px-5 py-3.5 shadow-sm focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-700 transition-all duration-300">
                <!-- Inline mini model selector (Custom Dropdown) -->
                <div class="relative flex-shrink-0">
                  <div *ngIf="isMiniDropdownOpen" class="fixed inset-0 z-40 bg-transparent" (click)="isMiniDropdownOpen = false"></div>
                  
                  <button type="button" (click)="isMiniDropdownOpen = !isMiniDropdownOpen" 
                          class="bg-transparent border-none outline-none text-[12px] font-sans text-zinc-600 dark:text-zinc-400 cursor-pointer pr-1 flex items-center gap-1.5 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors z-50 relative font-bold">
                    <span>{{ getModelShortLabel(selectedModel) }}</span>
                    <svg class="w-3 h-3 text-zinc-500 dark:text-zinc-600 transition-transform duration-200" [class.rotate-180]="isMiniDropdownOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  
                  <div *ngIf="isMiniDropdownOpen" 
                       class="absolute bottom-full left-0 mb-3 w-52 bg-white dark:bg-[#1c1c1f] rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 transform origin-bottom transition-all duration-200 border border-zinc-200 dark:border-zinc-800">
                    <button *ngFor="let model of modelOptions" 
                            type="button" 
                            (click)="selectModel(model)" 
                            [disabled]="model.locked"
                            class="w-full text-left px-4 py-2.5 text-[12px] hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center justify-between transition-colors duration-155 border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            [class.bg-zinc-50]="selectedModel === model.value"
                            [class.dark:bg-zinc-900]="selectedModel === model.value">
                      <div class="flex flex-col">
                        <span class="text-zinc-800 dark:text-[#ececf1] font-semibold"
                              [class.text-zinc-900]="selectedModel === model.value"
                              [class.dark:text-white]="selectedModel === model.value"
                              [class.font-bold]="selectedModel === model.value">{{ model.shortLabel }}</span>
                      </div>
                      <span *ngIf="model.locked" class="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold">LOCKED</span>
                      <svg *ngIf="!model.locked && selectedModel === model.value" class="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <span class="text-zinc-300 dark:text-zinc-700">|</span>

                <!-- Text input field -->
                <input [(ngModel)]="userInput" 
                       (keyup.enter)="sendMessage()" 
                       placeholder="Ketik pesan Anda di sini..." 
                       class="flex-1 bg-transparent border-none outline-none text-[13.5px] text-zinc-800 dark:text-[#ececf1] placeholder-zinc-400 dark:placeholder-zinc-700 min-w-0">
                
                <!-- Send button -->
                <button (click)="sendMessage()" 
                        [disabled]="!userInput.trim() || isLoading" 
                        class="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black w-8 h-8 rounded-xl border-none flex items-center justify-center hover:opacity-90 disabled:opacity-30 cursor-pointer font-bold transition-all flex-shrink-0">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>
      
      <!-- RIGHT SIDEBAR: CONTROL PANEL (SETTINGS ONLY) -->
      <aside *ngIf="showPromptsSidebar" 
             class="w-80 bg-white dark:bg-[#101012] border-l border-zinc-200/80 dark:border-zinc-800/50 flex flex-col justify-between select-none overflow-hidden transition-all duration-300 z-30">
        
        <div class="flex-1 flex flex-col min-h-0 p-4">
          <!-- Header without tabs -->
          <div class="flex items-center justify-between pb-2.5 mb-4 border-b border-zinc-200 dark:border-zinc-800/50">
            <span class="text-[12px] font-extrabold tracking-wider uppercase text-zinc-800 dark:text-zinc-200">Pengaturan</span>
            <button (click)="showPromptsSidebar = false" class="bg-transparent border-none text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white cursor-pointer transition-all p-1 hover-scale">✕</button>
          </div>

          <!-- SETTINGS CONTENT -->
          <div class="flex-1 overflow-y-auto space-y-5 min-h-0 pr-1 py-1 font-sans">
            <!-- Model Selection -->
            <div>
              <label class="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-bold block mb-2">Pilihan Model</label>
              <div class="relative w-full">
                <!-- Dropdown Backdrop to close it on click outside -->
                <div *ngIf="isModelDropdownOpen" class="fixed inset-0 z-40 bg-transparent" (click)="isModelDropdownOpen = false"></div>
                
                <!-- Trigger Button -->
                <button type="button" (click)="isModelDropdownOpen = !isModelDropdownOpen" 
                        class="w-full flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-[13px] text-zinc-800 dark:text-[#ececf1] focus:outline-none cursor-pointer transition-all text-left z-50 relative hover-scale">
                  <span class="font-sans font-medium truncate pr-2">{{ getModelLabel(selectedModel) }}</span>
                  <svg class="w-4 h-4 text-zinc-400 dark:text-zinc-600 transition-transform duration-200 flex-shrink-0" [class.rotate-180]="isModelDropdownOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                <!-- Styled Options Container -->
                <div *ngIf="isModelDropdownOpen" 
                     class="absolute left-0 right-0 mt-2 bg-white dark:bg-[#1c1c1f] rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 max-h-60 overflow-y-auto transform origin-top animate-scale-in border border-zinc-200 dark:border-zinc-800">
                  <button *ngFor="let model of modelOptions" 
                          type="button" 
                          (click)="selectModel(model)" 
                          [disabled]="model.locked"
                          class="w-full text-left px-4 py-2.5 text-[13px] hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center justify-between transition-colors duration-155 border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          [class.bg-zinc-50]="selectedModel === model.value"
                          [class.dark:bg-zinc-900]="selectedModel === model.value">
                    <div class="flex flex-col gap-0.5">
                      <span class="text-zinc-900 dark:text-[#ececf1] font-semibold"
                            [class.text-zinc-950]="selectedModel === model.value"
                            [class.dark:text-white]="selectedModel === model.value"
                            [class.font-bold]="selectedModel === model.value">{{ model.label }}</span>
                    </div>
                    <span *ngIf="model.locked" class="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold">LOCKED</span>
                    <svg *ngIf="!model.locked && selectedModel === model.value" class="w-4 h-4 text-zinc-900 dark:text-zinc-100 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- System Instructions -->
            <div>
              <label class="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-bold block mb-2">Instruksi Sistem</label>
              <textarea [(ngModel)]="selectedSystemPrompt" 
                        placeholder="Anda adalah asisten AI yang bermanfaat dan tepat..." 
                        rows="6" 
                        class="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-[13px] text-zinc-800 dark:text-zinc-300 placeholder-zinc-500 dark:placeholder-zinc-700 focus:outline-none resize-none leading-relaxed transition-all"></textarea>
            </div>

            <!-- Temperature -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-bold block">Temperatur</label>
                <span class="text-[12px] font-bold text-zinc-600 dark:text-zinc-400">{{ temperatureValue }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-[10px] text-zinc-500 dark:text-zinc-500 select-none">Tepat</span>
                <input type="range" min="0" max="2" step="0.1" [(ngModel)]="temperatureValue" class="flex-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-zinc-800 dark:accent-zinc-100">
                <span class="text-[10px] text-zinc-500 dark:text-zinc-500 select-none">Kreatif</span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-zinc-50 dark:bg-[#1a1a1f] border-t border-zinc-200 dark:border-zinc-800/50 text-center text-[9.5px] text-zinc-400 dark:text-zinc-600 font-sans uppercase tracking-wider select-none">
          Konfigurasi lingkungan model
        </div>
      </aside>

      <!-- Run Code Preview Modal -->
      <div *ngIf="isRunningModalOpen" class="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-8 animate-fade-in-up">
        <div class="bg-white dark:bg-[#101012] w-full h-full max-w-5xl rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 animate-scale-in">
          <!-- Modal Header -->
          <div class="px-6 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/50 select-none">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-red-500"></span>
              <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span class="w-3 h-3 rounded-full bg-green-500"></span>
              <span class="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 font-mono ml-2">Minimalism Live Run</span>
            </div>
            <button (click)="isRunningModalOpen = false; runningCode = null" class="bg-transparent border-none text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white cursor-pointer font-bold text-[18px]">✕</button>
          </div>
          <!-- Modal Body / Iframe -->
          <div class="flex-1 bg-white relative">
            <iframe #previewIframe *ngIf="isRunningModalOpen" sandbox="allow-scripts allow-modals" class="w-full h-full border-none bg-white"></iframe>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @ViewChild('previewIframe') previewIframe!: ElementRef;

  // Zero-Fluff and Code-Block parameters
  zeroFluffActive = true;

  // Session profile values
  userRole = 'umum';
  userEmail = 'operator@minimalism.ai';
  creditsRemaining = 15;

  // Active workspace segments
  activeSegment = 'chat';

  // State parameters inputs
  userInput = '';
  isLoading = false;
  selectedModel = 'minimalism-flash';
  temperatureValue = 0.7;
  selectedSystemPrompt = 'Anda adalah asisten AI yang bermanfaat, tepat, dan ringkas.';

  // Right sidebar active tab state
  rightSidebarTab: 'settings' | 'prompts' = 'settings';

  // Quick suggestions for clean blank state
  quickSuggestions = [
    { title: 'First-Principles Analysis', desc: 'Deconstruct a complex idea to its core fundamental truths.', content: 'Deconstruct the concept of quantum computing using First-Principles thinking.' },
    { title: 'Nuanced Copywriter', desc: 'Draft clean, high-converting copy without standard AI clichés.', content: 'Write a short, engaging description for a minimalist productivity app.' },
    { title: 'Mental Model Solver', desc: 'Apply mental frameworks to clarify an architectural decision.', content: 'Use Second-Order Thinking to analyze migrating from Monolith to Microservices.' },
    { title: 'Socratic Inquiry', desc: 'Discuss a philosophy concept through guided questions.', content: 'Mari kita diskusikan tentang kebebasan berkehendak (free will) menggunakan metode Socratic.' }
  ];

  // Custom dropdown states
  isModelDropdownOpen = false;
  isMiniDropdownOpen = false;
  isCreatorStyleDropdownOpen = false;
  isSkillDropdownOpen = false;

  selectedSkills: { [key: string]: string } = {
    chat: 'general',
    code: 'code-architect',
    creator: 'creator-scheduler',
    analysis: 'academic-critic'
  };

  chatSkills = [
    { value: 'general', label: 'General Chat Mode', details: 'Standard high-agency helper, warm human editor.' },
    { value: 'first-principles', label: 'First-Principles Analyst', details: 'Deconstruct issues to core truths and inversions.' },
    { value: 'mental-models', label: 'Mental Model Solver', details: 'Applies Occam\'s Razor, Pareto (80/20), and 2nd order thinking.' },
    { value: 'copywriter', label: 'Nuanced Copywriter', details: 'Writes engaging, warm, copywriting without AI clichés.' },
    { value: 'socratic', label: 'Socratic Critic', details: 'Tutors through critical questions, identifying fallacies.' }
  ];

  codeSkills = [
    { value: 'code-architect', label: 'Fullstack Project Architect', details: 'Plans directory structures, database schemas, and API routers.' },
    { value: 'code-generator', label: 'Fullstack Code Generator', details: 'Generates cross-file fullstack code files based on prompt context.' },
    { value: 'code-debugger', label: 'Systematic Test Debugger', details: 'Drives step-by-step logic checks and unit tests.' }
  ];

  creatorSkills = [
    { value: 'creator-scheduler', label: 'Flow Content Automator', details: 'Generates complete social automation pipelines and triggers.' },
    { value: 'creator-script', label: 'Script Outline & Storyteller', details: 'Drafts emotional, high-hook video scripts and storyboard outlines.' },
    { value: 'creator-visual', label: 'Visual Composition Planner', details: 'Designs layouts and visual directives for rendering engines.' }
  ];

  academicSkills = [
    { value: 'academic-critic', label: 'Thesis Socratic Critic', details: 'Critiques paper outlines, arguments, and logical validity.' },
    { value: 'academic-citation', label: 'Citation & Reference Engine', details: 'Formats references and tracks bibliographical data.' },
    { value: 'academic-summarizer', label: 'Literature Abstract Engine', details: 'Deconstructs academic journals into core abstractions.' }
  ];

  getActiveSkillLabel(): string {
    const segment = this.activeSegment;
    const skillVal = this.selectedSkills[segment];
    if (segment === 'chat') {
      const opt = this.chatSkills.find(o => o.value === skillVal);
      return opt ? opt.label : skillVal;
    } else if (segment === 'code') {
      const opt = this.codeSkills.find(o => o.value === skillVal);
      return opt ? opt.label : skillVal;
    } else if (segment === 'creator') {
      const opt = this.creatorSkills.find(o => o.value === skillVal);
      return opt ? opt.label : skillVal;
    } else if (segment === 'analysis') {
      const opt = this.academicSkills.find(o => o.value === skillVal);
      return opt ? opt.label : skillVal;
    }
    return 'General Mode';
  }

  getActiveSkillOptions() {
    const segment = this.activeSegment;
    if (segment === 'chat') return this.chatSkills;
    if (segment === 'code') return this.codeSkills;
    if (segment === 'creator') return this.creatorSkills;
    if (segment === 'analysis') return this.academicSkills;
    return [];
  }

  modelOptions = [
    { value: 'minimalism-flash', label: 'Minimalism Flash (1 credit)', shortLabel: 'Minimalism Flash', details: 'Sangat luas, hemat, dan cepat. Ideal untuk konteks panjang.', locked: false },
    { value: 'minimalism-fast', label: 'Minimalism Fast (Segera Hadir)', shortLabel: 'Minimalism Fast (Locked)', details: 'Sangat efisien, respons kilat, dan terstruktur secara logis.', locked: true },
    { value: 'minimalism-think', label: 'Minimalism Think (Segera Hadir)', shortLabel: 'Minimalism Think (Locked)', details: 'Analisis mendalam multi-pass untuk problem solving kompleks.', locked: true },
    { value: 'minimalism-lite', label: 'Minimalism Lite (Segera Hadir)', shortLabel: 'Minimalism Lite (Locked)', details: 'Paling murah dan ringan untuk kebutuhan kasual sederhana.', locked: true },
    { value: 'minimalism-deep', label: 'Minimalism Deep (Segera Hadir)', shortLabel: 'Minimalism Deep (Locked)', details: 'Riset mendalam, riset komparatif, dan analisis canggih.', locked: true }
  ];

  creatorStyleOptions = [
    { value: 'photorealistic', label: 'PHOTOREALISTIC' },
    { value: 'flat-vector', label: 'MINIMALIST VECTOR' }
  ];

  selectModel(modelOption: any) {
    if (modelOption.locked) return;
    this.selectedModel = modelOption.value;
    this.isMiniDropdownOpen = false;
    this.isModelDropdownOpen = false;
  }

  getModelLabel(val: string): string {
    const opt = this.modelOptions.find(o => o.value === val);
    return opt ? opt.label : val;
  }

  getModelShortLabel(val: string): string {
    const opt = this.modelOptions.find(o => o.value === val);
    return opt ? opt.shortLabel : val;
  }

  getCreatorStyleLabel(val: string): string {
    const opt = this.creatorStyleOptions.find(o => o.value === val);
    return opt ? opt.label : val;
  }

  // Unified General Chat parameters
  messages: Message[] = [];
  chatHistory: { id?: string; title: string; messages: Message[] }[] = [];
  activeChat = -1;

  // Code compiler parameters
  activeDevFile = 'src/index.html';
  codeContext = '';
  bigOAnalysis = true;
  generateTestCases = true;
  codeMessages: Message[] = [];

  codeQuickLaunchCards = [
    {
      icon: '🚀',
      title: 'Startup Landing Page',
      desc: 'Dark minimalist hero + CTA + features section',
      prompt: 'Buatkan halaman landing startup minimalis gelap dengan hero section besar, tagline powerfull, section fitur, dan tombol CTA yang mencolok. Gunakan dark theme #0a0a0a, tipografi Inter, dan animasi fade-in yang smooth.'
    },
    {
      icon: '🏥',
      title: 'Klinik Registration Form',
      desc: 'Form pendaftaran klinik dengan validasi real-time',
      prompt: 'Buatkan halaman pendaftaran klinik gigi dengan form lengkap (nama, nomor HP, tanggal kunjungan, pilihan dokter). Gunakan dark theme elegan, validasi real-time dengan feedback visual, dan tampilan yang clean dan professional.'
    },
    {
      icon: '🛒',
      title: 'E-Commerce Dashboard',
      desc: 'Admin dashboard dengan statistik dan tabel pesanan',
      prompt: 'Buatkan admin dashboard e-commerce dengan kartu statistik (total penjualan, pesanan, pengguna, revenue), grafik bar sederhana, dan tabel pesanan terbaru. Dark theme #111111, accent hijau, font modern.'
    },
    {
      icon: '📊',
      title: 'Developer Portfolio',
      desc: 'Portfolio dengan animasi scroll dan dark mode',
      prompt: 'Buatkan halaman portfolio developer dengan section hero, about, skills progress bar, project cards, dan contact. Dark aesthetic, animasi scroll fade-in, typography premium, dan layout yang modern.'
    },
    {
      icon: '🔐',
      title: 'Login / Register Page',
      desc: 'Auth page modern dengan glassmorphism effect',
      prompt: 'Buatkan halaman login dan register dengan tampilan glassmorphism di atas background gradient gelap. Termasuk form email/password, toggle antara login dan register, dan animasi transisi yang smooth.'
    },
    {
      icon: '💰',
      title: 'SaaS Pricing Page',
      desc: 'Pricing tiers dengan 3 paket dan toggle billing',
      prompt: 'Buatkan halaman pricing SaaS dengan 3 tier (Starter, Pro, Enterprise), toggle monthly/annual, comparison table fitur, dan CTA button di setiap plan. Dark theme premium dengan accent warna yang kontras.'
    },
    {
      icon: '📱',
      title: 'Mobile App Landing',
      desc: 'Landing page app dengan mockup device dan download CTA',
      prompt: 'Buatkan landing page untuk mobile app dengan mockup phone di hero section, section fitur utama, testimonial cards, dan tombol download App Store/Play Store. Dark gradient background, modern dan profesional.'
    }
  ];

  devFiles: OpenFile[] = [];
  terminalLogs: string[] = [];
  terminalCommand = '';
  showTerminal = true;
  workspaceLoading = false;
  saveStatusMessage = '';

  // Ergonomic sidebar layouts
  sidebarCollapsed = false;
  sidebarHidden = false;
  showFileExplorer = true;
  showAiPanel = true;
  showPromptsSidebar = true;
  searchPromptQuery = '';
  workspaceMode = 'split'; 

  // Monaco and live sandbox properties
  editorInstance: any = null;
  previewKey = 0;
  previewLoading = false;
  collapsedDirs = new Set<string>();
  workspaceTree: any[] = [];
  explorerItems: any[] = [];
  aiThinkingState = '';

  // Creator Board parameters
  creatorStyle = 'photorealistic';
  creatorRatio = '1:1';
  imageCoins = 5;
  flowNodes: WireflowNode[] = [];

  // Academic Socratic Writer parameters
  docTitle = '';
  docBody = '';
  jenniDocTitle = 'Metode Vector Space Cartesian';
  jenniDocBody = 'Dalam analisis kalkulus modern, konsep ruang vektor Cartesian merupakan fondasi dasar untuk memodelkan lintasan antigravitasi partikel 2D...';
  tutorMessages: Message[] = [];

  // Static prompt templates catalog
  prompts = [
    { title: 'Creative Copywriter', desc: 'Drafts copy with hook, features and Call to Action.', content: 'Write a high-converting, punchy marketing copy about Minimalism AI. Keep it short, focused on speed, zero fluff, and raw efficiency.' },
    { title: 'Code Refactor Tool', desc: 'Reviews code for optimization and performance.', content: 'Review the following code segment, check for bottlenecks, simplify logic, and return a clean optimized refactored version:\n\n' },
    { title: 'Socratic Tutor', desc: 'Guides you through step-by-step logic questions.', content: 'Explain this concept to me using Socratic method. Ask me questions one at a time to lead me to the discovery myself:\n\n' },
    { title: 'UX Designer Critic', desc: 'Critiques UI flows and color harmonies.', content: 'Critique this interface layout and color theme. Highlight friction points and suggest improvements:\n\n' },
    { title: 'Translate to English', desc: 'Translates foreign scripts to clean English.', content: 'Translate the following text to clear, natural-sounding English:\n\n' }
  ];

  constructor(
    private authService: AuthService,
    private aiService: AiService,
    private router: Router,
    private sanitizer: DomSanitizer,
    public themeService: ThemeService,
    private ngZone: NgZone
  ) {}

  getSafePreviewUrl(): SafeResourceUrl {
    // Add timestamp + random to bust both browser and server cache
    const url = `http://localhost:3000/sandbox/src/index.html?t=${this.previewKey}&r=${Date.now()}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  refreshPreview() {
    this.previewLoading = true;
    this.previewKey++;
    setTimeout(() => {
      this.previewLoading = false;
    }, 2000);
  }

  rebuildExplorer() {
    const list: any[] = [];
    const traverse = (nodes: any[], depth = 0) => {
      if (!nodes) return;
      nodes.forEach(node => {
        const path = node.path;
        let isVisible = true;

        for (const collapsed of this.collapsedDirs) {
          if (path.startsWith(collapsed + '/')) {
            isVisible = false;
            break;
          }
        }

        const isDirCollapsed = this.collapsedDirs.has(path);
        const isActiveFile = this.getActiveFile()?.path === path;

        list.push({
          path,
          name: node.name,
          type: node.type,
          depth,
          collapsed: isDirCollapsed,
          visible: isVisible,
          active: isActiveFile
        });

        if (node.type === 'directory' && node.children) {
          traverse(node.children, depth + 1);
        }
      });
    };

    traverse(this.workspaceTree);
    this.explorerItems = list;
  }

  toggleFolder(path: string) {
    if (this.collapsedDirs.has(path)) {
      this.collapsedDirs.delete(path);
    } else {
      this.collapsedDirs.add(path);
    }
    this.rebuildExplorer();
  }

  selectFile(path: string) {
    this.openDevFileByPath(path);
    this.rebuildExplorer();
  }

  flattenWorkspaceFiles(files: any[]): OpenFile[] {
    const list: OpenFile[] = [];
    const traverse = (item: any) => {
      if (item.type === 'file') {
        list.push({
          name: item.name,
          path: item.path,
          content: item.content || '',
          active: false
        });
      } else if (item.children) {
        item.children.forEach((c: any) => traverse(c));
      }
    };
    files.forEach(f => traverse(f));
    return list;
  }

  async loadWorkspace(preserveActive = true) {
    this.workspaceLoading = true;
    try {
      const activePath = preserveActive ? this.getActiveFile()?.path : null;
      const res = await this.aiService.getWorkspaceFiles();
      
      if (res && res.files) {
        this.workspaceTree = res.files;
        this.devFiles = this.flattenWorkspaceFiles(res.files);
      }

      if (this.devFiles.length > 0) {
        const matched = this.devFiles.find(f => f.path === activePath);
        if (matched) {
          matched.active = true;
        } else {
          this.devFiles[0].active = true;
        }
        
        const active = this.getActiveFile();
        this.activeDevFile = active.name;
        this.codeContext = active.content;
      } else {
        const fallback = { name: 'index.html', path: 'src/index.html', content: '<!-- Scaffolded Sandbox Workspace -->', active: true };
        this.devFiles = [fallback];
        this.activeDevFile = 'index.html';
        this.codeContext = fallback.content;
      }

      this.rebuildExplorer();
      setTimeout(() => {
        this.initMonacoEditor();
      }, 100);
    } catch (err: any) {
      console.error('Failed to load sandbox workspace:', err);
      this.terminalLogs.push(`[SYSTEM ERROR] Failed to load sandbox files tree: ${err.message}`);
    } finally {
      this.workspaceLoading = false;
    }
  }

  getActiveFile(): OpenFile {
    let active = this.devFiles.find(f => f.active);
    if (!active) {
      if (this.devFiles.length > 0) {
        this.devFiles[0].active = true;
        active = this.devFiles[0];
      } else {
        active = { name: 'untitled.txt', path: 'untitled.txt', content: '// Workspace empty', active: true };
        this.devFiles = [active];
      }
    }
    return active;
  }

  openDevFileByPath(filePath: string) {
    this.devFiles.forEach(f => f.active = (f.path === filePath));
    const active = this.getActiveFile();
    this.activeDevFile = active.name;
    this.codeContext = active.content;

    setTimeout(() => {
      this.updateMonacoModel();
    }, 50);
  }

  async saveActiveFile() {
    const active = this.getActiveFile();
    this.saveStatusMessage = 'SAVING...';
    try {
      await this.aiService.writeWorkspaceFile(active.path, active.content);
      this.saveStatusMessage = 'SAVED TO DISK';
    } catch (err: any) {
      this.saveStatusMessage = 'SAVE FAILED';
      this.terminalLogs.push(`[SYSTEM ERROR] Failed to save active file ${active.path}: ${err.message}`);
    }
    setTimeout(() => {
      if (this.saveStatusMessage === 'SAVED TO DISK' || this.saveStatusMessage === 'SAVE FAILED') {
        this.saveStatusMessage = '';
      }
    }, 2000);
  }

  async createNewFile() {
    const filename = prompt('Masukkan nama file baru beserta path relatifnya (contoh: src/components/button.js):');
    if (!filename) return;

    try {
      this.workspaceLoading = true;
      await this.aiService.writeWorkspaceFile(filename.trim(), `// File: ${filename.trim()}\n// Created by Minimalism AI\n\n`);
      await this.loadWorkspace(false);
      this.openDevFileByPath(filename.trim());
      this.terminalLogs.push(`[WORKSPACE] Created file successfully: ${filename.trim()}`);
    } catch (err: any) {
      alert(`Gagal membuat file: ${err.message}`);
    } finally {
      this.workspaceLoading = false;
    }
  }

  async deleteActiveFile() {
    const active = this.getActiveFile();
    if (confirm(`Apakah Anda yakin ingin menghapus file ${active.path} dari disk fisik?`)) {
      try {
        this.workspaceLoading = true;
        await this.aiService.deleteWorkspaceFile(active.path);
        await this.loadWorkspace(false);
        this.terminalLogs.push(`[WORKSPACE] Deleted file: ${active.path}`);
      } catch (err: any) {
        alert(`Gagal menghapus file: ${err.message}`);
      } finally {
        this.workspaceLoading = false;
      }
    }
  }

  async deleteFileByPath(filePath: string, event: Event) {
    event.stopPropagation();
    if (confirm(`Apakah Anda yakin ingin menghapus file ${filePath} dari disk fisik?`)) {
      try {
        this.workspaceLoading = true;
        await this.aiService.deleteWorkspaceFile(filePath);
        await this.loadWorkspace(false);
        this.terminalLogs.push(`[WORKSPACE] Deleted file: ${filePath}`);
      } catch (err: any) {
        alert(`Gagal menghapus file: ${err.message}`);
      } finally {
        this.workspaceLoading = false;
      }
    }
  }

  cycleSidebarMode() {
    if (!this.sidebarCollapsed && !this.sidebarHidden) {
      this.sidebarCollapsed = true;
      this.sidebarHidden = false;
    } else if (this.sidebarCollapsed && !this.sidebarHidden) {
      this.sidebarCollapsed = false;
      this.sidebarHidden = true;
    } else {
      this.sidebarCollapsed = false;
      this.sidebarHidden = false;
    }
  }

  getLineNumbers(): number[] {
    const active = this.getActiveFile();
    const lineCount = active ? active.content.split('\n').length : 1;
    return Array.from({ length: Math.max(20, lineCount) }, (_, i) => i + 1);
  }

  onCodeEdit(newContent: string) {
    const active = this.getActiveFile();
    if (active) {
      active.content = newContent;
      this.codeContext = newContent;
    }
  }

  extractCodeBlock(text: string): string | null {
    const regex = /```(?:typescript|javascript|json|html|css|prisma)?\s*([\s\S]*?)```/i;
    const match = regex.exec(text);
    return match ? match[1] : null;
  }

  async initMonacoEditor() {
    const container = document.getElementById('monaco-editor-container');
    if (!container) return;

    if (!(window as any).monaco) {
      await this.loadMonacoLibrary();
    }

    if (!(window as any).monaco) {
      console.error('Failed to load Monaco library globally.');
      return;
    }

    if (this.editorInstance) {
      try {
        this.editorInstance.destroy();
      } catch (e) {}
      this.editorInstance = null;
    }

    const activeFile = this.getActiveFile();
    const extension = activeFile.path.split('.').pop() || '';
    const languageMap: { [key: string]: string } = {
      js: 'javascript',
      ts: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      prisma: 'graphql',
      env: 'properties'
    };
    const language = languageMap[extension] || 'plaintext';

    this.editorInstance = (window as any).monaco.editor.create(container, {
      value: activeFile.content,
      language: language,
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 12,
      fontFamily: 'Fira Code, monospace',
      minimap: { enabled: false },
      lineHeight: 20
    });

    this.editorInstance.onDidChangeModelContent(() => {
      const val = this.editorInstance.getValue();
      this.onCodeEdit(val);
    });

    this.editorInstance.addCommand((window as any).monaco.KeyMod.CtrlCmd | (window as any).monaco.KeyCode.KeyS, () => {
      this.saveActiveFile();
    });
  }

  loadMonacoLibrary(): Promise<void> {
    if ((window as any).monaco) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const checkAndResolve = () => {
        if ((window as any).monaco) {
          resolve();
          return true;
        }
        return false;
      };

      if (checkAndResolve()) return;

      if ((window as any).require) {
        (window as any).require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
        (window as any).require(['vs/editor/editor.main'], () => {
          resolve();
        }, (err: any) => reject(err));
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.js';
        script.onload = () => {
          (window as any).require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
          (window as any).require(['vs/editor/editor.main'], () => {
            resolve();
          }, (err: any) => reject(err));
        };
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
      }
    });
  }

  updateMonacoModel() {
    if (!this.editorInstance || !(window as any).monaco) {
      this.initMonacoEditor();
      return;
    }
    const activeFile = this.getActiveFile();
    const extension = activeFile.path.split('.').pop() || '';
    const languageMap: { [key: string]: string } = {
      js: 'javascript',
      ts: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      prisma: 'graphql',
      env: 'properties'
    };
    const language = languageMap[extension] || 'plaintext';

    const currentVal = this.editorInstance.getValue();
    if (currentVal !== activeFile.content) {
      const model = (window as any).monaco.editor.createModel(activeFile.content, language);
      this.editorInstance.setModel(model);
    }
  }

  changeWorkspaceMode(mode: string) {
    this.workspaceMode = mode;
    if (mode === 'code' || mode === 'split') {
      setTimeout(() => {
        this.initMonacoEditor();
      }, 50);
    }
  }

  async ngOnInit() {
    (window as any).copyCodeBlock = (msgIndex: number, blockIndex: number) => {
      this.ngZone.run(() => this.copyCodeBlock(msgIndex, blockIndex));
    };
    (window as any).deployCodeToSandbox = (msgIndex: number, blockIndex: number) => {
      this.ngZone.run(() => this.deployCodeBlock(msgIndex, blockIndex));
    };
    (window as any).runCodeBlock = (msgIndex: number, blockIndex: number) => {
      this.ngZone.run(() => this.runCodeBlock(msgIndex, blockIndex));
    };

    await this.loadUserProfile();
    await this.loadWorkspace();
    await this.loadChatHistoryFromServer();
  }

  ngOnDestroy() {
    if ((window as any).copyCodeBlock) {
      delete (window as any).copyCodeBlock;
    }
    if ((window as any).deployCodeToSandbox) {
      delete (window as any).deployCodeToSandbox;
    }
    if ((window as any).runCodeBlock) {
      delete (window as any).runCodeBlock;
    }
  }

  async loadUserProfile() {
    const user = await this.authService.loadTokenAndUser();
    if (user) {
      this.userEmail = user.email;
      this.userRole = user.role || 'umum';
      const dailyPrompts = user.ledger?.dailyPromptsUsed || 0;
      this.creditsRemaining = Math.max(0, 15 - dailyPrompts);
      this.imageCoins = user.ledger?.imageCoinsLeft || 5;
    }
  }

  isFreeUser(): boolean {
    return this.userRole === 'umum';
  }

  async switchSegment(segmentId: string) {
    this.activeSegment = segmentId;
    this.userInput = '';
    this.isLoading = false;
    
    if (segmentId === 'chat') {
      await this.loadChatHistoryFromServer();
    }
    
    if (segmentId === 'code') {
      await this.loadWorkspace();
      setTimeout(() => {
        this.initMonacoEditor();
      }, 150);
    }
  }

  triggerUpgrade() {
    this.router.navigate(['/pricing']);
  }

  loadChat(index: number) {
    this.activeChat = index;
    this.messages = [...this.chatHistory[index].messages];
  }

  startNewChat() {
    this.messages = [];
    this.activeChat = -1;
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.messageContainer) {
          const el = this.messageContainer.nativeElement;
          el.scrollTo({
            top: el.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 50);
    } catch (err) {}
  }

  async loadChatHistoryFromServer() {
    try {
      const chats = await this.aiService.getChatHistory(this.activeSegment);
      this.chatHistory = chats.map((c: any) => ({
        id: c.id,
        title: c.title,
        messages: c.messages || []
      }));
      if (this.chatHistory.length > 0) {
        this.loadChat(0);
      } else {
        this.startNewChat();
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }

  async deleteChatSession(index: number, event: Event) {
    event.stopPropagation();
    const chat = this.chatHistory[index];
    if (confirm(`Apakah Anda yakin ingin menghapus percakapan "${chat.title}"?`)) {
      if (chat.id) {
        await this.aiService.deleteChatHistory(chat.id);
      }
      this.chatHistory.splice(index, 1);
      
      if (this.activeChat === index) {
        if (this.chatHistory.length > 0) {
          this.loadChat(0);
        } else {
          this.startNewChat();
        }
      } else if (this.activeChat > index) {
        this.activeChat--;
      }
    }
  }

  applyPrompt(promptContent: string) {
    this.userInput = promptContent;
  }

  toggleRightSidebar(tab: 'settings' | 'prompts') {
    if (this.showPromptsSidebar && this.rightSidebarTab === tab) {
      this.showPromptsSidebar = false;
    } else {
      this.showPromptsSidebar = true;
      this.rightSidebarTab = tab;
    }
  }

  applySuggestion(content: string) {
    this.userInput = content;
  }

  unescapeHtml(safeText: string): string {
    return safeText
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, '&');
  }

  renderMarkdown(text: string, msgIndex: number, codeBlocksList: any[]): string {
    if (!text) return '';
    let html = text;
    
    // Clean up escaped markdown characters from API (e.g. \\* to *)
    html = html.replace(/\\([*_`#|])/g, '$1');
    
    // Escape HTML to prevent XSS
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Pre-process code blocks: ```code```
    const placeholders: string[] = [];
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const blockIndex = codeBlocksList.length;
      const rawCode = code.trim();
      
      // Auto path detection: scan first 3 lines for filename comment
      let path = '';
      const lines = rawCode.split('\n').slice(0, 3);
      for (const line of lines) {
        const pathMatch = line.match(/(?:\/\/|<!--|#|--)\s*File:\s*([^\s-->]+)/i);
        if (pathMatch) {
          path = pathMatch[1].trim();
          break;
        }
      }
      
      // Store in codeBlocksList
      codeBlocksList.push({
        lang: lang || 'plaintext',
        path: path,
        code: this.unescapeHtml(rawCode)
      });
      
      const placeholder = `<!--CODE_BLOCK_${blockIndex}-->`;
      
      // Render beautiful toolbar
      const displayLang = (lang || 'plaintext').toUpperCase();
      const displayPath = path ? ` · ${path}` : '';
      const deployButton = path ? `
        <button onclick="window.deployCodeToSandbox(${msgIndex}, ${blockIndex})" class="deploy-btn hover-lift" title="Deploy to Sandbox">
          <svg class="w-3 h-3 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Deploy
        </button>
      ` : '';
      
      const toolbarHtml = `
        <div class="code-block-container my-3 select-text font-sans">
          <div class="code-block-toolbar flex justify-between items-center bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-t-2xl text-[11px] font-sans text-zinc-500 dark:text-zinc-400 select-none">
            <span class="lang-and-path font-bold uppercase select-none">${displayLang}${displayPath}</span>
            <div class="actions flex gap-2 items-center select-none">
              <button onclick="window.runCodeBlock(${msgIndex}, ${blockIndex})" class="run-btn hover-lift flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 border-none bg-transparent cursor-pointer" title="Jalankan Kode">
                <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24" style="display:inline-block;"><polygon points="6 3 20 12 6 21 6 3"/></svg>Run
              </button>
              <span class="text-zinc-300 dark:text-zinc-800">|</span>
              <button onclick="window.copyCodeBlock(${msgIndex}, ${blockIndex})" class="copy-btn hover-lift border-none bg-transparent cursor-pointer font-semibold text-zinc-700 dark:text-zinc-300" title="Salin Kode">Copy</button>
              ${deployButton ? `<span class="text-zinc-300 dark:text-zinc-800">|</span>` + deployButton : ''}
            </div>
          </div>
          <pre class="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-b-2xl font-mono text-[13px] overflow-x-auto text-zinc-800 dark:text-zinc-200 mt-0"><code>${rawCode}</code></pre>
        </div>
      `;
      
      placeholders.push(toolbarHtml);
      return placeholder;
    });

    // Split into lines
    const lines = html.split('\n');
    const resultLines: string[] = [];
    
    let currentParagraph: string[] = [];
    let currentList: { type: 'ul' | 'ol', items: string[] } | null = null;
    let currentTable: { headers: string[], rows: string[][] } | null = null;
    let currentBlockquote: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        let pContent = currentParagraph.join(' ');
        pContent = processInlineMarkdown(pContent);
        resultLines.push(`<p class="mb-3 leading-relaxed text-zinc-800 dark:text-zinc-200">${pContent}</p>`);
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (currentList) {
        const listClass = currentList.type === 'ul' ? 'list-disc' : 'list-decimal';
        let listHtml = `<ul class="space-y-1.5 my-3 ${listClass} pl-5 text-zinc-800 dark:text-zinc-200">`;
        if (currentList.type === 'ol') {
          listHtml = `<ol class="space-y-1.5 my-3 ${listClass} pl-5 text-zinc-800 dark:text-zinc-200">`;
        }
        currentList.items.forEach(item => {
          listHtml += `<li class="my-0.5">${processInlineMarkdown(item)}</li>`;
        });
        listHtml += currentList.type === 'ul' ? '</ul>' : '</ol>';
        resultLines.push(listHtml);
        currentList = null;
      }
    };

    const flushBlockquote = () => {
      if (currentBlockquote.length > 0) {
        const quoteContent = processInlineMarkdown(currentBlockquote.join('<br>'));
        resultLines.push(`<blockquote class="border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 py-1.5 italic my-3 text-zinc-700 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/40 pr-4 rounded-r-xl">${quoteContent}</blockquote>`);
        currentBlockquote = [];
      }
    };

    const flushTable = () => {
      if (currentTable) {
        let tableHtml = '<div class="overflow-x-auto my-4 rounded-2xl shadow-soft bg-zinc-50/20 dark:bg-zinc-900/20"><table class="w-full text-left border-collapse text-[13px] border-none">';
        
        if (currentTable.headers.length > 0) {
          tableHtml += '<thead class="bg-zinc-100/60 dark:bg-zinc-800/80 font-bold text-zinc-900 dark:text-white"><tr>';
          currentTable.headers.forEach(h => {
            tableHtml += `<th class="px-4 py-2.5 border-none">${processInlineMarkdown(h)}</th>`;
          });
          tableHtml += '</tr></thead>';
        }
        
        tableHtml += '<tbody class="text-zinc-700 dark:text-zinc-300">';
        currentTable.rows.forEach(row => {
          tableHtml += '<tr class="border-none hover:bg-zinc-100/40 dark:hover:bg-zinc-800/30 transition-colors odd:bg-zinc-50/30 dark:odd:bg-zinc-800/10">';
          row.forEach(c => {
            tableHtml += `<td class="px-4 py-2.5 border-none">${processInlineMarkdown(c)}</td>`;
          });
          tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table></div>';
        resultLines.push(tableHtml);
        currentTable = null;
      }
    };

    const flushAll = () => {
      flushParagraph();
      flushList();
      flushBlockquote();
      flushTable();
    };

    function processInlineMarkdown(text: string): string {
      let t = text;
      // Inline code: `code`
      t = t.replace(/`([^`]+)`/g, '<code class="bg-zinc-200/60 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-[12.5px] text-zinc-800 dark:text-zinc-200">$1</code>');
      // Bold: **text**
      t = t.replace(/\*\*([\s\S]*?)\*\*/g, '<strong class="font-bold text-zinc-950 dark:text-white">$1</strong>');
      // Italic: *text*
      t = t.replace(/\*([\s\S]*?)\*/g, '<em class="italic">$1</em>');
      return t;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // 1. Code block placeholder
      if (trimmed.startsWith('<!--CODE_BLOCK_')) {
        flushAll();
        resultLines.push(trimmed);
        continue;
      }

      // 2. Empty line
      if (!trimmed) {
        flushAll();
        continue;
      }

      // 3. Headings: #, ##, ###
      const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        flushAll();
        const level = headingMatch[1].length;
        const content = processInlineMarkdown(headingMatch[2]);
        if (level === 1) {
          resultLines.push(`<h1 class="text-xl font-extrabold text-zinc-900 dark:text-white mt-6 mb-3 font-sans">${content}</h1>`);
        } else if (level === 2) {
          resultLines.push(`<h2 class="text-lg font-extrabold text-zinc-900 dark:text-white mt-5 mb-2.5 font-sans">${content}</h2>`);
        } else {
          resultLines.push(`<h3 class="text-base font-extrabold text-zinc-900 dark:text-white mt-4 mb-2 font-sans">${content}</h3>`);
        }
        continue;
      }

      // 4. Horizontal Rule
      if (/^\s*[-*_]{3,}\s*$/.test(trimmed)) {
        flushAll();
        resultLines.push('<hr class="border-t border-zinc-200 dark:border-zinc-800 my-5">');
        continue;
      }

      // 5. Blockquote
      const quoteMatch = line.match(/^\s*(?:>|&gt;)\s+(.+)$/);
      if (quoteMatch) {
        flushParagraph();
        flushList();
        flushTable();
        currentBlockquote.push(quoteMatch[1]);
        continue;
      }

      // 6. List Items
      const ulMatch = line.match(/^\s*[-*]\s+(.+)$/);
      const olMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
      if (ulMatch || olMatch) {
        flushParagraph();
        flushBlockquote();
        flushTable();
        
        const type = ulMatch ? 'ul' : 'ol';
        const content = ulMatch ? ulMatch[1] : (olMatch ? olMatch[2] : '');
        
        if (currentList && currentList.type === type) {
          currentList.items.push(content);
        } else {
          flushList();
          currentList = { type, items: [content] };
        }
        continue;
      }

      // 7. Table rows
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushParagraph();
        flushBlockquote();
        flushList();
        
        const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
        if (trimmed.includes('---')) {
          continue;
        }
        
        if (!currentTable) {
          currentTable = { headers: [], rows: [] };
        }
        
        if (currentTable.headers.length === 0) {
          currentTable.headers = cells;
        } else {
          currentTable.rows.push(cells);
        }
        continue;
      }

      // 8. Normal text line
      flushList();
      flushBlockquote();
      flushTable();
      currentParagraph.push(line);
    }

    flushAll();

    // Re-assemble html string
    let finalHtml = resultLines.join('\n');
    
    // Replace code block placeholders back
    for (let i = 0; i < placeholders.length; i++) {
      finalHtml = finalHtml.replace(`<!--CODE_BLOCK_${i}-->`, placeholders[i]);
    }
    
    return finalHtml;
  }

  getSafeHtml(msg: any, msgIndex?: number) {
    if (typeof msg === 'string') {
      const tempBlocks: any[] = [];
      const rendered = this.renderMarkdown(msg, msgIndex ?? 0, tempBlocks);
      return this.sanitizer.bypassSecurityTrustHtml(rendered);
    }
    if (!msg) return '';
    if (!msg.renderedHtml || msg.isTyping || !msg.codeBlocks || (msg.content && msg.content.includes('```') && msg.codeBlocks.length === 0)) {
      msg.codeBlocks = [];
      msg.renderedHtml = this.renderMarkdown(msg.content, msgIndex ?? 0, msg.codeBlocks);
    }
    return this.sanitizer.bypassSecurityTrustHtml(msg.renderedHtml);
  }

  runningCode: string | null = null;
  isRunningModalOpen = false;

  runCodeBlock(msgIndex: number, blockIndex: number) {
    const msg = this.messages[msgIndex];
    if (msg && msg.codeBlocks && msg.codeBlocks[blockIndex]) {
      const code = msg.codeBlocks[blockIndex].code;
      const lang = msg.codeBlocks[blockIndex].lang.toLowerCase();
      
      let htmlContent = '';
      if (lang === 'html') {
        htmlContent = code;
      } else if (lang === 'javascript' || lang === 'js') {
        htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="background:#111;color:#eee;font-family:sans-serif;padding:20px;"><script>${code}<\/script></body></html>`;
      } else if (lang === 'css') {
        htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${code}</style></head><body style="padding:20px;"><h1>CSS Demo</h1><p>Demo content styled with the CSS.</p></body></html>`;
      } else {
        htmlContent = `<!DOCTYPE html><html><body style="background:#111;color:#eee;font-family:monospace;padding:20px;white-space:pre-wrap;">${code}</body></html>`;
      }
      
      this.runningCode = htmlContent;
      this.isRunningModalOpen = true;
      
      setTimeout(() => {
        const iframe = this.previewIframe?.nativeElement;
        if (iframe) {
          iframe.srcdoc = htmlContent;
        }
      }, 50);
    }
  }

  getSafeSrcdoc() {
    return this.sanitizer.bypassSecurityTrustHtml(this.runningCode || '');
  }

  copyCodeBlock(msgIndex: number, blockIndex: number) {
    const msg = this.messages[msgIndex];
    if (msg && msg.codeBlocks && msg.codeBlocks[blockIndex]) {
      const code = msg.codeBlocks[blockIndex].code;
      navigator.clipboard.writeText(code).then(() => {
        console.log('Code block copied successfully');
      });
    }
  }

  async deployCodeBlock(msgIndex: number, blockIndex: number) {
    const msg = this.messages[msgIndex];
    if (msg && msg.codeBlocks && msg.codeBlocks[blockIndex]) {
      const block = msg.codeBlocks[blockIndex];
      if (!block.path) return;
      
      try {
        this.isLoading = true;
        await this.aiService.writeWorkspaceFile(block.path, block.code);
        this.activeSegment = 'code';
        await this.loadWorkspace(true);
        this.openDevFile(block.path);
        this.refreshPreview();
        this.terminalLogs.push(`[SYSTEM] Deployed generated code block to sandbox: ${block.path}`);
      } catch (err: any) {
        console.error('Failed to deploy code block:', err);
        alert(`Failed to deploy: ${err.message}`);
      } finally {
        this.isLoading = false;
      }
    }
  }

  getFilteredPrompts() {
    if (!this.searchPromptQuery.trim()) return this.prompts;
    const q = this.searchPromptQuery.toLowerCase();
    return this.prompts.filter(p => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }

  openDevFile(fileName: string) {
    const file = this.devFiles.find(f => f.name === fileName || f.path === fileName);
    if (file) {
      this.openDevFileByPath(file.path);
    }
  }

  addNewNode() {
    const id = 'node_' + Math.random().toString(36).substring(2, 7);
    this.flowNodes.push({
      id,
      title: `#${this.flowNodes.length + 4} Custom Node`,
      type: 'crop',
      content: 'Configured crop filter: square.',
      posX: 200,
      posY: 300,
      outputConnections: []
    });
  }

  getWordCount(): number {
    return this.jenniDocBody ? this.jenniDocBody.trim().split(/\s+/).length : 0;
  }

  async sendMessage() {
    const prompt = this.userInput.trim();
    if (!prompt || this.isLoading) return;

    this.messages.push({ role: 'user', content: prompt, timestamp: new Date() });
    this.userInput = '';
    this.isLoading = true;
    this.scrollToBottom();

    try {
      let processedPrompt = prompt;
      if (this.selectedSystemPrompt.trim()) {
        processedPrompt = `[System instructions: ${this.selectedSystemPrompt.trim()}]\n[User prompt: ${prompt}]`;
      }

      const activeSkill = this.selectedSkills[this.activeSegment];
      const res = await this.aiService.sendUnifiedMessage(this.selectedModel, processedPrompt, activeSkill);
      const replyText = res.reply || res.error || 'Perhitungan pipa sistem selesai.';
      
      this.creditsRemaining = Math.max(0, this.creditsRemaining - 1);

      // Create empty assistant message placeholder for streaming
      const assistantMsg: Message = {
        role: 'assistant',
        content: '',
        model: this.selectedModel,
        timestamp: new Date(),
        isTyping: true
      };
      this.messages.push(assistantMsg);

      // Disable loader as streaming starts
      this.isLoading = false;

      // Word-by-word rollout animation
      let currentWordIndex = 0;
      const words = replyText.split(/(\s+)/);
      const timer = setInterval(async () => {
        if (currentWordIndex >= words.length) {
          clearInterval(timer);
          assistantMsg.content = replyText; // ensure exact final match
          assistantMsg.isTyping = false;
          this.scrollToBottom();
          
          // Save final chat state to server DB
          if (this.messages.length === 2) {
            const chatSessionId = 'chat_' + Math.random().toString(36).substring(2, 11);
            const title = prompt.substring(0, 24) + (prompt.length > 24 ? '...' : '');
            const newChat = {
              id: chatSessionId,
              title: title,
              messages: [...this.messages]
            };
            this.chatHistory.unshift(newChat);
            this.activeChat = 0;
            await this.aiService.saveChatHistory(chatSessionId, this.activeSegment, newChat.messages, newChat.title);
          } else if (this.activeChat >= 0) {
            const activeChatObj = this.chatHistory[this.activeChat];
            activeChatObj.messages = [...this.messages];
            if (activeChatObj.id) {
              await this.aiService.saveChatHistory(activeChatObj.id, this.activeSegment, activeChatObj.messages, activeChatObj.title);
            }
          }
        } else {
          assistantMsg.content = words.slice(0, currentWordIndex + 1).join('');
          currentWordIndex++;
          this.scrollToBottom();
        }
      }, 12);

    } catch (err) {
      this.messages.push({
        role: 'assistant',
        content: '[CONNECTION TIMEOUT]: Gagal menghubungi Minimalism AI Gateway.',
        timestamp: new Date()
      });
      this.isLoading = false;
      this.scrollToBottom();
    }
  }

  async executeTerminalCLI() {
    const command = this.terminalCommand.trim();
    if (!command) return;

    this.terminalLogs.push(`$ ${command}`);
    this.terminalCommand = '';

    try {
      const active = this.getActiveFile();
      if (active) {
        await this.aiService.writeWorkspaceFile(active.path, active.content);
      }

      const token = localStorage.getItem('supabase_token') || 'mock_jwt_dev_user_id';
      const url = `http://localhost:3000/api/workspace/stream-execute?command=${encodeURIComponent(command)}&token=${encodeURIComponent(token)}`;
      
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'stdout') {
            this.terminalLogs.push(data.text);
          } else if (data.type === 'stderr') {
            this.terminalLogs.push(`[stderr] ${data.text}`);
          } else if (data.type === 'exit') {
            this.terminalLogs.push(`[CLI] Process completed. Exit code: ${data.code}`);
            eventSource.close();
            this.loadWorkspace(true);
            this.refreshPreview();
          } else if (data.type === 'error') {
            this.terminalLogs.push(`[PROCESS ERROR]: ${data.text}`);
            eventSource.close();
          }
        } catch (e) {
          console.error('Failed to parse SSE payload:', e);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };

    } catch (err: any) {
      this.terminalLogs.push(`[SYSTEM ERROR] Failed to run command: ${err.message}`);
    }
  }

  async runSandboxCommand(command: string) {
    this.terminalCommand = command;
    await this.executeTerminalCLI();
  }

  launchCodeCard(prompt: string) {
    this.userInput = prompt;
    this.runAutonomousCodeGenerator();
  }

  onCodeEditorEnter(event: KeyboardEvent) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.runAutonomousCodeGenerator();
    }
  }

  async runAutonomousCodeGenerator() {
    const prompt = this.userInput.trim();
    if (!prompt || this.isLoading) return;

    this.codeMessages.push({ role: 'user', content: prompt, timestamp: new Date() });
    this.userInput = '';
    this.isLoading = true;
    this.aiThinkingState = 'SCANNING PHYSICAL FILES TREE...';

    const thinkingInterval = setInterval(() => {
      if (this.aiThinkingState === 'SCANNING PHYSICAL FILES TREE...') {
        this.aiThinkingState = 'COMPUTING ARCHITECTURE REASONING PATHS...';
      } else if (this.aiThinkingState === 'COMPUTING ARCHITECTURE REASONING PATHS...') {
        this.aiThinkingState = 'ORCHESTRATING MINIMALISM CODE COMPILE ENGINE...';
      }
    }, 1800);

    try {
      const res = await this.aiService.generateWorkspaceCode(prompt, 'minimalism-flash');
      
      clearInterval(thinkingInterval);
      this.aiThinkingState = 'APPLYING DIRECT DIRECTORY MUTATIONS...';

      this.codeMessages.push({
        role: 'assistant',
        content: res.explanation || 'Generation pipeline completed successfully.',
        timestamp: new Date()
      });

      if (res.filesWritten && res.filesWritten.length > 0) {
        this.terminalLogs.push(`[AUTONOMOUS ENGINE] Applied write mutations:`);
        res.filesWritten.forEach((p: string) => this.terminalLogs.push(`  - Created/Modified: ${p}`));
      }
      if (res.filesDeleted && res.filesDeleted.length > 0) {
        this.terminalLogs.push(`[AUTONOMOUS ENGINE] Applied delete mutations:`);
        res.filesDeleted.forEach((p: string) => this.terminalLogs.push(`  - Removed: ${p}`));
      }

      await this.loadWorkspace(true);

      // Give backend 1.5s to flush files to disk before refreshing the iframe
      setTimeout(() => {
        this.refreshPreview();
      }, 1500);

    } catch (err: any) {
      clearInterval(thinkingInterval);
      console.error(err);
      this.codeMessages.push({
        role: 'assistant',
        content: `❌ GENERATOR ERROR: ${err.message || 'Generation timeout.'}`,
        timestamp: new Date()
      });
    } finally {
      this.isLoading = false;
      this.aiThinkingState = '';
    }
  }

  async startNewCodeProject() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.aiThinkingState = 'CLEARING WORKSPACE...';
    try {
      await this.aiService.clearWorkspace();
      this.codeMessages = [];
      this.previewKey = 0;
      this.previewLoading = false;
    } catch (err) {
      console.error('Failed to clear workspace:', err);
    } finally {
      this.isLoading = false;
      this.aiThinkingState = '';
    }
  }

  async generateVisual() {
    const prompt = this.userInput.trim();
    if (!prompt || this.isLoading) return;

    if (this.imageCoins <= 0) {
      alert('❌ [OUT OF COINS]: Koin gambar visual gratis Anda habis. Upgrade ke Creator Plan untuk unlimited generation.');
      return;
    }

    this.userInput = '';
    this.isLoading = true;

    setTimeout(() => {
      this.flowNodes.push({
        id: 'node_out',
        title: `#${this.flowNodes.length + 4} Generative Canvas Card`,
        type: 'image',
        content: `Rendered prompt: "${prompt}" successfully with style ${this.creatorStyle.toUpperCase()}`,
        posX: 400,
        posY: 400,
        outputConnections: []
      });

      this.imageCoins = Math.max(0, this.imageCoins - 1);
      this.isLoading = false;
    }, 2000);
  }

  async sendTutorMessage() {
    const prompt = this.userInput.trim();
    if (!prompt || this.isLoading) return;

    this.tutorMessages.push({ role: 'user', content: prompt, timestamp: new Date() });
    this.userInput = '';
    this.isLoading = true;

    try {
      let fullPrompt = `Explain vector analogies Socratically for student question: ${prompt}`;
      if (this.docBody.trim()) {
        fullPrompt += `\n\nCONTEXT REFERENCE DIKTAT:\n"""\n${this.docBody}\n"""`;
      }

      const res = await this.aiService.sendUnifiedMessage('gemini-pro', fullPrompt);

      this.tutorMessages.push({
        role: 'assistant',
        content: res.reply || 'Metaphor generated successfully.',
        timestamp: new Date()
      });

      this.creditsRemaining = Math.max(0, this.creditsRemaining - 2);
    } catch (err) {
      this.tutorMessages.push({
        role: 'assistant',
        content: '[TUTOR GATEWAY ERROR]: Failed to fetch conceptual Metaphor.',
        timestamp: new Date()
      });
    }

    this.isLoading = false;
  }

  insertIntoDocument(content: string) {
    if (!this.jenniDocBody) {
      this.jenniDocBody = '';
    }
    const cleaned = content
      .replace(/^\[⚠️ LIVE API OFFLINE\]\s*/, '')
      .replace(/^Simulated output with \d+ Layers for prompt:.*?\n+/, '')
      .trim();
    
    this.jenniDocBody = this.jenniDocBody.trim() + '\n\n' + cleaned;
  }

  logout() {
    this.authService.logout();
    window.location.href = '/';
  }
}
