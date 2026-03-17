import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  categories = [
    { name: 'Shirts', emoji: '👔', color: '#3b82f6' },
    { name: 'Jeans', emoji: '👖', color: '#2563eb' },
    { name: 'Jackets', emoji: '🧥', color: '#7c3aed' },
    { name: 'Dresses', emoji: '👗', color: '#ec4899' },
    { name: 'Shoes', emoji: '👟', color: '#10b981' },
    { name: 'Watches', emoji: '⌚', color: '#f59e0b' },
    { name: 'Bags', emoji: '👜', color: '#6366f1' },
    { name: 'Accessories', emoji: '🕶️', color: '#8b5cf6' },
  ];

  featuredProducts: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts({ limit: 8, sort: 'rating' }).subscribe({
      next: (res) => {
        this.featuredProducts = res.data;
      }
    });
  }

  getDiscount(product: Product): number {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }
}
