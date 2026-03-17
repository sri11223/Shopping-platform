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
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
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
