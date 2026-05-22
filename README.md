# Cong Phone Backend

Express backend for the Cong Phone shop. Production hosting is Vercel, and uploaded files are stored in Cloudflare R2.

## Runtime

- **API host:** Vercel
- **Entrypoint:** `index.js` -> `dist/vercel.js`
- **Build command:** `yarn build:vercel`
- **Database:** MongoDB
- **Storage:** Cloudflare R2 through the S3-compatible API
- **Auth:** Firebase/Cognito wiring remains in the backend

Serverless Framework, AWS Lambda container deployment, ECR, and S3/CloudFront storage are no longer part of the active backend runtime.

## Setup

```bash
yarn install
yarn setup
```

Then fill the generated `.env` values. See `docs/ENV_TEMPLATE.md` for the complete list.

Required storage variables:

```bash
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET=your-r2-bucket-name
R2_PUBLIC_ENDPOINT=https://cdn.example.com
```

## Development

```bash
yarn dev
```

The local API listens on `http://localhost:3001` by default.

## Build

```bash
yarn build
yarn build:vercel
```

Both commands produce the Vercel output in `dist/`.

## Storage Migration

Run a dry run before changing data:

```bash
yarn migrate:storage:r2 -- --mode=dry-run
```

After backing up MongoDB and confirming Cloudflare R2 public access, run:

```bash
yarn migrate:storage:r2 -- --mode=execute
```

The migration copies legacy product images, variant images, category images, and user profile images to R2, then rewrites MongoDB URLs to `R2_PUBLIC_ENDPOINT`.

Optional legacy variables can help map old URLs:

```bash
LEGACY_CLOUDFRONT_STORAGE_ENDPOINT=https://old-cdn.example.com
LEGACY_S3_PUBLIC_ENDPOINT=https://old-bucket.s3.ap-southeast-1.amazonaws.com
S3_BUCKET=old-s3-bucket-name
```

## Docs

- `docs/ENV_TEMPLATE.md`
- `docs/DEPLOYMENT_VERCEL_R2.md`
- `docs/BUILD_OPTIMIZATION.md`
