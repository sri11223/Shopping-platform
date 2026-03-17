import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Cart, CartItem } from '../models/types';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;
  private cartSubject = new BehaviorSubject<Cart | null>(null);

  cart$ = this.cartSubject.asObservable();
  cartItemCount$ = this.cart$.pipe(
    map(cart => cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0)
  );
  cartTotal$ = this.cart$.pipe(
    map(cart => cart ? cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0)
  );

  constructor(private http: HttpClient) {}

  loadCart(): void {
    this.http.get<ApiResponse<Cart>>(this.apiUrl).pipe(
      map(response => response.data)
    ).subscribe({
      next: (cart) => this.cartSubject.next(cart),
      error: (err) => console.error('Failed to load cart:', err),
    });
  }

  addToCart(productId: string, quantity: number = 1): Observable<Cart> {
    return this.http.post<ApiResponse<Cart>>(`${this.apiUrl}/items`, { productId, quantity }).pipe(
      map(response => response.data),
      tap(cart => this.cartSubject.next(cart))
    );
  }

  updateQuantity(productId: string, quantity: number): Observable<Cart> {
    return this.http.put<ApiResponse<Cart>>(`${this.apiUrl}/items/${productId}`, { quantity }).pipe(
      map(response => response.data),
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeItem(productId: string): Observable<Cart> {
    return this.http.delete<ApiResponse<Cart>>(`${this.apiUrl}/items/${productId}`).pipe(
      map(response => response.data),
      tap(cart => this.cartSubject.next(cart))
    );
  }

  clearCart(): Observable<Cart> {
    return this.http.delete<ApiResponse<Cart>>(this.apiUrl).pipe(
      map(response => response.data),
      tap(cart => this.cartSubject.next(cart))
    );
  }

  getCurrentCart(): Cart | null {
    return this.cartSubject.value;
  }
}
