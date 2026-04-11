# Environment Variables Template

Create a `.env` file in the `be/` directory with the following variables:

## Required Variables

```bash
# AWS Configuration (if not using `aws configure`)
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION=ap-southeast-1
AWS_ACCOUNT_ID=018134828672

# ECR Configuration
ECR_REPOSITORY=mobile/be

# MongoDB Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGODB_NAME=cong-phone

# AWS S3 Storage
S3_BUCKET=your-s3-bucket-name
CLOUDFRONT_STORAGE_ENDPOINT=https://cdn.example.com

# AWS Cognito Authentication
COGNITO_USER_POOL_ID=ap-southeast-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Application Environment
NODE_ENV=production
DASHBOARD_URL=https://admin.example.com
ALLOWED_ORIGINS=https://shop.example.com,https://admin.example.com
```

## Optional Variables

```bash
# Telegram Notifications (if using)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
TELEGRAM_MENTION_USER_IDS=123456789,987654321
```

## How to Create `.env` File

### Option 1: Manual Creation

1. Create a new file named `.env` in the `be/` directory
2. Copy the template above
3. Replace all placeholder values with your actual credentials

### Option 2: Using Command Line

```bash
cd be

# Create .env file
cat > .env << 'EOF'
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION=ap-southeast-1
AWS_ACCOUNT_ID=018134828672

ECR_REPOSITORY=mobile/be

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_NAME=cong-phone
S3_BUCKET=your-s3-bucket-name
CLOUDFRONT_STORAGE_ENDPOINT=https://cdn.example.com
COGNITO_USER_POOL_ID=ap-southeast-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

NODE_ENV=production
DASHBOARD_URL=https://admin.example.com
ALLOWED_ORIGINS=https://shop.example.com,https://admin.example.com
EOF

# Edit with your preferred editor
nano .env
# or
vim .env
# or
code .env
```

## AWS Credentials

You can obtain AWS credentials in two ways:

### Method 1: AWS CLI (Recommended)
```bash
aws configure
```
This stores credentials in `~/.aws/credentials` and they will be automatically used.

### Method 2: .env File
Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to your `.env` file.

## Getting Your Values

### MongoDB URI
- Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Get connection string from "Connect" → "Connect your application"

### S3 Bucket
- Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
- Create a new bucket or use existing one
- Copy the bucket name

### Cognito User Pool
- Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
- Create a user pool or use existing one
- Copy the User Pool ID and App Client ID

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file to version control
- Keep your credentials secure
- Use different credentials for development and production
- Rotate credentials regularly
- Use AWS IAM roles when possible instead of access keys

## Verification

After creating your `.env` file, verify it:

```bash
# Check if file exists
ls -la .env

# Check if variables are loadable (don't display values)
node -e "require('dotenv').config(); console.log('✅ .env loaded successfully');"
```
