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
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
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
