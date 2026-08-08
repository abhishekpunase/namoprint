# OMGS Print Backend

Node.js + Express + MongoDB backend for a personalized print-on-demand store.

## Setup

```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

Required before real payment/upload production:

- Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
- Add AWS S3 env keys for cloud uploads. Without them, uploads are stored in local `uploads/`.
- Add Shiprocket credentials when shipping automation is ready.
- Change `JWT_*` secrets and `ADMIN_SETUP_SECRET` before production.
- Add SMTP env keys for real forgot-password emails. Without SMTP, the API returns a dev reset URL and logs it.

## Main APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/admin/register` requires `setupSecret`
- `POST /api/auth/admin/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/account/profile`
- `PATCH /api/account/profile`
- `POST /api/account/addresses`
- `DELETE /api/account/addresses/:addressId`
- `GET /api/account/orders`
- `GET /api/account/payments`
- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/uploads/photo` multipart field `photo`
- `POST /api/uploads/preview`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `POST /api/orders/checkout`
- `GET /api/orders/my`
- `GET /api/orders/:id`
- `POST /api/payments/razorpay/order`
- `POST /api/payments/razorpay/verify`
- `POST /api/payments/webhook`
- `GET /api/admin/dashboard`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id/status`
- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `PATCH /api/admin/users/:id/status`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PATCH /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`

Cart, upload, checkout, payment, account, and admin routes require JWT Bearer auth. Product and category listing remain public for browsing.

## Image Upload To Preview Logic

1. Frontend uploads photo to `POST /api/uploads/photo` as multipart `photo`.
2. Backend validates file type/size, rotates using EXIF, creates print-quality optimized image and lightweight preview using `sharp`.
3. File is stored in S3 when configured, otherwise local dev storage.
4. Frontend calls `POST /api/uploads/preview` with `productId`, `assetId`, and crop data.
5. Backend returns product mockup canvas, photo box, crop, and layer instructions. Vite frontend can render this on canvas/CSS for customer preview.
