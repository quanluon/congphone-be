import { Router } from "express";
import brandRoutes from "./brand.routes";
import categoryRoutes from "./category.routes";
import orderRoutes from "./order.routes";
import productRoutes from "./product.routes";
import userRoutes from "./user.routes";

const router = Router();

// Admin product management routes
router.use("/products", productRoutes);

// Admin brand management routes
router.use("/brands", brandRoutes);

// Admin category management routes
router.use("/categories", categoryRoutes);

// Admin order management routes
router.use("/orders", orderRoutes);

// Admin user management routes
router.use("/users", userRoutes);

export default router;
