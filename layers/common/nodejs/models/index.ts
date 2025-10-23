/**
 * Model Index
 * Imports all models to ensure they're registered with Mongoose
 * This prevents "Schema hasn't been registered" errors when models reference each other
 */

// Import all models in dependency order
import './user.model';
import './brand.model';
import './category.model';
import './product.model';
import './order.model';

// Re-export models for convenience
export { User, UserType, UserStatus, type IUser } from './user.model';
export { Brand, type IBrand } from './brand.model';
export { Category, type ICategory } from './category.model';
export { 
  Product, 
  ProductStatus, 
  ProductType, 
  ProductAttributeType,
  type IProduct,
  type IProductVariant,
  type IProductAttribute 
} from './product.model';
export { 
  Order,
  type IOrder,
  type IOrderItem 
} from './order.model';

