import { Schema, model, Document, Types } from "mongoose";

export type MessageRole = "user" | "assistant" | "system";

export interface IMessage extends Document {
  chat: Types.ObjectId;
  user: Types.ObjectId;
  role: MessageRole;
  content: string;
  tokenCount?: number;
  isError?: boolean;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  tokenCount: { type: Number },
  isError: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ chat: 1, createdAt: 1 });

export const Message = model<IMessage>("Message", messageSchema);
