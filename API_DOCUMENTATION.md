# API Documentation

Complete API documentation for the Cong Phone Backend with authentication, brands, categories, products, and file upload functionality.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://your-api-domain.com`

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this consistent format:

### Success Response
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

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "data": { ... }
}
```

## Multi-language Support

The API supports English and Vietnamese responses based on the `Accept-Language` header:

- `Accept-Language: en` - English responses
- `Accept-Language: vi` - Vietnamese responses
- Default: English

---

## 🔐 Authentication Endpoints

### Login

**POST** `/auth/login`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "cognitoId": "cognito_user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "type": "customer",
      "status": "active",
      "fullName": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "idToken": "jwt_id_token",
      "expiresIn": 3600
    }
  }
}
```

### Refresh Token

**POST** `/auth/refresh-token`

Refresh expired access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "new_jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "idToken": "new_jwt_id_token",
      "expiresIn": 3600
    }
  }
}
```

### Logout

**POST** `/auth/logout`

Logout user and invalidate all tokens (global sign out).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

### Forgot Password

**POST** `/auth/forgot-password`

Initiate password reset process.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Confirm Forgot Password

**POST** `/auth/confirm-forgot-password`

Confirm password reset with verification code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "confirmationCode": "123456",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Get Profile

**GET** `/auth/profile`

Get current user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "user_id",
    "cognitoId": "cognito_user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "type": "customer",
    "status": "active",
    "fullName": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Profile

**PUT** `/auth/profile`

Update current user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "profileImage": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "user_id",
    "cognitoId": "cognito_user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "profileImage": "https://example.com/image.jpg",
    "type": "customer",
    "status": "active",
    "fullName": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Register User (Admin Only)

**POST** `/auth/register`

Create new user account (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "userType": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "new_user_id",
    "cognitoId": "new_cognito_user_id",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1234567890",
    "type": "customer",
    "status": "active",
    "fullName": "Jane Smith",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get All Users (Admin Only)

**GET** `/auth/users`

Get paginated list of all users (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `userType` (optional): Filter by user type (customer/admin)
- `status` (optional): Filter by status (active/inactive/suspended)

**Example:**
```
GET /auth/users?page=1&limit=10&userType=customer&status=active
```

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "user_id",
        "cognitoId": "cognito_user_id",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "type": "customer",
        "status": "active",
        "fullName": "John Doe",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "pages": 1
  }
}
```

### Get User by ID (Admin Only)

**GET** `/auth/users/:id`

