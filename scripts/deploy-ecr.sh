#!/bin/bash

# ECR Deployment Script for Cong Phone Backend
# This script builds and pushes the Docker image to AWS ECR
# Usage: ./scripts/deploy-ecr.sh [IMAGE_TAG] [STAGE]

set -e

# Load environment variables from .env file
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env..."
    # Properly load .env file, filtering out comments and empty lines
    set -a
    source <(grep -v '^#' .env | grep -v '^$' | sed 's/\r$//')
    set +a
else
    echo "⚠️  Warning: .env file not found. Using default values."
fi

# Configuration
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-018134828672}"
AWS_REGION="${AWS_REGION:-ap-southeast-1}"
ECR_REPOSITORY="${ECR_REPOSITORY:-mobile/be}"
IMAGE_TAG="${1:-latest}"
STAGE="${2:-dev}"

# Construct ECR URL
ECR_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"

echo "================================================"
echo "🚀 ECR Deployment Configuration"
echo "================================================"
echo "AWS Account ID: ${AWS_ACCOUNT_ID}"
echo "AWS Region: ${AWS_REGION}"
echo "ECR Repository: ${ECR_REPOSITORY}"
echo "Image Tag: ${IMAGE_TAG}"
echo "Stage: ${STAGE}"
echo "ECR URL: ${ECR_URL}"
echo "================================================"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI is not installed"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "🔨 Building Docker image for linux/amd64 platform..."
docker buildx build --platform linux/amd64 --provenance=false --sbom=false -t ${ECR_REPOSITORY}:${IMAGE_TAG} --load .

echo ""
echo "🏷️  Tagging image for ECR..."
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_URL}:${IMAGE_TAG}

# Also tag as latest if not already
if [ "${IMAGE_TAG}" != "latest" ]; then
    docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_URL}:latest
fi

echo ""
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URL}

echo ""
echo "📤 Pushing image to ECR..."
docker push ${ECR_URL}:${IMAGE_TAG}

if [ "${IMAGE_TAG}" != "latest" ]; then
    echo "📤 Pushing latest tag..."
    docker push ${ECR_URL}:latest
fi

echo ""
echo "================================================"
echo "✅ Successfully pushed image to ECR"
echo "================================================"
echo "Image: ${ECR_URL}:${IMAGE_TAG}"
if [ "${IMAGE_TAG}" != "latest" ]; then
    echo "Latest: ${ECR_URL}:latest"
fi
echo ""
echo "Next steps:"
echo "1. Deploy to Lambda:"
echo "   yarn deploy:serverless --stage ${STAGE}"
echo ""
echo "2. Or run complete deployment:"
echo "   yarn deploy"
echo "================================================"

