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
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
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
  isAddingToCart = false;

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
    if (!this.product || this.isAddingToCart) return;
    this.isAddingToCart = true;
    this.cartService.addToCart(this.product._id, this.quantity).subscribe({
      next: () => {
        this.toastService.success(`${this.product!.name} added to cart`);
        this.addedToCart = true;
        this.isAddingToCart = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to add to cart');
        this.isAddingToCart = false;
      },
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
