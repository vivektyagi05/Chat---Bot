import { Schema, model, Document, Types } from "mongoose";

export interface ISession extends Document {
  user: Types.ObjectId;
  refreshTokenHash: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  refreshTokenHash: { type: String, required: true },
  userAgent: { type: String },
  ip: { type: String },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = model<ISession>("Session", sessionSchema);
