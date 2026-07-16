import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../logger/logger.js";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (!err.isOperational) logger.error("Non-operational error", { error: serializeError(err) });
    return res.status(err.statusCode).json({ success: false, message: err.message, details: err.details });
  }

  // Mongoose throws a plain CastError (e.g. malformed ObjectId in a route param)
  // outside of our repository guards; surface it as a 400 instead of a 500.
  if (err instanceof Error && err.name === "CastError") {
    logger.warn("Invalid identifier in request", { error: serializeError(err), path: req.originalUrl });
    return res.status(400).json({ success: false, message: "Invalid identifier" });
  }

  logger.error("Unhandled error", { error: serializeError(err) });
  return res.status(500).json({ success: false, message: "Internal server error" });
}

function serializeError(err: unknown): unknown {
  if (err instanceof Error) return { name: err.name, message: err.message, stack: err.stack };
  return err;
}