Get user by email address (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "user_id",
    "cognitoId": "cognito_user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "type": "customer",
    "status": "active",
    "fullName": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Deactivate User (Admin Only)

**DELETE** `/auth/users/:email`

Deactivate user account (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

---

## 🏷️ Brand Endpoints

### Get All Brands

**GET** `/api/brands`

Get all brands with optional filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name
- `isActive` (optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "message": "Brands retrieved successfully",
  "data": [
    {
      "_id": "brand_id",
      "name": "Apple",
      "description": "Apple Inc. is an American multinational technology company",
      "logo": "https://example.com/apple-logo.png",
      "website": "https://apple.com",
      "slug": "apple",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Get Active Brands

**GET** `/api/brands/active`

Get only active brands.

**Response:**
```json
{
  "success": true,
  "message": "Active brands retrieved successfully",
  "data": [
    {
      "_id": "brand_id",
      "name": "Apple",
      "description": "Apple Inc. is an American multinational technology company",
      "logo": "https://example.com/apple-logo.png",
      "website": "https://apple.com",
      "slug": "apple",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Brand by ID

**GET** `/api/brands/:id`

Get brand by MongoDB ObjectId.

**Response:**
```json
{
  "success": true,
  "message": "Brand retrieved successfully",
  "data": {
    "_id": "brand_id",
    "name": "Apple",
    "description": "Apple Inc. is an American multinational technology company",
    "logo": "https://example.com/apple-logo.png",
    "website": "https://apple.com",
    "slug": "apple",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Brand by Slug

**GET** `/api/brands/slug/:slug`

Get brand by URL-friendly slug.

**Response:**
```json
{
  "success": true,
  "message": "Brand retrieved successfully",
  "data": {
    "_id": "brand_id",
    "name": "Apple",
    "description": "Apple Inc. is an American multinational technology company",
    "logo": "https://example.com/apple-logo.png",
    "website": "https://apple.com",
    "slug": "apple",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Products by Brand

**GET** `/api/brands/:id/products`

Get all products for a specific brand.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "product_id",
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "The latest iPhone with advanced features",
      "category": "category_id",
      "brand": "brand_id",
      "basePrice": 999,
      "images": ["https://example.com/iphone15pro.jpg"],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

## 📂 Category Endpoints

### Get All Categories

**GET** `/api/categories`

Get all categories with optional filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name
- `isActive` (optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "_id": "category_id",
      "name": "Smartphones",
      "description": "Mobile phones and smartphones",
      "slug": "smartphones",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Get Active Categories

**GET** `/api/categories/active`

Get only active categories.

**Response:**
```json
{
  "success": true,
  "message": "Active categories retrieved successfully",
  "data": [
    {
      "_id": "category_id",
      "name": "Smartphones",
      "description": "Mobile phones and smartphones",
      "slug": "smartphones",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Category by ID

**GET** `/api/categories/:id`

Get category by MongoDB ObjectId.

**Response:**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "_id": "category_id",
    "name": "Smartphones",
    "description": "Mobile phones and smartphones",
    "slug": "smartphones",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Category by Slug

**GET** `/api/categories/slug/:slug`

Get category by URL-friendly slug.

**Response:**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "_id": "category_id",
    "name": "Smartphones",
    "description": "Mobile phones and smartphones",
    "slug": "smartphones",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Products by Category

**GET** `/api/categories/:id/products`

Get all products for a specific category.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "product_id",
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "The latest iPhone with advanced features",
      "category": "category_id",
      "brand": "brand_id",
      "basePrice": 999,
      "images": ["https://example.com/iphone15pro.jpg"],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

## 📱 Product Endpoints

### Get All Products

**GET** `/api/products`

Get all products with advanced filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or description
- `category` (optional): Filter by category ID
- `brand` (optional): Filter by brand ID
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `isActive` (optional): Filter by active status
- `isFeatured` (optional): Filter featured products
- `isNew` (optional): Filter new products
- `sortBy` (optional): Sort field (name, price, createdAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Example:**
```
GET /api/products?page=1&limit=10&category=category_id&brand=brand_id&minPrice=500&maxPrice=1500&sortBy=price&sortOrder=asc
```

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "product_id",
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "The latest iPhone with advanced features",
      "shortDescription": "Latest iPhone with Pro features",
      "category": {
        "_id": "category_id",
        "name": "Smartphones",
        "slug": "smartphones"
      },
      "brand": {
        "_id": "brand_id",
        "name": "Apple",
        "slug": "apple"
      },
      "productType": "smartphone",
      "variants": [
        {
          "_id": "variant_id",
          "name": "iPhone 15 Pro 128GB Blue",
          "color": "Blue",
          "colorCode": "#007AFF",
          "storage": "128GB",
          "size": "6.1 inch",
          "price": 999,
          "originalPrice": 1099,
          "stock": 50,
          "images": ["https://example.com/iphone15pro-blue.jpg"],
          "isActive": true
        }
      ],
      "basePrice": 999,
      "images": ["https://example.com/iphone15pro.jpg"],
      "features": ["A17 Pro chip", "48MP camera", "Titanium design"],
      "specifications": {
        "display": "6.1-inch Super Retina XDR",
        "processor": "A17 Pro",
        "storage": "128GB, 256GB, 512GB, 1TB",
        "camera": "48MP Main, 12MP Ultra Wide, 12MP Telephoto"
      },
      "status": "active",
      "isFeatured": true,
      "isNew": true,
      "tags": ["iphone", "smartphone", "apple", "pro"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Get Featured Products

**GET** `/api/products/featured`

Get all featured products.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Featured products retrieved successfully",
  "data": [
    {
      "_id": "product_id",
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "The latest iPhone with advanced features",
      "basePrice": 999,
      "images": ["https://example.com/iphone15pro.jpg"],
      "isFeatured": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Get New Products

**GET** `/api/products/new`

Get all new products.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "New products retrieved successfully",
  "data": [
    {
      "_id": "product_id",
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "The latest iPhone with advanced features",
      "basePrice": 999,
      "images": ["https://example.com/iphone15pro.jpg"],
      "isNew": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Search Products

**GET** `/api/products/search`

Search products by name, description, or tags.

**Query Parameters:**
- `q` (required): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/products/search?q=iphone&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": [
    {
      "_id": "product_id",
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "The latest iPhone with advanced features",
      "basePrice": 999,
      "images": ["https://example.com/iphone15pro.jpg"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Get Product by ID

**GET** `/api/products/:id`

Get product by MongoDB ObjectId.

**Response:**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "_id": "product_id",
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "description": "The latest iPhone with advanced features",
    "shortDescription": "Latest iPhone with Pro features",
    "category": {
      "_id": "category_id",
      "name": "Smartphones",
      "slug": "smartphones"
    },
    "brand": {
      "_id": "brand_id",
      "name": "Apple",
      "slug": "apple"
    },
    "productType": "smartphone",
    "variants": [
      {
        "_id": "variant_id",
        "name": "iPhone 15 Pro 128GB Blue",
        "color": "Blue",
        "colorCode": "#007AFF",
        "storage": "128GB",
        "size": "6.1 inch",
        "price": 999,
        "originalPrice": 1099,
        "stock": 50,
        "images": ["https://example.com/iphone15pro-blue.jpg"],
        "isActive": true,
        "specifications": {
          "display": "6.1-inch Super Retina XDR",
          "processor": "A17 Pro",
          "storage": "128GB",
          "camera": "48MP Main, 12MP Ultra Wide, 12MP Telephoto"
        }
      }
    ],
    "basePrice": 999,
    "images": ["https://example.com/iphone15pro.jpg"],
    "features": ["A17 Pro chip", "48MP camera", "Titanium design"],
    "specifications": {
      "display": "6.1-inch Super Retina XDR",
      "processor": "A17 Pro",
      "storage": "128GB, 256GB, 512GB, 1TB",
      "camera": "48MP Main, 12MP Ultra Wide, 12MP Telephoto"
    },
    "status": "active",
    "isFeatured": true,
    "isNew": true,
    "tags": ["iphone", "smartphone", "apple", "pro"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Product by Slug

**GET** `/api/products/slug/:slug`

Get product by URL-friendly slug.

**Response:**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "_id": "product_id",
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "description": "The latest iPhone with advanced features",
    "shortDescription": "Latest iPhone with Pro features",
    "category": {
      "_id": "category_id",
      "name": "Smartphones",
      "slug": "smartphones"
    },
    "brand": {
      "_id": "brand_id",
      "name": "Apple",
      "slug": "apple"
    },
    "productType": "smartphone",
    "variants": [
      {
        "_id": "variant_id",
        "name": "iPhone 15 Pro 128GB Blue",
        "color": "Blue",
        "colorCode": "#007AFF",
        "storage": "128GB",
        "size": "6.1 inch",
        "price": 999,
        "originalPrice": 1099,
        "stock": 50,
        "images": ["https://example.com/iphone15pro-blue.jpg"],
        "isActive": true
      }
    ],
    "basePrice": 999,
    "images": ["https://example.com/iphone15pro.jpg"],
    "features": ["A17 Pro chip", "48MP camera", "Titanium design"],
    "specifications": {
      "display": "6.1-inch Super Retina XDR",
      "processor": "A17 Pro",
      "storage": "128GB, 256GB, 512GB, 1TB",
      "camera": "48MP Main, 12MP Ultra Wide, 12MP Telephoto"
    },
    "status": "active",
    "isFeatured": true,
    "isNew": true,
    "tags": ["iphone", "smartphone", "apple", "pro"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 📁 File Upload Endpoints

### Get Presigned Upload URL

**POST** `/files/upload-url`

Get presigned URL for single file upload to S3.

**Request Body:**
```json
{
  "fileName": "product-image.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1024000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Upload URL generated successfully",
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/bucket/path/to/file?presigned-params",
    "fileKey": "uploads/products/2024/01/01/product-image.jpg",
    "expiresIn": 3600
  }
}
```

### Get Multiple Presigned Upload URLs

**POST** `/files/upload-urls`

Get multiple presigned URLs for batch file upload to S3.

**Request Body:**
```json
{
  "files": [
    {
      "fileName": "product-image-1.jpg",
      "fileType": "image/jpeg",
      "fileSize": 1024000
    },
    {
      "fileName": "product-image-2.jpg",
      "fileType": "image/jpeg",
      "fileSize": 2048000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Upload URLs generated successfully",
  "data": [
    {
      "uploadUrl": "https://s3.amazonaws.com/bucket/path/to/file1?presigned-params",
      "fileKey": "uploads/products/2024/01/01/product-image-1.jpg",
      "expiresIn": 3600
    },
    {
      "uploadUrl": "https://s3.amazonaws.com/bucket/path/to/file2?presigned-params",
      "fileKey": "uploads/products/2024/01/01/product-image-2.jpg",
      "expiresIn": 3600
    }
  ]
}
```

### Delete File

**DELETE** `/files/delete`

Delete file from S3.

**Request Body:**
```json
{
  "fileKey": "uploads/products/2024/01/01/product-image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Get File Information

**GET** `/files/info/:fileKey`

Get file information from S3.

**Response:**
```json
{
  "success": true,
  "message": "File information retrieved successfully",
  "data": {
    "fileKey": "uploads/products/2024/01/01/product-image.jpg",
    "size": 1024000,
    "lastModified": "2024-01-01T00:00:00.000Z",
    "contentType": "image/jpeg",
    "url": "https://s3.amazonaws.com/bucket/uploads/products/2024/01/01/product-image.jpg"
  }
}
```

---

## 🏥 Health Check

### Health Status

**GET** `/health`

Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## ❌ Error Codes

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Common Error Messages

#### Authentication Errors
- `tokenRequired` - Authorization token required
- `invalidToken` - Invalid token
- `tokenExpired` - Token expired
- `authenticationFailed` - Authentication failed
- `invalidCredentials` - Invalid credentials
- `userNotFound` - User not found
- `adminAccessRequired` - Admin access required
- `customerAccessRequired` - Customer access required

#### Validation Errors
- `validationError` - Validation error
- `emailRequired` - Email is required
- `passwordRequired` - Password is required
- `emailInvalid` - Invalid email format
- `passwordTooShort` - Password must be at least 8 characters

#### Resource Errors
- `brandNotFound` - Brand not found
- `categoryNotFound` - Category not found
- `productNotFound` - Product not found

#### File Upload Errors
- `fileNameRequired` - File name is required
- `fileTypeInvalid` - Invalid file type
- `fileSizeExceeded` - File size exceeds limit
- `maxFilesExceeded` - Maximum files exceeded

---

## 🔧 Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **File upload endpoints**: 10 requests per minute per IP
- **General API endpoints**: 100 requests per minute per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 📝 Examples

### Complete Authentication Flow

```bash
# 1. Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@congphone.com","password":"Admin123!"}'

# 2. Use token for protected request
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 3. Refresh token when expired
curl -X POST http://localhost:3001/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

### File Upload Flow

```bash
# 1. Get presigned URL
curl -X POST http://localhost:3001/files/upload-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"product.jpg","fileType":"image/jpeg","fileSize":1024000}'

# 2. Upload file to S3 using presigned URL
curl -X PUT "PRESIGNED_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary @product.jpg

# 3. Use file key in your application
```

### Product Search with Filters

```bash
curl -X GET "http://localhost:3001/api/products?search=iphone&category=smartphones&brand=apple&minPrice=500&maxPrice=1500&sortBy=price&sortOrder=asc&page=1&limit=10"
```

This comprehensive API documentation covers all endpoints, request/response formats, error handling, and usage examples for the Cong Phone Backend.
