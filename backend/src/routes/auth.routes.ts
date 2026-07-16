import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), asyncHandler(AuthController.register));
router.post("/login", authRateLimiter, validate(loginSchema), asyncHandler(AuthController.login));
router.post("/refresh", asyncHandler(AuthController.refresh));
router.post("/logout", asyncHandler(AuthController.logout));
router.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), asyncHandler(AuthController.forgotPassword));
router.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), asyncHandler(AuthController.resetPassword));
router.post("/verify-email", validate(verifyEmailSchema), asyncHandler(AuthController.verifyEmail));
router.get("/me", requireAuth, asyncHandler(AuthController.me));

export default router;
