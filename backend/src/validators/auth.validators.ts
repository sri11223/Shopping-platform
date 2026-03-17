import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().required().email().trim(),
  password: Joi.string().required().min(6).max(128),
  phone: Joi.string().trim().pattern(/^[6-9]\d{9}$/).message('Invalid phone number').allow(''),
});

export const loginSchema = Joi.object({
  email: Joi.string().required().email().trim(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  phone: Joi.string().trim().pattern(/^[6-9]\d{9}$/).message('Invalid phone number').allow(''),
  avatar: Joi.string().uri().allow(''),
});

export const addAddressSchema = Joi.object({
  fullName: Joi.string().required().trim().min(2).max(100),
  phone: Joi.string().required().trim().pattern(/^[6-9]\d{9}$/),
  addressLine1: Joi.string().required().trim().min(5).max(200),
  addressLine2: Joi.string().trim().allow('').max(200),
  city: Joi.string().required().trim().min(2).max(100),
  state: Joi.string().required().trim().min(2).max(100),
  pincode: Joi.string().required().trim().pattern(/^\d{6}$/),
  country: Joi.string().trim().default('India'),
  isDefault: Joi.boolean().default(false),
});
