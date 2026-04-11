import mongoose from 'mongoose';

export enum UserType {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  cognitoId?: string; // Legacy AWS Cognito user ID
  firebaseUid?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  type: UserType;
  status: UserStatus;
  profileImage?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  cognitoId: {
    type: String,
    unique: true,
    index: true,
    sparse: true,
  },
  firebaseUid: {
    type: String,
    unique: true,
    index: true,
    sparse: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: UserType,
    required: true,
    default: UserType.CUSTOMER,
  },
  status: {
    type: String,
    enum: UserStatus,
    required: true,
    default: UserStatus.ACTIVE,
  },
  profileImage: {
    type: String,
  },
  lastLoginAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for performance
userSchema.index({ email: 1, type: 1 });
userSchema.index({ cognitoId: 1, type: 1 });
userSchema.index({ firebaseUid: 1, type: 1 });
userSchema.index({ status: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || '';
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

export const User = mongoose.model<IUser>('User', userSchema);
