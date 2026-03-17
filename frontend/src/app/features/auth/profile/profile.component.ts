import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  profileForm!: FormGroup;
  isSaving = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.user = user;
      if (user) {
        this.profileForm = this.fb.group({
          name: [user.name, [Validators.required, Validators.minLength(2)]],
          phone: [user.phone || ''],
        });
      }
    });
    this.authService.getProfile().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;
    this.isSaving = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.toastService.success('Profile updated!');
      },
      error: () => {
        this.isSaving = false;
        this.toastService.error('Update failed');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.toastService.success('Signed out successfully');
    this.router.navigate(['/login']);
  }
}
