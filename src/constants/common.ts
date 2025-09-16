import { ProductStatus, ProductType } from "@/models/product.model";

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