# API Gateway Routing Issue - Quick Fix

## Problem

API Gateway forwards the full path (e.g., `/api/products`) to the Lambda function, but Express routes expect root path (`/`).

**Error**: "Cannot GET /api/products"

## Root Cause

```yaml
# serverless.yml
events:
  - http:
      path: /api/products    # API Gateway path
      
# Express in Lambda
app.get('/', ...)  # Expects root, but receives /api/products
```

## Solution Options

### Option 1: Strip Base Path in serverless-http (Recommended)
Use `serverless-http` basePath option:

```typescript
const serverlessHandler = serverless(app, {
  basePath: '/api/products'  // Strip this from incoming paths
});
```

### Option 2: Change API Gateway Paths
Remove prefixes from serverless.yml and use root paths

### Option 3: Update Express Routes
Make Express handle full paths (not recommended - breaks modularity)

## Quick Fix Implementation

Update each function handler to strip the base path.

