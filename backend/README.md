# StayFinder Backend API

A comprehensive backend API for StayFinder - an Airbnb-like platform built with Express.js, TypeScript, Prisma, and PostgreSQL.

## 🚀 Features

### Core Features
- **User Authentication**: JWT-based auth for users and admins
- **Property Management**: Full CRUD operations for listings
- **Booking System**: Complete booking workflow with date validation
- **Review System**: User reviews and ratings
- **Favorites**: Save and manage favorite properties
- **Payment Integration**: Stripe payment processing
- **Admin Dashboard**: Admin panel for managing users and listings

### Advanced Features
- **Search & Filters**: Advanced property search with multiple filters
- **Geolocation**: Latitude/longitude support for map integration
- **File Upload**: Image upload support for properties
- **Rate Limiting**: API rate limiting for security
- **Data Validation**: Comprehensive input validation with Joi
- **Error Handling**: Centralized error handling
- **Database Seeding**: Sample data for development

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Stripe API
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn
- Stripe account (for payments)

## 🔧 Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd stayfinder/backend
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your configuration:
\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/stayfinder?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
\`\`\`

4. **Set up the database**
\`\`\`bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data
npm run db:seed
\`\`\`

5. **Start the development server**
\`\`\`bash
npm run dev
\`\`\`

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "isHost": false
}
