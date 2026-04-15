🚀 AI-Powered E-Commerce Platform

A full-stack e-commerce platform featuring secure authentication, AI-powered product search, and seamless payment integration. Built with a scalable backend architecture and modern frontend styling using Tailwind CSS.

✨ Features
🔐 Authentication & Authorization
JWT-based authentication
Role-Based Access Control (Admin/User)
🛍️ Product Management
Create, update, delete products (Admin only)
Image upload using Cloudinary
Category, price, and stock management
🔍 Advanced Product Filtering
Search by keyword, category, price range
Pagination & sorting
Availability filters (in-stock, limited, out-of-stock)
🤖 AI-Powered Product Search
Natural language queries (e.g., "show me shoes under 1000")
Keyword extraction + LLM-based filtering
Intelligent recommendations
💳 Payment Integration
Stripe checkout integration
Webhook handling for payment verification
Automatic order update & stock reduction
📊 Admin Dashboard
Revenue analytics (daily, monthly)
Order status tracking
Top-selling products
Low stock alerts
🛠️ Tech Stack
Frontend
Tailwind CSS
(Your frontend framework here — e.g., React / Vite)
Backend
Node.js
Express.js
PostgreSQL
Integrations
Stripe (Payments & Webhooks)
Cloudinary (Image Upload)
LLM API (AI Recommendations)
📂 Project Structure
/server
  /controllers
  /models
  /routes
  /middlewares
  /database
/client
  /src
  /components
  /pages
⚙️ Environment Variables

Create a .env file in the server folder:

PORT=4000

# JWT
JWT_SECRET_KEY=your_secret
JWT_EXPIRES_IN=30d

# Database
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=evocartdb
DB_HOST=localhost
DB_PORT=5432

# Cloudinary
CLOUDINARY_CLIENT_NAME=your_name
CLOUDINARY_CLIENT_API=your_api
CLOUDINARY_CLIENT_SECRET=your_secret

# Stripe
STRIPE_SECRET_KEY=your_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# AI (Groq / Gemini)
GROQ_API_KEY=your_api_key
🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/your-username/your-repo.git
cd your-repo
2️⃣ Install Dependencies
cd server
npm install

cd ../client
npm install
3️⃣ Run the Project
# backend
cd server
npm run dev

# frontend
cd client
npm run dev
🔗 API Highlights
POST /api/v1/product/admin/create → Create product
GET /api/v1/product → Fetch all products
PUT /api/v1/product/admin/update/:id → Update product
POST /api/v1/review/:productId → Add review
POST /api/v1/ai-search → AI product filtering
🧠 AI Search Example
{
  "userPrompt": "Show me smartphones under 20000"
}
💡 Key Highlights
Real-time payment verification using Stripe webhooks
AI-enhanced product discovery
Optimized SQL queries with filtering & aggregation
Scalable backend design with clean architecture
📌 Future Improvements
Wishlist & cart optimization
Recommendation engine improvements
Admin dashboard UI enhancements
Caching (Redis)
👩‍💻 Author

Shirin Shaikh

GitHub: https://github.com/your-username