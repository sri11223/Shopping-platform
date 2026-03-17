import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-inner">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <span class="logo-icon">👜</span>
          <span class="logo-text">Luxe<span class="logo-accent">Store</span></span>
        </a>

        <!-- Nav Links -->
        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Home</a>
          <a routerLink="/products" routerLinkActive="active" class="nav-link">Products</a>
          <div class="nav-dropdown">
            <button class="nav-link dropdown-trigger">
              Categories <span class="caret">▾</span>
            </button>
            <div class="dropdown-menu">
              <a *ngFor="let cat of categories"
                 [routerLink]="['/products']"
                 [queryParams]="{category: cat.name}"
                 class="dropdown-item">
                <span class="dd-emoji">{{ cat.emoji }}</span>
                {{ cat.name }}
              </a>
            </div>
          </div>
        </nav>

        <!-- Right Actions -->
        <div class="header-actions">
          <!-- Search toggle -->
          <button class="action-btn" (click)="toggleSearch()" title="Search">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>

          <!-- Wishlist (only when logged in) -->
          <a routerLink="/wishlist" class="action-btn" title="Wishlist" *ngIf="user">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span class="badge-count wish-badge" *ngIf="user?.wishlist?.length">{{ user.wishlist.length }}</span>
          </a>

          <!-- Cart -->
          <a routerLink="/cart" class="action-btn cart-action" id="cart-icon" title="Cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span class="badge-count cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
          </a>

          <!-- User Menu -->
          <div class="user-menu" *ngIf="user">
            <button class="user-avatar" (click)="showUserMenu = !showUserMenu">
              {{ user.name.charAt(0).toUpperCase() }}
            </button>
            <div class="user-dropdown" *ngIf="showUserMenu" (mouseleave)="showUserMenu = false">
              <div class="user-info">
                <strong>{{ user.name }}</strong>
                <span>{{ user.email }}</span>
              </div>
              <a routerLink="/profile" class="ud-link" (click)="showUserMenu = false">👤 My Profile</a>
              <a routerLink="/my-orders" class="ud-link" (click)="showUserMenu = false">📦 My Orders</a>
              <a routerLink="/wishlist" class="ud-link" (click)="showUserMenu = false">❤️ Wishlist</a>
              <a routerLink="/cart" class="ud-link" (click)="showUserMenu = false">🛒 Cart</a>
              <div class="ud-divider"></div>
              <button class="ud-link logout-link" (click)="logout()">🚪 Sign Out</button>
            </div>
          </div>

          <!-- Login/Register (when not logged in) -->
          <a routerLink="/login" class="btn-signin" *ngIf="!user">Sign In</a>
        </div>
      </div>

      <!-- Search Overlay -->
      <div class="search-overlay" *ngIf="showSearch">
        <div class="search-bar">
          <input
            #searchInput
            type="text"
            placeholder="Search products..."
            (keydown.enter)="search(searchInput.value)"
            (keydown.escape)="showSearch = false"
            autofocus
          />
          <button (click)="search(searchInput.value)">Search</button>
          <button class="close-search" (click)="showSearch = false">✕</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .header-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 32px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .logo-icon { font-size: 1.5rem; }
    .logo-text { color: #f8fafc; font-weight: 800; font-size: 1.3rem; font-family:'Outfit',sans-serif; }
    .logo-accent { color: #3b82f6; }
    .nav { display: flex; align-items: center; gap: 4px; }
    .nav-link {
      padding: 8px 16px;
      color: #94a3b8;
      font-weight: 500;
      font-size: 0.9rem;
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.2s;
      border: none;
      background: none;
      cursor: pointer;
    }
    .nav-link:hover { color: #e2e8f0; background: rgba(255,255,255,0.04); }
    .nav-link.active { color: #3b82f6; background: rgba(59,130,246,0.08); }
    .nav-dropdown { position: relative; }
    .caret { font-size: 0.7rem; margin-left: 2px; }
    .dropdown-menu {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 200px;
      padding: 8px;
      background: rgba(30, 41, 59, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.4);
      margin-top: 4px;
    }
    .nav-dropdown:hover .dropdown-menu { display: block; }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      color: #e2e8f0;
      font-size: 0.9rem;
      text-decoration: none;
      border-radius: 10px;
      transition: background 0.15s;
    }
    .dropdown-item:hover { background: rgba(59,130,246,0.1); }
    .dd-emoji { font-size: 1rem; }
    .header-actions { display: flex; align-items: center; gap: 8px; }
    .action-btn {
      position: relative;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(30,41,59,0.3);
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
    }
    .action-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.06); }
    .badge-count {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      border-radius: 10px;
      font-size: 0.65rem;
      font-weight: 700;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    .cart-badge { background: #3b82f6; animation: popIn 0.3s ease; }
    .wish-badge { background: #ef4444; }
    @keyframes popIn { 0% { transform: scale(0); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
    .user-menu { position: relative; }
    .user-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      font-weight: 700;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .user-avatar:hover { transform: scale(1.05); }
    .user-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 220px;
      padding: 8px;
      background: rgba(30, 41, 59, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.4);
    }
    .user-info { padding: 12px 14px 8px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 4px; }
    .user-info strong { display: block; color: #f8fafc; font-size: 0.9rem; }
    .user-info span { color: #64748b; font-size: 0.8rem; }
    .ud-link {
      display: block;
      padding: 10px 14px;
      color: #e2e8f0;
      font-size: 0.9rem;
      text-decoration: none;
      border-radius: 10px;
      transition: background 0.15s;
      border: none;
      background: none;
      cursor: pointer;
      width: 100%;
      text-align: left;
    }
    .ud-link:hover { background: rgba(59,130,246,0.1); }
    .ud-divider { border-top: 1px solid rgba(255,255,255,0.06); margin: 4px 0; }
    .logout-link { color: #fca5a5; }
    .logout-link:hover { background: rgba(239,68,68,0.1); }
    .btn-signin {
      padding: 8px 20px;
      border-radius: 10px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.85rem;
      transition: opacity 0.2s;
    }
    .btn-signin:hover { opacity: 0.9; }
    /* Search Overlay */
    .search-overlay {
      position: absolute;
      top: 72px;
      left: 0;
      right: 0;
      padding: 16px 32px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      animation: slideDown 0.2s ease;
    }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .search-bar {
      max-width: 600px;
      margin: 0 auto;
      display: flex;
      gap: 8px;
    }
    .search-bar input {
      flex: 1;
      padding: 12px 16px;
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: #e2e8f0;
      font-size: 0.95rem;
      box-sizing: border-box;
    }
    .search-bar input:focus { outline: none; border-color: #3b82f6; }
    .search-bar button {
      padding: 12px 20px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      font-weight: 600;
      cursor: pointer;
    }
    .close-search { background: rgba(255,255,255,0.06) !important; color: #94a3b8 !important; }
    @media (max-width: 768px) {
      .nav { display: none; }
      .header-inner { padding: 0 16px; }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: User | null = null;
  cartCount = 0;
  showSearch = false;
  showUserMenu = false;
  categories = [
    { name: 'Shirts', emoji: '👔' },
    { name: 'Jeans', emoji: '👖' },
    { name: 'Jackets', emoji: '🧥' },
    { name: 'Dresses', emoji: '👗' },
    { name: 'Shoes', emoji: '👟' },
    { name: 'Watches', emoji: '⌚' },
    { name: 'Bags', emoji: '👜' },
    { name: 'Accessories', emoji: '🕶️' },
  ];
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.user = user;
    });
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe(cart => {
      this.cartCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
  }

  search(query: string): void {
    if (query.trim()) {
      this.showSearch = false;
      this.router.navigate(['/products'], { queryParams: { search: query.trim() } });
    }
  }

  logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
