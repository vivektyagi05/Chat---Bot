import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository.js";
import { SessionRepository } from "../repositories/session.repository.js";
import { MailerService } from "./mailer.service.js";
import { PasswordReset } from "../models/passwordReset.model.js";
import { EmailVerification } from "../models/emailVerification.model.js";
import { signAccessToken, generateRefreshToken, hashToken, refreshExpiryDate, generateRandomToken } from "../utils/token.js";
import { ApiError } from "../utils/ApiError.js";
import { Types } from "mongoose";

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

interface DeviceInfo { userAgent?: string; ip?: string; }

export const AuthService = {
  async register(name: string, email: string, password: string, device: DeviceInfo) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) throw ApiError.conflict("An account with this email already exists");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserRepository.create({ name, email, passwordHash });

    const verifyToken = generateRandomToken();
    await EmailVerification.create({
      user: user._id,
      tokenHash: hashToken(verifyToken),
      expiresAt: new Date(Date.now() + EMAIL_VERIFY_TTL_MS),
    });
    await MailerService.sendVerificationEmail(user.email, verifyToken);

    const tokens = await this.issueTokens(user._id, user.email, user.role, device);
    return {
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified },
      ...tokens,
    };
  },

  async login(email: string, password: string, device: DeviceInfo) {
    const user = await UserRepository.findByEmail(email, true);
    if (!user) throw ApiError.unauthorized("Invalid email or password");
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized("Invalid email or password");

    const tokens = await this.issueTokens(user._id, user.email, user.role, device);
    return {
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified },
      ...tokens,
    };
  },

  async issueTokens(userId: Types.ObjectId, email: string, role: "user" | "admin", device: DeviceInfo) {
    const accessToken = signAccessToken({ sub: userId.toString(), email, role });
    const refreshToken = generateRefreshToken();
    await SessionRepository.create({
      user: userId,
      refreshTokenHash: hashToken(refreshToken),
      userAgent: device.userAgent,
      ip: device.ip,
      expiresAt: refreshExpiryDate(),
    });
    return { accessToken, refreshToken };
  },

  async refresh(refreshToken: string, device: DeviceInfo) {
    const tokenHash = hashToken(refreshToken);
    const session = await SessionRepository.findByTokenHash(tokenHash);
    if (!session || session.expiresAt < new Date()) throw ApiError.unauthorized("Invalid or expired refresh token");

    const user = await UserRepository.findById(session.user);
    if (!user) throw ApiError.unauthorized("Invalid session");

    await SessionRepository.deleteByTokenHash(tokenHash);
    return this.issueTokens(user._id, user.email, user.role, device);
  },

  async logout(refreshToken: string): Promise<void> {
    await SessionRepository.deleteByTokenHash(hashToken(refreshToken));
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await UserRepository.findByEmail(email);
    if (!user) return;
    const token = generateRandomToken();
    await PasswordReset.create({
      user: user._id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    });
    await MailerService.sendPasswordResetEmail(user.email, token);
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);
    const record = await PasswordReset.findOne({ tokenHash, used: false }).exec();
    if (!record || record.expiresAt < new Date()) throw ApiError.badRequest("Invalid or expired reset token");

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await UserRepository.updatePassword(record.user, passwordHash);
    record.used = true;
    await record.save();
    await SessionRepository.deleteAllForUser(record.user);
  },

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    const record = await EmailVerification.findOne({ tokenHash }).exec();
    if (!record || record.expiresAt < new Date()) throw ApiError.badRequest("Invalid or expired verification token");
    await UserRepository.markEmailVerified(record.user);
    await EmailVerification.deleteOne({ _id: record._id }).exec();
  },
};
