# Multi-stage build for optimized image size
FROM node:24-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build the application
RUN NODE_ENV=production yarn build:lambda

# Production image - Use AWS Lambda Node.js base image
FROM public.ecr.aws/lambda/nodejs:24

# Copy package files for production dependencies
COPY package.json yarn.lock ./

# Install production dependencies
RUN npm install -g yarn && \
    yarn install --frozen-lockfile --production=true && \
    yarn cache clean

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Set environment
ENV NODE_ENV=production

# Lambda handler
CMD ["dist/handler.handler"]
