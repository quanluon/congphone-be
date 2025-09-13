import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema, 
  forgotPasswordSchema, 
  confirmForgotPasswordSchema, 
  updateProfileSchema, 
  getAllUsersSchema 
} from "../validators/auth.validator";
import { requiredAuth, adminOnly } from "../middleware/auth";

const router = Router();
const authController = new AuthController();

// Public routes (no authentication required)
router.post("/login", validate({ body: loginSchema }), authController.login);
router.post("/refresh-token", validate({ body: refreshTokenSchema }), authController.refreshToken);
router.post("/forgot-password", validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post("/confirm-forgot-password", validate({ body: confirmForgotPasswordSchema }), authController.confirmForgotPassword);

// Protected routes (authentication required)
router.get("/profile", requiredAuth, authController.getProfile);
router.put("/profile", requiredAuth, validate({ body: updateProfileSchema }), authController.updateProfile);

// Admin only routes
router.post("/register", adminOnly, validate({ body: registerSchema }), authController.register);
router.get("/users", adminOnly, validate({ query: getAllUsersSchema }), authController.getAllUsers);
router.get("/users/:id", adminOnly, authController.getUserById);
router.delete("/users/:email", adminOnly, authController.deactivateUser);

export default router;
