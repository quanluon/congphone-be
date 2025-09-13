import { toSlug } from '../utils/string';
import mongoose from 'mongoose';

export interface IBrand {
  _id: string | mongoose.Types.ObjectId;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new mongoose.Schema<IBrand>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  website: {
    type: String
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create slug from name
brandSchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = toSlug(this.name)
  }
  next();
});

// Validate slug is present
brandSchema.pre('validate', function(next) {
  if (!this.slug) {
    this.slug = toSlug(this.name)
  }
  next();
});

// Add text index for search
brandSchema.index({ 
  name: 'text', 
  description: 'text'
});

export const Brand = mongoose.model<IBrand>('Brand', brandSchema);
