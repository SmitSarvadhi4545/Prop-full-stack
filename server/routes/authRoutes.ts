import { Router } from "express";
import { authController } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

/**
 * Authentication routes
 * All routes are prefixed with /api/auth
 */

// Public routes (no authentication required)
router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post("/logout", authController.logout.bind(authController));

// Protected routes (authentication required)
router.get(
  "/me",
  authenticateToken,
  authController.getProfile.bind(authController)
);
router.put(
  "/profile",
  authenticateToken,
  authController.updateProfile.bind(authController)
);

// Add the /api/user route
router.get(
  "/user",
  authenticateToken,
  authController.getUser.bind(authController)
);

export const authRoutes = router;
