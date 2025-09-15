import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { adminOnly, requiredAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  confirmForgotPasswordSchema,
  forgotPasswordSchema,
  getAllUsersSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  updateProfileSchema,
} from "../validators/auth.validator";

const router = Router();
const authController = new AuthController();

// Public routes (no authentication required)
router.post(
  "/register",
  validate({ body: registerSchema }),
  authController.registerPublic
);
router.post("/login", validate({ body: loginSchema }), authController.login);
router.post(
  "/refresh",
  validate({ body: refreshTokenSchema }),
  authController.refreshToken
);
router.post(
  "/forgot-password",
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validate({ body: confirmForgotPasswordSchema }),
  authController.confirmForgotPassword
);

// Protected routes (authentication required)
router.post("/logout", requiredAuth, authController.logout);
router.get("/profile", requiredAuth, authController.getProfile);
router.put(
  "/profile",
  requiredAuth,
  validate({ body: updateProfileSchema }),
  authController.updateProfile
);

// Admin only routes
router.post(
  "/admin/register",
  adminOnly,
  validate({ body: registerSchema }),
  authController.register
);
router.get(
  "/users",
  adminOnly,
  validate({ query: getAllUsersSchema }),
  authController.getAllUsers
);
router.get("/users/:id", adminOnly, authController.getUserById);
router.delete("/users/:email", adminOnly, authController.deactivateUser);

export default router;
