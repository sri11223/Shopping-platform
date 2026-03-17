export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  brand: string;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  features: string[];
  sizes: string[];
  colors: string[];
  isActive: boolean;
  discountPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface Cart {
  _id: string;
  sessionId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  shippingCharge: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentId?: string;
  razorpayOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export interface ProductDetailResponse {
  product: Product;
  relatedProducts: Product[];
}

export interface RazorpayPaymentData {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}
