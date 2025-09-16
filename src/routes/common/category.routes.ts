import { Router } from "express";
import { CategoryController } from "../../controllers/common/category.controller";

const router = Router();
const categoryController = new CategoryController();

// Public category routes (no authentication required)
router.get("/", categoryController.getCategories.bind(categoryController));
router.get("/active", categoryController.getActiveCategories.bind(categoryController));
router.get("/:id", categoryController.getCategoryById.bind(categoryController));
router.get("/:id/products", categoryController.getCategoryProducts.bind(categoryController));
router.get("/slug/:slug", categoryController.getCategoryBySlug.bind(categoryController));

export default router;
