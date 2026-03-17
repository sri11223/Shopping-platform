import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Cart, CartItem } from '../../core/models/types';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  updatingItemId: string | null = null;
  removingItemId: string | null = null;
  isClearing = false;
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe(cart => {
      this.cart = cart;
    });
    this.cartService.loadCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateQty(item: CartItem, qty: number): void {
    if (qty < 1 || qty > 10 || this.updatingItemId) return;
    this.updatingItemId = item.product;
    this.cartService.updateQuantity(item.product, qty).subscribe({
      next: () => { this.updatingItemId = null; },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Update failed');
        this.updatingItemId = null;
      },
    });
  }

  removeItem(item: CartItem): void {
    if (this.removingItemId) return;
    this.removingItemId = item.product;
    this.cartService.removeItem(item.product).subscribe({
      next: () => {
        this.toastService.success('Item removed from cart');
        this.removingItemId = null;
      },
      error: () => {
        this.toastService.error('Failed to remove item');
        this.removingItemId = null;
      },
    });
  }

  clearCart(): void {
    if (this.isClearing) return;
    this.isClearing = true;
    this.cartService.clearCart().subscribe({
      next: () => {
        this.toastService.success('Cart cleared');
        this.isClearing = false;
      },
      error: () => {
        this.toastService.error('Failed to clear cart');
        this.isClearing = false;
      },
    });
  }

  getSubtotal(): number {
    if (!this.cart) return 0;
    return this.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getTax(): number {
    return this.getSubtotal() * 0.18;
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const shipping = subtotal >= 999 ? 0 : 99;
    return subtotal + this.getTax() + shipping;
  }

  getTotalItems(): number {
    if (!this.cart) return 0;
    return this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  trackByProduct(_: number, item: CartItem): string {
    return item.product;
  }
}
