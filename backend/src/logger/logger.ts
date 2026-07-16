import winston from "winston";
import { env } from "../config/env.js";

// winston.format.errors({ stack: true }) only unwraps an Error when it IS the
// log message itself. It does NOT unwrap Error instances nested in metadata,
// e.g. logger.error("failed", { error: err }) — the most common pattern in
// this codebase — which serialized to "{}" because Error's message/stack are
// non-enumerable. This format walks top-level metadata values and expands
// any Error instances (and Error instances one level deep in objects/arrays)
// into plain, loggable objects before JSON serialization.
const unwrapErrors = winston.format((info) => {
  for (const key of Object.keys(info)) {
    const value = (info as Record<string, unknown>)[key];
    if (value instanceof Error) {
      (info as Record<string, unknown>)[key] = { name: value.name, message: value.message, stack: value.stack };
    } else if (value && typeof value === "object") {
      for (const nestedKey of Object.keys(value as Record<string, unknown>)) {
        const nested = (value as Record<string, unknown>)[nestedKey];
        if (nested instanceof Error) {
          (value as Record<string, unknown>)[nestedKey] = { name: nested.name, message: nested.message, stack: nested.stack };
        }
      }
    }
  }
  return info;
});

export const logger = winston.createLogger({
  level: env.nodeEnv === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    unwrapErrors(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});
