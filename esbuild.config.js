const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production';

// Get all function files
const functionsDir = path.join(__dirname, 'functions');
const functionFiles = fs.readdirSync(functionsDir)
  .filter(file => file.endsWith('.ts'))
  .map(file => path.join('functions', file));

// Create entry points object
const entryPoints = functionFiles.reduce((acc, file) => {
  const name = path.basename(file, '.ts');
  acc[`functions/${name}`] = file;
  return acc;
}, {});

console.log('📦 Building functions:', Object.keys(entryPoints).map(k => path.basename(k)));

const config = {
  entryPoints,
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outdir: 'dist',
  outExtension: { '.js': '.js' },
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
    'jose',
    'pino',
    'pino-pretty'
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
    // Clean dist folder first
    if (fs.existsSync('dist/functions')) {
      fs.rmSync('dist/functions', { recursive: true, force: true });
    }
    
    const result = await esbuild.build(config);
    
    if (result.metafile) {
      // Write metadata file for analysis
      fs.writeFileSync('dist/build-meta.json', JSON.stringify(result.metafile, null, 2));
      
      console.log('\n📊 Bundle Analysis:');
      
      // Calculate total size
      let totalSize = 0;
      const outputs = Object.entries(result.metafile.outputs)
        .filter(([file]) => file.endsWith('.js'))
        .sort((a, b) => b[1].bytes - a[1].bytes);
      
      outputs.forEach(([file, meta]) => {
        totalSize += meta.bytes;
        const size = (meta.bytes / 1024).toFixed(2);
        const name = path.basename(file);
        console.log(`  ${name}: ${size} KB`);
      });
      
      console.log(`\n📦 Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
      console.log(`📄 Functions built: ${outputs.length}`);
    }
    
    console.log('\n✅ Build completed successfully');
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
