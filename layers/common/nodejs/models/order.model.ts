import mongoose, { Document, Schema } from 'mongoose';
import { OrderStatus, PaymentStatus, PaymentMethod, ORDER_STATUSES, PAYMENT_STATUSES, PAYMENT_METHODS } from '../constants/common';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variant?: {
    name: string;
    color: string;
    colorCode: string;
    storage?: string;
    size?: string;
    connectivity?: string;
    simType?: string;
  };
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
  status: OrderStatus;
  paymentStatus: PaymentStatus;
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
  paymentMethod?: PaymentMethod;
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
    name: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    colorCode: {
      type: String,
      trim: true,
    },
    storage: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      trim: true,
    },
    connectivity: {
      type: String,
      trim: true,
    },
    simType: {
      type: String,
      trim: true,
    },
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
    enum: ORDER_STATUSES,
    default: OrderStatus.PENDING,
  },
  paymentStatus: {
    type: String,
    enum: PAYMENT_STATUSES,
    default: PaymentStatus.PENDING,
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
    enum: [...PAYMENT_METHODS, null],
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

export const Order = (mongoose.models.Order as mongoose.Model<IOrder>) || mongoose.model<IOrder>('Order', OrderSchema);
