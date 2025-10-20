# ECR Deployment Guide

This guide explains how to deploy the Cong Phone Backend to AWS Lambda using Docker containers stored in Amazon ECR (Elastic Container Registry).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Deployment Process](#deployment-process)
- [Troubleshooting](#troubleshooting)
- [Environment Variables](#environment-variables)

## Prerequisites

Before deploying, ensure you have the following installed and configured:

1. **Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Ensure Docker is running before deployment

2. **AWS CLI**
   - Install from: https://aws.amazon.com/cli/
   - Version 2.x recommended

3. **Node.js & Yarn**
   - Node.js 20.x or higher
   - Yarn package manager

4. **AWS Account & Credentials**
   - AWS Account ID: `018134828672`
   - IAM user with appropriate permissions

## Initial Setup

### 1. Configure AWS Credentials

You have two options:

**Option A: Using AWS CLI (Recommended)**
```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `ap-southeast-1`
- Default output format: `json`

**Option B: Using Environment Variables**

Add to your `.env` file:
```bash
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=ap-southeast-1
```

### 2. Create `.env` File

Copy the example file and fill in your values:
```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:
```bash
# AWS Configuration
AWS_ACCOUNT_ID=018134828672
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your_actual_access_key
AWS_SECRET_ACCESS_KEY=your_actual_secret_key

# ECR Configuration
ECR_REPOSITORY=mobile/be

# Application Configuration
MONGODB_URI=your_mongodb_connection_string
S3_BUCKET=your_s3_bucket_name
COGNITO_USER_POOL_ID=your_cognito_user_pool_id
COGNITO_CLIENT_ID=your_cognito_client_id
NODE_ENV=production
```

### 3. Ensure ECR Repository Exists

Check if the ECR repository exists:
```bash
aws ecr describe-repositories --repository-names mobile/be --region ap-southeast-1
```

If it doesn't exist, create it:
```bash
aws ecr create-repository \
  --repository-name mobile/be \
  --region ap-southeast-1 \
  --image-scanning-configuration scanOnPush=true
```

## Deployment Process

### Quick Deployment (Recommended)

Deploy everything in one command:
```bash
yarn deploy
```

This will:
1. Build the Docker image
2. Push it to ECR
3. Deploy to AWS Lambda via Serverless Framework

### Step-by-Step Deployment

For more control, you can deploy in steps:

**Step 1: Build and Push to ECR**
```bash
yarn deploy:ecr
```

Optional: Use a custom image tag
```bash
yarn deploy:ecr:tag v1.0.0 dev
```

**Step 2: Deploy to Lambda**
```bash
yarn deploy:serverless --stage dev
```

Or for production:
```bash
yarn deploy:serverless --stage prod
```

### Testing Docker Locally

Before deploying to AWS, test the Docker image locally:

**Build the image:**
```bash
yarn docker:build
```

**Run locally:**
```bash
yarn docker:run
```

The API will be available at `http://localhost:3000`

## Deployment Commands Reference

| Command | Description |
|---------|-------------|
| `yarn deploy` | Complete deployment (ECR + Lambda) |
| `yarn deploy:ecr` | Build and push Docker image to ECR |
| `yarn deploy:ecr:tag [TAG] [STAGE]` | Deploy with custom tag |
| `yarn deploy:serverless` | Deploy to Lambda only (uses existing ECR image) |
| `yarn docker:build` | Build Docker image locally |
| `yarn docker:run` | Run Docker container locally |
| `yarn docker:test` | Build and run locally for testing |

## Environment Variables

### Required Variables

These must be set in your `.env` file:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `S3_BUCKET` | S3 bucket for file uploads | `my-bucket-name` |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID | `ap-southeast-1_xxxxx` |
| `COGNITO_CLIENT_ID` | Cognito App Client ID | `xxxxxxxxxx` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_ACCOUNT_ID` | AWS Account ID | `018134828672` |
| `AWS_REGION` | AWS Region | `ap-southeast-1` |
| `ECR_REPOSITORY` | ECR Repository name | `mobile/be` |
| `NODE_ENV` | Node environment | `development` |

## Troubleshooting

### Common Issues

#### 1. Docker Not Running
```
Error: Cannot connect to Docker daemon
```

**Solution:** Start Docker Desktop and wait for it to fully initialize.

#### 2. AWS Authentication Failed
```
Error: Unable to locate credentials
```

**Solution:** 
- Run `aws configure` to set up credentials
- Or add AWS credentials to your `.env` file
- Verify credentials with: `aws sts get-caller-identity`

#### 3. ECR Login Failed
```
Error: no basic auth credentials
```

**Solution:** The script handles this automatically, but you can manually login:
```bash
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  018134828672.dkr.ecr.ap-southeast-1.amazonaws.com
```

#### 4. ECR Repository Not Found
```
Error: The repository with name 'mobile/be' does not exist
```

**Solution:** Create the repository:
```bash
aws ecr create-repository --repository-name mobile/be --region ap-southeast-1
```

#### 5. Lambda Deployment Failed
```
Error: Stack cong-phone-backend-dev failed to deploy
```

**Solutions:**
- Check CloudWatch logs for detailed errors
- Verify all environment variables are set correctly
- Ensure the ECR image was pushed successfully
- Check IAM permissions for Lambda and ECR

#### 6. Build Fails Due to Missing Dependencies
```
Error: Cannot find module 'xxx'
```

**Solution:** Install dependencies first:
```bash
yarn install
```

### Viewing Logs

**Serverless Framework logs:**
```bash
serverless logs -f api --stage dev --tail
```

**AWS CloudWatch logs:**
```bash
aws logs tail /aws/lambda/cong-phone-backend-dev-api --follow
```

### Rollback

If a deployment fails, rollback to the previous version:
```bash
serverless rollback --stage dev
```

## Architecture

### Deployment Flow

```
Local Development
      ↓
Build Docker Image (Dockerfile)
      ↓
Push to ECR (deploy-ecr.sh)
      ↓
Serverless Framework
      ↓
AWS Lambda (Container Image)
```

### Image Structure

The Docker image uses a multi-stage build:

1. **Builder Stage:** Compiles TypeScript to JavaScript using esbuild
2. **Production Stage:** Creates minimal runtime image with only necessary dependencies

### Lambda Configuration

- **Runtime:** Container Image (Node.js 20)
- **Memory:** 512 MB
- **Timeout:** 29 seconds
- **Architecture:** x86_64

## Best Practices

1. **Always test locally first** using `yarn docker:test`
2. **Use tagged releases** for production deployments
3. **Keep `.env` file secure** - never commit it to version control
4. **Monitor CloudWatch logs** after deployment
5. **Use separate stages** (dev/staging/prod) for different environments
6. **Verify ECR image** was pushed successfully before deploying to Lambda

## Additional Resources

- [AWS Lambda Container Images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html)
- [Amazon ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [Serverless Framework AWS Lambda Guide](https://www.serverless.com/framework/docs/providers/aws/guide/functions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review CloudWatch logs
3. Verify all prerequisites are met
4. Ensure `.env` file is properly configured

