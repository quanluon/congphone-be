import { ProductStatus, ProductType } from "../models/product.model";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

// Product constants
export const PRODUCT_TYPES = [
  ProductType.IPHONE    ,
  ProductType.IPAD, 
  ProductType.IMAC,
  ProductType.MACBOOK,
  ProductType.WATCH,
  ProductType.AIRPODS,
  ProductType.ACCESSORIES
] as const;

export const PRODUCT_STATUSES = [
  ProductStatus.ACTIVE,
  ProductStatus.INACTIVE,
  ProductStatus.DRAFT
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_REQUEST = 5;
export const MAX_FILES_PER_PRODUCT = 10;

// Order constants
export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  MOMO = 'momo',
  ZALOPAY = 'zalopay'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export const PAYMENT_METHODS = Object.values(PaymentMethod);
export const ORDER_STATUSES = Object.values(OrderStatus);
export const PAYMENT_STATUSES = Object.values(PaymentStatus);

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export const ORDER_SORT_FIELDS = ['createdAt', 'updatedAt', 'totalAmount', 'status', 'paymentStatus'] as const;