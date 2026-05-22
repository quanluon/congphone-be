# Build Notes

The backend build is optimized for Vercel.

## Commands

```bash
yarn build
yarn build:vercel
```

Both commands build the Vercel target through `esbuild.config.js`.

## Outputs

- `dist/app.js`
- `dist/vercel.js`
- `dist/vercel.meta.json`

The root `index.js` loads `dist/vercel.js` for Vercel.

## Notes

- AWS Lambda, ECR, Serverless Framework, and Docker image deployment are no longer part of this backend.
- The AWS SDK S3 client is bundled because it is used to talk to Cloudflare R2.
- Keep heavy native packages such as `sharp` tested in the Vercel runtime after dependency upgrades.
