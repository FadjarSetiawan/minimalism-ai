import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { getApiUrl } from '../../core/api-config';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-6">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white text-sm font-bold">⚙</span>
          </div>
          <h1 class="text-[20px] font-semibold text-primary mb-1">Nexus Command X9</h1>
          <p class="text-[13px] text-secondary">Manual Payment Override Terminal</p>
        </div>

        <div *ngIf="message" [class]="'text-[13px] px-4 py-3 rounded-2xl mb-4 ' + (success ? 'bg-success/5 text-success border border-success/20' : 'bg-danger/5 text-danger border border-danger/20')">
          {{ message }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-[12px] font-medium text-primary block mb-1.5">Payment Reference ID</label>
            <input type="text" [(ngModel)]="referenceId" placeholder="TRX-XXXXXX"
                   class="w-full border border-border rounded-2xl px-4 py-3 text-[13.5px] text-primary focus:outline-none focus:border-accent">
          </div>
          <div>
            <label class="text-[12px] font-medium text-primary block mb-1.5">Admin Secret Key</label>
            <input type="password" [(ngModel)]="adminSecret" placeholder="••••••••"
                   class="w-full border border-border rounded-2xl px-4 py-3 text-[13.5px] text-primary focus:outline-none focus:border-accent">
          </div>
          <button (click)="approvePayment()" [disabled]="isLoading"
                  class="w-full bg-primary text-white py-3 rounded-full text-[14px] font-medium hover:opacity-90 disabled:opacity-50">
            {{ isLoading ? 'Processing...' : 'Authorize Payment' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminPanelComponent {
  referenceId = '';
  adminSecret = '';
  message = '';
  success = false;
  isLoading = false;

  constructor(private http: HttpClient) {}

  approvePayment() {
    if (!this.referenceId || !this.adminSecret) {
      this.showMessage('All fields are required.', false);
      return;
    }
    this.isLoading = true;
    this.message = '';

    this.http.post(`${getApiUrl()}/api/admin/payment/approve`, {
      reference: this.referenceId,
      admin_secret: this.adminSecret
    }).subscribe({
      next: (res: any) => {
        this.showMessage(res.message || 'Payment approved successfully.', true);
        this.isLoading = false;
        this.referenceId = '';
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'An error occurred.', false);
        this.isLoading = false;
      }
    });
  }

  private showMessage(msg: string, isSuccess: boolean) {
    this.message = msg;
    this.success = isSuccess;
  }
}
