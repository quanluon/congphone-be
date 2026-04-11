import { Router } from 'express';
import { adminBrandController } from '../../controllers/admin/brand.controller';
import { adminOnly } from '../../middleware/auth';
import { validate, validateRequest } from '../../middleware/validate';
import {
  createBrandSchema,
  updateBrandSchema,
  listBrandsSchema
} from '../../validators/brand.validator';

const router = Router();

// Admin brand management routes
router.post(
  '/',
  validateRequest(createBrandSchema),
  adminBrandController.createBrand.bind(adminBrandController)
);

router.get(
  '/',
  validate({ query: listBrandsSchema }),
  adminBrandController.listBrands.bind(adminBrandController)
);

router.get(
  '/active',
  adminBrandController.getAllActiveBrands.bind(adminBrandController)
);

router.get(
  '/:id',
  adminBrandController.getBrand.bind(adminBrandController)
);

router.put(
  '/:id',
  validateRequest(updateBrandSchema),
  adminBrandController.updateBrand.bind(adminBrandController)
);

router.delete(
  '/:id',
  adminBrandController.deleteBrand.bind(adminBrandController)
);

export default router;
