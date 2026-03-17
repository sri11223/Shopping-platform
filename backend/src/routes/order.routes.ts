import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { validate } from '../middleware/validate.middleware';
import { createOrderSchema } from '../validators';

const router = Router();

router.post(
  '/',
  validate(createOrderSchema),
  orderController.createOrder
);

router.get('/my-orders', orderController.getMyOrders);

router.get('/:orderNumber', orderController.getOrder);

router.post('/:orderNumber/payment', orderController.createPayment);

router.post('/:orderNumber/verify-payment', orderController.verifyPayment);

export default router;
