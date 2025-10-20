# Quick Start: ECR Deployment

This is a quick reference guide for deploying to AWS Lambda using ECR. For detailed documentation, see [DEPLOYMENT_ECR.md](./DEPLOYMENT_ECR.md).

## Prerequisites Checklist

- ✅ Docker Desktop installed and running
- ✅ AWS CLI installed (`aws --version`)
- ✅ AWS credentials configured (`aws configure`)
- ✅ Node.js 20+ and Yarn installed

## Step 1: Create `.env` File

Create a `.env` file in the `be/` directory with these variables:

```bash
# AWS (if not using aws configure)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-southeast-1
AWS_ACCOUNT_ID=018134828672

# ECR
ECR_REPOSITORY=mobile/be

# Application
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
S3_BUCKET=your-bucket-name
COGNITO_USER_POOL_ID=ap-southeast-1_xxxxx
COGNITO_CLIENT_ID=xxxxxxxxxx
NODE_ENV=production
```

## Step 2: Ensure ECR Repository Exists

```bash
# Check if repository exists
aws ecr describe-repositories --repository-names mobile/be --region ap-southeast-1

# If not, create it
aws ecr create-repository --repository-name mobile/be --region ap-southeast-1
```

## Step 3: Deploy

### Option A: One-Command Deployment (Recommended)
```bash
cd be
yarn deploy
```

### Option B: Step-by-Step
```bash
cd be

# Build and push Docker image to ECR
yarn deploy:ecr

# Deploy to Lambda
yarn deploy:serverless --stage dev
```

## Common Commands

```bash
# Test Docker locally
yarn docker:test

# Build Docker image only
yarn docker:build

# Deploy with custom tag
yarn deploy:ecr:tag v1.0.0 prod

# View Lambda logs
serverless logs -f api --stage dev --tail

# Rollback if needed
serverless rollback --stage dev
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Docker not running | Start Docker Desktop |
| AWS auth failed | Run `aws configure` or check `.env` |
| ECR repo not found | Create it with command above |
| Build fails | Run `yarn install` first |

## Deployment Flow

```
1. Build Docker image locally
2. Push to ECR (Amazon's container registry)
3. Serverless deploys Lambda using ECR image
4. API is live! 🚀
```

## Verify Deployment

```bash
# Get API endpoint
serverless info --stage dev

# Test API
curl https://your-api-gateway-url.amazonaws.com/dev/health
```

## Need Help?

- Full documentation: [DEPLOYMENT_ECR.md](./DEPLOYMENT_ECR.md)
- Check CloudWatch logs for errors
- Verify all environment variables in `.env`
- Ensure Docker is running before deployment

