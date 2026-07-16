import { Schema, model, Document, Types } from "mongoose";

export interface IEmailVerification extends Document {
  user: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const emailVerificationSchema = new Schema<IEmailVerification>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailVerification = model<IEmailVerification>("EmailVerification", emailVerificationSchema);
