# 🛍️ LuxeStore — E-Commerce Cart & Checkout System

A production-grade, full-stack e-commerce application built with the **MEAN stack** (MongoDB, Express.js, Angular 17, Node.js/TypeScript). Features product browsing, shopping cart management, checkout with form validation, order placement, authentication, wishlist, and Razorpay payment integration.

![Angular](https://img.shields.io/badge/Angular-17-DD0031) ![Node.js](https://img.shields.io/badge/Node.js-Express-339933) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6)

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🖥️ **Frontend** (Vercel) | [https://shopping-platform-blush.vercel.app](https://shopping-platform-blush.vercel.app) |
| ⚙️ **Backend API** (Render) | [https://shopping-platform-5quz.onrender.com](https://shopping-platform-5quz.onrender.com) |
| 📖 **API Docs** (Swagger) | [https://shopping-platform-5quz.onrender.com/api-docs](https://shopping-platform-5quz.onrender.com/api-docs) |

### Demo Credentials
| Email | Password |
|-------|----------|
| `demo@luxestore.com` | `demo123` |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Product Listing** | Grid view with search, category/brand filters, price range, sorting, and pagination |
| **Product Details** | Image gallery, size/color selectors, related products, stock status |
| **Shopping Cart** | Add/remove items, quantity controls, live total with GST & shipping calculation |
| **Checkout** | Reactive form with validation (phone, pincode), order summary review |
| **Order Summary** | Confirmation page with order details, items, shipping address, payment status |
| **My Orders** | Order history with status tracking |
| **Authentication** | JWT-based register/login, protected routes, profile management |
| **Wishlist** | Add/remove products, move to cart |
| **Razorpay Payment** | Test mode integration for online payments |
| **Swagger API Docs** | Interactive API documentation at `/api-docs` |

### Architecture Highlights

- **Backend**: Layered architecture (Controllers → Services → Models) with Joi validation, centralized error handling, and in-memory caching
- **Frontend**: Angular 17 standalone components with external HTML/CSS files, lazy-loaded routes, BehaviorSubject state management, RxJS shareReplay caching, HTTP interceptors
- **Security**: Helmet, CORS, rate limiting, input validation, JWT authentication
- **Performance**: Node-Cache with TTL, MongoDB compound indexes, lazy loading, view transitions
- **UX**: Loading states on all action buttons with double-click prevention
- **CI/CD**: GitHub Actions workflow for automated build verification

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17, TypeScript, CSS (custom design system) |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Payments | Razorpay (test mode) |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Caching | node-cache (in-memory TTL-based) |
| Validation | Joi (backend), Reactive Forms (frontend) |
| CI/CD | GitHub Actions |
| Deployment | Vercel (frontend), Render (backend) |

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** running locally on `mongodb://localhost:27017` (or a MongoDB Atlas URI)

### 1. Clone the Repository

```bash
git clone https://github.com/sri11223/Shopping-platform.git
cd Shopping-platform
```

### 2. Backend Setup

```bash
cd backend
npm install

# Configure environment (edit .env if needed)
# Default: MongoDB on localhost:27017, server on port 5000

# Seed the database with 24 sample products + demo user
npm run seed

# Start the backend server
npm run dev
```

The backend starts at **http://localhost:5000**.
Swagger docs available at **http://localhost:5000/api-docs**.

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start the Angular dev server
npx ng serve
```

The frontend starts at **http://localhost:4200**.

---

## 📖 API Documentation (Swagger)

Interactive API documentation is available at:
- **Production**: [https://shopping-platform-5quz.onrender.com/api-docs](https://shopping-platform-5quz.onrender.com/api-docs)
- **Local**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

The Swagger UI lets you explore and test all API endpoints directly in the browser.

---

## 🔌 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | ✕ |
| POST | `/api/auth/login` | Login with email & password | ✕ |
| GET | `/api/auth/profile` | Get current user profile | ✓ |
| PUT | `/api/auth/profile` | Update user profile | ✓ |
| POST | `/api/auth/addresses` | Add a shipping address | ✓ |
| DELETE | `/api/auth/addresses/:addressId` | Remove an address | ✓ |
| GET | `/api/auth/wishlist` | Get user wishlist | ✓ |
| POST | `/api/auth/wishlist/:productId` | Toggle product in wishlist | ✓ |

### Products (`/api/products`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (pagination, filters, search, sort) |
| GET | `/api/products/categories` | List all categories |
| GET | `/api/products/brands` | List all brands |
| GET | `/api/products/:id` | Product details + related products |

### Cart (`/api/cart`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart by session/user |
| POST | `/api/cart/items` | Add item to cart |
| PUT | `/api/cart/items/:productId` | Update item quantity |
| DELETE | `/api/cart/items/:productId` | Remove item from cart |
| DELETE | `/api/cart` | Clear cart |

### Orders (`/api/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order from cart |
| GET | `/api/orders/my-orders` | Get user's order history |
| GET | `/api/orders/:orderNumber` | Get order summary |
| POST | `/api/orders/:orderNumber/payment` | Create Razorpay payment |
| POST | `/api/orders/:orderNumber/verify-payment` | Verify Razorpay payment |

---

## 🧪 Sample Usage / Test Flow

### 1. Browse Products
- Open the app URL in your browser
- You'll see the product listing page with 24 products across 8 categories
- Use the **search bar** to find specific items
- Click **category chips** (Shirts, Jeans, Jackets, etc.) to filter
- Use the **sort dropdown** to order by price, rating, or name

### 2. View Product Details
- Click any product card to view its detail page
- See the full description, features, size/color options
- Check the star rating and stock availability
- Browse **related products** at the bottom

### 3. Add to Cart
- From either the listing or detail page, click **"Add to Cart"**
- The cart badge in the header updates instantly
- A toast notification confirms the action
- Button shows "Adding..." state to prevent double-clicks

### 4. Manage Cart
- Click the cart icon in the header to go to the cart page
- Use **+/−** buttons to change item quantities
- Click the **trash icon** to remove items
- See live subtotal, GST (18%), and shipping calculation (free over ₹999)

### 5. Checkout
- Click **"Proceed to Checkout"**
- Fill in the shipping form:
  - **Full Name**: John Doe
  - **Email**: john@example.com
  - **Phone**: 9876543210
  - **Address**: 123 MG Road
  - **City**: Bangalore
  - **State**: Karnataka
  - **Pincode**: 560001
- Review the order summary on the right
- Click **"Place Order"**

### 6. Order Confirmation
- You'll be redirected to the **Order Summary** page
- Check order number, status, items, shipping details, and payment breakdown

---

## 📁 Project Structure

```
Shopping-platform/
├── .github/workflows/ci.yml   # GitHub Actions CI pipeline
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Razorpay, Swagger config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Error, cache, session, auth, validation
│   │   ├── models/          # Mongoose schemas (Product, Cart, Order, User)
│   │   ├── routes/          # Express API routes
│   │   ├── services/        # Business logic layer
│   │   ├── utils/           # Logger, errors, constants, response helpers
│   │   ├── validators/      # Joi validation schemas
│   │   ├── seed/            # Product seed data (24 items) + demo user
│   │   └── app.ts           # Express entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── core/        # Services, interceptors, models/types
│       │   ├── shared/      # Reusable components (toast)
│       │   ├── features/    # Feature pages (products, cart, checkout, orders, auth, wishlist)
│       │   ├── layouts/     # Header, footer
│       │   ├── app.routes.ts
│       │   ├── app.config.ts
│       │   └── app.component.ts
│       ├── environments/
│       └── styles.css       # Global design system
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | `mongodb://localhost:27017/ecommerce` | MongoDB connection string |
| `JWT_SECRET` | `your-secret-key` | JWT signing secret |
| `RAZORPAY_KEY_ID` | `rzp_test_placeholder` | Razorpay test API key |
| `RAZORPAY_KEY_SECRET` | `placeholder_secret` | Razorpay test secret |
| `FRONTEND_URL` | `http://localhost:4200` | CORS allowed origin |
| `CACHE_TTL` | `300` | Cache TTL in seconds |

### Frontend (`environment.prod.ts`)
| Variable | Value | Description |
|----------|-------|-------------|
| `apiUrl` | `https://shopping-platform-5quz.onrender.com/api` | Backend API URL |

---

## 📝 License

This project was built as part of a technical assignment.
