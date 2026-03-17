import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-section">
            <h3 class="footer-logo">🛍️ LUXE<span>STORE</span></h3>
            <p class="footer-desc">Premium fashion and lifestyle products curated for the modern you. Quality craftsmanship meets contemporary design.</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/products">All Products</a></li>
              <li><a href="/cart">Shopping Cart</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Customer Care</h4>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Shipping Policy</a></li>
              <li><a href="#">Returns & Exchanges</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Connect</h4>
            <ul>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 LuxeStore. All rights reserved. Built with ❤️</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #0a0f1a;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding: 64px 0 0;
      margin-top: 80px;
    }
    .footer-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 32px;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 48px;
    }
    .footer-logo {
      font-size: 1.3rem;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }
    .footer-logo span { color: #3b82f6; }
    .footer-desc {
      color: #64748b;
      font-size: 0.9rem;
      line-height: 1.6;
    }
    .footer-section h4 {
      color: #e2e8f0;
      font-weight: 600;
      margin-bottom: 16px;
      font-size: 0.95rem;
    }
    .footer-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .footer-section li {
      margin-bottom: 10px;
    }
    .footer-section a {
      color: #64748b;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    .footer-section a:hover { color: #3b82f6; }
    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding: 24px 0;
      margin-top: 48px;
      text-align: center;
    }
    .footer-bottom p {
      color: #475569;
      font-size: 0.85rem;
    }
    @media (max-width: 768px) {
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
    }
    @media (max-width: 480px) {
      .footer-grid { grid-template-columns: 1fr; gap: 24px; }
    }
  `]
})
export class FooterComponent {}
