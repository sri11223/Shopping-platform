import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts: Toast[] = [];
  private toastSubject = new BehaviorSubject<Toast[]>([]);
  private counter = 0;

  toasts$ = this.toastSubject.asObservable();

  show(message: string, type: Toast['type'] = 'info', duration: number = 3000): void {
    const toast: Toast = {
      id: ++this.counter,
      message,
      type,
      duration,
    };

    this.toasts.push(toast);
    this.toastSubject.next([...this.toasts]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', 5000);
  }

  warning(message: string): void {
    this.show(message, 'warning', 4000);
  }

  dismiss(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastSubject.next([...this.toasts]);
  }
}
