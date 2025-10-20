import mongoose from 'mongoose';
import connectToDatabase from '../config/database';
import { authService } from '../services/auth.service';
import logger from '../utils/logger';

async function seedAdmin() {
  try {
    await connectToDatabase();
    logger.info('Connected to database');

    // Check if admin already exists
    const existingAdmin = await authService.getUserByEmail('admin@congphone.com');
    if (existingAdmin) {
      logger.info({ email: existingAdmin.email }, 'Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = await authService.registerUser({
      email: 'admin@congphone.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      userType: 'admin',
    });

    logger.info({
      id: adminUser._id,
      email: adminUser.email,
      type: adminUser.type,
    }, 'Admin user created successfully');

    logger.info('Admin credentials:');
    logger.info('Email: admin@congphone.com');
    logger.info('Password: Admin123!');

  } catch (error) {
    logger.error({ err: error }, 'Error seeding admin user');
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
}

// Run the seed function
seedAdmin();
