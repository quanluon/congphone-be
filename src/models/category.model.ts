import mongoose from 'mongoose';
import { toSlug } from '../utils/string';

export interface ICategory {
  _id: string | mongoose.Types.ObjectId;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new mongoose.Schema<ICategory>({
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
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = toSlug(this.name)
  }
  next();
});

// Validate slug is present
categorySchema.pre('validate', function(next) {
  if (!this.slug) {
    this.slug = toSlug(this.name)
  }
  next();
});

// Add text index for search
categorySchema.index({ 
  name: 'text', 
  description: 'text'
});

export const Category = mongoose.model<ICategory>('Category', categorySchema);
