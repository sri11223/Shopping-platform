import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo-icon">👜</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your LuxeStore account</p>
        </div>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input id="email" type="email" formControlName="email" placeholder="you@example.com" autocomplete="email" />
            <span class="error" *ngIf="isFieldInvalid('email')">Valid email is required</span>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="Enter your password" autocomplete="current-password" />
            <button type="button" class="toggle-password" (click)="showPassword = !showPassword">{{ showPassword ? '🙈' : '👁️' }}</button>
            <span class="error" *ngIf="isFieldInvalid('password')">Password is required</span>
          </div>
          <button type="submit" class="btn-submit" [disabled]="isLoading" id="login-submit">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Create one</a></p>
        </div>
        <div class="demo-creds">
          <p class="demo-title">🧪 Demo Credentials</p>
          <p>Email: <strong>demo&#64;luxestore.com</strong></p>
          <p>Password: <strong>demo123</strong></p>
          <button class="btn-demo" (click)="fillDemo()">Fill Demo</button>
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
      background: radial-gradient(ellipse at top, rgba(59,130,246,0.08) 0%, transparent 60%);
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
    .form-group { margin-bottom: 20px; position: relative; }
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
    .form-group input:focus { outline: none; border-color: #3b82f6; }
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
      background: linear-gradient(135deg, #3b82f6, #2563eb);
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
    .auth-footer a { color: #3b82f6; font-weight: 600; text-decoration: none; }
    .auth-footer a:hover { text-decoration: underline; }
    .demo-creds {
      margin-top: 24px;
      padding: 16px;
      border-radius: 12px;
      background: rgba(59, 130, 246, 0.06);
      border: 1px solid rgba(59, 130, 246, 0.15);
      text-align: center;
      font-size: 0.8rem;
      color: #94a3b8;
    }
    .demo-title { color: #93c5fd; font-weight: 600; margin-bottom: 8px; }
    .demo-creds strong { color: #e2e8f0; }
    .btn-demo {
      margin-top: 10px;
      padding: 6px 20px;
      border-radius: 8px;
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #93c5fd;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-demo:hover { background: rgba(59, 130, 246, 0.25); }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  fillDemo(): void {
    this.loginForm.patchValue({ email: 'demo@luxestore.com', password: 'demo123' });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(k => this.loginForm.get(k)?.markAsTouched());
      return;
    }
    this.isLoading = true;
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Welcome back!');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(err.error?.message || 'Login failed. Please try again.');
      }
    });
  }
}
