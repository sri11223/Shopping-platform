# 🛍️ LuxeStore — E-Commerce Cart & Checkout System

A production-grade, full-stack e-commerce application built with the **MEAN stack** (MongoDB, Express.js, Angular 17, Node.js/TypeScript). Features product browsing, shopping cart management, checkout with form validation, order placement, and Razorpay payment integration.

![Angular](https://img.shields.io/badge/Angular-17-DD0031) ![Node.js](https://img.shields.io/badge/Node.js-Express-339933) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Product Listing** | Grid view with search, category/brand filters, price range, sorting, and pagination |
| **Product Details** | Image gallery, size/color selectors, related products, stock status |
| **Shopping Cart** | Add/remove items, quantity controls, live total with GST & shipping calculation |
| **Checkout** | Reactive form with validation (phone, pincode), order summary review |
| **Order Summary** | Confirmation page with order details, items, shipping address, payment status |
| **Razorpay Payment** | Test mode integration for online payments |

### Architecture Highlights

- **Backend**: Layered architecture (Controllers → Services → Models) with Joi validation, centralized error handling, and in-memory caching
- **Frontend**: Angular 17 standalone components, lazy-loaded routes, BehaviorSubject state management, RxJS shareReplay caching, HTTP interceptors
- **Security**: Helmet, CORS, rate limiting, input validation
- **Performance**: Node-Cache with TTL, MongoDB compound indexes, lazy loading, view transitions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17, TypeScript, CSS (custom design system) |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB (Mongoose ODM) |
| Payments | Razorpay (test mode) |
| Caching | node-cache (in-memory TTL-based) |
| Validation | Joi (backend), Reactive Forms (frontend) |

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** running locally on `mongodb://localhost:27017` (or a MongoDB Atlas URI)

### 1. Clone the Repository

```bash
git clone <repo-url>
cd E-commerce-application
```

### 2. Backend Setup

```bash
cd backend
npm install

# Configure environment (edit .env if needed)
# Default: MongoDB on localhost:27017, server on port 5000

# Seed the database with 24 sample products
npm run seed

# Start the backend server
npm run dev
```

The backend starts at **http://localhost:5000**.

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start the Angular dev server
npx ng serve
```

The frontend starts at **http://localhost:4200**.

---

## 🧪 Sample Usage / Test Flow

### 1. Browse Products
- Open **http://localhost:4200** in your browser
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
E-commerce-application/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Razorpay, env config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Error, cache, session, validation
│   │   ├── models/          # Mongoose schemas (Product, Cart, Order)
│   │   ├── routes/          # Express API routes
│   │   ├── services/        # Business logic layer
│   │   ├── utils/           # Logger, errors, constants, response helpers
│   │   ├── validators/      # Joi validation schemas
│   │   ├── seed/            # Product seed data (24 items)
│   │   └── app.ts           # Express entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── core/        # Services, interceptors, models/types
│       │   ├── shared/      # Reusable components (toast)
│       │   ├── features/    # Feature pages (products, cart, checkout, orders)
│       │   ├── layouts/     # Header, footer
│       │   ├── app.routes.ts
│       │   ├── app.config.ts
│       │   └── app.component.ts
│       ├── environments/
│       └── styles.css       # Global design system
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (pagination, filters, search, sort) |
| GET | `/api/products/categories` | List all categories |
| GET | `/api/products/brands` | List all brands |
| GET | `/api/products/:id` | Product details + related products |
| GET | `/api/cart` | Get cart by session |
| POST | `/api/cart/items` | Add item to cart |
| PUT | `/api/cart/items/:productId` | Update item quantity |
| DELETE | `/api/cart/items/:productId` | Remove item from cart |
| DELETE | `/api/cart` | Clear cart |
| POST | `/api/orders` | Create order from cart |
| GET | `/api/orders/:orderNumber` | Get order summary |
| POST | `/api/orders/:orderNumber/payment` | Create Razorpay payment |
| POST | `/api/orders/:orderNumber/verify-payment` | Verify Razorpay payment |

---

## ⚙️ Environment Variables (Backend `.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | `mongodb://localhost:27017/ecommerce` | MongoDB connection string |
| `RAZORPAY_KEY_ID` | `rzp_test_placeholder` | Razorpay test API key |
| `RAZORPAY_KEY_SECRET` | `placeholder_secret` | Razorpay test secret |
| `FRONTEND_URL` | `http://localhost:4200` | CORS allowed origin |
| `CACHE_TTL` | `300` | Cache TTL in seconds |

---

## 📝 License

This project was built as part of a technical assignment.
