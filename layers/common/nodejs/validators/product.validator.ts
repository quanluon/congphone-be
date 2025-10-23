import Joi from 'joi';

const productBaseSchema = {
  name: Joi.string().min(2).max(200),
  description: Joi.string().min(10),
  price: Joi.number().min(0),
  images: Joi.array().items(Joi.string().uri()),
  category: Joi.string(),
  brand: Joi.string(),
  stock: Joi.number().min(0),
  specifications: Joi.object().pattern(
    Joi.string(),
    Joi.any()
  ),
  isActive: Joi.boolean()
};

export const createProductSchema = Joi.object({
  ...productBaseSchema,
  name: productBaseSchema.name.required(),
  description: productBaseSchema.description.required(),
  price: productBaseSchema.price.required(),
  images: productBaseSchema.images.required(),
  category: productBaseSchema.category.required(),
  brand: productBaseSchema.brand.required(),
  stock: productBaseSchema.stock.required()
});

export const updateProductSchema = Joi.object(productBaseSchema).min(1);

export const listProductsSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  category: Joi.string(),
  brand: Joi.string(),
  search: Joi.string(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(Joi.ref('minPrice'))
});
