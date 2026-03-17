import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validate } from '../middleware/validate.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';
import { productQuerySchema } from '../validators';

const router = Router();

router.get(
  '/',
  validate(productQuerySchema, 'query'),
  cacheMiddleware('products', 300),
  productController.getProducts
);

router.get(
  '/categories',
  cacheMiddleware('categories', 3600),
  productController.getCategories
);

router.get(
  '/brands',
  cacheMiddleware('brands', 3600),
  productController.getBrands
);

router.get('/:id', productController.getProductById);

export default router;
