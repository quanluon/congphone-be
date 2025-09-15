const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  entryPoints: ['src/handler.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: 'dist/handler.js',
  external: [
    // AWS SDK is provided by Lambda runtime
    'aws-sdk',
    '@aws-sdk/*',
    // Keep these external for better performance
    'mongoose',
    'express',
    'cors',
    'bcryptjs',
    'jsonwebtoken',
    'joi',
    'winston',
    'dotenv',
    'serverless-http',
    'express-validator',
    'jose'
  ],
  minify: isProduction,
  sourcemap: !isProduction,
  treeShaking: true,
  drop: isProduction ? ['console', 'debugger'] : [],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  metafile: true,
  logLevel: 'info',
  // Optimize for Lambda
  mainFields: ['main', 'module'],
  conditions: ['node'],
  // Remove unused code
  pure: isProduction ? ['console.log', 'console.info', 'console.debug'] : [],
};

// Build function
async function build() {
  try {
    const result = await esbuild.build(config);
    
    if (result.metafile) {
      // Write metadata file for esbuild-visualizer
      fs.writeFileSync('dist/handler.js.meta.json', JSON.stringify(result.metafile, null, 2));
      
      console.log('\n📊 Bundle Analysis:');
      console.log('Entry point size:', (result.metafile.outputs['dist/handler.js']?.bytes || 0) / 1024, 'KB');
      
      // Show largest dependencies
      const outputs = Object.entries(result.metafile.outputs);
      const largestFiles = outputs
        .filter(([file]) => file.includes('node_modules'))
        .sort((a, b) => b[1].bytes - a[1].bytes)
        .slice(0, 10);
      
      if (largestFiles.length > 0) {
        console.log('\n🔍 Largest dependencies:');
        largestFiles.forEach(([file, meta]) => {
          const size = (meta.bytes / 1024).toFixed(2);
          const name = file.split('node_modules/')[1]?.split('/')[0] || 'unknown';
          console.log(`  ${name}: ${size} KB`);
        });
      }
    }
    
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run build if this file is executed directly
if (require.main === module) {
  build();
}

module.exports = { config, build };
