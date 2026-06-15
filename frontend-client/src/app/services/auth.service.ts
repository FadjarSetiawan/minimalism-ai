import { Injectable } from '@angular/core';

import { getApiUrl } from '../core/api-config';

export interface UserLedger {
  dailyPromptsUsed: number;
  imageCoinsLeft: number;
  lastResetDate: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'umum' | 'pelajar' | 'kode' | 'creator';
  ledger: UserLedger;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${getApiUrl()}/api`;
  private user: UserProfile | null = null;

  constructor() {
    this.loadTokenAndUser();
  }

  // Synchronous checks
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('supabase_token');
  }

  getUserRole(): 'umum' | 'pelajar' | 'kode' | 'creator' {
    return this.user?.role || 'umum';
  }

  getCurrentUser(): UserProfile | null {
    return this.user;
  }

  // Load user profile on startup
  async loadTokenAndUser(): Promise<UserProfile | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.user = await response.json();
        return this.user;
      } else {
        // Token might have expired
        this.logout();
        return null;
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }

  // Authentication operations
  async register(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Gagal mendaftar' };
      }

      localStorage.setItem('supabase_token', data.token);
      this.user = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        ledger: { dailyPromptsUsed: 0, imageCoinsLeft: 5, lastResetDate: '' }
      };
      
      await this.loadTokenAndUser(); // Load full detail
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Koneksi ke backend gateway terputus' };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Email atau password salah' };
      }

      localStorage.setItem('supabase_token', data.token);
      this.user = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        ledger: { dailyPromptsUsed: 0, imageCoinsLeft: 5, lastResetDate: '' }
      };

      await this.loadTokenAndUser(); // Load full detail
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Koneksi ke backend gateway terputus' };
    }
  }

  logout() {
    localStorage.removeItem('supabase_token');
    this.user = null;
  }

  // Payment billing actions
  async chargeInvoice(planType: string): Promise<{ success: boolean; invoice?: any; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Silakan login terlebih dahulu' };

    try {
      const response = await fetch(`${this.baseUrl}/payment/charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planType })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Gagal memproses pembayaran' };
      }

      return { success: true, invoice: data.data };
    } catch (error) {
      return { success: false, error: 'Koneksi ke payment gateway bermasalah' };
    }
  }

  // Developer simulated success trigger
  async simulatePaymentCompletion(reference: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/simulate-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reference })
      });

      if (response.ok) {
        await this.loadTokenAndUser(); // refresh role status
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to trigger payment simulation:', error);
      return false;
    }
  }
}
