import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of (toastService.toasts$ | async)"
        class="toast toast-{{ toast.type }}"
        (click)="toastService.dismiss(toast.id)"
      >
        <span class="toast-icon">
          {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : toast.type === 'warning' ? '⚠' : 'ℹ' }}
        </span>
        <span class="toast-msg">{{ toast.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 88px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .toast {
      padding: 14px 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 280px;
      max-width: 400px;
      cursor: pointer;
      animation: slideIn 0.3s ease;
      backdrop-filter: blur(16px);
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .toast-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
    }
    .toast-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
    .toast-warning {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fcd34d;
    }
    .toast-info {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #93c5fd;
    }
    .toast-icon {
      font-size: 1rem;
      font-weight: 700;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
