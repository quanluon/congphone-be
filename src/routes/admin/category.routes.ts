import { Router } from 'express';
import { adminCategoryController } from '../../controllers/admin/category.controller';
import { adminOnly } from '../../middleware/auth';
import { validate, validateRequest } from '../../middleware/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesSchema
} from '../../validators/category.validator';

const router = Router();

// Admin category management routes
router.post(
  '/',
  validateRequest(createCategorySchema),
  adminCategoryController.createCategory.bind(adminCategoryController)
);

router.get(
  '/',
  validate({ query: listCategoriesSchema }),
  adminCategoryController.listCategories.bind(adminCategoryController)
);

router.get(
  '/:id',
  adminCategoryController.getCategory.bind(adminCategoryController)
);

router.put(
  '/:id',
  validateRequest(updateCategorySchema),
  adminCategoryController.updateCategory.bind(adminCategoryController)
);

router.delete(
  '/:id',
  adminCategoryController.deleteCategory.bind(adminCategoryController)
);

export default router;
