import { Router } from "express";
import { BrandController } from "../../controllers/common/brand.controller";

const router = Router();
const brandController = new BrandController();

// Public brand routes (no authentication required)
router.get("/", brandController.getBrands.bind(brandController));
router.get("/active", brandController.getActiveBrands.bind(brandController));
router.get("/:id", brandController.getBrandById.bind(brandController));
router.get("/:id/products", brandController.getBrandProducts.bind(brandController));
router.get("/slug/:slug", brandController.getBrandBySlug.bind(brandController));

export default router;
