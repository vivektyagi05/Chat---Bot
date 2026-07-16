import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: "user" | "admin";
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: jwt.SignOptions = { expiresIn: env.jwt.accessExpires as jwt.SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwt.accessSecret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function refreshExpiryDate(): Date {
  const match = env.jwt.refreshExpires.match(/^(\d+)([smhd])$/);
  const now = new Date();
  if (!match) return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(now.getTime() + value * multipliers[unit]);
}
