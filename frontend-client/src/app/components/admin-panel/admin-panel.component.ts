import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
          <h1 class="text-2xl font-semibold text-primary mb-1">Admin Console</h1>
          <p class="text-sm text-secondary">Verify payments and manage subscriptions</p>
        </div>

        <div *ngIf="message"
             class="text-sm px-4 py-3 rounded-xl mb-4 border"
             [ngStyle]="{'background-color': success ? '#34C75910' : '#FF3B3010', 'border-color': success ? '#34C75930' : '#FF3B3030', 'color': success ? '#34C759' : '#FF3B30'}">
          {{ message }}
        </div>

        <div class="bg-white border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label class="text-sm font-medium text-primary block mb-1.5">Reference ID</label>
            <input type="text" [(ngModel)]="referenceId" placeholder="INV-..."
                   class="w-full border border-border rounded-xl px-4 py-3 text-sm text-primary bg-white focus:outline-none focus:border-accent">
          </div>
          <div>
            <label class="text-sm font-medium text-primary block mb-1.5">Admin Secret</label>
            <input type="password" [(ngModel)]="adminSecret" placeholder="Enter admin key"
                   class="w-full border border-border rounded-xl px-4 py-3 text-sm text-primary bg-white focus:outline-none focus:border-accent">
          </div>
          <button (click)="approvePayment()" [disabled]="isLoading"
                  class="w-full bg-primary text-white py-3 rounded-xl text-sm font-medium border-none cursor-pointer hover:opacity-90 disabled:opacity-50">
            {{ isLoading ? 'Processing...' : 'Approve Payment' }}
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

    this.http.post('http://localhost:3000/api/admin/payment/approve', {
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
