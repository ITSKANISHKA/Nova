# Nova — Full-Stack E-Commerce Platform

A full-stack e-commerce platform built with **React, Node.js, Express.js, and MongoDB**, featuring JWT authentication with role-based access control (Buyer/Seller/Admin), Razorpay payments, and 10+ modules.
Built a multi-user e-commerce platform with an architecture designed to support 1,000+ users.

## Modules

| Module | Description |
|---|---|
| Auth | JWT access + refresh token system, role-based access (buyer/seller/admin) |
| Products | Search, filter, sort, pagination, seller CRUD |
| Cart | Add/update/remove items, stock validation |
| Checkout & Payments | Razorpay integration (test mode), signature verification |
| Orders | Buyer order history, seller order management, status tracking |
| Reviews | Verified-purchase-only reviews, product rating aggregation |
| Wishlist | Add/remove/view saved products |
| Seller Dashboard | Product management, order fulfillment |
| Admin Panel | User management, platform-wide product/order visibility, stats |
| Profile | Address & contact management |

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios, Razorpay Checkout.js
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt, Razorpay SDK
- **Deployment:** Vercel (frontend) + Render (backend) + MongoDB Atlas (database)

## Project Structure

```
ecommerce-platform/
├── backend/          # Express API
│   ├── config/       # DB connection
│   ├── controllers/  # Route handlers
│   ├── middleware/   # Auth, error handling
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── utils/        # Token helpers, seed script
│   └── server.js
└── frontend/         # React app
    └── src/
        ├── api/       # Axios instance + endpoint functions
        ├── components/
        ├── context/   # Auth & Cart state
        └── pages/
```

## Local Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT secrets, Razorpay keys
npm run seed            # creates admin + demo seller + sample products
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```

See `DEPLOYMENT.md` for step-by-step public deployment instructions (Vercel + Render + MongoDB Atlas).

## Demo Accounts (after running `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@ecommerce.com | Admin@123 |
| Seller | seller@ecommerce.com | Seller@123 |

## Auth Design Notes

To avoid login/logout issues in production:
- Short-lived access tokens (15 min) are kept in memory on the frontend — never in localStorage.
- Long-lived refresh tokens (7 days) live in an httpOnly cookie and are validated against a copy stored in the database, so a logout on one device can't be replayed.
- An Axios response interceptor automatically calls `/api/auth/refresh` on a 401 and retries the original request, so users aren't logged out just because their access token expired mid-session.
- CORS is configured with `credentials: true` and a specific `CLIENT_URL`, which is required for cookies to work across the Vercel/Render domains.
