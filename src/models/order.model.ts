import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  originalPrice?: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    name?: string;
    email?: string;
    phone: string;
    userId?: mongoose.Types.ObjectId;
  };
  items: IOrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    postalCode?: string;
  };
  notes?: string;
  totalAmount: number;
  originalTotalAmount?: number;
  discountAmount?: number;
  shippingFee?: number;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: Schema.Types.ObjectId,
    ref: 'ProductVariant',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  items: [OrderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  shippingAddress: {
    fullName: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    district: {
      type: String,
    },
    ward: {
      type: String,
    },
    postalCode: {
      type: String,
    },
  },
  notes: {
    type: String,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  originalTotalAmount: {
    type: Number,
    min: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  shippingFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  paymentMethod: {
    type: String,
  },
}, {
  timestamps: true,
});

// Generate order number before saving
OrderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for better query performance
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ 'customer.phone': 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
