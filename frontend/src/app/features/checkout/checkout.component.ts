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
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
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
