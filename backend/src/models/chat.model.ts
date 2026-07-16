import { Schema, model, Document, Types } from "mongoose";

export interface IChat extends Document {
  user: Types.ObjectId;
  title: string;
  aiModel: string;
  systemPrompt?: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "New Chat", maxlength: 200 },
    aiModel: { type: String, default: "gemini-3.5-flash" },
    systemPrompt: { type: String },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

chatSchema.index({ user: 1, createdAt: -1 });
chatSchema.index({ user: 1, title: "text" });

export const Chat = model<IChat>("Chat", chatSchema);
