import { Router } from "express";
import { AdminProductController } from "../../controllers/admin/product.controller";
import { adminOnly, requiredAuth } from "../../middleware/auth";
import { validate, validateRequest } from "../../middleware/validate";
import {
  bulkDeleteSchema,
  bulkUpdateSchema,
  createProductSchema,
  listProductsSchema,
  updateProductSchema,
  updateStatusSchema
} from "../../validators/admin/product.validator";

const router = Router();
const adminProductController = new AdminProductController();

// Product CRUD operations
router.get("/", validate({ query: listProductsSchema }), adminProductController.getProducts.bind(adminProductController));
router.get("/stats", adminProductController.getProductStats.bind(adminProductController));
// AI extraction
router.post("/ai-extract", adminProductController.aiExtractProduct.bind(adminProductController));

router.get("/:id", adminProductController.getProductById.bind(adminProductController));
router.post("/", validateRequest(createProductSchema), adminProductController.createProduct.bind(adminProductController));
router.put("/:id", validateRequest(updateProductSchema), adminProductController.updateProduct.bind(adminProductController));
router.delete("/:id", adminProductController.deleteProduct.bind(adminProductController));
router.delete("/:id/hard", adminProductController.hardDeleteProduct.bind(adminProductController));

// Bulk operations
router.put("/bulk/update", validateRequest(bulkUpdateSchema), adminProductController.bulkUpdateProducts.bind(adminProductController));
router.delete("/bulk/delete", validateRequest(bulkDeleteSchema), adminProductController.bulkDeleteProducts.bind(adminProductController));

// Product status and feature management
router.patch("/:id/status", validateRequest(updateStatusSchema), adminProductController.updateProductStatus.bind(adminProductController));
router.patch("/:id/featured", adminProductController.toggleFeatured.bind(adminProductController));
router.patch("/:id/new", adminProductController.toggleNew.bind(adminProductController));

// Product variants management
router.get("/:id/variants", adminProductController.getProductVariants.bind(adminProductController));
router.put("/:id/variants", adminProductController.updateProductVariants.bind(adminProductController));

export default router;
