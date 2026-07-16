import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { env } from "../config/env.js";

const REFRESH_COOKIE = "refreshToken";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function device(req: Request) {
  return { userAgent: req.headers["user-agent"], ip: req.ip };
}

export const AuthController = {
  async register(req: Request, res: Response) {
    const { name, email, password } = req.body;
    const result = await AuthService.register(name, email, password, device(req));
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password, device(req));
    setRefreshCookie(res, result.refreshToken);
    res.json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) return res.status(401).json({ success: false, message: "No refresh token" });
    const result = await AuthService.refresh(token, device(req));
    setRefreshCookie(res, result.refreshToken);
    res.json({ success: true, data: { accessToken: result.accessToken } });
  },

  async logout(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) await AuthService.logout(token);
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    res.json({ success: true, message: "Logged out" });
  },

  async forgotPassword(req: Request, res: Response) {
    await AuthService.forgotPassword(req.body.email);
    res.json({ success: true, message: "If that email exists, a reset link has been sent" });
  },

  async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);
    res.json({ success: true, message: "Password reset successful" });
  },

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.body;
    await AuthService.verifyEmail(token);
    res.json({ success: true, message: "Email verified" });
  },

  async me(req: Request, res: Response) {
    res.json({ success: true, data: { user: req.user } });
  },
};
