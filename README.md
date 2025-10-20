# Cong Phone Backend

A comprehensive serverless Node.js Express backend for an Apple product webshop, built with AWS Lambda, MongoDB, and AWS Cognito authentication.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: Complete AWS Cognito integration with customer and admin roles
- **User Management**: Customer registration, admin user creation, profile management
- **Brands**: Manage product brands (Apple, Samsung, etc.)
- **Categories**: Organize products into categories (Smartphones, Tablets, Laptops, Accessories)
- **Products**: Handle products with variants (color, storage, connectivity options)
- **File Upload**: Direct S3 upload with presigned URLs

### Advanced Features
- **Multi-language Support**: English and Vietnamese message responses
- **JWT Token Management**: Access and refresh token handling
- **Role-based Access Control**: Customer and admin permission separation
- **Serverless Architecture**: Deploy to AWS Lambda
- **Comprehensive Error Handling**: Centralized error management with translation
- **Input Validation**: Joi-based request validation
- **Database Seeding**: Automated data population scripts

## 🛠️ Tech Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js with serverless-http
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: AWS Cognito with JWT tokens
- **Deployment**: AWS Lambda via Serverless Framework
- **File Storage**: AWS S3 with presigned URLs
- **Language**: TypeScript
- **Validation**: Joi schemas
- **Logging**: Winston logger

## 📁 Project Structure

```
src/
├── config/           # Database configuration
├── constants/        # Application constants and messages
├── controllers/      # Request handlers
│   ├── auth.controller.ts      # Authentication controller
│   └── common/       # Public API controllers
│       ├── brand.controller.ts
│       ├── category.controller.ts
│       └── product.controller.ts
├── middleware/       # Express middleware
│   ├── auth.ts      # Authentication middleware
│   ├── error.ts     # Error handling middleware
│   └── validate.ts  # Input validation middleware
├── models/          # Mongoose models
│   ├── user.model.ts
│   ├── brand.model.ts
│   ├── category.model.ts
│   └── product.model.ts
├── routes/          # API routes
│   ├── auth.routes.ts        # Authentication routes
│   ├── file.routes.ts        # File upload routes
│   └── common/      # Public routes
│       ├── brand.routes.ts
│       ├── category.routes.ts
│       └── product.routes.ts
├── scripts/         # Database seeding scripts
│   ├── seedAdmin.ts # Create admin user
│   └── seedData.ts  # Seed sample data
├── services/        # Business logic services
│   ├── auth.service.ts       # Authentication service
│   ├── cognito.service.ts    # AWS Cognito service
│   ├── s3.service.ts         # AWS S3 service
│   ├── brand.service.ts
│   ├── category.service.ts
│   └── product.service.ts
├── utils/           # Utility functions
│   ├── ApiResponse.ts        # API response utilities
│   ├── jwt.ts               # JWT token utilities
│   ├── messages.ts          # Message translation
│   └── logger.ts            # Logging utilities
└── validators/      # Input validation
    ├── auth.validator.ts
    ├── brand.validator.ts
    ├── category.validator.ts
    └── product.validator.ts
```

## 🔌 API Endpoints

### Health Check
- `GET /health` - Service health status

### 🔐 Authentication (`/auth`)

#### Public Routes (No Authentication Required)
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/forgot-password` - Initiate password reset
- `POST /auth/confirm-forgot-password` - Confirm password reset

#### Protected Routes (Authentication Required)
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

#### Admin Only Routes
- `POST /auth/register` - Create new user (admin only)
- `GET /auth/users` - Get all users with pagination
- `GET /auth/users/:id` - Get user by ID
- `DELETE /auth/users/:email` - Deactivate user

### 🏷️ Brands (`/api/brands`)
- `GET /api/brands` - Get all brands
- `GET /api/brands/active` - Get active brands
- `GET /api/brands/:id` - Get brand by ID
- `GET /api/brands/slug/:slug` - Get brand by slug
- `GET /api/brands/:id/products` - Get products by brand

### 📂 Categories (`/api/categories`)
- `GET /api/categories` - Get all categories
- `GET /api/categories/active` - Get active categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/slug/:slug` - Get category by slug
- `GET /api/categories/:id/products` - Get products by category

### 📱 Products (`/api/products`)
- `GET /api/products` - Get all products with filtering
- `GET /api/products/featured` - Get featured products
- `GET /api/products/new` - Get new products
- `GET /api/products/search` - Search products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug

### 📁 File Upload (`/files`)
- `POST /files/upload-url` - Get presigned URL for upload
- `POST /files/upload-urls` - Get multiple presigned URLs
- `DELETE /files/delete` - Delete file from S3
- `GET /files/info/:fileKey` - Get file information

## Multi-language Support

The API supports English and Vietnamese responses based on the `Accept-Language` header:

- `Accept-Language: en` - English responses
- `Accept-Language: vi` - Vietnamese responses
- Default: English

