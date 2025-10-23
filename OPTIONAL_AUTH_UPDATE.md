# Optional Authentication Update

## Changes Made

Updated all Lambda functions to support **optional authentication** - the same pattern as the original monolithic architecture.

## Authentication Flow

### 1. **Optional Authentication (Base Layer)**
All functions now use `optionalAuth` middleware as the base layer:
- ✅ Checks for Authorization header
- ✅ If token present: verifies and attaches `req.user`
- ✅ If no token or invalid token: continues without user (no error)
- ✅ Allows public access while detecting authenticated users

### 2. **Required Authentication (Protected Routes)**
Routes that need authentication use `requiredAuth` middleware:
- ✅ Checks if `req.user` exists (set by `optionalAuth`)
- ✅ Throws error if not authenticated
- ✅ Must be used AFTER `optionalAuth`

### 3. **Admin Only (Admin Routes)**
Admin routes use both `requiredAuth` and `adminOnly`:
- ✅ Requires authentication first
- ✅ Checks user type is ADMIN
- ✅ Throws error if not admin

## Middleware Order

### Public Functions (Optional Auth)
```typescript
app.use(optionalAuth); // Base - attaches user if token present

// All routes can optionally access req.user
app.get('/', controller.method); // Public, but user info available if logged in
```

**Functions**:
- `public-products.ts`
- `public-brands.ts`
- `public-categories.ts`
- `public-orders.ts`
- `files.ts`
- `auth.ts` (public routes)

### Protected Routes (Required Auth)
```typescript
app.use(optionalAuth); // Base - attaches user if token present

// Specific routes require authentication
app.get('/protected', requiredAuth, controller.method); // Requires auth
```

**Example**: `auth.ts` protected routes
```typescript
app.post('/logout', requiredAuth, authController.logout);
app.get('/profile', requiredAuth, authController.getProfile);
```

### Admin Functions (Required Auth + Admin Role)
```typescript
app.use(optionalAuth); // Base - attaches user if token present  
app.use(requiredAuth); // All routes require authentication
app.use(adminOnly); // All routes require admin role

// All routes protected
app.get('/', controller.method); // Requires admin
```

**Functions**:
- `admin-products.ts`
- `admin-brands.ts`
- `admin-categories.ts`
- `admin-orders.ts`

## Updated Files

### Layer Files
- ✅ `layers/common/nodejs/middleware/auth.ts` - Simplified `requiredAuth` middleware

### Function Files
- ✅ `functions/auth.ts` - Added `optionalAuth` base middleware
- ✅ `functions/admin-products.ts` - Added `optionalAuth` before `requiredAuth`
- ✅ `functions/admin-brands.ts` - Added `optionalAuth` before `requiredAuth`
- ✅ `functions/admin-categories.ts` - Added `optionalAuth` before `requiredAuth`
- ✅ `functions/admin-orders.ts` - Added `optionalAuth` before `requiredAuth`
- ✅ `functions/public-products.ts` - Added `optionalAuth` base middleware
- ✅ `functions/public-brands.ts` - Added `optionalAuth` base middleware
- ✅ `functions/public-categories.ts` - Added `optionalAuth` base middleware
- ✅ `functions/public-orders.ts` - Added `optionalAuth` base middleware
- ✅ `functions/files.ts` - Added `optionalAuth` base middleware

## Middleware Implementation

### optionalAuth
```typescript
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(); // No token, continue without user
    }

    try {
      const payload = await verifyCognitoToken(token);
      const user = await authService.getUserByCognitoId(payload.sub);

      if (user) {
        req.user = user; // Attach user to request
        req.token = token;
      }
    } catch (error) {
      // Invalid token, continue without user (no error thrown)
    }

    next();
  } catch (error) {
    next(error);
  }
};
```

### requiredAuth
```typescript
export const requiredAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required", null, "authenticationRequired");
    }
    next();
  } catch (error) {
    next(error);
  }
};
```

