# Environment Variables Template

Create a `.env` file in the `be/` directory with these values.

## Required Variables

```bash
# MongoDB Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGODB_NAME=cong-phone

# Firebase / Cognito Authentication
FIREBASE_PROJECT_ID=your_firebase_project_id
AWS_REGION=ap-southeast-1
COGNITO_USER_POOL_ID=ap-southeast-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET=your-r2-bucket-name
R2_PUBLIC_ENDPOINT=https://cdn.example.com

# Application Environment
NODE_ENV=production
DASHBOARD_URL=https://admin.example.com
ALLOWED_ORIGINS=https://shop.example.com,https://admin.example.com
```

## Optional Variables

```bash
# Legacy storage endpoints used only while migrating existing URLs.
LEGACY_CLOUDFRONT_STORAGE_ENDPOINT=https://old-cdn.example.com
LEGACY_S3_PUBLIC_ENDPOINT=https://old-bucket.s3.ap-southeast-1.amazonaws.com
S3_BUCKET=old-s3-bucket-name

# Telegram Notifications
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
TELEGRAM_MENTION_USER_IDS=123456789,987654321

# AI / product vector features
OPENAI_API_KEY=your_openai_api_key
PRODUCT_VECTOR_MODEL=Xenova/all-MiniLM-L6-v2
PRODUCT_VECTOR_CACHE_DIR=.cache/product-vectors
PRODUCT_VECTOR_QUANTIZED=true
```

## Cloudflare R2 Setup

1. Create an R2 bucket in Cloudflare.
2. Create an R2 API token with object read/write permissions for that bucket.
3. Configure a public bucket domain or custom domain.
4. Use that public domain as `R2_PUBLIC_ENDPOINT`.

The backend is hosted on Vercel. Cloudflare is only used for file/object storage and public file serving.

## Vercel Setup

Set the same required variables in the Vercel project environment. The backend build command is:

```bash
yarn build:vercel
```

The Vercel entrypoint is `index.js`, which loads `dist/vercel.js`.

## Storage Migration

Run a dry run first:

```bash
yarn migrate:storage:r2 -- --mode=dry-run
```

After backing up MongoDB and confirming the R2 public endpoint works, execute:

```bash
yarn migrate:storage:r2 -- --mode=execute
```

The migration copies legacy product, variant, category, and user profile images to R2, then rewrites MongoDB URLs to `R2_PUBLIC_ENDPOINT`.
