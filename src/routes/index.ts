import { adminOnly, requiredAuth } from "../middleware/auth";
import { Router } from "express";
import adminRoutes from "./admin";
import authRoutes from "./auth.routes";
import commonRoutes from "./common";
import fileRoutes from "./file.routes";

const router = Router();

// Public health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Authentication APIs - prefix with /auth
router.use("/auth", authRoutes);

// Public APIs - prefix with /api (with optional auth)
router.use("/api", commonRoutes);

// Admin APIs - prefix with /admin (with authentication required)
router.use("/admin", requiredAuth, adminOnly, adminRoutes);

// File APIs - prefix with /files
router.use("/files", fileRoutes);

export default router;