### adminOnly
```typescript
export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.type !== UserType.ADMIN) {
      throw new ApiError(403, "Admin access required", null, "adminAccessRequired");
    }
    next();
  } catch (error) {
    next(error);
  }
};
```

## Testing

### Test Public Endpoints (No Token)
```bash
# Should work without authentication
curl https://7vsdjcci1h.execute-api.ap-southeast-1.amazonaws.com/test/api/products
curl https://7vsdjcci1h.execute-api.ap-southeast-1.amazonaws.com/test/api/brands
curl https://7vsdjcci1h.execute-api.ap-southeast-1.amazonaws.com/test/api/categories
```

### Test Public Endpoints (With Token)
```bash
# Should work and user info available to controller
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://7vsdjcci1h.execute-api.ap-southeast-1.amazonaws.com/test/api/products
```

### Test Protected Endpoints (No Token)
```bash
# Should return 401 error
curl https://7vsdjcci1h.execute-api.ap-southeast-1.amazonaws.com/test/auth/profile
```

### Test Protected Endpoints (With Token)
```bash
# Should work
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://7vsdjcci1h.execute-api.ap-southeast-1.amazonaws.com/test/auth/profile
```

### Test Admin Endpoints (No Token)
```bash
# Should return 401 error
curl https://7vsdjcci1h.execute-api.ap-southeast-1.amazonaws.com/test/admin/products
```

### Test Admin Endpoints (User Token)
```bash
# Should return 403 error (not admin)
curl -H "Authorization: Bearer USER_TOKEN" \
  https://7vsdjcci1h.execute-api.ap-southeast-1.amazonaws.com/test/admin/products
```

### Test Admin Endpoints (Admin Token)
```bash
# Should work
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  https://7vsdjcci1h.execute-api.ap-southeast-1.amazonaws.com/test/admin/products
```

## Benefits

1. **Flexible Access Control**
   - Public endpoints work without authentication
   - User info available if authenticated
   - Controllers can check `req.user` for conditional logic

2. **Consistent Pattern**
   - Same as original monolithic architecture
   - Predictable behavior across all functions
   - Easy to understand and maintain

3. **Better UX**
   - Users can browse without logging in
   - Authenticated users get personalized experience
   - Seamless transition from public to protected

4. **Security**
   - Invalid tokens don't block public access
   - Protected routes properly enforce authentication
   - Admin routes properly enforce role checks

## Example Use Cases

### Public Product Browsing with Optional User Info
```typescript
// In controller
export async function getProducts(req: Request, res: Response) {
  const filters = buildFilters(req.query);
  
  // Optional: personalize based on user if logged in
  if (req.user) {
    filters.personalizedFor = req.user._id;
  }
  
  const products = await Product.find(filters);
  res.json(ApiResponse.success(products));
}
```

### Protected Route
```typescript
// Route requires authentication
app.get('/profile', requiredAuth, authController.getProfile);

// In controller
export async function getProfile(req: Request, res: Response) {
  // req.user is guaranteed to exist (requiredAuth middleware)
  const user = req.user!;
  res.json(ApiResponse.success(user));
}
```

### Admin Route
```typescript
// All routes require admin
app.use(optionalAuth);
app.use(requiredAuth);
app.use(adminOnly);

app.get('/', controller.list); // Requires admin

// In controller
export async function list(req: Request, res: Response) {
  // req.user is guaranteed to exist AND be admin
  const products = await Product.find();
  res.json(ApiResponse.success(products));
}
```

## Deployment

Updated and deployed to test stage:
```bash
✅ Build successful: 711.18 KB total
✅ Functions deployed to test stage
✅ Optional authentication working
```

## Summary

✅ All functions now support optional authentication  
✅ Protected routes properly enforce authentication  
✅ Admin routes properly enforce admin role  
✅ Same pattern as original monolithic architecture  
✅ Deployed and tested on test stage  

The refactored "Function per Route" architecture now maintains the same flexible authentication pattern as the original implementation!

