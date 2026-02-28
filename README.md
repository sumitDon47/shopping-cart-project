# 🛒 ShopCart — Full-Stack E-Commerce Platform

A modern, full-featured e-commerce application built with **React 19**, **Redux Toolkit**, **Express 5**, and **MongoDB**. Includes user authentication with email OTP verification, product catalog with reviews, cart management, order tracking, Khalti payment integration, and a complete admin dashboard.

![Node.js](https://img.shields.io/badge/Node.js-ES_Modules-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)

---

## ✨ Features

### Customer Features
- **OTP-Based Registration** — 3-step signup with 6-digit OTP sent to email via Gmail SMTP
- **Secure Login** — JWT-based authentication with auto-expiry
- **Forgot Password** — Email-based OTP password reset flow
- **Product Browsing** — Search, filter by category, sort by price/rating, pagination
- **Product Reviews** — Authenticated users can rate and review products
- **Shopping Cart** — Add/update/remove items, persistent across sessions (server-backed)
- **Checkout** — Shipping address form with multiple payment methods
- **Khalti Payment** — Integrated Khalti payment gateway (sandbox mode)
- **Order Tracking** — View order history with real-time status updates
- **Profile Management** — Edit name, phone, address, change password
- **Dark/Light Theme** — Toggle between themes with CSS variables

### Admin Dashboard
- **Overview** — Stats cards (total users, products, orders, revenue)
- **Products Management** — Create, update, delete products
- **Users Management** — View all registered users, delete accounts
- **Orders Management** — View all orders, search, filter & update order status
- **Payments** — View all paid orders and payment details
- **Role Restriction** — Admin cannot add to cart or place orders

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Redux Toolkit | Global State Management |
| React Router v7 | Client-side Routing |
| Axios | HTTP Client |
| Vite 8 | Build Tool & Dev Server |
| React Icons (Feather) | Icon Library |
| React Hot Toast | Toast Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| Express 5 | Web Framework |
| MongoDB + Mongoose 9 | Database & ODM |
| JSON Web Tokens | Authentication |
| bcryptjs | Password Hashing |
| Nodemailer | Email (Gmail SMTP) |
| Axios | Khalti API Communication |
| Multer + Cloudinary | Image Uploads |
| dotenv | Environment Variables |

---

## 📁 Project Structure

```
shopping-cart-project/
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # LoginPage, RegisterPage (3-step OTP)
│   │   │   ├── common/         # Navbar, Footer, Loader, ProtectedRoute
│   │   │   └── profile/        # ProfileView, ProfileEdit, ChangePassword
│   │   ├── pages/
│   │   │   ├── admin/          # Dashboard, Products, Users, Payments, Orders
│   │   │   ├── auth/           # Login, Register, ForgotPassword wrappers
│   │   │   ├── cart/           # CartPage, CheckoutPage
│   │   │   ├── orders/         # OrdersPage, OrderDetailPage
│   │   │   ├── payment/        # KhaltiCallback
│   │   │   ├── products/       # ProductsPage, ProductDetailPage
│   │   │   ├── user/           # DashboardPage, ProfilePage
│   │   │   ├── HomePage.jsx
│   │   │   └── NotFound.jsx
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/         # authSlice, userSlice, cartSlice, orderSlice
│   │   ├── services/
│   │   │   └── api.js          # Axios instance & all API methods
│   │   └── utils/
│   │       └── constants.js    # API_URL, ROUTES, USER_ROLES
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Register (OTP), Login, Forgot/Reset Password
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── adminController.js
│   │   └── paymentController.js  # Khalti initiate & verify
│   ├── middleware/
│   │   ├── authMiddleware.js   # protect, authorize (role-based)
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js             # name, email, password, role, address
│   │   ├── Product.js          # name, price, mrp, stock, reviews, category
│   │   ├── Order.js            # items, shipping, payment, status
│   │   ├── Cart.js             # user-specific cart with virtuals
│   │   └── Otp.js              # OTP with TTL auto-expiry (10 min)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── adminRoutes.js
│   │   └── paymentRoutes.js
│   ├── utils/
│   │   ├── email.js            # Nodemailer Gmail SMTP (OTP templates)
│   │   └── seedProducts.js     # Database seeder
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB Atlas** account (or local MongoDB)
- **Gmail account** with [App Password](https://myaccount.google.com/apppasswords) for SMTP
- **Khalti Merchant account** (sandbox) — optional for payments

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shopping-cart-project.git
cd shopping-cart-project
```

### 2. Setup Environment Variables

Create `server/.env`:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
ADMIN_EMAIL=admin@shopcart.com
ADMIN_PASSWORD=Admin@123

# Gmail SMTP
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_16_char_app_password

# Khalti (Sandbox)
KHALTI_SECRET_KEY=your_khalti_secret_key
KHALTI_GATEWAY_URL=https://dev.khalti.com/api/v2
```

### 3. Install Dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 4. Seed the Database (Optional)

```bash
cd server
npm run seed
```

### 5. Run the Application

```bash
# Start server (from /server)
npm run dev        # → http://localhost:5000

# Start client (from /client)
npm run dev        # → http://localhost:5173
```

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/send-otp` | Send registration OTP to email | No |
| POST | `/resend-otp` | Resend OTP | No |
| POST | `/verify-otp` | Verify OTP & create account | No |
| POST | `/login` | Login with email & password | No |
| POST | `/forgot-password` | Send password reset OTP | No |
| POST | `/reset-password` | Reset password with OTP | No |
| GET | `/me` | Get logged-in user profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| DELETE | `/me` | Delete own account | Yes |

### Products (`/api/products`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List products (search, filter, sort, paginate) | No |
| GET | `/top` | Top rated products | No |
| GET | `/categories` | All categories | No |
| GET | `/:id` | Product details | No |
| POST | `/` | Create product | Admin |
| PUT | `/:id` | Update product | Admin |
| DELETE | `/:id` | Delete product | Admin |
| POST | `/:id/reviews` | Add review | Yes |

### Cart (`/api/cart`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get cart | Yes |
| POST | `/` | Add item to cart | Yes |
| PUT | `/:itemId` | Update item quantity | Yes |
| DELETE | `/:itemId` | Remove item | Yes |
| DELETE | `/` | Clear entire cart | Yes |

### Orders (`/api/orders`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create order from cart | Yes |
| GET | `/myorders` | Get logged-in user's orders | Yes |
| GET | `/` | Get all orders | Admin |
| GET | `/:id` | Get order by ID | Yes |
| PUT | `/:id/status` | Update order status | Admin |
| PUT | `/:id/pay` | Mark order as paid | Yes |

### Payment (`/api/payment`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/khalti/initiate` | Initiate Khalti payment | Yes |
| POST | `/khalti/verify` | Verify Khalti payment | Yes |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stats` | Dashboard statistics | Admin |
| GET | `/users` | List all users | Admin |
| DELETE | `/users/:id` | Delete a user | Admin |
| GET | `/payments` | List paid orders | Admin |

---

## 🔐 Authentication Flow

### Registration (3-Step OTP)
```
1. User enters Name + Email  →  POST /auth/send-otp  →  OTP sent to email
2. User enters 6-digit OTP   →  Verified client-side
3. User sets Password         →  POST /auth/verify-otp  →  Account created + JWT issued
```

### Password Reset
```
1. User enters Email          →  POST /auth/forgot-password  →  OTP sent to email
2. User enters OTP + New Pass →  POST /auth/reset-password   →  Password updated
```

---

## 💳 Payment Flow (Khalti)

```
1. User places order (paymentMethod: "khalti")
2. Frontend calls POST /payment/khalti/initiate with orderId
3. Server creates Khalti payment session → returns payment URL
4. User redirected to Khalti checkout page
5. After payment, Khalti redirects to /payment/khalti/callback
6. Frontend calls POST /payment/khalti/verify with pidx
7. Server verifies with Khalti API → marks order as paid
```

---

## 🎨 Theming

The app supports **dark** and **light** themes using CSS custom properties:

```css
[data-theme="light"] { --bg-primary: #ffffff; ... }
[data-theme="dark"]  { --bg-primary: #0f172a; ... }
```

Toggle is available in the Navbar dropdown (logged-in users) or as a standalone button (guests).

---

## 👤 Default Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@shopcart.com` |
| Password | `Admin@123` |

> The admin account is auto-created on first server start if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `.env`.

---

## 📝 Scripts

### Server (`/server`)
| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `nodemon server.js` | Start with auto-reload |
| `start` | `node server.js` | Production start |
| `seed` | `node utils/seedProducts.js` | Seed product data |

### Client (`/client`)
| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Dev server (HMR) |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview production build |
| `lint` | `eslint .` | Lint code |

---

## 📄 License

This project is for educational purposes.
