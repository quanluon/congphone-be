import { Router } from "express";
import { ProductController } from "../../controllers/common/product.controller";

const router = Router();
const productController = new ProductController();

// Public product routes (no authentication required)
router.get("/", productController.getProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/new", productController.getNewProducts);
router.get("/by-category/:categoryId", productController.getProductsByCategory);
router.get("/by-brand/:brandId", productController.getProductsByBrand);
router.get("/by-type/:productType", productController.getProductsByType);
router.get("/:id", productController.getProductById);
router.get("/:id/variants", productController.getProductVariants);
router.get("/:id/related", productController.getRelatedProducts);

// Product filtering and sorting
router.get("/filter/price-range", productController.getPriceRange);
router.get("/filter/colors", productController.getAvailableColors);
router.get("/filter/storage-options", productController.getStorageOptions);

export default router;
