import Joi from 'joi';
import { ProductStatus, ProductType } from '../../models/product.model';

// Product variant schema
const productVariantSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(200),
  color: Joi.string().required().trim().min(1).max(50),
  colorCode: Joi.string().required().trim().pattern(/^#[0-9A-Fa-f]{6}$/),
  storage: Joi.string().trim().max(50).optional(),
  size: Joi.string().trim().max(50).optional(),
  connectivity: Joi.string().trim().max(50).optional(),
  simType: Joi.string().trim().max(50).optional(),
  price: Joi.number().required().min(0),
  originalPrice: Joi.number().min(0).optional(),
  stock: Joi.number().required().min(0),
  images: Joi.array().items(Joi.string().uri()).optional(),
  attributes: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim().min(1).max(100),
      value: Joi.string().required().trim().min(1).max(200),
      unit: Joi.string().trim().max(20).optional(),
      category: Joi.string().trim().max(50).optional()
    })
  ).optional(),
  isActive: Joi.boolean().optional().default(true)
});

// Product attribute schema
const productAttributeSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(100),
  value: Joi.string().required().trim().min(1).max(200),
  unit: Joi.string().trim().max(20).optional(),
  category: Joi.string().trim().max(50).optional()
});

// Base product schema
const productBaseSchema = {
  name: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().min(10).max(5000),
  shortDescription: Joi.string().trim().optional(),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  brand: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  productType: Joi.string().valid(...Object.values(ProductType)),
  variants: Joi.array().items(productVariantSchema).min(1),
  basePrice: Joi.number().min(0),
  originalBasePrice: Joi.number().min(0).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  features: Joi.array().items(Joi.string().trim().max(200)),
  attributes: Joi.array().items(productAttributeSchema),
  status: Joi.string().valid(...Object.values(ProductStatus)),
  isFeatured: Joi.boolean(),
  isNew: Joi.boolean(),
  tags: Joi.array().items(Joi.string().trim().max(50)),
  metaTitle: Joi.string().trim().max(200).allow('').optional(),
  metaDescription: Joi.string().trim().allow('').optional()
};

// Create product schema
export const createProductSchema = Joi.object({
  ...productBaseSchema,
  name: productBaseSchema.name.required(),
  description: productBaseSchema.description.required(),
  category: productBaseSchema.category.required(),
  brand: productBaseSchema.brand.required(),
  productType: productBaseSchema.productType.required(),
  variants: productBaseSchema.variants.required(),
  images: productBaseSchema.images.optional(),
  features: productBaseSchema.features.optional(),
  attributes: productBaseSchema.attributes.optional(),
  status: productBaseSchema.status.optional().default(ProductStatus.DRAFT),
  isFeatured: productBaseSchema.isFeatured.optional().default(false),
  isNew: productBaseSchema.isNew.optional().default(false),
  tags: productBaseSchema.tags.optional()
});

// Update product schema
export const updateProductSchema = Joi.object(productBaseSchema).min(1);

// List products schema for admin
export const listProductsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10),
  sort: Joi.string().valid('name', 'createdAt', 'updatedAt', 'basePrice', 'status').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  brand: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  productType: Joi.string().valid(...Object.values(ProductType)).optional(),
  status: Joi.string().valid(...Object.values(ProductStatus)).optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(Joi.ref('minPrice')).optional(),
  isFeatured: Joi.boolean().optional(),
  isNew: Joi.boolean().optional(),
  search: Joi.string().trim().max(200).optional()
});

// Bulk update schema
export const bulkUpdateSchema = Joi.object({
  productIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).max(100).required(),
  updateData: Joi.object({
    status: Joi.string().valid(...Object.values(ProductStatus)).optional(),
    isFeatured: Joi.boolean().optional(),
    isNew: Joi.boolean().optional(),
    category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    brand: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
  }).min(1).required()
});

// Bulk delete schema
export const bulkDeleteSchema = Joi.object({
  productIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).max(100).required()
});

// Update status schema
export const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ProductStatus)).required()
});

// Update variants schema
export const updateVariantsSchema = Joi.object({
  variants: Joi.array().items(productVariantSchema).min(1).required()
});
