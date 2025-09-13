import mongoose from 'mongoose';
import connectToDatabase from '../config/database';
import { authService } from '../services/auth.service';

async function seedAdmin() {
  try {
    await connectToDatabase();
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await authService.getUserByEmail('admin@congphone.com');
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
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

    console.log('Admin user created successfully:', {
      id: adminUser._id,
      email: adminUser.email,
      type: adminUser.type,
    });

    console.log('Admin credentials:');
    console.log('Email: admin@congphone.com');
    console.log('Password: Admin123!');

  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedAdmin();
