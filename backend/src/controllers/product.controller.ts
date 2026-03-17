import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { sendSuccess } from '../utils/response';

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await productService.getProducts(req.query as any);
      sendSuccess(res, result.data, 'Products retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getProductById(req.params.id);
      const related = await productService.getRelatedProducts(
        req.params.id,
        (product as any).category
      );
      sendSuccess(res, { product, relatedProducts: related }, 'Product retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await productService.getCategories();
      sendSuccess(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getBrands(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const brands = await productService.getBrands();
      sendSuccess(res, brands, 'Brands retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
