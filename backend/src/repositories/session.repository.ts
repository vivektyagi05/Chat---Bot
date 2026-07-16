import { Session, ISession } from "../models/session.model.js";
import { Types } from "mongoose";

export const SessionRepository = {
  async create(data: { user: Types.ObjectId; refreshTokenHash: string; userAgent?: string; ip?: string; expiresAt: Date; }): Promise<ISession> {
    return Session.create(data);
  },
  async findByTokenHash(refreshTokenHash: string): Promise<ISession | null> {
    return Session.findOne({ refreshTokenHash }).exec();
  },
  async deleteByTokenHash(refreshTokenHash: string): Promise<void> {
    await Session.deleteOne({ refreshTokenHash }).exec();
  },
  async deleteAllForUser(userId: string | Types.ObjectId): Promise<void> {
    await Session.deleteMany({ user: userId }).exec();
  },
};
