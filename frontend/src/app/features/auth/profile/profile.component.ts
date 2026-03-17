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
  template: `
    <div class="profile-page" *ngIf="user">
      <div class="profile-header">
        <div class="avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
        <h1>{{ user.name }}</h1>
        <p>{{ user.email }}</p>
        <span class="member-since">Member since {{ user.createdAt | date:'MMMM yyyy' }}</span>
      </div>

      <div class="profile-layout">
        <!-- Profile Details Card -->
        <div class="profile-card">
          <h2 class="card-title">
            <span class="title-icon">👤</span>
            Personal Information
          </h2>
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <div class="form-group">
              <label>Full Name</label>
              <input formControlName="name" placeholder="Your name" />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input formControlName="phone" placeholder="10-digit mobile" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input [value]="user.email" disabled class="disabled-input" />
              <span class="hint">Email cannot be changed</span>
            </div>
            <button type="submit" class="btn-save" [disabled]="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>

        <!-- Quick Links Card -->
        <div class="profile-card">
          <h2 class="card-title">
            <span class="title-icon">⚡</span>
            Quick Links
          </h2>
          <div class="quick-links">
            <a routerLink="/wishlist" class="quick-link">
              <span class="ql-icon">❤️</span>
              <span class="ql-text">
                <strong>My Wishlist</strong>
                <span>{{ user.wishlist?.length || 0 }} items saved</span>
              </span>
              <span class="ql-arrow">→</span>
            </a>
            <a routerLink="/cart" class="quick-link">
              <span class="ql-icon">🛒</span>
              <span class="ql-text">
                <strong>Shopping Cart</strong>
                <span>View your cart</span>
              </span>
              <span class="ql-arrow">→</span>
            </a>
            <a routerLink="/products" class="quick-link">
              <span class="ql-icon">🛍️</span>
              <span class="ql-text">
                <strong>Browse Products</strong>
                <span>Discover new items</span>
              </span>
              <span class="ql-arrow">→</span>
            </a>
          </div>

          <button class="btn-logout" (click)="logout()">
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding-top: 72px;
      max-width: 900px;
      margin: 0 auto;
      padding-left: 24px;
      padding-right: 24px;
      padding-bottom: 64px;
    }
    .profile-header {
      text-align: center;
      padding: 48px 32px 32px;
    }
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      font-size: 2rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    .profile-header h1 { color: #f8fafc; font-size: 1.6rem; font-weight: 700; margin-bottom: 4px; }
    .profile-header p { color: #94a3b8; margin-bottom: 4px; }
    .member-since { color: #64748b; font-size: 0.8rem; }
    .profile-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .profile-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 28px;
    }
    .card-title {
      color: #f8fafc;
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .title-icon { font-size: 1.2rem; }
    .form-group { margin-bottom: 16px; }
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
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #e2e8f0;
      font-size: 0.95rem;
      box-sizing: border-box;
    }
    .form-group input:focus { outline: none; border-color: #3b82f6; }
    .disabled-input { opacity: 0.5; cursor: not-allowed; }
    .hint { color: #64748b; font-size: 0.7rem; margin-top: 4px; display: block; }
    .btn-save {
      padding: 12px 24px;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-save:disabled { opacity: 0.5; }
    .quick-links { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .quick-link {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 12px;
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.04);
      text-decoration: none;
      transition: all 0.2s;
    }
    .quick-link:hover { background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.15); }
    .ql-icon { font-size: 1.4rem; }
    .ql-text { flex: 1; }
    .ql-text strong { display: block; color: #e2e8f0; font-size: 0.9rem; }
    .ql-text span { color: #64748b; font-size: 0.8rem; }
    .ql-arrow { color: #64748b; font-size: 1.2rem; }
    .btn-logout {
      width: 100%;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid rgba(239, 68, 68, 0.2);
      background: rgba(239, 68, 68, 0.08);
      color: #fca5a5;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-logout:hover { background: rgba(239, 68, 68, 0.15); }
    @media (max-width: 768px) {
      .profile-layout { grid-template-columns: 1fr; }
    }
  `]
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
