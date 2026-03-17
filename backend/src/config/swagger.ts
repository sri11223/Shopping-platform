import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LuxeStore API',
      version: '1.0.0',
      description:
        'Full-stack E-Commerce REST API with product browsing, cart management, checkout, orders, authentication, wishlist, and Razorpay payments.',
      contact: {
        name: 'LuxeStore',
      },
    },
    servers: [
      {
        url: 'https://shopping-platform-5quz.onrender.com',
        description: 'Production (Render)',
      },
      {
        url: 'http://localhost:5000',
        description: 'Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            originalPrice: { type: 'number' },
            category: { type: 'string' },
            brand: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            sizes: { type: 'array', items: { type: 'string' } },
            colors: { type: 'array', items: { type: 'string' } },
            stock: { type: 'integer' },
            rating: { type: 'number' },
            reviewCount: { type: 'integer' },
            features: { type: 'array', items: { type: 'string' } },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            product: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            quantity: { type: 'integer' },
            image: { type: 'string' },
          },
        },
        Cart: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
            sessionId: { type: 'string' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            orderNumber: { type: 'string' },
            items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
            subtotal: { type: 'number' },
            tax: { type: 'number' },
            shipping: { type: 'number' },
            total: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
            paymentStatus: { type: 'string', enum: ['pending', 'paid', 'failed'] },
            shippingAddress: { type: 'object' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            addresses: { type: 'array', items: { type: 'object' } },
            wishlist: { type: 'array', items: { type: 'string' } },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication & user management' },
      { name: 'Products', description: 'Product catalog' },
      { name: 'Cart', description: 'Shopping cart operations' },
      { name: 'Orders', description: 'Order management & payments' },
    ],
    paths: {
      // ─── AUTH ────────────────────────────────────────────────
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john@example.com' },
                    password: { type: 'string', example: 'password123' },
                    phone: { type: 'string', example: '9876543210' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Registration successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            400: { description: 'Validation error' },
            409: { description: 'Email already registered' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email & password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'demo@luxestore.com' },
                    password: { type: 'string', example: 'demo123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful — returns user + JWT token' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/profile': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Profile retrieved' },
            401: { description: 'Unauthorized' },
          },
        },
        put: {
          tags: ['Auth'],
          summary: 'Update user profile',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    phone: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Profile updated' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/auth/addresses': {
        post: {
          tags: ['Auth'],
          summary: 'Add a shipping address',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    fullName: { type: 'string' },
                    phone: { type: 'string' },
                    address: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    pincode: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Address added' },
          },
        },
      },
      '/api/auth/addresses/{addressId}': {
        delete: {
          tags: ['Auth'],
          summary: 'Remove an address',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'addressId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Address removed' },
          },
        },
      },
      '/api/auth/wishlist': {
        get: {
          tags: ['Auth'],
          summary: 'Get user wishlist',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Wishlist retrieved — returns populated product array' },
          },
        },
      },
      '/api/auth/wishlist/{productId}': {
        post: {
          tags: ['Auth'],
          summary: 'Toggle product in wishlist (add/remove)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Wishlist updated' },
          },
        },
      },
      // ─── PRODUCTS ───────────────────────────────────────────
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'List products with pagination, filters, search & sort',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'brand', in: 'query', schema: { type: 'string' } },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'rating', 'name_asc'] } },
          ],
          responses: {
            200: { description: 'Paginated product list with meta' },
          },
        },
      },
      '/api/products/categories': {
        get: {
          tags: ['Products'],
          summary: 'List all product categories',
          responses: { 200: { description: 'Array of category names' } },
        },
      },
      '/api/products/brands': {
        get: {
          tags: ['Products'],
          summary: 'List all product brands',
          responses: { 200: { description: 'Array of brand names' } },
        },
      },
      '/api/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get product details + related products',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Product details with related products' },
            404: { description: 'Product not found' },
          },
        },
      },
      // ─── CART ───────────────────────────────────────────────
      '/api/cart': {
        get: {
          tags: ['Cart'],
          summary: 'Get current cart',
          description: 'Returns cart by session ID or user ID',
          responses: { 200: { description: 'Cart object', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } } },
        },
        delete: {
          tags: ['Cart'],
          summary: 'Clear entire cart',
          responses: { 200: { description: 'Cart cleared' } },
        },
      },
      '/api/cart/items': {
        post: {
          tags: ['Cart'],
          summary: 'Add item to cart',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['productId'],
                  properties: {
                    productId: { type: 'string' },
                    quantity: { type: 'integer', default: 1 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Item added to cart' },
            404: { description: 'Product not found or out of stock' },
          },
        },
      },
      '/api/cart/items/{productId}': {
        put: {
          tags: ['Cart'],
          summary: 'Update item quantity',
          parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['quantity'],
                  properties: { quantity: { type: 'integer', minimum: 1, maximum: 10 } },
                },
              },
            },
          },
          responses: { 200: { description: 'Quantity updated' } },
        },
        delete: {
          tags: ['Cart'],
          summary: 'Remove item from cart',
          parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Item removed' } },
        },
      },
      // ─── ORDERS ─────────────────────────────────────────────
      '/api/orders': {
        post: {
          tags: ['Orders'],
          summary: 'Place a new order from cart',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['shippingAddress'],
                  properties: {
                    shippingAddress: {
                      type: 'object',
                      required: ['fullName', 'phone', 'address', 'city', 'state', 'pincode'],
                      properties: {
                        fullName: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', example: 'john@example.com' },
                        phone: { type: 'string', example: '9876543210' },
                        address: { type: 'string', example: '123 MG Road' },
                        city: { type: 'string', example: 'Bangalore' },
                        state: { type: 'string', example: 'Karnataka' },
                        pincode: { type: 'string', example: '560001' },
                      },
                    },
                    paymentMethod: { type: 'string', enum: ['cod', 'razorpay'], default: 'cod' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Order created — returns order object' },
            400: { description: 'Cart is empty or validation error' },
          },
        },
      },
      '/api/orders/my-orders': {
        get: {
          tags: ['Orders'],
          summary: 'Get orders for current user/session',
          responses: { 200: { description: 'Array of orders' } },
        },
      },
      '/api/orders/{orderNumber}': {
        get: {
          tags: ['Orders'],
          summary: 'Get order by order number',
          parameters: [{ name: 'orderNumber', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Order details' },
            404: { description: 'Order not found' },
          },
        },
      },
      '/api/orders/{orderNumber}/payment': {
        post: {
          tags: ['Orders'],
          summary: 'Create Razorpay payment for order',
          parameters: [{ name: 'orderNumber', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Razorpay order created — returns order_id, amount, key' } },
        },
      },
      '/api/orders/{orderNumber}/verify-payment': {
        post: {
          tags: ['Orders'],
          summary: 'Verify Razorpay payment signature',
          parameters: [{ name: 'orderNumber', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    razorpay_order_id: { type: 'string' },
                    razorpay_payment_id: { type: 'string' },
                    razorpay_signature: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Payment verified' } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
