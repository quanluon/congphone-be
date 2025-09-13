# Cong Phone Backend

A serverless Node.js Express backend for an Apple product webshop, built with AWS Lambda and MongoDB.

## Features

- **Brands**: Manage product brands (Apple, Samsung, etc.)
- **Categories**: Organize products into categories (Smartphones, Tablets, Laptops, Accessories)
- **Products**: Handle products with variants (color, storage, connectivity options)
- **Multi-language Support**: English and Vietnamese message responses
- **File Upload**: Direct S3 upload with presigned URLs
- **Serverless Architecture**: Deploy to AWS Lambda

## Tech Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js with serverless-http
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: AWS Lambda via Serverless Framework
- **File Storage**: AWS S3
- **Language**: TypeScript

## Project Structure

```
src/
├── config/           # Database configuration
├── constants/        # Application constants and messages
├── controllers/      # Request handlers
│   └── common/       # Public API controllers
├── middleware/       # Express middleware
├── models/          # Mongoose models
├── routes/          # API routes
│   └── common/      # Public routes
├── scripts/         # Database seeding scripts
├── services/        # Business logic services
├── utils/           # Utility functions
└── validators/      # Input validation
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Brands
- `GET /api/brands` - Get all brands
- `GET /api/brands/active` - Get active brands
- `GET /api/brands/:id` - Get brand by ID
- `GET /api/brands/slug/:slug` - Get brand by slug
- `GET /api/brands/:id/products` - Get products by brand

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/active` - Get active categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/slug/:slug` - Get category by slug
- `GET /api/categories/:id/products` - Get products by category

### Products
- `GET /api/products` - Get all products with filtering
- `GET /api/products/featured` - Get featured products
- `GET /api/products/new` - Get new products
- `GET /api/products/search` - Search products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug

### File Upload
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

### Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/cong-phone
JWT_SECRET=your-jwt-secret
S3_BUCKET=your-s3-bucket
AWS_REGION=ap-southeast-1
NODE_ENV=development
```

## Deployment

### Deploy to AWS Lambda

```bash
npm run deploy
```

### Local Testing

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Database Models

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
