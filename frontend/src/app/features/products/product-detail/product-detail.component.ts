import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/types';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-detail-page" *ngIf="product">
      <div class="breadcrumb">
        <a routerLink="/products">Products</a>
        <span class="sep">/</span>
        <span>{{ product.category }}</span>
        <span class="sep">/</span>
        <span class="current">{{ product.name }}</span>
      </div>

      <div class="product-layout">
        <!-- Image Gallery -->
        <div class="image-section">
          <div class="main-image">
            <img [src]="selectedImage" [alt]="product.name" />
            <div class="discount-tag" *ngIf="getDiscount() > 0">-{{ getDiscount() }}% OFF</div>
          </div>
          <div class="image-thumbs" *ngIf="product.images.length > 1">
            <button
              *ngFor="let img of product.images"
              class="thumb"
              [class.active]="img === selectedImage"
              (click)="selectedImage = img"
            >
              <img [src]="img" [alt]="product.name" />
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="info-section">
          <span class="product-brand">{{ product.brand }}</span>
          <h1 class="product-name">{{ product.name }}</h1>

          <div class="rating-row">
            <div class="stars">
              <span *ngFor="let s of getStars()" class="star" [class.filled]="s === 'filled'" [class.half]="s === 'half'">★</span>
            </div>
            <span class="rating-text">{{ product.rating }} ({{ product.reviewCount }} reviews)</span>
          </div>

          <div class="price-section">
            <span class="current-price">₹{{ product.price | number }}</span>
            <span class="original-price" *ngIf="product.originalPrice > product.price">₹{{ product.originalPrice | number }}</span>
            <span class="save-tag" *ngIf="getDiscount() > 0">Save ₹{{ product.originalPrice - product.price | number }}</span>
          </div>

          <p class="description">{{ product.description }}</p>

          <!-- Size Selector -->
          <div class="option-section" *ngIf="product.sizes.length > 0">
            <label class="option-label">Size</label>
            <div class="option-chips">
              <button
                *ngFor="let size of product.sizes"
                class="option-chip"
                [class.active]="selectedSize === size"
                (click)="selectedSize = size"
              >{{ size }}</button>
            </div>
          </div>

          <!-- Color Selector -->
          <div class="option-section" *ngIf="product.colors.length > 0">
            <label class="option-label">Color</label>
            <div class="option-chips">
              <button
                *ngFor="let color of product.colors"
                class="option-chip"
                [class.active]="selectedColor === color"
                (click)="selectedColor = color"
              >{{ color }}</button>
            </div>
          </div>

          <!-- Quantity -->
          <div class="option-section">
            <label class="option-label">Quantity</label>
            <div class="quantity-control">
              <button (click)="decreaseQty()" [disabled]="quantity <= 1" class="qty-btn">−</button>
              <span class="qty-value">{{ quantity }}</span>
              <button (click)="increaseQty()" [disabled]="quantity >= 10" class="qty-btn">+</button>
            </div>
          </div>

          <div class="stock-info" [class.low]="product.stock <= 5">
            <span *ngIf="product.stock > 5">✓ In Stock</span>
            <span *ngIf="product.stock > 0 && product.stock <= 5">⚠ Only {{ product.stock }} left!</span>
            <span *ngIf="product.stock === 0" class="out">✕ Out of Stock</span>
          </div>

          <div class="action-buttons">
            <button class="btn-cart" (click)="addToCart()" [disabled]="product.stock === 0" id="add-to-cart-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Add to Cart
            </button>
            <a routerLink="/cart" class="btn-buy" *ngIf="addedToCart">View Cart →</a>
          </div>

          <!-- Features -->
          <div class="features-section" *ngIf="product.features.length > 0">
            <h3>Key Features</h3>
            <ul class="features-list">
              <li *ngFor="let feature of product.features">
                <span class="feature-check">✓</span>
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <section class="related-section" *ngIf="relatedProducts.length > 0">
        <h2 class="section-title">You May Also Like</h2>
        <div class="related-grid">
          <a *ngFor="let rp of relatedProducts" [routerLink]="['/products', rp._id]" class="related-card">
            <div class="related-img-wrap">
              <img [src]="rp.images[0]" [alt]="rp.name" loading="lazy" />
            </div>
            <div class="related-info">
              <span class="related-brand">{{ rp.brand }}</span>
              <span class="related-name">{{ rp.name }}</span>
              <span class="related-price">₹{{ rp.price | number }}</span>
            </div>
          </a>
        </div>
      </section>
    </div>

    <!-- Loading -->
    <div class="loading-detail" *ngIf="isLoading">
      <div class="skeleton-img-large"></div>
      <div class="skeleton-info">
        <div class="skeleton-text w40"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text w60"></div>
        <div class="skeleton-text w80"></div>
      </div>
    </div>
  `,
  styles: [`
    .product-detail-page {
      padding-top: 72px;
      max-width: 1200px;
      margin: 0 auto;
      padding-left: 32px;
      padding-right: 32px;
    }
    .breadcrumb {
      padding: 24px 0;
      font-size: 0.85rem;
      color: #64748b;
    }
    .breadcrumb a {
      color: #94a3b8;
      text-decoration: none;
      transition: color 0.2s;
    }
    .breadcrumb a:hover { color: #3b82f6; }
    .sep { margin: 0 8px; }
    .current { color: #e2e8f0; }
    .product-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      padding-bottom: 64px;
    }
    /* Image Section */
    .main-image {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      background: #1e293b;
      aspect-ratio: 1;
    }
    .main-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .discount-tag {
      position: absolute;
      top: 16px;
      left: 16px;
      background: #ef4444;
      color: white;
      padding: 6px 14px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .image-thumbs {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
    .thumb {
      width: 72px;
      height: 72px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid transparent;
      cursor: pointer;
      transition: border-color 0.2s;
      padding: 0;
      background: none;
    }
    .thumb.active { border-color: #3b82f6; }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    /* Info Section */
    .product-brand {
      color: #3b82f6;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .product-name {
      color: #f8fafc;
      font-size: 1.8rem;
      font-weight: 800;
      margin: 8px 0 16px;
      line-height: 1.3;
    }
    .rating-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    .star { color: #334155; font-size: 1rem; }
    .star.filled { color: #f59e0b; }
    .star.half { color: #f59e0b; opacity: 0.6; }
    .rating-text { color: #94a3b8; font-size: 0.9rem; }
    .price-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .current-price { font-size: 2rem; font-weight: 800; color: #f8fafc; }
    .original-price { font-size: 1.2rem; color: #64748b; text-decoration: line-through; }
    .save-tag {
      background: rgba(16, 185, 129, 0.15);
      color: #6ee7b7;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .description {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.7;
      margin-bottom: 24px;
    }
    .option-section { margin-bottom: 20px; }
    .option-label {
      display: block;
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .option-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .option-chip {
      padding: 8px 18px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(15, 23, 42, 0.4);
      color: #94a3b8;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .option-chip:hover { border-color: #3b82f6; color: #e2e8f0; }
    .option-chip.active {
      background: rgba(59, 130, 246, 0.2);
      border-color: #3b82f6;
      color: #93c5fd;
    }
    .quantity-control {
      display: flex;
      align-items: center;
      gap: 0;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      overflow: hidden;
      width: fit-content;
    }
    .qty-btn {
      padding: 8px 16px;
      background: rgba(30, 41, 59, 0.5);
      border: none;
      color: #e2e8f0;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .qty-btn:hover:not(:disabled) { background: rgba(59, 130, 246, 0.2); }
    .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .qty-value {
      padding: 8px 20px;
      color: #f8fafc;
      font-weight: 600;
      font-size: 1rem;
      min-width: 48px;
      text-align: center;
    }
    .stock-info {
      margin-bottom: 24px;
      font-size: 0.9rem;
      color: #10b981;
      font-weight: 500;
    }
    .stock-info.low { color: #f59e0b; }
    .stock-info .out { color: #ef4444; }
    .action-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
    }
    .btn-cart {
      flex: 1;
      padding: 14px 28px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-cart:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-cart:disabled { background: #334155; color: #64748b; cursor: not-allowed; transform: none; }
    .btn-buy {
      padding: 14px 28px;
      border-radius: 12px;
      border: 1px solid #3b82f6;
      background: transparent;
      color: #3b82f6;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      text-decoration: none;
      display: flex;
      align-items: center;
      transition: all 0.2s;
    }
    .btn-buy:hover { background: rgba(59, 130, 246, 0.1); }
    .features-section h3 {
      color: #e2e8f0;
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .features-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .features-list li {
      padding: 8px 0;
      color: #94a3b8;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .feature-check { color: #10b981; font-weight: 700; }
    /* Related */
    .related-section { padding: 0 0 64px; }
    .section-title {
      color: #f8fafc;
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 24px;
    }
    .related-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .related-card {
      text-decoration: none;
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .related-card:hover {
      transform: translateY(-4px);
      border-color: rgba(59, 130, 246, 0.2);
    }
    .related-img-wrap {
      aspect-ratio: 1;
      overflow: hidden;
    }
    .related-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    .related-card:hover img { transform: scale(1.08); }
    .related-info { padding: 12px; }
    .related-brand {
      display: block;
      color: #3b82f6;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .related-name {
      display: block;
      color: #e2e8f0;
      font-size: 0.85rem;
      font-weight: 600;
      margin: 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .related-price { color: #f8fafc; font-weight: 700; font-size: 0.95rem; }
    /* Loading */
    .loading-detail {
      padding-top: 120px;
      max-width: 1200px;
      margin: 0 auto;
      padding-left: 32px;
      padding-right: 32px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
    }
    .skeleton-img-large {
      aspect-ratio: 1;
      border-radius: 20px;
      background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-info { padding-top: 16px; }
    .skeleton-text {
      height: 20px;
      border-radius: 8px;
      margin-bottom: 16px;
      background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-text.w40 { width: 40%; }
    .skeleton-text.w60 { width: 60%; }
    .skeleton-text.w80 { width: 80%; }
    @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
    @media (max-width: 768px) {
      .product-layout { grid-template-columns: 1fr; gap: 24px; }
      .product-name { font-size: 1.4rem; }
      .related-grid { grid-template-columns: repeat(2, 1fr); }
      .loading-detail { grid-template-columns: 1fr; }
    }
  `]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  selectedImage = '';
  selectedSize = '';
  selectedColor = '';
  quantity = 1;
  isLoading = true;
  addedToCart = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.loadProduct(params['id']);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.addedToCart = false;
    this.quantity = 1;

    this.productService.getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.product = result.product;
          this.relatedProducts = result.relatedProducts;
          this.selectedImage = this.product.images[0] || '';
          this.selectedSize = this.product.sizes[0] || '';
          this.selectedColor = this.product.colors[0] || '';
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.toastService.error('Failed to load product');
        }
      });
  }

  addToCart(): void {
    if (!this.product) return;
    this.cartService.addToCart(this.product._id, this.quantity).subscribe({
      next: () => {
        this.toastService.success(`${this.product!.name} added to cart`);
        this.addedToCart = true;
      },
      error: (err) => this.toastService.error(err.error?.message || 'Failed to add to cart'),
    });
  }

  increaseQty(): void {
    if (this.quantity < 10) this.quantity++;
  }

  decreaseQty(): void {
    if (this.quantity > 1) this.quantity--;
  }

  getDiscount(): number {
    if (!this.product) return 0;
    if (this.product.originalPrice > this.product.price) {
      return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
    }
    return 0;
  }

  getStars(): string[] {
    if (!this.product) return [];
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(this.product.rating)) stars.push('filled');
      else if (i - 0.5 <= this.product.rating) stars.push('half');
      else stars.push('empty');
    }
    return stars;
  }
}
