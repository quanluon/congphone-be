import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import connectToDatabase from '../config/database';
import { Brand } from '../models/brand.model';
import { Category } from '../models/category.model';
import { Product, ProductType, ProductStatus } from '../models/product.model';
import logger from '../utils/logger';

async function seedData() {
  try {
    await connectToDatabase();
    logger.info('Connected to database');

    // Clear existing data
    await Brand.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    logger.info('Cleared existing data');

    // Create brands
    const brands = await Brand.insertMany([
      {
        name: 'Apple',
        description: 'Apple Inc. is an American multinational technology company',
        logo: 'https://example.com/apple-logo.png',
        website: 'https://apple.com'
      },
      {
        name: 'Samsung',
        description: 'Samsung Electronics is a South Korean multinational electronics corporation',
        logo: 'https://example.com/samsung-logo.png',
        website: 'https://samsung.com'
      }
    ]);
    logger.info({ count: brands.length }, 'Created brands');

    // Create categories
    const categories = await Category.insertMany([
      {
        name: 'Smartphones',
        description: 'Mobile phones with advanced computing capabilities'
      },
      {
        name: 'Tablets',
        description: 'Portable computers with touchscreen displays'
      },
      {
        name: 'Laptops',
        description: 'Portable personal computers'
      },
      {
        name: 'Watches',
        description: 'Smartwatches and wearable devices'
      },
      {
        name: 'Accessories',
        description: 'Supplementary devices and components'
      }
    ]);
    logger.info({ count: categories.length }, 'Created categories');

    // Create products
    const products = await Product.insertMany([
      {
        name: 'iPhone 15 Pro',
        description: 'The latest iPhone with titanium design and A17 Pro chip',
        shortDescription: 'Latest iPhone with titanium design',
        category: categories[0]._id,
        brand: brands[0]._id,
        productType: ProductType.IPHONE,
        basePrice: 999,
        originalBasePrice: 1099,
        images: ['https://example.com/iphone15pro-1.jpg', 'https://example.com/iphone15pro-2.jpg'],
        features: ['Titanium Design', 'A17 Pro Chip', '48MP Camera', 'USB-C'],
        specifications: {
          'Display': '6.1-inch Super Retina XDR',
          'Chip': 'A17 Pro',
          'Camera': '48MP Main Camera',
          'Storage': '128GB, 256GB, 512GB, 1TB'
        },
        status: ProductStatus.ACTIVE,
        isFeatured: true,
        isNew: true,
        tags: ['iphone', 'pro', 'titanium', 'camera'],
        variants: [
          {
            name: 'iPhone 15 Pro 128GB Natural Titanium',
            color: 'Natural Titanium',
            colorCode: '#8E8E93',
            storage: '128GB',
            price: 999,
            originalPrice: 1099,
            stock: 50,
            images: ['https://example.com/iphone15pro-natural-1.jpg'],
            specifications: {
              'Storage': '128GB',
              'Color': 'Natural Titanium'
            }
          },
          {
            name: 'iPhone 15 Pro 256GB Blue Titanium',
            color: 'Blue Titanium',
            colorCode: '#007AFF',
            storage: '256GB',
            price: 1099,
            originalPrice: 1199,
            stock: 30,
            images: ['https://example.com/iphone15pro-blue-1.jpg'],
            specifications: {
              'Storage': '256GB',
              'Color': 'Blue Titanium'
            }
          }
        ]
      },
      {
        name: 'iPad Air',
        description: 'Powerful tablet with M2 chip and all-day battery life',
        shortDescription: 'Powerful tablet with M2 chip',
        category: categories[1]._id,
        brand: brands[0]._id,
        productType: ProductType.IPAD,
        basePrice: 599,
        images: ['https://example.com/ipadair-1.jpg'],
        features: ['M2 Chip', '10.9-inch Display', 'Touch ID', 'USB-C'],
        specifications: {
          'Display': '10.9-inch Liquid Retina',
          'Chip': 'M2',
          'Storage': '64GB, 256GB',
          'Connectivity': 'Wi-Fi, Wi-Fi + Cellular'
        },
        status: ProductStatus.ACTIVE,
        isFeatured: false,
        isNew: false,
        tags: ['ipad', 'air', 'm2', 'tablet'],
        variants: [
          {
            name: 'iPad Air 64GB Wi-Fi Space Gray',
            color: 'Space Gray',
            colorCode: '#8E8E93',
            connectivity: 'Wi-Fi',
            price: 599,
            stock: 25,
            images: ['https://example.com/ipadair-spacegray-1.jpg'],
            specifications: {
              'Storage': '64GB',
              'Connectivity': 'Wi-Fi',
              'Color': 'Space Gray'
            }
          }
        ]
      }
    ]);
    logger.info({ count: products.length }, 'Created products');

    logger.info('Data seeding completed successfully!');
  } catch (error) {
    logger.error({ err: error }, 'Error seeding data');
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
}

// Run the seed function
seedData();
