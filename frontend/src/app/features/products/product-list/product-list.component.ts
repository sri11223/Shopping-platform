import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, PaginationMeta } from '../../../core/models/types';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="product-list-page">
      <!-- Hero Banner -->
      <section class="hero-banner">
        <div class="hero-content">
          <h1 class="hero-title">Discover Your Style</h1>
          <p class="hero-subtitle">Explore our curated collection of premium fashion</p>
        </div>
      </section>

      <div class="main-content">
        <!-- Filters Sidebar -->
        <aside class="filters-sidebar" [class.open]="filtersOpen">
          <div class="filter-header">
            <h3>Filters</h3>
            <button class="filter-clear" (click)="clearFilters()">Clear All</button>
          </div>

          <!-- Search -->
          <div class="filter-group">
            <label class="filter-label">Search</label>
            <input
              type="text"
              class="filter-input"
              placeholder="Search products..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              id="search-input"
            />
          </div>

          <!-- Categories -->
          <div class="filter-group">
            <label class="filter-label">Category</label>
            <div class="filter-options">
              <button
                *ngFor="let cat of categories"
                class="filter-chip"
                [class.active]="selectedCategory === cat"
                (click)="selectCategory(cat)"
              >{{ cat }}</button>
            </div>
          </div>

          <!-- Brands -->
          <div class="filter-group">
            <label class="filter-label">Brand</label>
            <div class="filter-options">
              <button
                *ngFor="let brand of brands"
                class="filter-chip"
                [class.active]="selectedBrand === brand"
                (click)="selectBrand(brand)"
              >{{ brand }}</button>
            </div>
          </div>

          <!-- Price Range -->
          <div class="filter-group">
            <label class="filter-label">Price Range</label>
            <div class="price-inputs">
              <input type="number" placeholder="Min" [(ngModel)]="minPrice" class="filter-input price-input" (change)="applyFilters()" />
              <span class="price-separator">—</span>
              <input type="number" placeholder="Max" [(ngModel)]="maxPrice" class="filter-input price-input" (change)="applyFilters()" />
            </div>
          </div>

          <button class="mobile-close-filters" (click)="filtersOpen = false">Apply Filters</button>
        </aside>

        <!-- Products Grid -->
        <main class="products-section">
          <!-- Toolbar -->
          <div class="toolbar">
            <div class="toolbar-left">
              <button class="filter-toggle" (click)="filtersOpen = !filtersOpen">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>
                Filters
              </button>
              <span class="result-count" *ngIf="meta">{{ meta.total }} products found</span>
            </div>
            <div class="toolbar-right">
              <select [(ngModel)]="sortBy" (change)="applyFilters()" class="sort-select" id="sort-select">
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name_asc">A to Z</option>
              </select>
            </div>
          </div>

          <!-- Loading -->
          <div class="loading-grid" *ngIf="isLoading">
            <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5,6,7,8]">
              <div class="skeleton-img"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-text short"></div>
            </div>
          </div>

          <!-- Product Grid -->
          <div class="product-grid" *ngIf="!isLoading">
            <div class="product-card" *ngFor="let product of products; trackBy: trackByProductId" id="product-{{ product._id }}">
              <a [routerLink]="['/products', product._id]" class="product-image-wrap">
                <img [src]="product.images[0]" [alt]="product.name" class="product-image" loading="lazy" />
                <div class="discount-badge" *ngIf="getDiscount(product) > 0">-{{ getDiscount(product) }}%</div>
              </a>
              <button class="wishlist-heart" (click)="toggleWishlist(product)" [class.active]="isInWishlist(product._id)" title="Add to wishlist">
                {{ isInWishlist(product._id) ? '❤️' : '🤍' }}
              </button>
              <div class="product-info">
                <span class="product-brand">{{ product.brand }}</span>
                <a [routerLink]="['/products', product._id]" class="product-name">{{ product.name }}</a>
                <div class="product-rating">
                  <span class="stars">
                    <span *ngFor="let star of getStars(product.rating)" class="star" [class.filled]="star === 'filled'" [class.half]="star === 'half'">★</span>
                  </span>
                  <span class="review-count">({{ product.reviewCount }})</span>
                </div>
                <div class="product-price-row">
                  <span class="product-price">₹{{ product.price | number }}</span>
                  <span class="product-original-price" *ngIf="product.originalPrice > product.price">₹{{ product.originalPrice | number }}</span>
                </div>
                <button class="add-to-cart-btn" (click)="addToCart(product)" [disabled]="product.stock === 0" id="add-to-cart-{{ product._id }}">
                  {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="!isLoading && products.length === 0">
            <div class="empty-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search query</p>
            <button class="btn-primary" (click)="clearFilters()">Clear Filters</button>
          </div>

          <!-- Pagination -->
          <div class="pagination" *ngIf="meta && meta.totalPages > 1">
            <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">← Prev</button>
            <button
              *ngFor="let page of getPageNumbers()"
              class="page-btn"
              [class.active]="page === currentPage"
              (click)="goToPage(page)"
            >{{ page }}</button>
            <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === meta.totalPages">Next →</button>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .product-list-page { padding-top: 72px; }
    .hero-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
      padding: 64px 32px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .hero-banner::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%);
      animation: float 20s infinite linear;
    }
    @keyframes float { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .hero-content { position: relative; z-index: 1; }
    .hero-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .hero-subtitle { color: #94a3b8; font-size: 1.1rem; }
    .main-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 32px;
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 32px;
    }
    /* Filters */
    .filters-sidebar {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 24px;
      height: fit-content;
      position: sticky;
      top: 104px;
    }
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .filter-header h3 { color: #f8fafc; font-weight: 700; font-size: 1.1rem; }
    .filter-clear {
      background: none;
      border: none;
      color: #3b82f6;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .filter-group { margin-bottom: 24px; }
    .filter-label {
      display: block;
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .filter-input {
      width: 100%;
      padding: 10px 14px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #e2e8f0;
      font-size: 0.9rem;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .filter-input:focus {
      outline: none;
      border-color: #3b82f6;
    }
    .filter-input::placeholder { color: #475569; }
    .filter-options { display: flex; flex-wrap: wrap; gap: 8px; }
    .filter-chip {
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(15, 23, 42, 0.4);
      color: #94a3b8;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-chip:hover { border-color: #3b82f6; color: #e2e8f0; }
    .filter-chip.active {
      background: rgba(59, 130, 246, 0.2);
      border-color: #3b82f6;
      color: #93c5fd;
    }
    .price-inputs { display: flex; align-items: center; gap: 8px; }
    .price-input { width: 100px !important; }
    .price-separator { color: #475569; }
    .mobile-close-filters { display: none; }
    /* Toolbar */
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .toolbar-left { display: flex; align-items: center; gap: 16px; }
    .filter-toggle {
      display: none;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(30, 41, 59, 0.5);
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .result-count { color: #64748b; font-size: 0.9rem; }
    .sort-select {
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(30, 41, 59, 0.5);
      color: #e2e8f0;
      font-size: 0.85rem;
      cursor: pointer;
    }
    .sort-select option { background: #1e293b; }
    /* Grid */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
    }
    .product-card {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
      position: relative;
    }
    .product-card:hover {
      transform: translateY(-4px);
      border-color: rgba(59, 130, 246, 0.2);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }
    .product-image-wrap {
      display: block;
      position: relative;
      overflow: hidden;
      aspect-ratio: 1;
      background: #1e293b;
    }
    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .product-card:hover .product-image { transform: scale(1.08); }
    .discount-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: #ef4444;
      color: white;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .product-info { padding: 16px; }
    .wishlist-heart {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 2;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.1);
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .wishlist-heart:hover { background: rgba(239, 68, 68, 0.2); transform: scale(1.1); }
    .wishlist-heart.active { background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); }
    .product-brand {
      color: #3b82f6;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .product-name {
      display: block;
      color: #e2e8f0;
      font-size: 0.95rem;
      font-weight: 600;
      margin: 6px 0 8px;
      text-decoration: none;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .product-name:hover { color: #3b82f6; }
    .product-rating {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
    }
    .star {
      color: #334155;
      font-size: 0.85rem;
    }
    .star.filled { color: #f59e0b; }
    .star.half { color: #f59e0b; opacity: 0.6; }
    .review-count { color: #64748b; font-size: 0.8rem; }
    .product-price-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }
    .product-price {
      color: #f8fafc;
      font-size: 1.15rem;
      font-weight: 700;
    }
    .product-original-price {
      color: #64748b;
      font-size: 0.9rem;
      text-decoration: line-through;
    }
    .add-to-cart-btn {
      width: 100%;
      padding: 10px;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .add-to-cart-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .add-to-cart-btn:disabled {
      background: #334155;
      color: #64748b;
      cursor: not-allowed;
      transform: none;
    }
    /* Loading */
    .loading-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
    }
    .skeleton-card {
      background: rgba(30, 41, 59, 0.4);
      border-radius: 16px;
      overflow: hidden;
    }
    .skeleton-img {
      aspect-ratio: 1;
      background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-text {
      height: 16px;
      margin: 16px;
      border-radius: 8px;
      background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-text.short { width: 60%; }
    @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
    /* Empty */
    .empty-state {
      text-align: center;
      padding: 64px 32px;
    }
    .empty-icon { font-size: 4rem; margin-bottom: 16px; }
    .empty-state h3 { color: #e2e8f0; margin-bottom: 8px; }
    .empty-state p { color: #64748b; margin-bottom: 24px; }
    .btn-primary {
      padding: 10px 24px;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      font-weight: 600;
      cursor: pointer;
    }
    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 40px;
    }
    .page-btn {
      padding: 8px 16px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(30, 41, 59, 0.5);
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .page-btn:hover:not(:disabled) { border-color: #3b82f6; color: #e2e8f0; }
    .page-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    /* Responsive */
    @media (max-width: 1024px) {
      .main-content { grid-template-columns: 1fr; }
      .filters-sidebar {
        position: fixed;
        top: 0;
        left: -320px;
        width: 300px;
        height: 100vh;
        border-radius: 0;
        z-index: 1001;
        overflow-y: auto;
        transition: left 0.3s ease;
        background: #1e293b;
      }
      .filters-sidebar.open { left: 0; }
      .filter-toggle { display: flex; }
      .mobile-close-filters {
        display: block;
        width: 100%;
        padding: 12px;
        border-radius: 10px;
        border: none;
        background: #3b82f6;
        color: white;
        font-weight: 600;
        cursor: pointer;
        margin-top: 16px;
      }
    }
    @media (max-width: 640px) {
      .hero-banner { padding: 40px 16px; }
      .hero-title { font-size: 1.8rem; }
      .main-content { padding: 16px; }
      .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .product-info { padding: 10px; }
      .product-name { font-size: 0.85rem; }
    }
  `]
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: string[] = [];
  brands: string[] = [];
  meta: PaginationMeta | null = null;
  isLoading = true;
  currentPage = 1;
  searchQuery = '';
  selectedCategory = '';
  selectedBrand = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = 'newest';
  filtersOpen = false;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadFilters();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadProducts();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.isLoading = true;
    const params: any = {
      page: this.currentPage,
      limit: 12,
      sort: this.sortBy,
    };

    if (this.searchQuery) params.search = this.searchQuery;
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.selectedBrand) params.brand = this.selectedBrand;
    if (this.minPrice) params.minPrice = this.minPrice;
    if (this.maxPrice) params.maxPrice = this.maxPrice;

    this.productService.getProducts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.products = result.data;
          this.meta = result.meta;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.toastService.error('Failed to load products');
        }
      });
  }

  loadFilters(): void {
    this.productService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(cats => this.categories = cats);

    this.productService.getBrands()
      .pipe(takeUntil(this.destroy$))
      .subscribe(b => this.brands = b);
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  selectCategory(cat: string): void {
    this.selectedCategory = this.selectedCategory === cat ? '' : cat;
    this.currentPage = 1;
    this.loadProducts();
  }

  selectBrand(brand: string): void {
    this.selectedBrand = this.selectedBrand === brand ? '' : brand;
    this.currentPage = 1;
    this.loadProducts();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'newest';
    this.currentPage = 1;
    this.loadProducts();
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product._id).subscribe({
      next: () => this.toastService.success(`${product.name} added to cart`),
      error: (err) => this.toastService.error(err.error?.message || 'Failed to add to cart'),
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && this.meta && page <= this.meta.totalPages) {
      this.currentPage = page;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    if (!this.meta) return [];
    const pages: number[] = [];
    for (let i = 1; i <= this.meta.totalPages; i++) pages.push(i);
    return pages;
  }

  getDiscount(product: Product): number {
    if (product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) stars.push('filled');
      else if (i - 0.5 <= rating) stars.push('half');
      else stars.push('empty');
    }
    return stars;
  }

  trackByProductId(_: number, product: Product): string {
    return product._id;
  }

  toggleWishlist(product: Product): void {
    if (!this.authService.getCurrentUser()) {
      this.toastService.error('Please login to add items to wishlist');
      return;
    }
    this.authService.toggleWishlist(product._id).subscribe({
      next: (res) => {
        this.toastService.success(res.wishlisted ? `${product.name} added to wishlist` : `Removed from wishlist`);
      },
      error: () => this.toastService.error('Failed to update wishlist')
    });
  }

  isInWishlist(productId: string): boolean {
    return this.authService.isInWishlist(productId);
  }
}
