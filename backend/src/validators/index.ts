import Joi from 'joi';

export const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
  search: Joi.string().trim().allow('').max(100),
  category: Joi.string().trim().allow(''),
  brand: Joi.string().trim().allow(''),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  sort: Joi.string().valid('price_asc', 'price_desc', 'rating', 'newest', 'name_asc').default('newest'),
});

export const addToCartSchema = Joi.object({
  productId: Joi.string().required().length(24).hex(),
  quantity: Joi.number().integer().min(1).max(10).default(1),
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(10).required(),
});

export const shippingAddressSchema = Joi.object({
  fullName: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().required().email().trim(),
  phone: Joi.string().required().trim().pattern(/^[6-9]\d{9}$/).message('Invalid Indian phone number'),
  addressLine1: Joi.string().required().trim().min(5).max(200),
  addressLine2: Joi.string().trim().allow('').max(200),
  city: Joi.string().required().trim().min(2).max(100),
  state: Joi.string().required().trim().min(2).max(100),
  pincode: Joi.string().required().trim().pattern(/^\d{6}$/).message('Pincode must be 6 digits'),
  country: Joi.string().trim().default('India'),
});

export const createOrderSchema = Joi.object({
  shippingAddress: shippingAddressSchema.required(),
  notes: Joi.string().trim().allow('').max(500),
});
