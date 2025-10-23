# Function per Route Architecture

This document explains the refactored "Function per Route" architecture using Lambda Layers for shared code.

## Overview

The backend has been refactored from a monolithic Lambda function into multiple, domain-specific Lambda functions. Each function handles a specific group of related routes while sharing common code through Lambda Layers.

## Architecture

### Lambda Functions

The application is split into the following Lambda functions:

#### 1. **Auth Function** (`functions/auth.ts`)
Handles all authentication and user management endpoints:
- `POST /auth/register` - User registration (public)
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Initiate password reset
- `POST /auth/reset-password` - Confirm password reset
- `POST /auth/social-login` - Social media login
- `POST /auth/logout` - User logout (protected)
- `GET /auth/profile` - Get user profile (protected)
- `PUT /auth/profile` - Update user profile (protected)
- `PUT /auth/change-password` - Change password (protected)
- `POST /auth/admin/register` - Admin user registration (admin only)
- `GET /auth/users` - List all users (admin only)
- `GET /auth/users/:id` - Get user by ID (admin only)
- `DELETE /auth/users/:email` - Deactivate user (admin only)

#### 2. **Admin Products Function** (`functions/admin-products.ts`)
Handles all admin product management endpoints:
- `GET /admin/products` - List products with filters
- `GET /admin/products/stats` - Get product statistics
- `GET /admin/products/:id` - Get product by ID
- `POST /admin/products` - Create new product
- `PUT /admin/products/:id` - Update product
- `DELETE /admin/products/:id` - Soft delete product
- `DELETE /admin/products/:id/hard` - Hard delete product
- `PUT /admin/products/bulk/update` - Bulk update products
- `DELETE /admin/products/bulk/delete` - Bulk delete products
- `PATCH /admin/products/:id/status` - Update product status
- `PATCH /admin/products/:id/featured` - Toggle featured status
- `PATCH /admin/products/:id/new` - Toggle new status
- `GET /admin/products/:id/variants` - Get product variants
- `PUT /admin/products/:id/variants` - Update product variants

#### 3. **Admin Brands Function** (`functions/admin-brands.ts`)
Handles all admin brand management endpoints:
- `POST /admin/brands` - Create brand
- `GET /admin/brands` - List brands
- `GET /admin/brands/active` - Get active brands
- `GET /admin/brands/:id` - Get brand by ID
- `PUT /admin/brands/:id` - Update brand
- `DELETE /admin/brands/:id` - Delete brand

#### 4. **Admin Categories Function** (`functions/admin-categories.ts`)
Handles all admin category management endpoints:
- `POST /admin/categories` - Create category
- `GET /admin/categories` - List categories
- `GET /admin/categories/:id` - Get category by ID
- `PUT /admin/categories/:id` - Update category
- `DELETE /admin/categories/:id` - Delete category

#### 5. **Admin Orders Function** (`functions/admin-orders.ts`)
Handles all admin order management endpoints:
- `GET /admin/orders` - List orders with filters
- `GET /admin/orders/stats` - Get order statistics
- `GET /admin/orders/:id` - Get order by ID
- `PUT /admin/orders/:id` - Update order
- `DELETE /admin/orders/:id` - Delete order
- `PUT /admin/orders/bulk-update` - Bulk update orders

#### 6. **Public Products Function** (`functions/public-products.ts`)
Handles all public product browsing endpoints:
- `GET /api/products` - List products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/new` - Get new products
- `GET /api/products/by-category/:categoryId` - Get products by category
- `GET /api/products/by-brand/:brandId` - Get products by brand
- `GET /api/products/by-type/:productType` - Get products by type
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/:id/variants` - Get product variants
- `GET /api/products/:id/related` - Get related products
- `GET /api/products/filter/price-range` - Get price range
- `GET /api/products/filter/colors` - Get available colors
- `GET /api/products/filter/storage-options` - Get storage options

#### 7. **Public Brands Function** (`functions/public-brands.ts`)
Handles all public brand browsing endpoints:
- `GET /api/brands` - List brands
- `GET /api/brands/active` - Get active brands
- `GET /api/brands/:id` - Get brand by ID
- `GET /api/brands/:id/products` - Get brand products
- `GET /api/brands/slug/:slug` - Get brand by slug

