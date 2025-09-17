import { Router } from "express";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import brandRoutes from "./brand.routes";
import orderRoutes from "./order.routes";

const router = Router();

// Public routes (no authentication required)
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/orders", orderRoutes);

export default router;
