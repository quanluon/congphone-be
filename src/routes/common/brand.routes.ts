import { Router } from "express";
import { BrandController } from "../../controllers/common/brand.controller";

const router = Router();
const brandController = new BrandController();

// Public brand routes (no authentication required)
router.get("/", brandController.getBrands);
router.get("/active", brandController.getActiveBrands);
router.get("/:id", brandController.getBrandById);
router.get("/:id/products", brandController.getBrandProducts);
router.get("/slug/:slug", brandController.getBrandBySlug);

export default router;
