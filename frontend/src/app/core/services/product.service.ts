import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Product, ProductDetailResponse, ProductQueryParams, PaginationMeta } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;
  private categoriesCache$: Observable<string[]> | null = null;
  private brandsCache$: Observable<string[]> | null = null;

  constructor(private http: HttpClient) {}

  getProducts(params: ProductQueryParams = {}): Observable<{ data: Product[]; meta: PaginationMeta }> {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return this.http.get<ApiResponse<Product[]>>(this.apiUrl, { params: httpParams }).pipe(
      map(response => ({
        data: response.data,
        meta: response.meta!,
      }))
    );
  }

  getProductById(id: string): Observable<ProductDetailResponse> {
    return this.http.get<ApiResponse<ProductDetailResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  getCategories(): Observable<string[]> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/categories`).pipe(
        map(response => response.data),
        shareReplay(1)
      );
    }
    return this.categoriesCache$;
  }

  getBrands(): Observable<string[]> {
    if (!this.brandsCache$) {
      this.brandsCache$ = this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/brands`).pipe(
        map(response => response.data),
        shareReplay(1)
      );
    }
    return this.brandsCache$;
  }
}