#### 8. **Public Categories Function** (`functions/public-categories.ts`)
Handles all public category browsing endpoints:
- `GET /api/categories` - List categories
- `GET /api/categories/active` - Get active categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/:id/products` - Get category products
- `GET /api/categories/slug/:slug` - Get category by slug

#### 9. **Public Orders Function** (`functions/public-orders.ts`)
Handles public order creation and user order endpoints:
- `POST /api/orders` - Create order (public)
- `GET /api/orders/number/:orderNumber` - Get order by number (protected)
- `GET /api/orders` - Get user orders (protected)
- `GET /api/orders/:id` - Get order by ID (protected)

#### 10. **Files Function** (`functions/files.ts`)
Handles file upload and management:
- `POST /files/upload-url` - Get presigned URL for upload
- `POST /files/upload-urls` - Get multiple presigned URLs
- `DELETE /files/delete` - Delete file
- `GET /files/info/:fileKey` - Get file info
- `POST /files/move-permanent` - Move file to permanent storage
- `POST /files/move-multiple-permanent` - Move multiple files

#### 11. **Health Function** (`functions/health.ts`)
Simple health check endpoint:
- `GET /health` - Health check

### Lambda Layers

Shared code is organized into three Lambda Layers:

#### 1. **Common Layer** (`layers/common/`)
Contains shared business logic and data models:
- **models/** - Mongoose models (User, Product, Brand, Category, Order)
- **services/** - Business logic services (AuthService, ProductService, etc.)
- **config/** - Database and environment configuration
- **utils/** - Utility functions (ApiResponse, logger, pagination, etc.)
- **constants/** - Shared constants and enums

#### 2. **Middleware Layer** (`layers/middleware/`)
Contains Express middleware:
- **auth.ts** - Authentication and authorization middleware
- **error.ts** - Error handling middleware
- **validate.ts** - Request validation middleware

#### 3. **Validators Layer** (`layers/validators/`)
Contains validation schemas:
- **auth.validator.ts** - Auth request validation schemas
- **product.validator.ts** - Product validation schemas
- **brand.validator.ts** - Brand validation schemas
- **category.validator.ts** - Category validation schemas
- **order.validator.ts** - Order validation schemas

## Benefits

### 1. **Independent Scaling**
Each function can scale independently based on its traffic:
- High-traffic endpoints (e.g., public products) scale separately from admin endpoints
- Avoid over-provisioning for low-traffic endpoints

### 2. **Cost Optimization**
- Pay only for what you use per function
- Cold starts are faster with smaller bundles
- Unused functions don't consume resources

### 3. **Better Performance**
- Smaller function bundles = faster cold starts
- Focused functions = faster execution
- Reduced memory footprint per function

### 4. **Improved Maintainability**
- Clear separation of concerns
- Easier to debug (isolated function logs)
- Independent deployments per function
- Shared code through layers reduces duplication

### 5. **Better Security**
- Granular IAM permissions per function
- Reduced blast radius if a function is compromised
- Easier to audit and monitor

## Development

### Building

Build all functions:
```bash
yarn build
```

This uses esbuild to bundle each function separately while keeping dependencies like Express and Mongoose external.

### Local Development

Run locally with serverless-offline:
```bash
yarn dev
```

This starts all functions on `http://localhost:3001` with hot reload.

### Testing Individual Functions

You can test individual functions using curl:

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get products
curl http://localhost:3001/api/products
```

## Deployment

### Deploy All Functions

Deploy everything (all functions + layers):
```bash
yarn deploy
```

### Deploy Individual Functions

Deploy a specific function:
```bash
serverless deploy function -f auth
serverless deploy function -f adminProducts
serverless deploy function -f publicProducts
```

### Deploy Layers Only

Update layers without redeploying functions:
```bash
serverless deploy --force
```

## Monitoring

### CloudWatch Logs

Each function has its own log group:
- `/aws/lambda/cong-phone-backend-dev-auth`
- `/aws/lambda/cong-phone-backend-dev-adminProducts`
- `/aws/lambda/cong-phone-backend-dev-publicProducts`
- etc.

### Metrics

Monitor each function independently:
- Invocations
- Duration
- Errors
- Throttles
- Concurrent executions

### X-Ray Tracing

Enable X-Ray in `serverless.yml` for distributed tracing:
```yaml
provider:
  tracing:
    lambda: true
    apiGateway: true
```

## Performance Optimization

### Cold Start Optimization

1. **Keep functions small** - Each function only imports what it needs
2. **Use layers** - Shared code is loaded once and cached
3. **Minimize dependencies** - External dependencies reduce bundle size
4. **Use provisioned concurrency** - For critical endpoints

### Memory Configuration

Adjust memory per function based on needs:
```yaml
functions:
  adminProducts:
    memorySize: 1024  # Higher for image processing
  publicProducts:
    memorySize: 512   # Lower for simple queries
```

### Timeout Configuration

Set appropriate timeouts:
```yaml
functions:
  adminProducts:
    timeout: 29  # Max for API Gateway
  files:
    timeout: 10  # Shorter for file operations
```

## Migration Notes

### From Monolithic to Function-per-Route

Key changes:
1. **Routes** are now split across multiple functions
2. **Controllers** are reused across functions via layers
3. **Middleware** is shared through middleware layer
4. **Database connection** is handled per function invocation

### API Gateway Routes

The API structure remains the same from a client perspective:
- `POST /auth/login` → `auth` function
- `GET /api/products` → `publicProducts` function
- `GET /admin/products` → `adminProducts` function

## Troubleshooting

### Layer Import Issues

If you see "Cannot find module" errors:
1. Check layer paths in `serverless.yml`
2. Ensure layers are built: `cd layers/common/nodejs && npm install`
3. Verify layer references in function handlers

### Build Errors

If build fails:
1. Clear dist folder: `rm -rf dist`
2. Rebuild: `yarn build`
3. Check TypeScript errors: `tsc --noEmit`

### Deployment Errors

If deployment fails:
1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify region: Check `serverless.yml` provider.region
3. Check CloudFormation limits
4. Review CloudWatch Logs for errors

## Best Practices

1. **Keep functions focused** - Each function should handle one domain
2. **Use layers for shared code** - Avoid code duplication
3. **Monitor function metrics** - Set up CloudWatch alarms
4. **Test locally first** - Use serverless-offline before deploying
5. **Version your layers** - Update layer versions when making breaking changes
6. **Use environment variables** - Keep configuration separate from code
7. **Implement proper error handling** - Use the errorHandler middleware
8. **Add logging** - Use the logger utility for debugging
9. **Validate inputs** - Use validation schemas from validators layer
10. **Follow security best practices** - Use IAM roles, encrypt sensitive data

## Future Improvements

1. **Add API Gateway Authorizers** - Move auth logic to API Gateway
2. **Implement caching** - Use ElastiCache for frequently accessed data
3. **Add rate limiting** - Protect against abuse
4. **Set up CI/CD** - Automate testing and deployment
5. **Add integration tests** - Test function interactions
6. **Implement feature flags** - Control feature rollout
7. **Add observability** - Use AWS X-Ray for tracing
8. **Optimize cold starts** - Use provisioned concurrency for critical functions

