import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { validate } from '../middleware/validate.middleware';
import { addToCartSchema, updateCartItemSchema } from '../validators';

const router = Router();

router.get('/', cartController.getCart);

router.post(
  '/items',
  validate(addToCartSchema),
  cartController.addItem
);

router.put(
  '/items/:productId',
  validate(updateCartItemSchema),
  cartController.updateItemQuantity
);

router.delete('/items/:productId', cartController.removeItem);

router.delete('/', cartController.clearCart);

export default router;
