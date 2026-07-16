import { Router } from "express";
import { MessageController } from "../controllers/message.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { chatRateLimiter } from "../middleware/rateLimit.middleware.js";
import { sendMessageSchema, editMessageSchema } from "../validators/message.validator.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", asyncHandler(MessageController.list));
router.post("/", chatRateLimiter, validate(sendMessageSchema), asyncHandler(MessageController.send));
router.post("/:messageId/regenerate", chatRateLimiter, asyncHandler(MessageController.regenerate));
router.post("/:messageId/edit", chatRateLimiter, validate(editMessageSchema), asyncHandler(MessageController.editAndResend));
router.post("/stop", asyncHandler(MessageController.stop));

export default router;
