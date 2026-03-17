import { Product, IProduct } from '../models/product.model';
import { cacheService } from '../utils/cache';
import { AppError } from '../utils/errors';
import { SORT_OPTIONS, PAGINATION } from '../utils/constants';

interface ProductQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ProductService {
  async getProducts(options: ProductQueryOptions): Promise<PaginatedResult<IProduct>> {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      sort = 'newest',
    } = options;

    const filter: any = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = brand;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    const sortOption = SORT_OPTIONS[sort as keyof typeof SORT_OPTIONS] || SORT_OPTIONS.newest;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption as any)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Product.countDocuments(filter).exec(),
    ]);

    return {
      data: products as unknown as IProduct[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string): Promise<IProduct> {
    const cacheKey = `product:${id}`;
    const cached = cacheService.get<IProduct>(cacheKey);
    if (cached) return cached;

    const product = await Product.findById(id).lean().exec();
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    cacheService.set(cacheKey, product, 600); // 10 min cache
    return product as unknown as IProduct;
  }

  async getCategories(): Promise<string[]> {
    const cacheKey = 'product:categories';
    const cached = cacheService.get<string[]>(cacheKey);
    if (cached) return cached;

    const categories = await Product.distinct('category', { isActive: true }).exec();
    cacheService.set(cacheKey, categories, 3600); // 1 hour cache
    return categories;
  }

  async getBrands(): Promise<string[]> {
    const cacheKey = 'product:brands';
    const cached = cacheService.get<string[]>(cacheKey);
    if (cached) return cached;

    const brands = await Product.distinct('brand', { isActive: true }).exec();
    cacheService.set(cacheKey, brands, 3600);
    return brands;
  }

  async getRelatedProducts(productId: string, category: string, limit: number = 4): Promise<IProduct[]> {
    const products = await Product.find({
      _id: { $ne: productId },
      category,
      isActive: true,
    })
      .limit(limit)
      .lean()
      .exec();

    return products as unknown as IProduct[];
  }
}

export const productService = new ProductService();
