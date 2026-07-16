import { Router } from "express";
import { ChatController } from "../controllers/chat.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { apiRateLimiter } from "../middleware/rateLimit.middleware.js";
import { createChatSchema, renameChatSchema, pinChatSchema, archiveChatSchema, importChatSchema } from "../validators/chat.validator.js";

const router = Router();

router.use(requireAuth, apiRateLimiter);

router.post("/", validate(createChatSchema), asyncHandler(ChatController.create));
router.get("/", asyncHandler(ChatController.list));
router.post("/import", validate(importChatSchema), asyncHandler(ChatController.importChat));
router.get("/:chatId", asyncHandler(ChatController.get));
router.patch("/:chatId/rename", validate(renameChatSchema), asyncHandler(ChatController.rename));
router.patch("/:chatId/pin", validate(pinChatSchema), asyncHandler(ChatController.pin));
router.patch("/:chatId/archive", validate(archiveChatSchema), asyncHandler(ChatController.archive));
router.get("/:chatId/export", asyncHandler(ChatController.exportChat));
router.delete("/:chatId", asyncHandler(ChatController.remove));

export default router;
