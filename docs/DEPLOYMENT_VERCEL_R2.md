# Vercel Deployment With Cloudflare R2 Storage

The backend now deploys to Vercel. Serverless Framework, AWS Lambda container deployment, and ECR are no longer part of the backend runtime path.

## Runtime Split

- Vercel runs the Express API through `src/vercel.ts`.
- Cloudflare R2 stores uploaded files and product/category/user images.
- MongoDB remains the application database.
- AWS Cognito can remain enabled for authentication while storage moves to Cloudflare.

## Deploy

1. Configure the Vercel project to use the `be` directory.
2. Set the build command to:

```bash
yarn build:vercel
```

3. Set the required environment variables from `docs/ENV_TEMPLATE.md`.
4. Deploy through Vercel.

`vercel.json` is the deployment source of truth. The root `index.js` loads `dist/vercel.js`, which is produced by the Vercel build.

## Cloudflare R2

Create an R2 bucket and API token, then configure:

```bash
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET=your-r2-bucket-name
R2_PUBLIC_ENDPOINT=https://cdn.example.com
```

Use a custom domain for production public file URLs when possible.

## Migration

Run:

```bash
yarn migrate:storage:r2 -- --mode=dry-run
```

Review the summary, back up MongoDB, then run:

```bash
yarn migrate:storage:r2 -- --mode=execute
```

The migration copies legacy public object URLs into R2 and updates MongoDB fields for product images, variant images, category images, and user profile images.
