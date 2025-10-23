import { Order, IOrder, IOrderItem } from '../../layers/common/nodejs/models/order.model';
import { Product } from '../../layers/common/nodejs/models/product.model';
import { generateOrderNumber } from '../utils/order.utils';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../constants/common';

export interface CreateOrderData {
  customer: {
    name?: string;
    email?: string;
    phone: string;
    userId?: string;
  };
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
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
  paymentMethod?: PaymentMethod;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
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
  paymentMethod?: PaymentMethod;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  customerEmail?: string;
  customerPhone?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  userId?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string | 'asc' | 'desc';
}

export class OrderService {
  async createOrder(data: CreateOrderData): Promise<IOrder> {
    try {
      // Validate and get product details
      const orderItems: IOrderItem[] = [];
      let totalAmount = 0;
      let originalTotalAmount = 0;

      for (const item of data.items) {
        const product = await Product.findById(item.productId).populate('variants');
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        let price = product.basePrice;
        let originalPrice = product.originalBasePrice;

        // If variant is specified, get variant price
        if (item.variantId && product.variants) {
          const variant = product.variants.find((v: any) => v._id.toString() === item.variantId);
          if (variant) {
            price = variant.price;
            originalPrice = variant.originalPrice;
          }
        }

        const itemTotal = price * item.quantity;
        const itemOriginalTotal = (originalPrice || price) * item.quantity;

        const orderItem: any = {
          product: product._id,
          quantity: item.quantity,
          price,
          originalPrice,
        };

        // If variant is specified, store variant data directly
        if (item.variantId && product.variants) {
          const variant = product.variants.find((v: any) => v._id.toString() === item.variantId);
          if (variant) {
            orderItem.variant = {
              name: variant.name,
              color: variant.color,
              colorCode: variant.colorCode,
              storage: variant.storage,
              size: variant.size,
              connectivity: variant.connectivity,
              simType: variant.simType,
            };
          }
        }

        orderItems.push(orderItem);

        totalAmount += itemTotal;
        originalTotalAmount += itemOriginalTotal;
      }

      const order = new Order({
        customer: data.customer,
        items: orderItems,
        shippingAddress: data.shippingAddress,
        notes: data.notes,
        paymentMethod: data.paymentMethod,
        totalAmount,
        originalTotalAmount: originalTotalAmount > totalAmount ? originalTotalAmount : undefined,
        discountAmount: originalTotalAmount > totalAmount ? originalTotalAmount - totalAmount : 0,
        orderNumber: generateOrderNumber(),
      });

      return await order.save();
    } catch (error) {
      throw error;
    }
  }

  async getOrders(filters: OrderFilters = {}, pagination: PaginationOptions = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = pagination;

      const query: any = {};

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.paymentStatus) {
        query.paymentStatus = filters.paymentStatus;
      }
      if (filters.customerEmail) {
        query['customer.email'] = { $regex: filters.customerEmail, $options: 'i' };
      }
      if (filters.customerPhone) {
        query['customer.phone'] = { $regex: filters.customerPhone, $options: 'i' };
      }
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) {
          query.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          query.createdAt.$lte = new Date(filters.dateTo);
        }
      }
      if (filters.search) {
        query.$or = [
          { orderNumber: { $regex: filters.search, $options: 'i' } },
          { 'customer.name': { $regex: filters.search, $options: 'i' } },
          { 'customer.email': { $regex: filters.search, $options: 'i' } },
          { 'customer.phone': { $regex: filters.search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate('items.product', 'name slug images')
          .populate('customer.userId', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Order.countDocuments(query)
      ]);

      return {
        data: orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getOrderById(id: string): Promise<IOrder | null> {
    try {
      return await Order.findById(id)
        .populate('items.product', 'name slug images description')
        .populate('customer.userId', 'name email');
    } catch (error) {
      throw error;
    }
  }

  async getOrderByNumber(orderNumber: string): Promise<IOrder | null> {
    try {
      return await Order.findOne({ orderNumber })
        .populate('items.product', 'name slug images description')
        .populate('customer.userId', 'name email');
    } catch (error) {
      throw error;
    }
  }

  async updateOrder(id: string, data: UpdateOrderData): Promise<IOrder | null> {
    try {
      return await Order.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      ).populate('items.product', 'name slug images')
        .populate('customer.userId', 'name email');
    } catch (error) {
      throw error;
    }
  }

  async deleteOrder(id: string): Promise<boolean> {
    try {
      const result = await Order.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw error;
    }
  }

  async getOrderStats() {
    try {
      const stats = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ['$status', OrderStatus.PENDING] }, 1, 0] }
            },
            confirmedOrders: {
              $sum: { $cond: [{ $eq: ['$status', OrderStatus.CONFIRMED] }, 1, 0] }
            },
            processingOrders: {
              $sum: { $cond: [{ $eq: ['$status', OrderStatus.PROCESSING] }, 1, 0] }
            },
            shippedOrders: {
              $sum: { $cond: [{ $eq: ['$status', OrderStatus.SHIPPED] }, 1, 0] }
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ['$status', OrderStatus.DELIVERED] }, 1, 0] }
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ['$status', OrderStatus.CANCELLED] }, 1, 0] }
            },
            paidOrders: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', PaymentStatus.PAID] }, 1, 0] }
            },
            pendingPaymentOrders: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', PaymentStatus.PENDING] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        paidOrders: 0,
        pendingPaymentOrders: 0
      };
    } catch (error) {
      throw error;
    }
  }
}

export const orderService = new OrderService();
