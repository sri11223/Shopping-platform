import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Order, ShippingAddress, RazorpayPaymentData } from '../models/types';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(shippingAddress: ShippingAddress, notes?: string): Observable<Order> {
    return this.http.post<ApiResponse<Order>>(this.apiUrl, { shippingAddress, notes }).pipe(
      map(response => response.data)
    );
  }

  getOrder(orderNumber: string): Observable<Order> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${orderNumber}`).pipe(
      map(response => response.data)
    );
  }

  createPayment(orderNumber: string): Observable<RazorpayPaymentData> {
    return this.http.post<ApiResponse<RazorpayPaymentData>>(`${this.apiUrl}/${orderNumber}/payment`, {}).pipe(
      map(response => response.data)
    );
  }

  verifyPayment(orderNumber: string, paymentData: any): Observable<Order> {
    return this.http.post<ApiResponse<Order>>(`${this.apiUrl}/${orderNumber}/verify-payment`, paymentData).pipe(
      map(response => response.data)
    );
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/my-orders`).pipe(
      map(response => response.data)
    );
  }
}
