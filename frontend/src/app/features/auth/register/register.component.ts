import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo-icon">🛍️</div>
          <h1>Create Account</h1>
          <p>Join LuxeStore for exclusive access</p>
        </div>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input id="name" formControlName="name" placeholder="Enter your name" autocomplete="name" />
            <span class="error" *ngIf="isFieldInvalid('name')">Name is required (min 2 chars)</span>
          </div>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input id="email" type="email" formControlName="email" placeholder="you@example.com" autocomplete="email" />
            <span class="error" *ngIf="isFieldInvalid('email')">Valid email is required</span>
          </div>
          <div class="form-group">
            <label for="phone">Phone (optional)</label>
            <input id="phone" formControlName="phone" placeholder="10-digit mobile number" />
            <span class="error" *ngIf="isFieldInvalid('phone')">Valid 10-digit phone required</span>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="Min 6 characters" autocomplete="new-password" />
            <button type="button" class="toggle-password" (click)="showPassword = !showPassword">{{ showPassword ? '🙈' : '👁️' }}</button>
            <span class="error" *ngIf="isFieldInvalid('password')">Password must be at least 6 characters</span>
          </div>
          <button type="submit" class="btn-submit" [disabled]="isLoading" id="register-submit">
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>
        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      background: radial-gradient(ellipse at top, rgba(16,185,129,0.06) 0%, transparent 60%);
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 40px;
      backdrop-filter: blur(20px);
    }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .logo-icon { font-size: 3rem; margin-bottom: 12px; }
    .auth-header h1 { color: #f8fafc; font-size: 1.8rem; font-weight: 800; margin-bottom: 6px; }
    .auth-header p { color: #64748b; font-size: 0.95rem; }
    .form-group { margin-bottom: 18px; position: relative; }
    .form-group label {
      display: block;
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .form-group input {
      width: 100%;
      padding: 14px 16px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: #e2e8f0;
      font-size: 0.95rem;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-group input:focus { outline: none; border-color: #10b981; }
    .form-group input::placeholder { color: #475569; }
    .toggle-password {
      position: absolute;
      right: 14px;
      top: 36px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }
    .error { color: #fca5a5; font-size: 0.75rem; margin-top: 4px; display: block; }
    .btn-submit {
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 8px;
    }
    .btn-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-footer { text-align: center; margin-top: 24px; color: #64748b; font-size: 0.9rem; }
    .auth-footer a { color: #10b981; font-weight: 600; text-decoration: none; }
    .auth-footer a:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[6-9]\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.registerForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(k => this.registerForm.get(k)?.markAsTouched());
      return;
    }
    this.isLoading = true;
    const { name, email, password, phone } = this.registerForm.value;
    this.authService.register(name, email, password, phone).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Account created successfully! Welcome!');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(err.error?.message || 'Registration failed');
      }
    });
  }
}
