import { Router } from "express";
import productRoutes from "./product.routes";
import brandRoutes from "./brand.routes";
import categoryRoutes from "./category.routes";

const router = Router();

// Admin product management routes
router.use("/products", productRoutes);

// Admin brand management routes
router.use("/brands", brandRoutes);

// Admin category management routes
router.use("/categories", categoryRoutes);

// Add other admin routes here as needed
// router.use("/users", userRoutes);

export default router;
