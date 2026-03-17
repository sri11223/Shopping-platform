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
  template: `
    <div class="cart-page">
      <h1 class="page-title">Shopping Cart</h1>

      <!-- Empty Cart -->
      <div class="empty-cart" *ngIf="cart && cart.items.length === 0">
        <div class="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any items yet</p>
        <a routerLink="/products" class="btn-primary">Start Shopping</a>
      </div>

      <!-- Cart Content -->
      <div class="cart-layout" *ngIf="cart && cart.items.length > 0">
        <div class="cart-items">
          <div class="cart-header-row">
            <span class="col-product">Product</span>
            <span class="col-price">Price</span>
            <span class="col-qty">Quantity</span>
            <span class="col-total">Total</span>
            <span class="col-action"></span>
          </div>

          <div class="cart-item" *ngFor="let item of cart.items; trackBy: trackByProduct" id="cart-item-{{ item.product }}">
            <div class="item-product">
              <div class="item-img">
                <img [src]="item.image || 'https://via.placeholder.com/80'" [alt]="item.name" />
              </div>
              <div class="item-details">
                <a [routerLink]="['/products', item.product]" class="item-name">{{ item.name }}</a>
              </div>
            </div>
            <div class="item-price">₹{{ item.price | number }}</div>
            <div class="item-qty">
              <div class="qty-control">
                <button (click)="updateQty(item, item.quantity - 1)" [disabled]="item.quantity <= 1" class="qty-btn">−</button>
                <span class="qty-val">{{ item.quantity }}</span>
                <button (click)="updateQty(item, item.quantity + 1)" [disabled]="item.quantity >= 10" class="qty-btn">+</button>
              </div>
            </div>
            <div class="item-total">₹{{ item.price * item.quantity | number }}</div>
            <button class="item-remove" (click)="removeItem(item)" title="Remove">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>

          <div class="cart-actions">
            <button class="btn-clear" (click)="clearCart()">Clear Cart</button>
            <a routerLink="/products" class="btn-continue">← Continue Shopping</a>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="order-summary">
          <h3 class="summary-title">Order Summary</h3>
          <div class="summary-row">
            <span>Subtotal ({{ getTotalItems() }} items)</span>
            <span>₹{{ getSubtotal() | number }}</span>
          </div>
          <div class="summary-row">
            <span>Estimated Tax (18% GST)</span>
            <span>₹{{ getTax() | number:'1.2-2' }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span [class.free]="getSubtotal() >= 999">{{ getSubtotal() >= 999 ? 'FREE' : '₹99' }}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total">
            <span>Total</span>
            <span>₹{{ getTotal() | number:'1.2-2' }}</span>
          </div>
          <div class="free-shipping-notice" *ngIf="getSubtotal() < 999">
            Add ₹{{ 999 - getSubtotal() | number }} more for free shipping!
          </div>
          <a routerLink="/checkout" class="btn-checkout" id="checkout-btn">Proceed to Checkout</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-page {
      padding-top: 72px;
      max-width: 1200px;
      margin: 0 auto;
      padding-left: 32px;
      padding-right: 32px;
      min-height: 60vh;
    }
    .page-title {
      color: #f8fafc;
      font-size: 2rem;
      font-weight: 800;
      padding: 32px 0 24px;
    }
    /* Empty Cart */
    .empty-cart {
      text-align: center;
      padding: 80px 32px;
    }
    .empty-icon { font-size: 5rem; margin-bottom: 24px; }
    .empty-cart h2 { color: #e2e8f0; font-size: 1.5rem; margin-bottom: 8px; }
    .empty-cart p { color: #64748b; margin-bottom: 32px; }
    .btn-primary {
      display: inline-block;
      padding: 14px 32px;
      border-radius: 12px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      text-decoration: none;
      font-weight: 700;
      font-size: 1rem;
      transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; }
    /* Cart Layout */
    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
      padding-bottom: 64px;
    }
    .cart-header-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 40px;
      gap: 16px;
      padding: 12px 16px;
      color: #64748b;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .cart-item {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 40px;
      gap: 16px;
      padding: 20px 16px;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      transition: background 0.2s;
    }
    .cart-item:hover { background: rgba(30, 41, 59, 0.3); }
    .item-product { display: flex; align-items: center; gap: 16px; }
    .item-img {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
      background: #1e293b;
    }
    .item-img img { width: 100%; height: 100%; object-fit: cover; }
    .item-name {
      color: #e2e8f0;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      line-height: 1.4;
    }
    .item-name:hover { color: #3b82f6; }
    .item-price { color: #94a3b8; font-size: 0.95rem; }
    .item-total { color: #f8fafc; font-weight: 700; font-size: 1rem; }
    .qty-control {
      display: flex;
      align-items: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      overflow: hidden;
      width: fit-content;
    }
    .qty-btn {
      padding: 6px 12px;
      background: rgba(30, 41, 59, 0.5);
      border: none;
      color: #e2e8f0;
      font-size: 1rem;
      cursor: pointer;
    }
    .qty-btn:hover:not(:disabled) { background: rgba(59, 130, 246, 0.2); }
    .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .qty-val {
      padding: 6px 14px;
      color: #f8fafc;
      font-weight: 600;
      min-width: 36px;
      text-align: center;
    }
    .item-remove {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .item-remove:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
    .cart-actions {
      display: flex;
      justify-content: space-between;
      padding: 20px 16px;
    }
    .btn-clear {
      padding: 10px 20px;
      border-radius: 10px;
      border: 1px solid rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.1);
      color: #fca5a5;
      font-weight: 500;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-clear:hover { background: rgba(239, 68, 68, 0.2); }
    .btn-continue {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
    }
    /* Order Summary */
    .order-summary {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 28px;
      height: fit-content;
      position: sticky;
      top: 104px;
    }
    .summary-title {
      color: #f8fafc;
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      color: #94a3b8;
      font-size: 0.95rem;
    }
    .summary-row .free { color: #10b981; font-weight: 600; }
    .summary-row.total {
      color: #f8fafc;
      font-weight: 700;
      font-size: 1.15rem;
    }
    .summary-divider {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      margin: 8px 0;
    }
    .free-shipping-notice {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 10px;
      padding: 10px 14px;
      color: #fcd34d;
      font-size: 0.8rem;
      margin-top: 16px;
      text-align: center;
    }
    .btn-checkout {
      display: block;
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      margin-top: 20px;
      transition: opacity 0.2s;
      box-sizing: border-box;
    }
    .btn-checkout:hover { opacity: 0.9; }
    @media (max-width: 1024px) {
      .cart-layout { grid-template-columns: 1fr; }
      .order-summary { position: static; }
    }
    @media (max-width: 768px) {
      .cart-header-row { display: none; }
      .cart-item {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .item-product { order: 1; }
      .item-price { order: 2; }
      .item-qty { order: 3; }
      .item-total { order: 4; font-size: 1.1rem; }
      .item-remove { order: 5; justify-self: end; }
    }
  `]
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
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
    if (qty < 1 || qty > 10) return;
    this.cartService.updateQuantity(item.product, qty).subscribe({
      error: (err) => this.toastService.error(err.error?.message || 'Update failed'),
    });
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.product).subscribe({
      next: () => this.toastService.success('Item removed from cart'),
      error: () => this.toastService.error('Failed to remove item'),
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => this.toastService.success('Cart cleared'),
      error: () => this.toastService.error('Failed to clear cart'),
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
