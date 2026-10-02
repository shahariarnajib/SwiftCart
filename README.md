# Swift Cart - Modern Production-Ready E-Commerce Platform

A complete, high-performance, conversion-focused e-commerce application built for **Swift Cart** in Bangladesh.

---

## 🎨 Brand Identity

- **Brand Name**: Swift Cart
- **Primary Color**: Swift Red (`#DC2626` / `brand-600`)
- **Secondary Color**: Clean White (`#FFFFFF`)
- **Supporting Neutrals**: Slate Black (`#0F172A`) & Crisp Light Gray (`#F8FAFC`, `#F1F5F9`)
- **Design Philosophy**: Modern, trustworthy, fast, clean typography, generous spacing, and conversion-optimized.

---

## 🚀 Key Features

### 🛍️ Customer Storefront
1. **Sticky Header**: Responsive desktop & mobile navigation, live search bar, category dropdown, dynamic shopping cart drawer/badge with count.
2. **Hero Section**: High-impact red + white branding, bold tagline *"Shop Smarter. Shop Faster."*, value propositions, and dual CTAs.
3. **Dynamic Featured Categories**: Loaded from database with product count badges.
4. **Featured & New Arrivals**: Dynamic product grids with discount badges, price struck-throughs, stock availability indicators, Quick View modal, and instant Add-to-Cart.
5. **Product Details Page**:
   - High-resolution gallery with thumbnail switcher
   - Stock status indicators (*In Stock*, *Low Stock*, *Out of Stock*)
   - Real-time quantity selectors
   - "Add to Cart" and "Buy Now" (instant checkout redirect)
   - Structured technical specifications table
   - Related products recommendations
   - Google Rich Snippet JSON-LD structured data for SEO
6. **Dedicated Cart & Mobile Checkout**:
   - Dynamic quantity adjustments with stock boundary protection
   - Real-time subtotal, delivery charges (Inside Dhaka ৳60 / Outside Dhaka ৳120 / Free over ৳2,500), and total calculations
   - Bangladesh phone number & address validation
   - Cash on Delivery (COD) payment method support
7. **Order Confirmation Page**:
   - Unique Order Number (`SC-XXXX`)
   - Detailed delivery breakdown, customer information, item price snapshot, and Printable Invoice.
8. **Informational & Policy Pages**:
   - About Us, Contact Us (with Banani Dhaka office details & interactive form), Privacy Policy, Terms & Conditions.

### 🛡️ Merchant Admin Panel
1. **Secure Authentication**:
   - Bcrypt password hashing & secure HTTP-only JWT cookies
   - Route protection for admin management endpoints
2. **Dashboard Overview**:
   - Revenue calculations (excluding cancelled orders)
   - Order pipeline status breakdown (*Pending, Confirmed, Processing, Shipped, Delivered, Cancelled*)
   - Catalog & stock warnings count
   - Recent incoming orders table with instant status management
3. **Product Management**:
   - Add, edit, and delete products
   - Dynamic multi-image URL management with primary indicator
   - Interactive key-value specifications builder
   - Featured & New Arrival toggles
   - Stock tracking with out-of-stock purchasing locks
4. **Inventory Control Center**:
   - Health indicators (Healthy, Low Stock ≤ 5, Out of Stock = 0)
   - Quick inline restock buttons (+10, +25, custom) with instant save
5. **Order Management System**:
   - Search by order number, customer name, or telephone
   - Status filters and date sorting
   - Detailed order inspection modal
   - Instant order status updates with automated inventory restoration on cancellation
6. **Category & Customer Management**:
   - Create, edit, and delete categories with product-assignment safety guards
   - Customer directory tracking lifetime order count and total spend
7. **Store Settings**:
   - Manage store name, tagline, hotline phone, support email, warehouse address, and delivery fees directly from UI.

---

## 🔑 Default Admin Credentials

- **URL**: `http://localhost:3000/admin`
- **Username**: `admin`
- **Password**: `admin123`

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Database ORM**: Prisma ORM with SQLite (`prisma/dev.db`)
- **Authentication**: JSON Web Tokens (JWT) + BcryptJS

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database & Seed Sample Products
```bash
npm run db:push
npm run db:seed
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to view the storefront, or `http://localhost:3000/admin` to access the admin portal.

### 4. Build for Production
```bash
npm run build
npm run start
```
