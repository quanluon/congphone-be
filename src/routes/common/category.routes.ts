import { Router } from "express";
import { CategoryController } from "../../controllers/common/category.controller";

const router = Router();
const categoryController = new CategoryController();

// Public category routes (no authentication required)
router.get("/", categoryController.getCategories);
router.get("/active", categoryController.getActiveCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/:id/products", categoryController.getCategoryProducts);
router.get("/slug/:slug", categoryController.getCategoryBySlug);

export default router;
