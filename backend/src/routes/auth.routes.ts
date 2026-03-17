import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, updateProfileSchema, addAddressSchema } from '../validators/auth.validators';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, validate(updateProfileSchema), authController.updateProfile);

// Addresses
router.post('/addresses', authMiddleware, validate(addAddressSchema), authController.addAddress);
router.delete('/addresses/:addressId', authMiddleware, authController.removeAddress);

// Wishlist
router.get('/wishlist', authMiddleware, authController.getWishlist);
router.post('/wishlist/:productId', authMiddleware, authController.toggleWishlist);

export default router;
