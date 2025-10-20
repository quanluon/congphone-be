# Constants and Enums Reference

This document provides a comprehensive reference for all constants and enums used throughout the backend application.

## Order-Related Enums

All order-related enums are defined in `src/constants/common.ts`.

### Payment Methods

```typescript
export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  MOMO = 'momo',
  ZALOPAY = 'zalopay'
}
```

**Usage:**
```typescript
import { PaymentMethod, PAYMENT_METHODS } from '../constants/common';

// Using enum
const payment = PaymentMethod.CASH;

// Using array of values
const allMethods = PAYMENT_METHODS;
// ['cash', 'bank_transfer', 'credit_card', 'momo', 'zalopay']
```

**Available Values:**
- `cash` - Cash on Delivery (COD)
- `bank_transfer` - Bank Transfer
- `credit_card` - Credit Card Payment
- `momo` - MoMo E-Wallet
- `zalopay` - ZaloPay E-Wallet

---

### Order Status

```typescript
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}
```

**Usage:**
```typescript
import { OrderStatus, ORDER_STATUSES } from '../constants/common';

// Using enum
const status = OrderStatus.PENDING;

// Using array of values
const allStatuses = ORDER_STATUSES;
// ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
```

**Status Flow:**
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    ↓         ↓            ↓           ↓
         CANCELLED (can happen at any stage)
```

**Status Descriptions:**
- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed by admin/system
- `processing` - Order is being prepared/packed
- `shipped` - Order has been shipped to customer
- `delivered` - Order successfully delivered
- `cancelled` - Order cancelled by customer or admin

---

### Payment Status

```typescript
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}
```

**Usage:**
```typescript
import { PaymentStatus, PAYMENT_STATUSES } from '../constants/common';

// Using enum
const paymentStatus = PaymentStatus.PAID;

// Using array of values
const allPaymentStatuses = PAYMENT_STATUSES;
// ['pending', 'paid', 'failed', 'refunded']
```

**Status Descriptions:**
- `pending` - Payment not yet received
- `paid` - Payment successfully received
- `failed` - Payment attempt failed
- `refunded` - Payment refunded to customer

---

### Sort Order

```typescript
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}
```

**Usage:**
```typescript
import { SortOrder } from '../constants/common';

const sortOrder = SortOrder.DESC; // 'desc'
```

---

### Sort Fields

```typescript
export const ORDER_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'totalAmount',
  'status',
  'paymentStatus'
] as const;
```

**Usage:**
```typescript
import { ORDER_SORT_FIELDS } from '../constants/common';

// In validation or query building
const validFields = ORDER_SORT_FIELDS;
```

---

## Product-Related Enums

### Product Types

```typescript
export const PRODUCT_TYPES = [
  ProductType.IPHONE,
  ProductType.IPAD, 
  ProductType.IMAC,
  ProductType.MACBOOK,
  ProductType.WATCH,
  ProductType.AIRPODS,
  ProductType.ACCESSORIES
] as const;
```

### Product Statuses

```typescript
export const PRODUCT_STATUSES = [
  ProductStatus.ACTIVE,
  ProductStatus.INACTIVE,
  ProductStatus.DRAFT
] as const;
```

---

## General Constants

### Pagination

```typescript
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
```

**Usage:**
```typescript
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../constants/common';

const page = req.query.page || DEFAULT_PAGE;
const limit = req.query.limit || DEFAULT_LIMIT;
```

---

### File Upload

```typescript
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_REQUEST = 5;
export const MAX_FILES_PER_PRODUCT = 10;
```

**Usage:**
```typescript
import { MAX_FILE_SIZE, MAX_FILES_PER_REQUEST } from '../constants/common';

// Validate file size
if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large');
}
```

---

## Usage Examples

### In Models

```typescript
import { OrderStatus, PaymentStatus, ORDER_STATUSES, PAYMENT_STATUSES } from '../constants/common';

const OrderSchema = new Schema({
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
});
```

### In Validators

```typescript
import { PAYMENT_METHODS, ORDER_STATUSES, PAYMENT_STATUSES } from '../constants/common';

export const createOrderSchema = Joi.object({
  paymentMethod: Joi.string().optional().valid(...PAYMENT_METHODS)
});

