#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function analyzeDependencies() {
  console.log('🔍 Analyzing dependencies for optimization opportunities...\n');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  console.log('📦 Current dependencies:');
  Object.entries(dependencies).forEach(([name, version]) => {
    console.log(`  ${name}: ${version}`);
  });
  
  console.log('\n💡 Optimization suggestions:');
  
  // Check for potential optimizations
  const suggestions = [];
  
  // Check for large dependencies that might be optimized
  const largeDeps = [
    'mongoose',
    'express',
    'winston',
    '@aws-sdk/client-cognito-identity-provider',
    '@aws-sdk/client-s3'
  ];
  
  largeDeps.forEach(dep => {
    if (dependencies[dep]) {
      suggestions.push(`Consider using lighter alternatives for ${dep} if possible`);
    }
  });
  
  // Check for unused dependencies
  const potentiallyUnused = [
    'bcryptjs', // If using Cognito, this might not be needed
    'jsonwebtoken', // If using Cognito, this might not be needed
    'jose' // Check if this is actually used
  ];
  
  potentiallyUnused.forEach(dep => {
    if (dependencies[dep]) {
      suggestions.push(`Review if ${dep} is actually needed (might be redundant with Cognito)`);
    }
  });
  
  // Check for dev dependencies in production
  const devDepsInProd = [
    'typescript',
    'ts-node',
    'nodemon',
    'jest',
    'esbuild'
  ];
  
  devDepsInProd.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      suggestions.push(`Move ${dep} from dependencies to devDependencies`);
    }
  });
  
  suggestions.forEach((suggestion, index) => {
    console.log(`  ${index + 1}. ${suggestion}`);
  });
  
  console.log('\n📊 Bundle size optimization tips:');
  console.log('  1. Use esbuild for faster, smaller builds');
  console.log('  2. Enable tree shaking to remove unused code');
  console.log('  3. Keep Cloudflare R2/AWS SDK usage scoped to storage and auth modules');
  console.log('  4. Minify production builds');
  console.log('  5. Remove console.log statements in production');
  console.log('  6. Keep Vercel output focused on dist/vercel.js');
  
  console.log('\n🚀 Next steps:');
  console.log('  1. Run: yarn build:analyze');
  console.log('  2. Check dist/bundle-analysis.html for detailed bundle analysis');
  console.log('  3. Review and remove unused dependencies');
  console.log('  4. Consider using lighter alternatives for large dependencies');
}

if (require.main === module) {
  analyzeDependencies();
}

module.exports = { analyzeDependencies };
