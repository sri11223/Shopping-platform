import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Cart } from '../../core/models/types';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="checkout-page">
      <h1 class="page-title">Checkout</h1>

      <!-- Redirect if empty -->
      <div class="empty-state" *ngIf="cart && cart.items.length === 0">
        <h2>No items to checkout</h2>
        <p>Add items to your cart first</p>
        <a routerLink="/products" class="btn-primary">Browse Products</a>
      </div>

      <div class="checkout-layout" *ngIf="cart && cart.items.length > 0">
        <!-- Shipping Form -->
        <div class="form-section">
          <div class="section-card">
            <h2 class="section-heading">
              <span class="step-number">1</span>
              Shipping Information
            </h2>
            <form [formGroup]="shippingForm">
              <div class="form-row">
                <div class="form-group">
                  <label for="fullName">Full Name *</label>
                  <input id="fullName" formControlName="fullName" placeholder="Enter your full name" />
                  <span class="error" *ngIf="isFieldInvalid('fullName')">Full name is required</span>
                </div>
                <div class="form-group">
                  <label for="email">Email *</label>
                  <input id="email" formControlName="email" type="email" placeholder="your@email.com" />
                  <span class="error" *ngIf="isFieldInvalid('email')">Valid email is required</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="phone">Phone *</label>
                  <input id="phone" formControlName="phone" placeholder="10-digit mobile number" />
                  <span class="error" *ngIf="isFieldInvalid('phone')">Valid 10-digit phone is required</span>
                </div>
                <div class="form-group">
                  <label for="pincode">Pincode *</label>
                  <input id="pincode" formControlName="pincode" placeholder="6-digit pincode" />
                  <span class="error" *ngIf="isFieldInvalid('pincode')">Valid 6-digit pincode required</span>
                </div>
              </div>

              <div class="form-group full">
                <label for="addressLine1">Address Line 1 *</label>
                <input id="addressLine1" formControlName="addressLine1" placeholder="House no., Street name" />
                <span class="error" *ngIf="isFieldInvalid('addressLine1')">Address is required</span>
              </div>

              <div class="form-group full">
                <label for="addressLine2">Address Line 2</label>
                <input id="addressLine2" formControlName="addressLine2" placeholder="Landmark, Area (optional)" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="city">City *</label>
                  <input id="city" formControlName="city" placeholder="City" />
                  <span class="error" *ngIf="isFieldInvalid('city')">City is required</span>
                </div>
                <div class="form-group">
                  <label for="state">State *</label>
                  <input id="state" formControlName="state" placeholder="State" />
                  <span class="error" *ngIf="isFieldInvalid('state')">State is required</span>
                </div>
              </div>
            </form>
          </div>

          <div class="section-card">
            <h2 class="section-heading">
              <span class="step-number">2</span>
              Additional Notes
            </h2>
            <div class="form-group full">
              <textarea
                [(ngModel)]="notes"
                placeholder="Any special instructions for delivery..."
                class="notes-input"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Order Review -->
        <div class="summary-section">
          <div class="section-card">
            <h3 class="summary-heading">Order Review</h3>

            <div class="review-items">
              <div class="review-item" *ngFor="let item of cart.items">
                <div class="review-img">
                  <img [src]="item.image || 'https://via.placeholder.com/48'" [alt]="item.name" />
                </div>
                <div class="review-details">
                  <span class="review-name">{{ item.name }}</span>
                  <span class="review-qty">Qty: {{ item.quantity }}</span>
                </div>
                <span class="review-price">₹{{ item.price * item.quantity | number }}</span>
              </div>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹{{ getSubtotal() | number }}</span>
            </div>
            <div class="summary-row">
              <span>GST (18%)</span>
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

            <button
              class="btn-place-order"
              (click)="placeOrder()"
              [disabled]="isSubmitting"
              id="place-order-btn"
            >
              {{ isSubmitting ? 'Placing Order...' : 'Place Order' }}
            </button>

            <p class="secure-notice">🔒 Your information is secure and encrypted</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page {
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
    .empty-state {
      text-align: center;
      padding: 80px 32px;
    }
    .empty-state h2 { color: #e2e8f0; margin-bottom: 8px; }
    .empty-state p { color: #64748b; margin-bottom: 24px; }
    .btn-primary {
      display: inline-block;
      padding: 14px 32px;
      border-radius: 12px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      text-decoration: none;
      font-weight: 700;
    }
    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 32px;
      padding-bottom: 64px;
    }
    .section-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 24px;
    }
    .section-heading {
      color: #f8fafc;
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group.full {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .form-group input, .notes-input {
      width: 100%;
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #e2e8f0;
      font-size: 0.95rem;
      transition: border-color 0.2s;
      box-sizing: border-box;
      font-family: inherit;
    }
    .form-group input:focus, .notes-input:focus {
      outline: none;
      border-color: #3b82f6;
    }
    .form-group input::placeholder, .notes-input::placeholder { color: #475569; }
    .form-group input.ng-invalid.ng-touched {
      border-color: #ef4444;
    }
    .error {
      color: #fca5a5;
      font-size: 0.75rem;
      margin-top: 4px;
      display: block;
    }
    .notes-input {
      resize: vertical;
      min-height: 80px;
    }
    /* Summary */
    .summary-heading {
      color: #f8fafc;
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .review-items { max-height: 300px; overflow-y: auto; }
    .review-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
    }
    .review-img {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      overflow: hidden;
      flex-shrink: 0;
      background: #1e293b;
    }
    .review-img img { width: 100%; height: 100%; object-fit: cover; }
    .review-details { flex: 1; min-width: 0; }
    .review-name {
      display: block;
      color: #e2e8f0;
      font-size: 0.85rem;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .review-qty { color: #64748b; font-size: 0.8rem; }
    .review-price { color: #f8fafc; font-weight: 600; font-size: 0.95rem; white-space: nowrap; }
    .summary-divider { border-top: 1px solid rgba(255, 255, 255, 0.06); margin: 16px 0; }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      color: #94a3b8;
      font-size: 0.95rem;
    }
    .summary-row .free { color: #10b981; font-weight: 600; }
    .summary-row.total { color: #f8fafc; font-weight: 700; font-size: 1.2rem; }
    .btn-place-order {
      display: block;
      width: 100%;
      padding: 16px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      font-weight: 700;
      font-size: 1.05rem;
      cursor: pointer;
      margin-top: 24px;
      transition: all 0.2s;
    }
    .btn-place-order:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-place-order:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .secure-notice {
      text-align: center;
      color: #64748b;
      font-size: 0.8rem;
      margin-top: 12px;
    }
    @media (max-width: 1024px) {
      .checkout-layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .form-row { grid-template-columns: 1fr; }
      .checkout-page { padding-left: 16px; padding-right: 16px; }
    }
  `]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  shippingForm!: FormGroup;
  cart: Cart | null = null;
  notes = '';
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private toastService: ToastService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.shippingForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      addressLine1: ['', [Validators.required, Validators.minLength(5)]],
      addressLine2: [''],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      country: ['India'],
    });

    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe(cart => {
      this.cart = cart;
      if (cart && cart.items.length === 0) {
        // Optional: redirect back
      }
    });
    this.cartService.loadCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.shippingForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
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

  placeOrder(): void {
    if (this.shippingForm.invalid) {
      Object.keys(this.shippingForm.controls).forEach(key => {
        this.shippingForm.get(key)?.markAsTouched();
      });
      this.toastService.error('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting = true;
    const shippingAddress = this.shippingForm.value;

    // Step 1: Create the order
    this.orderService.createOrder(shippingAddress, this.notes).subscribe({
      next: (order) => {
        // Step 2: Initiate Razorpay payment
        this.orderService.createPayment(order.orderNumber).subscribe({
          next: (paymentData) => {
            this.openRazorpayCheckout(paymentData, order.orderNumber);
          },
          error: (err) => {
            this.isSubmitting = false;
            // If payment init fails, still redirect to order page (COD fallback)
            this.toastService.warning('Payment init failed. Order placed as Cash on Delivery.');
            this.router.navigate(['/orders', order.orderNumber]);
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.message || 'Failed to place order');
      }
    });
  }

  private openRazorpayCheckout(paymentData: any, orderNumber: string): void {
    const options = {
      key: paymentData.keyId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: 'LuxeStore',
      description: `Order ${orderNumber}`,
      order_id: paymentData.orderId,
      theme: {
        color: '#3b82f6',
        backdrop_color: 'rgba(15, 23, 42, 0.85)',
      },
      prefill: {
        name: this.shippingForm.value.fullName,
        email: this.shippingForm.value.email,
        contact: this.shippingForm.value.phone,
      },
      handler: (response: any) => {
        this.ngZone.run(() => {
          // Step 3: Verify payment
          this.orderService.verifyPayment(orderNumber, {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          }).subscribe({
            next: () => {
              this.isSubmitting = false;
              this.toastService.success('Payment successful! Order confirmed.');
              this.router.navigate(['/orders', orderNumber]);
            },
            error: () => {
              this.isSubmitting = false;
              this.toastService.error('Payment verification failed');
              this.router.navigate(['/orders', orderNumber]);
            }
          });
        });
      },
      modal: {
        ondismiss: () => {
          this.ngZone.run(() => {
            this.isSubmitting = false;
            this.toastService.warning('Payment cancelled. Your order is saved.');
            this.router.navigate(['/orders', orderNumber]);
          });
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }
}