### Error Handling

The API uses a centralized error handling system with `ApiError` class:

```typescript
// Throw errors with message keys for translation
throw new ApiError(404, 'Product not found', null, 'productNotFound');

// Error middleware automatically translates based on Accept-Language header
```

All error messages are automatically translated based on the client's language preference.

## Development

### Prerequisites

- Node.js 20.x
- MongoDB
- AWS CLI configured (for deployment)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
npm run dev
```

4. Seed database with sample data:
```bash
npm run seed
```

5. Create initial admin user:
```bash
npm run seed:admin
```

This creates an admin user with:
- Email: `admin@congphone.com`
- Password: `Admin123!`

### Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/cong-phone

# AWS Configuration
AWS_REGION=ap-southeast-1
S3_BUCKET=your-s3-bucket

# AWS Cognito
COGNITO_USER_POOL_ID=your_user_pool_id
COGNITO_CLIENT_ID=your_client_id

# Application
NODE_ENV=development
```

## Deployment

This backend uses Docker containers deployed to AWS Lambda via Amazon ECR (Elastic Container Registry).

### Quick Start

```bash
# One-command deployment
yarn deploy
```

For detailed deployment instructions, see:
- **[Quick Start Guide](./DEPLOYMENT_QUICKSTART.md)** - Fast deployment reference
- **[Complete ECR Deployment Guide](./DEPLOYMENT_ECR.md)** - Detailed documentation

### Prerequisites

- Docker Desktop (running)
- AWS CLI configured
- Node.js 20+ and Yarn
- `.env` file with required variables

### Deployment Commands

```bash
# Complete deployment (ECR + Lambda)
yarn deploy

# Step-by-step deployment
yarn deploy:ecr              # Build and push to ECR
yarn deploy:serverless       # Deploy to Lambda

# Local Docker testing
yarn docker:build            # Build image
yarn docker:run              # Run container locally
yarn docker:test             # Build and run locally

# View logs
serverless logs -f api --stage dev --tail
```

### Local Development

```bash
yarn dev
```

The API will be available at `http://localhost:3001`

## 🔐 Authentication System

### User Types

#### Customer
- Can register, login, reset password
- Can update their own profile
- Access to public APIs and their own data

#### Admin
- Can login, reset password
- Can create new admin users
- Can manage all users (view, deactivate)
- Full access to all APIs

### Authentication Flow

1. **Login**: User provides email/password, receives JWT tokens
2. **Token Usage**: Include `Authorization: Bearer <token>` in requests
3. **Token Refresh**: Use refresh token to get new access token
4. **Password Reset**: Initiate reset, receive code via email, confirm with new password

### Middleware Usage

```typescript
// Optional authentication - user may or may not be logged in
router.get('/public', optionalAuth, controller.publicMethod);

// Required authentication - user must be logged in
router.get('/protected', requiredAuth, controller.protectedMethod);

// Admin only - user must be admin
router.get('/admin', adminOnly, controller.adminMethod);

// Customer only - user must be customer
router.get('/customer', customerOnly, controller.customerMethod);
```

### Helper Functions

```typescript
import { getCurrentUser, isAuthenticated, isAdmin, isCustomer } from '../middleware/auth';

// In your controller
const user = getCurrentUser(req);
if (isAuthenticated(req)) {
  console.log('User is logged in');
}
if (isAdmin(req)) {
  console.log('User is admin');
}
```

## 📊 Database Models

### User
- `cognitoId`: AWS Cognito user ID
- `email`: User email address
- `firstName`: First name
- `lastName`: Last name
- `phone`: Phone number
- `type`: User type (customer/admin)
- `status`: User status (active/inactive/suspended)
- `profileImage`: Profile image URL
- `lastLoginAt`: Last login timestamp
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Brand
- `name`: Brand name
- `description`: Brand description
- `logo`: Brand logo URL
- `website`: Brand website
- `slug`: URL-friendly identifier
- `isActive`: Active status

### Category
- `name`: Category name
- `description`: Category description
- `slug`: URL-friendly identifier
- `isActive`: Active status

### Product
- `name`: Product name
- `slug`: URL-friendly identifier
- `description`: Product description
- `shortDescription`: Brief description
- `category`: Reference to Category
- `brand`: Reference to Brand
- `productType`: Product type enum
- `variants`: Array of product variants
- `basePrice`: Starting price
- `images`: Product images
- `features`: Key features array
- `specifications`: Technical specifications
- `status`: Product status
- `isFeatured`: Featured flag
- `isNew`: New product flag
- `tags`: Search tags

### Product Variant
- `name`: Variant name
- `color`: Color option
- `colorCode`: Hex color code
- `storage`: Storage capacity
- `size`: Screen size
- `connectivity`: Connectivity options
- `price`: Variant price
- `stock`: Stock quantity
- `images`: Variant images
- `specifications`: Variant specifications

## API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "data": { ... }
}
```

## License

MIT