export const updateOrderSchema = Joi.object({
  status: Joi.string().optional().valid(...ORDER_STATUSES),
  paymentStatus: Joi.string().optional().valid(...PAYMENT_STATUSES),
});
```

### In Services

```typescript
import { OrderStatus, PaymentStatus, PaymentMethod } from '../constants/common';

export interface CreateOrderData {
  paymentMethod?: PaymentMethod;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

// In aggregation pipelines
const stats = await Order.aggregate([
  {
    $group: {
      _id: null,
      pendingOrders: {
        $sum: { $cond: [{ $eq: ['$status', OrderStatus.PENDING] }, 1, 0] }
      },
      paidOrders: {
        $sum: { $cond: [{ $eq: ['$paymentStatus', PaymentStatus.PAID] }, 1, 0] }
      }
    }
  }
]);
```

### In Controllers

```typescript
import { OrderStatus, PaymentStatus } from '../constants/common';

// Updating order status
await orderService.updateOrder(orderId, {
  status: OrderStatus.CONFIRMED,
  paymentStatus: PaymentStatus.PAID
});
```

---

## Benefits of Using Enums

### 1. Type Safety
```typescript
// ✅ Type-safe - TypeScript will catch errors
const status: OrderStatus = OrderStatus.PENDING;

// ❌ Error - TypeScript will catch this
const status: OrderStatus = 'pendinggg'; // Typo detected!
```

### 2. Autocompletion
Your IDE will provide intelligent autocomplete suggestions when using enums.

### 3. Centralized Management
All values are defined in one place (`src/constants/common.ts`), making updates easy.

### 4. Documentation
Enums serve as self-documenting code, making it clear what values are valid.

### 5. Refactoring Safety
Changing an enum value automatically updates all usages throughout the codebase.

---

## Migration from Hardcoded Values

### Before (Hardcoded)
```typescript
// ❌ Hardcoded values scattered throughout codebase
paymentMethod: Joi.string().optional().valid('cash', 'bank_transfer', 'credit_card')

status: {
  type: String,
  enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
  default: 'pending',
}
```

### After (Using Enums)
```typescript
// ✅ Using centralized enums
import { PAYMENT_METHODS, ORDER_STATUSES, OrderStatus } from '../constants/common';

paymentMethod: Joi.string().optional().valid(...PAYMENT_METHODS)

status: {
  type: String,
  enum: ORDER_STATUSES,
  default: OrderStatus.PENDING,
}
```

---

## Adding New Payment Methods

To add a new payment method:

1. **Update the enum** in `src/constants/common.ts`:
```typescript
export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
  VNPAY = 'vnpay', // ← New payment method
}
```

2. **That's it!** The change automatically propagates to:
   - Validators (validation rules updated)
   - Models (database schema updated)
   - Services (type checking updated)
   - Controllers (autocomplete updated)

---

## Best Practices

### ✅ DO

```typescript
// Use enum values
import { OrderStatus } from '../constants/common';
const status = OrderStatus.PENDING;

// Use enum arrays in validators
import { PAYMENT_METHODS } from '../constants/common';
Joi.string().valid(...PAYMENT_METHODS)

// Use enum types in interfaces
import { PaymentMethod } from '../constants/common';
interface Order {
  paymentMethod?: PaymentMethod;
}
```

### ❌ DON'T

```typescript
// Don't hardcode values
const status = 'pending';

// Don't hardcode in validators
Joi.string().valid('cash', 'bank_transfer')

// Don't use string types
interface Order {
  paymentMethod?: string; // Too loose
}
```

---

## Related Files

- **Constants Definition**: `be/src/constants/common.ts`
- **Order Model**: `be/src/models/order.model.ts`
- **Order Validator**: `be/src/validators/order.validator.ts`
- **Order Service**: `be/src/services/order.service.ts`

---

## Summary

Using enums and constants provides:
- ✅ **Type Safety**: Catch errors at compile time
- ✅ **Maintainability**: Change values in one place
- ✅ **Documentation**: Self-documenting code
- ✅ **Consistency**: Same values used everywhere
- ✅ **Refactoring**: Safe and easy updates
- ✅ **IDE Support**: Better autocomplete and IntelliSense

For any questions or to add new constants, update `src/constants/common.ts` and this documentation.

