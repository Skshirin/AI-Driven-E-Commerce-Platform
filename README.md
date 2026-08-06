# 🚀 EvoCart - AI-Powered Full-Stack E-Commerce Platform

EvoCart is a state-of-the-art, full-stack e-commerce platform designed for speed, security, and AI-enabled product discovery. Powered by **React 19**, **Express**, **PostgreSQL**, and **Groq Cloud (Llama 3.1)**, it delivers a seamless shopping experience integrated with **Stripe** payment processing and automatic stock inventory management.

---

## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Installation & Setup](#installation--setup)
- [💾 Database Schema](#-database-schema)
- [🔌 API Endpoint Reference](#-api-endpoint-reference)
- [🤖 AI Recommendation Engine](#-ai-recommendation-engine)
- [💳 Payment & Webhooks Flow](#-payment--webhooks-flow)

---

## ✨ Key Features

- **🔐 Robust Authentication**: Secure user authentication using JWT, bcrypt hashing, HTTP-only cookies, and transactional email-based password recovery (via SMTP/Nodemon).
- **🤖 AI-Powered Product Search**: Users can search for products using natural language query recommendations. Powered by Groq's `llama-3.1-8b-instant` LLM.
- **💳 Payment Integration**: Dynamic checkout sessions and secure transactions processed through Stripe SDK.
- **⚡ Webhook Synchronization**: Real-time event notifications handled via Stripe webhooks to automatically mark orders as paid and adjust database stock inventory upon payment completion.
- **🖼️ Cloud Image Storage**: Product images are uploaded directly and optimized using Cloudinary CDN.
- **⭐ Reviews & Ratings**: Interactive customer review system with stars, comments, and real-time average score updates.
- **📊 Admin Portal**: Advanced tools for store administrators to create, update, delete, and monitor products and orders.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React 19 (built on Vite 7 for near-instant HMR)
- **State Management**: Redux Toolkit & React Redux
- **Routing**: React Router DOM (v7)
- **Styling**: Tailwind CSS & Tailwind CSS Animate
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **API Client**: Axios (configured with credentials and baseURL hooks)

### Backend (Server)
- **Runtime Environment**: Node.js (ES Modules import syntax)
- **Framework**: Express (with customized async error middleware handler)
- **Database**: PostgreSQL (interfaced via low-latency native `pg` client pools)
- **Authentication**: JSON Web Tokens (JWT) & BcryptJS
- **File Uploads**: Express-FileUpload & Multer

### Services & Infrastructure
- **AI Engine**: Groq Cloud AI SDK (`llama-3.1-8b-instant`)
- **Payment Processing**: Stripe Payment Intent API
- **Cloud Storage**: Cloudinary Media API
- **Email Server**: SMTP Mailer (configured with secure OAuth/credential settings)

---

## 📂 Project Structure

```
EvoCart/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── api/            # API service calls
│   │   ├── components/     # UI Components (Navbar, Search, Cart, AISearchModal, etc.)
│   │   ├── contexts/       # React Contexts (Theme, etc.)
│   │   ├── data/           # Mock data and static configuration
│   │   ├── lib/            # External library configurations (e.g. Axios)
│   │   ├── pages/          # Page layouts (Home, Cart, Products, Orders, Stripe Checkout)
│   │   ├── store/          # Redux Toolkit store and slices (authSlice, productSlice, etc.)
│   │   └── main.jsx        # App entry point
│   ├── tailwind.config.js  # Tailwind configuration
│   └── vite.config.js      # Vite build setup
│
├── server/                 # Backend Node.js / Express Server
│   ├── config/             # Configuration folder (environment variables)
│   ├── controllers/        # Express Route Handlers (auth, products, orders, admin)
│   ├── database/           # Database initialization and client connection
│   ├── middlewares/        # Error handlers, authentication guards, role validation
│   ├── models/             # Database table schemas / definitions
│   ├── router/             # Express routes (API router endpoints)
│   ├── utils/              # Utility scripts (AI helper, Stripe triggers, table initializers)
│   ├── uploads/            # Temporary local directory for file uploads
│   └── server.js           # Server runner and Cloudinary initialization
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **PostgreSQL** (running locally or a cloud-hosted instance on Neon/Supabase)

### Environment Configuration

#### Backend Setup (`server/config/config.env`)
Create a file at `server/config/config.env` and configure the following variables:

```ini
PORT=4000
FRONTEND_URL=http://localhost:5173
DASHBOARD_URL=http://localhost:5174

# Database Config
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=evocartdb
DB_HOST=localhost
DB_PORT=5432

# Token & Cookie Config
JWT_SECRET_KEY=your_super_secret_jwt_key
JWT_EXPIRES_IN=30d
COOKIE_EXPIRES_IN=30

# SMTP / Mail Service Config
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_smtp_app_password

# Groq AI Config
GROQ_API_KEY=your_groq_api_key_here

# Cloudinary Config
CLOUDINARY_CLIENT_NAME=your_cloudinary_name
CLOUDINARY_CLIENT_API=your_cloudinary_api_key
CLOUDINARY_CLIENT_SECRET=your_cloudinary_secret

# Stripe Config
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
STRIPE_FRONTEND_KEY=your_stripe_publishable_key
```

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Skshirin/AI-Driven-E-Commerce-Platform.git
   cd EvoCart
   ```

2. **Setup the Server**:
   ```bash
   cd server
   npm install
   # Run in development mode (starts nodemon on http://localhost:4000)
   npm run dev
   ```
   *Note: Upon successful connection, the server will automatically execute table generation scripts (`createTables.js`) to set up the PostgreSQL tables if they don't already exist.*

3. **Setup the Client**:
   ```bash
   cd ../client
   npm install
   # Run React in development mode (starts Vite on http://localhost:5173)
   npm run dev
   ```

---

## 💾 Database Schema

EvoCart features an automated database initializer that connects to PostgreSQL and registers the following relational schemas:

- **`users`**: Manages accounts, credentials, and roles (`user` or `admin`).
- **`products`**: Stores catalog info (name, descriptions, ratings, price, JSONB structure for image arrays, and inventory stock).
- **`products_review`**: Stores product reviews referencing the target product and user.
- **`orders`**: Handles basic transaction info, shipping addresses, payment status, and creation timestamps.
- **`order_items`**: Maps ordered products, item quantities, and prices to order IDs.
- **`shipping_info`**: Detailed shipping address records linked to orders.
- **`payments`**: Captures payment intents, gateway records, and verification status.

---

## 🔌 API Endpoint Reference

### 🔐 Authentication (`/api/v1/auth`)
- `POST /register` - Registers a new user.
- `POST /login` - Log in a user (sets HTTP-only cookie).
- `GET /logout` - Logs out the active user.
- `GET /me` - Returns logged-in user profile info.
- `POST /password/forgot` - Generates reset token and emails it to the user.
- `PUT /password/reset/:token` - Updates password using validation token.

### 🛍️ Products (`/api/v1/product`)
- `GET /` - Fetches all products (supports category, search queries, ratings, availability, price, and pagination).
- `GET /singleProduct/:productId` - Retrieves specific product metadata.
- `PUT /post-new/review/:productId` - Post a customer product review.
- `POST /ai-search` - Performs AI search (described below).

### 🛠️ Admin Operations (`/api/v1/product/admin` & `/api/v1/admin`)
- `POST /admin/create` - Creates a new product (handles Cloudinary image uploads).
- `PUT /admin/update/:productId` - Updates product specs and stocks.
- `DELETE /admin/delete/:productId` - Deletes product and associated assets.

---

## 🤖 AI Recommendation Engine

EvoCart integrates a modern Llama-3 AI pipeline to process unstructured natural language search prompts from users:

1. **Keyword Pre-filtering**: Cleans user queries by filtering out typical non-informational stopwords, transforming inputs into query arrays, and executing a broad SQL wildcard query `ILIKE ANY($1)` against product names, categories, and descriptions.
2. **AI Categorization & Scoring**: Matches the query text with retrieved candidate database rows using the Groq Cloud endpoint.
3. **Strict Formatting**: The `llama-3.1-8b-instant` model returns a clean, filtered JSON list of recommended products, removing irrelevant entries and presenting them directly to the client.

---

## 💳 Payment & Webhooks Flow

Payments are securely executed using Stripe's end-to-end checkout pipeline:

1. **Session Setup**: A user navigates to Checkout, initiating a secure Stripe Checkout Session with their selected items.
2. **Payment Processing**: Payment is executed safely on Stripe's servers.
3. **Webhook Callback**: Stripe triggers a secure webhook event to the server endpoint `/api/v1/webhook`.
4. **Order State Update**:
   - The server verifies the signature `stripe-signature` using the `STRIPE_WEBHOOK_SECRET`.
   - On `checkout.session.completed`, the order state is updated to `Paid`.
   - The server decrements inventory stocks of each purchased item in the `products` table accordingly.