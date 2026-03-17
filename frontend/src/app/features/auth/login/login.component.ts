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
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
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
