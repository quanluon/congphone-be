import { Router } from "express";
import commonRoutes from "./common";
import fileRoutes from "./file.routes";
import authRoutes from "./auth.routes";

const router = Router();

// Public health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Authentication APIs - prefix with /auth
router.use("/auth", authRoutes);

// Public APIs - prefix with /api
router.use("/api", commonRoutes);

// File APIs - prefix with /files
router.use("/files", fileRoutes);

export default router;
