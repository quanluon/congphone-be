#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('Creating .env file from template...');
  
  const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/cong-phone

# JWT Configuration
JWT_SECRET=dev-jwt-secret-key-change-in-production

# AWS Cognito Configuration (for production)
COGNITO_USER_POOL_ID=local-pool-id
COGNITO_CLIENT_ID=local-client-id

# AWS S3 Configuration (for production)
S3_BUCKET=local-bucket

# Development Configuration
NODE_ENV=development
PORT=3001

# Hot Reload Configuration
HOT_RELOAD=true
WATCH_MODE=true
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('✅ .env file already exists');
}

// Create .env.example file
const envExampleContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/cong-phone

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# AWS Cognito Configuration (for production)
COGNITO_USER_POOL_ID=your-cognito-user-pool-id
COGNITO_CLIENT_ID=your-cognito-client-id

# AWS S3 Configuration (for production)
S3_BUCKET=your-s3-bucket-name

# Development Configuration
NODE_ENV=development
PORT=3001

# Hot Reload Configuration
HOT_RELOAD=true
WATCH_MODE=true
`;

fs.writeFileSync(envExamplePath, envExampleContent);
console.log('✅ .env.example file created successfully!');

console.log('\n🚀 Development setup complete!');
console.log('\nAvailable development commands:');
console.log('  npm run dev        - Start serverless offline with hot reload');
console.log('  npm run dev:hot    - Start with enhanced hot reload');
console.log('  npm run dev:watch  - Start with nodemon watching for changes');
console.log('  npm run dev:ts     - Start with ts-node-dev for fastest TypeScript reload');
console.log('\n📝 Make sure MongoDB is running on localhost:27017');
console.log('🌐 Server will be available at http://localhost:3001');
