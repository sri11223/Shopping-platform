export const PRODUCT_CATEGORIES = [
  'T-Shirts',
  'Shirts',
  'Jeans',
  'Jackets',
  'Dresses',
  'Shoes',
  'Accessories',
  'Activewear',
] as const;

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export const PAYMENT_STATUSES = [
  'pending',
  'created',
  'paid',
  'failed',
  'refunded',
] as const;

export const SORT_OPTIONS = {
  'price_asc': { price: 1 },
  'price_desc': { price: -1 },
  'rating': { rating: -1 },
  'newest': { createdAt: -1 },
  'name_asc': { name: 1 },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
} as const;
