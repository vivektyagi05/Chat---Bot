import { logger } from "../logger/logger.js";

export const MailerService = {
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    logger.info(`[MAIL] Verification email for ${to}: ${link}`);
  },
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    logger.info(`[MAIL] Password reset email for ${to}: ${link}`);
  },
};
