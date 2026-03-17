import { Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export class CartController {
  async getCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const userId = req.user?._id as string | undefined;
      const cart = await cartService.getCart(sessionId, userId);
      sendSuccess(res, cart, 'Cart retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const userId = req.user?._id as string | undefined;
      const { productId, quantity } = req.body;
      const cart = await cartService.addItem(sessionId, productId, quantity, userId);
      sendSuccess(res, cart, 'Item added to cart', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateItemQuantity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { productId } = req.params;
      const { quantity } = req.body;
      const cart = await cartService.updateItemQuantity(sessionId, productId, quantity);
      sendSuccess(res, cart, 'Cart item updated');
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { productId } = req.params;
      const cart = await cartService.removeItem(sessionId, productId);
      sendSuccess(res, cart, 'Item removed from cart');
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const cart = await cartService.clearCart(sessionId);
      sendSuccess(res, cart, 'Cart cleared');
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();
