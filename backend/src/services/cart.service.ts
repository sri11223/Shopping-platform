import { Cart, ICart } from '../models/cart.model';
import { Product } from '../models/product.model';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class CartService {
  async getCart(sessionId: string, userId?: string): Promise<ICart> {
    let cart: ICart | null = null;

    // Try to find by userId first, then by sessionId
    if (userId) {
      cart = await Cart.findOne({ userId }).exec();
    }
    if (!cart) {
      cart = await Cart.findOne({ sessionId }).exec();
    }

    if (!cart) {
      cart = new Cart({ sessionId, userId, items: [] });
      await cart.save();
    } else if (userId && !cart.userId) {
      // Migrate session cart to user cart
      cart.userId = userId as any;
      await cart.save();
    }

    return cart;
  }

  async addItem(sessionId: string, productId: string, quantity: number, userId?: string): Promise<ICart> {
    const product = await Product.findById(productId).exec();
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    if (!product.isActive) {
      throw AppError.badRequest('Product is currently unavailable');
    }

    if (product.stock < quantity) {
      throw AppError.badRequest(`Only ${product.stock} items available in stock`);
    }

    let cart = await this.getCart(sessionId, userId);

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > 10) {
        throw AppError.badRequest('Cannot add more than 10 of the same item');
      }
      if (newQuantity > product.stock) {
        throw AppError.badRequest(`Only ${product.stock} items available in stock`);
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = product.price;
    } else {
      cart.items.push({
        product: product._id as any,
        quantity,
        price: product.price,
        name: product.name,
        image: product.images[0] || '',
      });
    }

    await cart.save();
    logger.info(`Item added to cart: sessionId=${sessionId}, productId=${productId}`);
    return cart;
  }

  async updateItemQuantity(sessionId: string, productId: string, quantity: number): Promise<ICart> {
    const cart = await Cart.findOne({ sessionId }).exec();
    if (!cart) {
      throw AppError.notFound('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      throw AppError.notFound('Item not found in cart');
    }

    // Validate stock
    const product = await Product.findById(productId).exec();
    if (product && quantity > product.stock) {
      throw AppError.badRequest(`Only ${product.stock} items available in stock`);
    }

    cart.items[itemIndex].quantity = quantity;
    if (product) {
      cart.items[itemIndex].price = product.price;
    }

    await cart.save();
    return cart;
  }

  async removeItem(sessionId: string, productId: string): Promise<ICart> {
    const cart = await Cart.findOne({ sessionId }).exec();
    if (!cart) {
      throw AppError.notFound('Cart not found');
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    logger.info(`Item removed from cart: sessionId=${sessionId}, productId=${productId}`);
    return cart;
  }

  async clearCart(sessionId: string): Promise<ICart> {
    const cart = await Cart.findOne({ sessionId }).exec();
    if (!cart) {
      throw AppError.notFound('Cart not found');
    }

    cart.items = [];
    await cart.save();
    logger.info(`Cart cleared: sessionId=${sessionId}`);
    return cart;
  }
}

export const cartService = new CartService();
