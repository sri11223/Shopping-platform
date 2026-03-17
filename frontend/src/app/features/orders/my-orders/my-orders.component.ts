import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order } from '../../../core/models/types';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getMyOrders().pipe(takeUntil(this.destroy$)).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
