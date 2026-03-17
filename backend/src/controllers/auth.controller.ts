import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { generateToken, AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, phone } = req.body;
      const { user } = await authService.register(name, email, password, phone);
      const token = generateToken(user._id as string);
      sendSuccess(res, { user, token }, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await authService.login(email, password);
      const token = generateToken(user._id as string);
      sendSuccess(res, { user, token }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!._id as string);
      sendSuccess(res, user, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.updateProfile(req.user!._id as string, req.body);
      sendSuccess(res, user, 'Profile updated');
    } catch (error) {
      next(error);
    }
  }

  async addAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.addAddress(req.user!._id as string, req.body);
      sendSuccess(res, user.addresses, 'Address added');
    } catch (error) {
      next(error);
    }
  }

  async removeAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.removeAddress(req.user!._id as string, req.params.addressId);
      sendSuccess(res, user.addresses, 'Address removed');
    } catch (error) {
      next(error);
    }
  }

  async toggleWishlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.toggleWishlist(req.user!._id as string, req.params.productId);
      sendSuccess(res, result, result.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (error) {
      next(error);
    }
  }

  async getWishlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const wishlist = await authService.getWishlist(req.user!._id as string);
      sendSuccess(res, wishlist, 'Wishlist retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
