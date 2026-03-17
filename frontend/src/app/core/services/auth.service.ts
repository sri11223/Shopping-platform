import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/types';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  wishlist: string[];
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const TOKEN_KEY = 'ecommerce_token';
const USER_KEY = 'ecommerce_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  user$ = this.userSubject.asObservable();
  isLoggedIn$ = this.user$.pipe(map(u => !!u));

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    if (token && userStr) {
      try {
        this.tokenSubject.next(token);
        this.userSubject.next(JSON.parse(userStr));
      } catch {
        this.logout();
      }
    }
  }

  private saveToStorage(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.tokenSubject.next(token);
    this.userSubject.next(user);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  register(name: string, email: string, password: string, phone?: string): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, { name, email, password, phone }).pipe(
      map(res => res.data),
      tap(data => this.saveToStorage(data.token, data.user))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(res => res.data),
      tap(data => this.saveToStorage(data.token, data.user))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }

  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`).pipe(
      map(res => res.data),
      tap(user => {
        this.userSubject.next(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      })
    );
  }

  updateProfile(data: Partial<{ name: string; phone: string }>): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/profile`, data).pipe(
      map(res => res.data),
      tap(user => {
        this.userSubject.next(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      })
    );
  }

  toggleWishlist(productId: string): Observable<{ wishlisted: boolean; wishlist: string[] }> {
    return this.http.post<ApiResponse<{ wishlisted: boolean; wishlist: string[] }>>(`${this.apiUrl}/wishlist/${productId}`, {}).pipe(
      map(res => res.data),
      tap(result => {
        const user = this.getCurrentUser();
        if (user) {
          user.wishlist = result.wishlist;
          this.userSubject.next({ ...user });
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
      })
    );
  }

  getWishlist(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/wishlist`).pipe(
      map(res => res.data)
    );
  }

  isInWishlist(productId: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.wishlist.includes(productId) : false;
  }
}
