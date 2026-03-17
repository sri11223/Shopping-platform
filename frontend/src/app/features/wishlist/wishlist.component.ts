import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/types';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="wishlist-page">
      <h1 class="page-title">❤️ My Wishlist</h1>

      <!-- Loading -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Loading wishlist...</p>
      </div>

      <!-- Empty -->
      <div class="empty-state" *ngIf="!isLoading && wishlist.length === 0">
        <div class="empty-icon">💔</div>
        <h2>Your wishlist is empty</h2>
        <p>Save items you love to find them later</p>
        <a routerLink="/products" class="btn-primary">Browse Products</a>
      </div>

      <!-- Wishlist Grid -->
      <div class="wishlist-grid" *ngIf="!isLoading && wishlist.length > 0">
        <div class="wish-card" *ngFor="let product of wishlist">
          <button class="remove-btn" (click)="removeFromWishlist(product._id)" title="Remove from wishlist">✕</button>
          <a [routerLink]="['/products', product._id]" class="wish-link">
            <div class="wish-img">
              <img [src]="product.images?.[0] || 'https://via.placeholder.com/240'" [alt]="product.name" />
            </div>
            <div class="wish-info">
              <span class="wish-brand">{{ product.brand }}</span>
              <h3 class="wish-name">{{ product.name }}</h3>
              <div class="wish-price">
                <span class="price">₹{{ product.price | number }}</span>
                <span class="mrp" *ngIf="product.originalPrice && product.originalPrice > product.price">₹{{ product.originalPrice | number }}</span>
                <span class="discount" *ngIf="product.originalPrice && product.originalPrice > product.price">{{ getDiscount(product) }}% off</span>
              </div>
            </div>
          </a>
          <button class="btn-move-cart" (click)="moveToCart(product)">
            🛒 Move to Cart
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wishlist-page {
      padding-top:72px;max-width:1200px;margin:0 auto;padding-left:32px;padding-right:32px;min-height:60vh;padding-bottom:64px;
    }
    .page-title { color:#f8fafc;font-size:2rem;font-weight:800;padding:32px 0 24px; }
    .loading,.empty-state { text-align:center;padding:80px 32px; }
    .spinner { width:40px;height:40px;border:4px solid rgba(59,130,246,0.2);border-top-color:#3b82f6;border-radius:50%;animation:spin 0.8s ease infinite;margin:0 auto 16px; }
    @keyframes spin { to { transform:rotate(360deg) } }
    .loading p { color:#64748b; }
    .empty-icon { font-size:4rem;margin-bottom:16px; }
    .empty-state h2 { color:#e2e8f0;margin-bottom:8px; }
    .empty-state p { color:#64748b;margin-bottom:24px; }
    .btn-primary { display:inline-block;padding:14px 32px;border-radius:12px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;text-decoration:none;font-weight:700; }
    .wishlist-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:24px; }
    .wish-card {
      background: rgba(30,41,59,0.5);border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;position:relative;transition:all 0.2s;
    }
    .wish-card:hover { border-color:rgba(59,130,246,0.2);transform:translateY(-2px); }
    .remove-btn {
      position:absolute;top:12px;right:12px;z-index:2;width:32px;height:32px;border-radius:50%;
      background:rgba(15,23,42,0.7);border:1px solid rgba(255,255,255,0.1);color:#fca5a5;
      font-size:0.8rem;cursor:pointer;backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;
    }
    .remove-btn:hover { background:rgba(239,68,68,0.2); }
    .wish-link { text-decoration:none; }
    .wish-img { height:220px;overflow:hidden; }
    .wish-img img { width:100%;height:100%;object-fit:cover;transition:transform 0.3s; }
    .wish-card:hover .wish-img img { transform:scale(1.05); }
    .wish-info { padding:16px; }
    .wish-brand { color:#64748b;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px; }
    .wish-name { color:#e2e8f0;font-size:0.95rem;font-weight:600;margin:6px 0 10px;line-height:1.3; }
    .wish-price { display:flex;align-items:center;gap:8px; }
    .price { color:#f8fafc;font-weight:700;font-size:1.05rem; }
    .mrp { color:#64748b;text-decoration:line-through;font-size:0.85rem; }
    .discount { color:#10b981;font-size:0.8rem;font-weight:600; }
    .btn-move-cart {
      width:calc(100% - 32px);margin:0 16px 16px;padding:10px;border-radius:10px;
      background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);
      color:#93c5fd;font-weight:600;font-size:0.85rem;cursor:pointer;transition:all 0.2s;
    }
    .btn-move-cart:hover { background:rgba(59,130,246,0.2); }
    @media (max-width:640px) { .wishlist-grid { grid-template-columns:1fr 1fr; } }
  `]
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlist: Product[] = [];
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.authService.getWishlist().pipe(takeUntil(this.destroy$)).subscribe({
      next: (items) => {
        this.wishlist = items;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Failed to load wishlist');
      }
    });
  }

  removeFromWishlist(productId: string): void {
    this.authService.toggleWishlist(productId).subscribe({
      next: () => {
        this.wishlist = this.wishlist.filter(p => p._id !== productId);
        this.toastService.success('Removed from wishlist');
      }
    });
  }

  moveToCart(product: Product): void {
    this.cartService.addToCart(product._id, 1).subscribe({
      next: () => {
        this.toastService.success('Moved to cart!');
        this.removeFromWishlist(product._id);
      },
      error: () => this.toastService.error('Failed to add to cart')
    });
  }

  getDiscount(product: Product): number {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }
}
