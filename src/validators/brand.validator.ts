import Joi from 'joi';

export const createBrandSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(100),
  description: Joi.string().trim().max(500).optional(),
  logo: Joi.string().uri().optional(),
  website: Joi.string().uri().optional(),
  isActive: Joi.boolean().optional().default(true)
});

export const updateBrandSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().max(500).optional(),
  logo: Joi.string().uri().optional(),
  website: Joi.string().uri().optional(),
  isActive: Joi.boolean().optional()
});

export const listBrandsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10),
  search: Joi.string().trim().optional(),
  isActive: Joi.boolean().optional()
});
