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
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlist: Product[] = [];
  isLoading = true;
  movingToCartId: string | null = null;
  removingId: string | null = null;
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
    if (this.removingId) return;
    this.removingId = productId;
    this.authService.toggleWishlist(productId).subscribe({
      next: () => {
        this.wishlist = this.wishlist.filter(p => p._id !== productId);
        this.toastService.success('Removed from wishlist');
        this.removingId = null;
      },
      error: () => {
        this.toastService.error('Failed to remove');
        this.removingId = null;
      }
    });
  }

  moveToCart(product: Product): void {
    if (this.movingToCartId) return;
    this.movingToCartId = product._id;
    this.cartService.addToCart(product._id, 1).subscribe({
      next: () => {
        this.toastService.success('Moved to cart!');
        this.movingToCartId = null;
        this.removeFromWishlist(product._id);
      },
      error: () => {
        this.toastService.error('Failed to add to cart');
        this.movingToCartId = null;
      }
    });
  }

  getDiscount(product: Product): number {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }
}
