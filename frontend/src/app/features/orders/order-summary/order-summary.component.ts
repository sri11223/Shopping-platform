import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order } from '../../../core/models/types';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="order-page" *ngIf="order">
      <!-- Success Banner -->
      <div class="success-banner">
        <div class="success-icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p>Your order <strong>{{ order.orderNumber }}</strong> has been confirmed</p>
      </div>

      <div class="order-layout">
        <!-- Order Details -->
        <div class="detail-section">
          <div class="detail-card">
            <h2 class="card-title">Order Details</h2>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Order Number</span>
                <span class="detail-value highlight">{{ order.orderNumber }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Order Date</span>
                <span class="detail-value">{{ order.createdAt | date:'medium' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status</span>
                <span class="status-badge status-{{ order.status }}">{{ order.status | titlecase }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment</span>
                <span class="status-badge payment-{{ order.paymentStatus }}">{{ order.paymentStatus | titlecase }}</span>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="detail-card">
            <h2 class="card-title">Items Ordered</h2>
            <div class="order-items">
              <div class="order-item" *ngFor="let item of order.items">
                <div class="order-item-img">
                  <img [src]="item.image || 'https://via.placeholder.com/64'" [alt]="item.name" />
                </div>
                <div class="order-item-info">
                  <span class="order-item-name">{{ item.name }}</span>
                  <span class="order-item-qty">Qty: {{ item.quantity }} × ₹{{ item.price | number }}</span>
                </div>
                <span class="order-item-total">₹{{ item.price * item.quantity | number }}</span>
              </div>
            </div>
          </div>

          <!-- Shipping -->
          <div class="detail-card">
            <h2 class="card-title">Shipping Address</h2>
            <div class="address-block">
              <p class="address-name">{{ order.shippingAddress.fullName }}</p>
              <p>{{ order.shippingAddress.addressLine1 }}</p>
              <p *ngIf="order.shippingAddress.addressLine2">{{ order.shippingAddress.addressLine2 }}</p>
              <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} - {{ order.shippingAddress.pincode }}</p>
              <p>{{ order.shippingAddress.country }}</p>
              <p class="address-contact">📧 {{ order.shippingAddress.email }} | 📱 {{ order.shippingAddress.phone }}</p>
            </div>
          </div>
        </div>

        <!-- Price Summary -->
        <div class="summary-sidebar">
          <div class="detail-card">
            <h3 class="card-title">Payment Summary</h3>
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹{{ order.subtotal | number }}</span>
            </div>
            <div class="summary-row">
              <span>Tax (GST)</span>
              <span>₹{{ order.tax | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span [class.free]="order.shippingCharge === 0">{{ order.shippingCharge === 0 ? 'FREE' : '₹' + order.shippingCharge }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row total">
              <span>Total Paid</span>
              <span>₹{{ order.totalAmount | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="action-buttons">
            <a routerLink="/products" class="btn-continue">Continue Shopping</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div class="loading-state" *ngIf="isLoading">
      <div class="spinner"></div>
      <p>Loading order details...</p>
    </div>

    <!-- Error -->
    <div class="error-state" *ngIf="!isLoading && !order">
      <h2>Order not found</h2>
      <p>The order you're looking for doesn't exist</p>
      <a routerLink="/products" class="btn-primary">Go to Shop</a>
    </div>
  `,
  styles: [`
    .order-page {
      padding-top: 72px;
      max-width: 1200px;
      margin: 0 auto;
      padding-left: 32px;
      padding-right: 32px;
      padding-bottom: 64px;
    }
    .success-banner {
      text-align: center;
      padding: 48px 32px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 20px;
      margin: 32px 0;
    }
    .success-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      font-size: 2rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      animation: scaleIn 0.5s ease;
    }
    @keyframes scaleIn {
      0% { transform: scale(0); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    .success-banner h1 {
      color: #f8fafc;
      font-size: 1.8rem;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .success-banner p { color: #94a3b8; font-size: 1rem; }
    .success-banner strong { color: #3b82f6; }
    .order-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
    }
    .detail-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .card-title {
      color: #f8fafc;
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .detail-item { }
    .detail-label {
      display: block;
      color: #64748b;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .detail-value { color: #e2e8f0; font-size: 0.95rem; }
    .detail-value.highlight { color: #3b82f6; font-weight: 700; }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .status-pending { background: rgba(245, 158, 11, 0.15); color: #fcd34d; }
    .status-confirmed { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; }
    .status-processing { background: rgba(59, 130, 246, 0.15); color: #93c5fd; }
    .payment-pending { background: rgba(245, 158, 11, 0.15); color: #fcd34d; }
    .payment-paid { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; }
    .payment-failed { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }
    .order-items { }
    .order-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .order-item:last-child { border-bottom: none; }
    .order-item-img {
      width: 64px;
      height: 64px;
      border-radius: 10px;
      overflow: hidden;
      flex-shrink: 0;
      background: #1e293b;
    }
    .order-item-img img { width: 100%; height: 100%; object-fit: cover; }
    .order-item-info { flex: 1; }
    .order-item-name {
      display: block;
      color: #e2e8f0;
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 4px;
    }
    .order-item-qty { color: #64748b; font-size: 0.8rem; }
    .order-item-total { color: #f8fafc; font-weight: 700; white-space: nowrap; }
    .address-block {
      color: #94a3b8;
      line-height: 1.6;
      font-size: 0.95rem;
    }
    .address-name { color: #e2e8f0; font-weight: 600; }
    .address-contact {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 0.85rem;
    }
    /* Summary */
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      color: #94a3b8;
      font-size: 0.95rem;
    }
    .summary-row .free { color: #10b981; font-weight: 600; }
    .summary-row.total { color: #f8fafc; font-weight: 700; font-size: 1.2rem; }
    .summary-divider { border-top: 1px solid rgba(255, 255, 255, 0.06); margin: 8px 0; }
    .action-buttons { margin-top: 16px; }
    .btn-continue {
      display: block;
      padding: 14px;
      border-radius: 12px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      font-weight: 700;
      font-size: 1rem;
      text-align: center;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .btn-continue:hover { opacity: 0.9; }
    /* Loading & Error */
    .loading-state, .error-state {
      text-align: center;
      padding: 120px 32px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(59, 130, 246, 0.2);
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s ease-in-out infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-state p, .error-state p { color: #64748b; }
    .error-state h2 { color: #e2e8f0; margin-bottom: 8px; }
    .btn-primary {
      display: inline-block;
      padding: 14px 32px;
      border-radius: 12px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      text-decoration: none;
      font-weight: 700;
      margin-top: 16px;
    }
    @media (max-width: 1024px) {
      .order-layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .detail-grid { grid-template-columns: 1fr; }
      .success-banner h1 { font-size: 1.4rem; }
    }
  `]
})
export class OrderSummaryComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.loadOrder(params['orderNumber']);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrder(orderNumber: string): void {
    this.isLoading = true;
    this.orderService.getOrder(orderNumber)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.order = order;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.toastService.error('Order not found');
        }
      });
  }
}
