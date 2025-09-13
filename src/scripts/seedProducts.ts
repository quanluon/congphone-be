import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import connectToDatabase from '../config/database';
import { Product, ProductType, ProductStatus } from '../models/product.model';
import { Brand } from '../models/brand.model';
import { Category } from '../models/category.model';

async function seedProducts() {
  try {
    // Debug environment variables
    console.log('Environment variables:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    console.log('MONGODB_NAME:', process.env.MONGODB_NAME ? 'Set' : 'Not set');
    
    await connectToDatabase();
    console.log('Connected to database');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Get Apple brand
    const appleBrand = await Brand.findOne({ name: 'Apple' });
    if (!appleBrand) {
      console.log('Apple brand not found. Please run seed:data first to create brands and categories.');
      return;
    }

    // Get categories
    const smartphoneCategory = await Category.findOne({ name: 'Smartphones' });
    const tabletCategory = await Category.findOne({ name: 'Tablets' });
    const laptopCategory = await Category.findOne({ name: 'Laptops' });
    const watchCategory = await Category.findOne({ name: 'Watches' });
    const accessoriesCategory = await Category.findOne({ name: 'Accessories' });

    if (!smartphoneCategory || !tabletCategory || !laptopCategory || !watchCategory || !accessoriesCategory) {
      console.log('Categories not found. Please run seed:data first to create categories.');
      return;
    }

    const products = [
      // iPhone 15 Pro
      {
        name: 'iPhone 15 Pro',
        description: 'The iPhone 15 Pro features a titanium design, A17 Pro chip, and advanced camera system with 48MP main camera. Experience the power of Pro with enhanced performance and durability.',
        shortDescription: 'Titanium design with A17 Pro chip and 48MP camera',
        category: smartphoneCategory._id,
        brand: appleBrand._id,
        productType: ProductType.IPHONE,
        basePrice: 999,
        originalBasePrice: 1099,
        images: [
          'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279821',
          'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279821'
        ],
        features: [
          'A17 Pro chip with 6-core GPU',
          '48MP Main camera with 2x Telephoto',
          'Titanium design',
          'Action Button',
          'USB-C connector',
          'Pro camera system'
        ],
        specifications: {
          display: '6.1-inch Super Retina XDR display',
          processor: 'A17 Pro chip',
          storage: '128GB, 256GB, 512GB, 1TB',
          camera: '48MP Main, 12MP Ultra Wide, 12MP Telephoto',
          battery: 'Up to 23 hours video playback',
          connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3',
          materials: 'Titanium with Ceramic Shield front'
        },
        status: ProductStatus.ACTIVE,
        isFeatured: true,
        isNew: true,
        tags: ['iphone', 'smartphone', 'apple', 'pro', 'titanium', 'a17', 'camera'],
        variants: [
          {
            name: 'iPhone 15 Pro 128GB Natural Titanium',
            color: 'Natural Titanium',
            colorCode: '#8E8E93',
            storage: '128GB',
            size: '6.1 inch',
            price: 999,
            originalPrice: 1099,
            stock: 50,
            images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279821'],
            specifications: {
              display: '6.1-inch Super Retina XDR',
              processor: 'A17 Pro chip',
              storage: '128GB',
              camera: '48MP Main, 12MP Ultra Wide, 12MP Telephoto'
            },
            isActive: true
          },
          {
            name: 'iPhone 15 Pro 256GB Blue Titanium',
            color: 'Blue Titanium',
            colorCode: '#007AFF',
            storage: '256GB',
            size: '6.1 inch',
            price: 1099,
            originalPrice: 1199,
            stock: 30,
            images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279821'],
            specifications: {
              display: '6.1-inch Super Retina XDR',
              processor: 'A17 Pro chip',
              storage: '256GB',
              camera: '48MP Main, 12MP Ultra Wide, 12MP Telephoto'
            },
            isActive: true
          },
          {
            name: 'iPhone 15 Pro 512GB White Titanium',
            color: 'White Titanium',
            colorCode: '#F2F2F7',
            storage: '512GB',
            size: '6.1 inch',
            price: 1299,
            originalPrice: 1399,
            stock: 20,
            images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-whitetitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279821'],
            specifications: {
              display: '6.1-inch Super Retina XDR',
              processor: 'A17 Pro chip',
              storage: '512GB',
              camera: '48MP Main, 12MP Ultra Wide, 12MP Telephoto'
            },
            isActive: true
          }
        ]
      },

      // iPhone 15 Pro Max
      {
        name: 'iPhone 15 Pro Max',
        description: 'The iPhone 15 Pro Max features the largest display in the Pro lineup with a 6.7-inch Super Retina XDR display, A17 Pro chip, and advanced camera system with 5x Telephoto zoom.',
        shortDescription: 'Largest Pro display with 5x Telephoto zoom',
        category: smartphoneCategory._id,
        brand: appleBrand._id,
        productType: ProductType.IPHONE,
        basePrice: 1199,
        originalBasePrice: 1299,
        images: [
          'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-finish-select-202309-6-7inch-naturaltitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279821'
        ],
        features: [
          'A17 Pro chip with 6-core GPU',
          '48MP Main camera with 5x Telephoto',
          '6.7-inch Super Retina XDR display',
          'Titanium design',
          'Action Button',
          'USB-C connector'
        ],
        specifications: {
          display: '6.7-inch Super Retina XDR display',
          processor: 'A17 Pro chip',
          storage: '256GB, 512GB, 1TB',
          camera: '48MP Main, 12MP Ultra Wide, 12MP Telephoto (5x zoom)',
          battery: 'Up to 29 hours video playback',
          connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3',
          materials: 'Titanium with Ceramic Shield front'
        },
        status: ProductStatus.ACTIVE,
        isFeatured: true,
        isNew: true,
        tags: ['iphone', 'smartphone', 'apple', 'pro', 'max', 'titanium', 'a17', 'camera'],
        variants: [
          {
            name: 'iPhone 15 Pro Max 256GB Natural Titanium',
            color: 'Natural Titanium',
            colorCode: '#8E8E93',
            storage: '256GB',
            size: '6.7 inch',
            price: 1199,
            originalPrice: 1299,
            stock: 25,
            images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-finish-select-202309-6-7inch-naturaltitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279821'],
            specifications: {
              display: '6.7-inch Super Retina XDR',
              processor: 'A17 Pro chip',
              storage: '256GB',
              camera: '48MP Main, 12MP Ultra Wide, 12MP Telephoto (5x zoom)'
            },
            isActive: true
          },
          {
            name: 'iPhone 15 Pro Max 512GB Blue Titanium',
            color: 'Blue Titanium',
            colorCode: '#007AFF',
            storage: '512GB',
            size: '6.7 inch',
            price: 1399,
            originalPrice: 1499,
            stock: 15,
            images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-finish-select-202309-6-7inch-bluetitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279821'],
            specifications: {
              display: '6.7-inch Super Retina XDR',
              processor: 'A17 Pro chip',
              storage: '512GB',
              camera: '48MP Main, 12MP Ultra Wide, 12MP Telephoto (5x zoom)'
            },
            isActive: true
          }
        ]
      },

      // iPhone 15
      {
        name: 'iPhone 15',
        description: 'The iPhone 15 features a beautiful design with Dynamic Island, A16 Bionic chip, and advanced camera system. Available in five stunning colors with USB-C connectivity.',
        shortDescription: 'Beautiful design with Dynamic Island and A16 Bionic',
        category: smartphoneCategory._id,
        brand: appleBrand._id,
        productType: ProductType.IPHONE,
        basePrice: 799,
        originalBasePrice: 899,
        images: [
          'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279821'
        ],
        features: [
          'A16 Bionic chip',
          '48MP Main camera',
          'Dynamic Island',
          'USB-C connector',
          'Ceramic Shield front',
          'Water resistant'
        ],
        specifications: {
          display: '6.1-inch Super Retina XDR display',
          processor: 'A16 Bionic chip',
          storage: '128GB, 256GB, 512GB',
          camera: '48MP Main, 12MP Ultra Wide',
          battery: 'Up to 20 hours video playback',
          connectivity: '5G, Wi-Fi 6, Bluetooth 5.3',
          materials: 'Aluminum with Ceramic Shield front'
        },
        status: ProductStatus.ACTIVE,
        isFeatured: false,
        isNew: true,
        tags: ['iphone', 'smartphone', 'apple', 'a16', 'dynamic-island', 'usb-c'],
        variants: [
          {
            name: 'iPhone 15 128GB Pink',
            color: 'Pink',
            colorCode: '#FF69B4',
            storage: '128GB',
            size: '6.1 inch',
            price: 799,
            originalPrice: 899,
            stock: 40,
            images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279821'],
            specifications: {
              display: '6.1-inch Super Retina XDR',
              processor: 'A16 Bionic chip',
              storage: '128GB',
              camera: '48MP Main, 12MP Ultra Wide'
            },
            isActive: true
          },
          {
            name: 'iPhone 15 256GB Blue',
            color: 'Blue',
            colorCode: '#007AFF',
            storage: '256GB',
            size: '6.1 inch',
            price: 899,
            originalPrice: 999,
            stock: 35,
            images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-blue?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279821'],
            specifications: {
              display: '6.1-inch Super Retina XDR',
              processor: 'A16 Bionic chip',
              storage: '256GB',
              camera: '48MP Main, 12MP Ultra Wide'
            },
            isActive: true
          }
        ]
      },

      // iPad Pro 12.9-inch
      {
        name: 'iPad Pro 12.9-inch',
        description: 'The iPad Pro 12.9-inch features the M2 chip, Liquid Retina XDR display, and support for Apple Pencil and Magic Keyboard. Perfect for professionals and creatives.',
        shortDescription: 'M2 chip with Liquid Retina XDR display',
        category: tabletCategory._id,
        brand: appleBrand._id,
        productType: ProductType.IPAD,
        basePrice: 1099,
        originalBasePrice: 1199,
        images: [
          'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-12-select-wifi-spacegray-202210?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1664411200794'
        ],
        features: [
          'M2 chip',
          'Liquid Retina XDR display',
          'Apple Pencil support',
          'Magic Keyboard compatible',
          'Thunderbolt / USB 4',
          'Face ID'
        ],
        specifications: {
          display: '12.9-inch Liquid Retina XDR',
          processor: 'M2 chip',
          storage: '128GB, 256GB, 512GB, 1TB, 2TB',
          connectivity: 'Wi-Fi, Wi-Fi + Cellular',
          camera: '12MP Wide, 10MP Ultra Wide',
          battery: 'Up to 10 hours',
          materials: 'Aluminum'
        },
        status: ProductStatus.ACTIVE,
        isFeatured: true,
        isNew: false,
        tags: ['ipad', 'tablet', 'apple', 'pro', 'm2', 'liquid-retina', 'pencil'],
        variants: [
          {
            name: 'iPad Pro 12.9-inch 128GB Wi-Fi Space Gray',
            color: 'Space Gray',
            colorCode: '#8E8E93',
            storage: '128GB',
            size: '12.9 inch',
            connectivity: 'Wi-Fi',
            price: 1099,
            originalPrice: 1199,
            stock: 20,
            images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-12-select-wifi-spacegray-202210?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1664411200794'],
            specifications: {
              display: '12.9-inch Liquid Retina XDR',
              processor: 'M2 chip',
              storage: '128GB',
              connectivity: 'Wi-Fi'
            },
            isActive: true
          },
          {
            name: 'iPad Pro 12.9-inch 256GB Wi-Fi + Cellular Silver',
            color: 'Silver',
            colorCode: '#F2F2F7',
            storage: '256GB',
            size: '12.9 inch',
            connectivity: 'Wi-Fi + Cellular',
            price: 1299,
            originalPrice: 1399,
            stock: 15,
            images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-12-select-cellular-silver-202210?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1664411200794'],
            specifications: {
              display: '12.9-inch Liquid Retina XDR',
              processor: 'M2 chip',
              storage: '256GB',
              connectivity: 'Wi-Fi + Cellular'
            },
            isActive: true
          }
        ]
      },

      // MacBook Pro 14-inch
      {
        name: 'MacBook Pro 14-inch',
        description: 'The MacBook Pro 14-inch features the M3 Pro or M3 Max chip, Liquid Retina XDR display, and all-day battery life. Built for professionals who demand the best.',
        shortDescription: 'M3 Pro/Max chip with Liquid Retina XDR display',
        category: laptopCategory._id,
        brand: appleBrand._id,
        productType: ProductType.MACBOOK,
        basePrice: 1999,
        originalBasePrice: 2199,
        images: [
          'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1697230830200'
        ],
        features: [
          'M3 Pro or M3 Max chip',
          'Liquid Retina XDR display',
          'Up to 22 hours battery life',
          '1080p FaceTime HD camera',
          'Six-speaker sound system',
          'MagSafe 3 charging'
        ],
        specifications: {
          display: '14.2-inch Liquid Retina XDR',
          processor: 'M3 Pro or M3 Max chip',
          memory: '18GB, 36GB, or 48GB unified memory',
          storage: '512GB, 1TB, 2TB, 4TB, or 8TB SSD',
          graphics: 'M3 Pro: 18-core GPU, M3 Max: 30-core or 40-core GPU',
          connectivity: 'Three Thunderbolt 4 ports, HDMI port, SDXC card slot, MagSafe 3 port',
          materials: 'Aluminum'
        },
        status: ProductStatus.ACTIVE,
        isFeatured: true,
        isNew: true,
        tags: ['macbook', 'laptop', 'apple', 'pro', 'm3', 'liquid-retina', 'professional'],
        variants: [
          {
            name: 'MacBook Pro 14-inch M3 Pro 512GB Space Gray',
            color: 'Space Gray',
            colorCode: '#8E8E93',
            storage: '512GB',
            size: '14.2 inch',
            price: 1999,
            originalPrice: 2199,
            stock: 10,
            images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1697230830200'],
            specifications: {
              display: '14.2-inch Liquid Retina XDR',
              processor: 'M3 Pro chip',
              memory: '18GB unified memory',
              storage: '512GB SSD',
              graphics: '18-core GPU'
            },
            isActive: true
          },
          {
            name: 'MacBook Pro 14-inch M3 Pro 1TB Silver',
            color: 'Silver',
            colorCode: '#F2F2F7',
            storage: '1TB',
            size: '14.2 inch',
            price: 2199,
            originalPrice: 2399,
            stock: 8,
            images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-silver-select-202310?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1697230830200'],
            specifications: {
              display: '14.2-inch Liquid Retina XDR',
              processor: 'M3 Pro chip',
              memory: '18GB unified memory',
              storage: '1TB SSD',
              graphics: '18-core GPU'
            },
            isActive: true
          }
        ]
      },

      // Apple Watch Series 9
      {
        name: 'Apple Watch Series 9',
        description: 'The Apple Watch Series 9 features the S9 chip, brighter display, and advanced health features. Available in aluminum and stainless steel cases.',
        shortDescription: 'S9 chip with brighter display and advanced health features',
        category: watchCategory._id,
        brand: appleBrand._id,
        productType: ProductType.WATCH,
        basePrice: 399,
        originalBasePrice: 449,
        images: [
          'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-45mm-aluminum-pink-s9?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1692895702700'
        ],
        features: [
          'S9 chip',
          'Brighter display',
          'Advanced health features',
          'Crash Detection',
          'Emergency SOS',
          'Water resistant'
        ],
        specifications: {
          display: '45mm or 41mm Always-On Retina display',
          processor: 'S9 chip',
          connectivity: 'GPS, GPS + Cellular',
          health: 'Heart rate, ECG, Blood Oxygen, Sleep tracking',
          battery: 'Up to 18 hours',
          materials: 'Aluminum or Stainless Steel'
        },
        status: ProductStatus.ACTIVE,
        isFeatured: true,
        isNew: true,
        tags: ['apple-watch', 'watch', 'apple', 'series-9', 's9', 'health', 'fitness'],
        variants: [
          {
            name: 'Apple Watch Series 9 45mm GPS Pink Aluminum',
            color: 'Pink',
            colorCode: '#FF69B4',
            size: '45mm',
            connectivity: 'GPS',
            price: 399,
            originalPrice: 449,
            stock: 30,
            images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-45mm-aluminum-pink-s9?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1692895702700'],
            specifications: {
              display: '45mm Always-On Retina display',
              processor: 'S9 chip',
              connectivity: 'GPS',
              materials: 'Aluminum'
            },
            isActive: true
          },
          {
            name: 'Apple Watch Series 9 41mm GPS + Cellular Blue Aluminum',
            color: 'Blue',
            colorCode: '#007AFF',
            size: '41mm',
            connectivity: 'GPS + Cellular',
            price: 499,
            originalPrice: 549,
            stock: 25,
            images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-41mm-aluminum-blue-s9?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1692895702700'],
            specifications: {
              display: '41mm Always-On Retina display',
              processor: 'S9 chip',
              connectivity: 'GPS + Cellular',
              materials: 'Aluminum'
            },
            isActive: true
          }
        ]
      },

      // AirPods Pro (2nd generation)
      {
        name: 'AirPods Pro (2nd generation)',
        description: 'The AirPods Pro (2nd generation) feature the H2 chip, Active Noise Cancellation, and Personalized Spatial Audio. Experience immersive sound like never before.',
        shortDescription: 'H2 chip with Active Noise Cancellation and Spatial Audio',
        category: accessoriesCategory._id,
        brand: appleBrand._id,
        productType: ProductType.AIRPODS,
        basePrice: 249,
        originalBasePrice: 279,
        images: [
          'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1660803972361'
        ],
        features: [
          'H2 chip',
          'Active Noise Cancellation',
          'Personalized Spatial Audio',
          'Adaptive Transparency',
          'Up to 6 hours listening time',
          'MagSafe Charging Case'
        ],
        specifications: {
          chip: 'H2 chip',
          audio: 'Personalized Spatial Audio with dynamic head tracking',
          noiseControl: 'Active Noise Cancellation, Adaptive Transparency',
          battery: 'Up to 6 hours listening time with ANC, up to 30 hours total with case',
          connectivity: 'Bluetooth 5.3',
          case: 'MagSafe Charging Case with speaker and lanyard loop'
        },
        status: ProductStatus.ACTIVE,
        isFeatured: true,
        isNew: false,
        tags: ['airpods', 'pro', 'apple', 'wireless', 'noise-cancellation', 'spatial-audio'],
        variants: [
          {
            name: 'AirPods Pro (2nd generation) with MagSafe Charging Case',
            color: 'White',
            colorCode: '#FFFFFF',
            price: 249,
            originalPrice: 279,
            stock: 50,
            images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1660803972361'],
            specifications: {
              chip: 'H2 chip',
              audio: 'Personalized Spatial Audio',
              noiseControl: 'Active Noise Cancellation',
              battery: 'Up to 6 hours listening time',
              case: 'MagSafe Charging Case'
            },
            isActive: true
          }
        ]
      }
    ];

    // Insert products
    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products successfully`);

    // Log created products
    createdProducts.forEach(product => {
      console.log(`- ${product.name} (${product.variants.length} variants)`);
    });

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedProducts();
