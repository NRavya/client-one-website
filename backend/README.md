# ESKRAFT Backend

## Setup
```
cd backend
npm install
cp .env.example .env  # fill DATABASE_URL, JWT_SECRET
npx prisma migrate deploy
npx prisma generate
node src/utils/seed.js
npm run dev # nodemon server.js
```

## Env (.env.example)
PORT, DATABASE_URL, JWT_SECRET, FRONTEND_URL, CASHFREE_* (optional for later)

## APIs
- POST /api/auth/register {name,email,phone,password}
- POST /api/auth/login
- GET /api/products , GET /api/products/:slug
- POST /api/orders (auth) {items:[{productId,quantity}]}
- GET /api/orders/my-orders (auth)
- GET /api/orders/:orderNumber (auth, owner or admin)
- GET /api/admin/orders?status=&search=&page=&limit= (admin)
- PATCH /api/admin/orders/:id/status {status} (admin)
- GET /api/admin/customers, GET /api/admin/products

All responses: {success, data, message} / {success:false, error:{code,message}}

## Test credentials (seed)
- admin@eskraft.in / Admin@123 (ADMIN)
- customer@test.com / Customer@123 (CUSTOMER)

## Frontend integration
Vite proxy `/api` -> localhost:5000. Account.jsx already uses /api/auth and /api/orders/my-orders. Cart.jsx now POST /api/orders.

Payment deliberately NOT implemented; orders created with PENDING/PENDING_PAYMENT, ready for Cashfree later.
