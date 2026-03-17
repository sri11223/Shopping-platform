import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10),
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
