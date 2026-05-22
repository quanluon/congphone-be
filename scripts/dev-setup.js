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
MONGODB_NAME=cong-phone

# Auth Configuration
FIREBASE_PROJECT_ID=local-firebase-project
AWS_REGION=ap-southeast-1
COGNITO_USER_POOL_ID=local-pool-id
COGNITO_CLIENT_ID=local-client-id

# Cloudflare R2 Storage
R2_ACCOUNT_ID=local-account-id
R2_ACCESS_KEY_ID=local-r2-access-key
R2_SECRET_ACCESS_KEY=local-r2-secret-key
R2_BUCKET=local-bucket
R2_PUBLIC_ENDPOINT=http://localhost:3001/files/mock

# Development Configuration
NODE_ENV=development
DASHBOARD_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
PORT=3001
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('✅ .env file already exists');
}

// Create .env.example file
const envExampleContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/cong-phone
MONGODB_NAME=cong-phone

# Auth Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
AWS_REGION=ap-southeast-1
COGNITO_USER_POOL_ID=your-cognito-user-pool-id
COGNITO_CLIENT_ID=your-cognito-client-id

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET=your-r2-bucket-name
R2_PUBLIC_ENDPOINT=https://cdn.example.com

# Development Configuration
NODE_ENV=development
DASHBOARD_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
PORT=3001
`;

fs.writeFileSync(envExamplePath, envExampleContent);
console.log('✅ .env.example file created successfully!');

console.log('\n🚀 Development setup complete!');
console.log('\nAvailable development commands:');
console.log('  yarn dev           - Start local Express API');
console.log('  yarn dev:local     - Start local Express API with ts-node-dev');
console.log('  yarn build:vercel  - Build the Vercel output');
console.log('\n📝 Make sure MongoDB is running on localhost:27017');
console.log('🌐 Server will be available at http://localhost:3001');
