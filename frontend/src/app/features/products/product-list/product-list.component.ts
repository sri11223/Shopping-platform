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
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
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
  addingToCartId: string | null = null;

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
    if (this.addingToCartId) return;
    this.addingToCartId = product._id;
    this.cartService.addToCart(product._id).subscribe({
      next: () => {
        this.toastService.success(`${product.name} added to cart`);
        this.addingToCartId = null;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to add to cart');
        this.addingToCartId = null;
      },
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
