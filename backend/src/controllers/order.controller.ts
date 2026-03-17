import { Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export class OrderController {
  async createOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const userId = req.user?._id as string | undefined;
      const { shippingAddress, notes } = req.body;
      const order = await orderService.createOrder(sessionId, shippingAddress, notes, userId);
      sendSuccess(res, order, 'Order created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderNumber } = req.params;
      const order = await orderService.getOrder(orderNumber);
      sendSuccess(res, order, 'Order retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id as string | undefined;
      const sessionId = (req as any).sessionId;
      let orders;
      if (userId) {
        orders = await orderService.getOrdersByUser(userId);
      } else {
        orders = await orderService.getOrdersBySession(sessionId);
      }
      sendSuccess(res, orders, 'Orders retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderNumber } = req.params;
      const paymentData = await orderService.createRazorpayOrder(orderNumber);
      sendSuccess(res, paymentData, 'Payment order created');
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderNumber } = req.params;
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
      const order = await orderService.verifyPayment(
        orderNumber,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      );
      sendSuccess(res, order, 'Payment verified successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
