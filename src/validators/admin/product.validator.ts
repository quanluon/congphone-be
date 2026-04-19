import Joi from 'joi';
import { ProductAttributeType, ProductStatus, ProductType } from '../../models/product.model';

// Product variant schema
const productVariantSchema = Joi.object({
  name: Joi.string().required().trim(),
  color: Joi.string().required().trim(),
  colorCode: Joi.string().required().trim().pattern(/^#[0-9A-Fa-f]{6}$/),
  storage: Joi.string().trim().optional().allow(null),
  size: Joi.string().trim().optional().allow(null),
  connectivity: Joi.string().trim().optional().allow(null),
  simType: Joi.string().trim().optional().allow(null),
  price: Joi.number().required().min(0),
  originalPrice: Joi.number().min(0).optional().allow(null),
  stock: Joi.number().required().min(0),
  images: Joi.array().items(Joi.string().uri()).optional().allow(null),
  attributes: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim(),
      value: Joi.string().required().trim(),
      unit: Joi.string().trim().optional().allow(""),
      category: Joi.string().trim().optional()
    })
  ).optional(),
  isActive: Joi.boolean().optional().default(true)
});

// Product attribute schema
const productAttributeSchema = Joi.object({
  name: Joi.string().required().trim(),
  value: Joi.string().required().trim(),
  unit: Joi.string().trim().optional().allow(""),
  category: Joi.string().trim().optional(),
  type: Joi.string().valid(...Object.values(ProductAttributeType)).optional().default(ProductAttributeType.CUSTOM).allow("")
});

// Base product schema
const productBaseSchema = {
  name: Joi.string().trim(),
  description: Joi.string().trim(),
  shortDescription: Joi.string().trim().optional().allow(null),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  brand: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  productType: Joi.string().valid(...Object.values(ProductType)),
  variants: Joi.array().items(productVariantSchema).min(1),
  basePrice: Joi.number().min(0),
  originalBasePrice: Joi.number().min(0).optional().allow(null),
  images: Joi.array().items(Joi.string().uri()).optional(),
  features: Joi.array().items(Joi.string().trim()),
  attributes: Joi.array().items(productAttributeSchema),
  status: Joi.string().valid(...Object.values(ProductStatus)),
  isFeatured: Joi.boolean(),
  isNew: Joi.boolean(),
  isHiddenPrice: Joi.boolean(),
  tags: Joi.array().items(Joi.string().trim()),
  metaTitle: Joi.string().trim().allow('').optional(),
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
  productIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).required(),
  updateData: Joi.object({
    status: Joi.string().valid(...Object.values(ProductStatus)).optional(),
    isFeatured: Joi.boolean().optional(),
    isNew: Joi.boolean().optional(),
    isHiddenPrice: Joi.boolean().optional(),
    category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    brand: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
  }).min(1).required()
});

// Bulk delete schema
export const bulkDeleteSchema = Joi.object({
  productIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).required()
});

// Update status schema
export const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ProductStatus)).required()
});

// Update variants schema
export const updateVariantsSchema = Joi.object({
  variants: Joi.array().items(productVariantSchema).min(1).required()
});
