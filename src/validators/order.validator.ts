import Joi from 'joi';

// Order item schema
const orderItemSchema = Joi.object({
  productId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  variantId: Joi.string().optional().pattern(/^[0-9a-fA-F]{24}$/),
  quantity: Joi.number().required().min(1).max(100)
});

// Customer schema
const customerSchema = Joi.object({
  name: Joi.string().optional().trim().min(2).max(100),
  email: Joi.string().optional().email(),
  phone: Joi.string().required()
});

// Shipping address schema
const shippingAddressSchema = Joi.object({
  address: Joi.string().required().trim().min(5).max(200),
  city: Joi.string().optional().trim().min(2).max(50).allow(""),
  district: Joi.string().optional().trim().min(2).max(50).allow(""),
  ward: Joi.string().optional().trim().min(2).max(50).allow(""),
  postalCode: Joi.string().optional().trim().max(10).allow("")
});

// Create order schema
export const createOrderSchema = Joi.object({
  customer: customerSchema.required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  shippingAddress: shippingAddressSchema.optional(),
  notes: Joi.string().optional().trim().allow(""),
  paymentMethod: Joi.string().optional().valid('cash', 'bank_transfer', 'credit_card', 'momo', 'zalopay')
});

// Update order schema
export const updateOrderSchema = Joi.object({
  status: Joi.string().optional().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
  paymentStatus: Joi.string().optional().valid('pending', 'paid', 'failed', 'refunded'),
  shippingAddress: shippingAddressSchema.optional(),
  notes: Joi.string().optional().trim().allow(""),
  paymentMethod: Joi.string().optional().valid('cash', 'bank_transfer', 'credit_card', 'momo', 'zalopay')
});

// Get orders query schema
export const getOrdersSchema = Joi.object({
  page: Joi.number().optional().min(1).default(1),
  limit: Joi.number().optional().min(1).max(100).default(10),
  sortBy: Joi.string().optional().valid('createdAt', 'updatedAt', 'totalAmount', 'status', 'paymentStatus').default('createdAt'),
  sortOrder: Joi.string().optional().valid('asc', 'desc').default('desc'),
  status: Joi.string().optional().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
  paymentStatus: Joi.string().optional().valid('pending', 'paid', 'failed', 'refunded'),
  customerEmail: Joi.string().optional().email(),
  customerPhone: Joi.string().optional(),
  dateFrom: Joi.date().optional().iso(),
  dateTo: Joi.date().optional().iso(),
  search: Joi.string().optional().trim().min(1).max(100)
});

// Bulk update schema
export const bulkUpdateOrdersSchema = Joi.object({
  orderIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).required(),
  updateData: updateOrderSchema.required()
});

// Params schemas
export const orderIdSchema = Joi.object({
  id: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/)
});

export const orderNumberSchema = Joi.object({
  orderNumber: Joi.string().required().pattern(/^ORD-\d{6}$/)
});
