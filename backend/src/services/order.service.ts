import { Order, IOrder, IShippingAddress } from '../models/order.model';
import { Cart } from '../models/cart.model';
import { Product } from '../models/product.model';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import { config } from '../config';

const TAX_RATE = 0.18; // 18% GST
const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE = 99;

export class OrderService {
  async createOrder(sessionId: string, shippingAddress: IShippingAddress, notes?: string, userId?: string): Promise<IOrder> {
    // Find cart by userId first, then sessionId
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId }).exec();
    }
    if (!cart) {
      cart = await Cart.findOne({ sessionId }).exec();
    }

    if (!cart || cart.items.length === 0) {
      throw AppError.badRequest('Cart is empty. Add items before placing an order.');
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const product = await Product.findById(item.product).exec();
      if (!product) {
        throw AppError.badRequest(`Product "${item.name}" is no longer available`);
      }
      if (product.stock < item.quantity) {
        throw AppError.badRequest(
          `Insufficient stock for "${item.name}". Available: ${product.stock}`
        );
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
    const totalAmount = Math.round((subtotal + tax + shippingCharge) * 100) / 100;

    // Create order
    const order = new Order({
      sessionId,
      userId,
      items: cart.items.map((item) => ({
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      shippingAddress,
      subtotal,
      tax,
      shippingCharge,
      totalAmount,
      notes,
      status: 'pending',
      paymentStatus: 'pending',
    });

    await order.save();

    // Decrement stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      }).exec();
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    logger.info(`Order created: ${order.orderNumber}`);
    return order;
  }

  async getOrder(orderNumber: string): Promise<IOrder> {
    const order = await Order.findOne({ orderNumber }).exec();
    if (!order) {
      throw AppError.notFound('Order not found');
    }
    return order;
  }

  async getOrdersByUser(userId: string): Promise<IOrder[]> {
    return Order.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async getOrdersBySession(sessionId: string): Promise<IOrder[]> {
    return Order.find({ sessionId }).sort({ createdAt: -1 }).exec();
  }

  async createRazorpayOrder(orderNumber: string): Promise<any> {
    const order = await this.getOrder(orderNumber);

    if (order.paymentStatus === 'paid') {
      throw AppError.badRequest('Order is already paid');
    }

    try {
      const { getRazorpayInstance } = await import('../config/razorpay');
      const razorpay = getRazorpayInstance();

      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(order.totalAmount * 100), // in paise
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderNumber: order.orderNumber,
        },
      });

      order.razorpayOrderId = razorpayOrder.id;
      order.paymentStatus = 'created';
      await order.save();

      return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: config.razorpay.keyId,
      };
    } catch (error: any) {
      logger.error('Razorpay order creation failed:', error);
      throw AppError.internal('Payment initialization failed. Please try again.');
    }
  }

  async verifyPayment(
    orderNumber: string,
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ): Promise<IOrder> {
    const order = await this.getOrder(orderNumber);

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      order.paymentStatus = 'failed';
      await order.save();
      throw AppError.badRequest('Payment verification failed');
    }

    order.paymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    await order.save();

    logger.info(`Payment verified for order: ${order.orderNumber}`);
    return order;
  }
}

export const orderService = new OrderService();
