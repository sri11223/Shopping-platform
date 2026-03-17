import { User, IUser } from '../models/user.model';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class AuthService {
  async register(name: string, email: string, password: string, phone?: string): Promise<{ user: IUser; }> {
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      throw AppError.conflict('An account with this email already exists');
    }

    const user = new User({ name, email, password, phone });
    await user.save();

    logger.info(`New user registered: ${email}`);
    return { user };
  }

  async login(email: string, password: string): Promise<IUser> {
    const user = await User.findOne({ email }).select('+password').exec();

    if (!user) {
      throw AppError.badRequest('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw AppError.badRequest('Account has been deactivated', 'ACCOUNT_DEACTIVATED');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw AppError.badRequest('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    logger.info(`User logged in: ${email}`);
    return user;
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId).exec();
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, updates: Partial<{ name: string; phone: string; avatar: string }>): Promise<IUser> {
    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).exec();
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }

  async addAddress(userId: string, address: any): Promise<IUser> {
    const user = await User.findById(userId).exec();
    if (!user) throw AppError.notFound('User not found');

    if (address.isDefault) {
      user.addresses.forEach(addr => (addr.isDefault = false));
    }
    user.addresses.push(address);
    await user.save();
    return user;
  }

  async removeAddress(userId: string, addressId: string): Promise<IUser> {
    const user = await User.findById(userId).exec();
    if (!user) throw AppError.notFound('User not found');

    user.addresses = user.addresses.filter(a => (a as any)._id.toString() !== addressId);
    await user.save();
    return user;
  }

  async toggleWishlist(userId: string, productId: string): Promise<{ wishlisted: boolean; wishlist: string[] }> {
    const user = await User.findById(userId).exec();
    if (!user) throw AppError.notFound('User not found');

    const index = user.wishlist.findIndex(id => id.toString() === productId);
    let wishlisted: boolean;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      wishlisted = false;
    } else {
      user.wishlist.push(productId as any);
      wishlisted = true;
    }

    await user.save();
    return { wishlisted, wishlist: user.wishlist.map(id => id.toString()) };
  }

  async getWishlist(userId: string) {
    const user = await User.findById(userId).populate('wishlist').exec();
    if (!user) throw AppError.notFound('User not found');
    return user.wishlist;
  }
}

export const authService = new AuthService();
