import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: User | null = null;
  cartCount = 0;
  showSearch = false;
  showUserMenu = false;
  categories = [
    { name: 'Shirts', emoji: '👔' },
    { name: 'Jeans', emoji: '👖' },
    { name: 'Jackets', emoji: '🧥' },
    { name: 'Dresses', emoji: '👗' },
    { name: 'Shoes', emoji: '👟' },
    { name: 'Watches', emoji: '⌚' },
    { name: 'Bags', emoji: '👜' },
    { name: 'Accessories', emoji: '🕶️' },
  ];
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.user = user;
    });
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe(cart => {
      this.cartCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
  }

  search(query: string): void {
    if (query.trim()) {
      this.showSearch = false;
      this.router.navigate(['/products'], { queryParams: { search: query.trim() } });
    }
  }

  logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
