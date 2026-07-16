import { Message, IMessage, MessageRole } from "../models/message.model.js";
import { Types } from "mongoose";

export const MessageRepository = {
  async create(data: { chat: Types.ObjectId; user: Types.ObjectId; role: MessageRole; content: string; tokenCount?: number; isError?: boolean; }): Promise<IMessage> {
    return Message.create(data);
  },
  async listForChat(chatId: string | Types.ObjectId, limit = 100): Promise<IMessage[]> {
    return Message.find({ chat: chatId }).sort({ createdAt: 1 }).limit(limit).exec();
  },
  async recentForContext(chatId: string | Types.ObjectId, limit = 20): Promise<IMessage[]> {
    const docs = await Message.find({ chat: chatId }).sort({ createdAt: -1 }).limit(limit).exec();
    return docs.reverse();
  },
  async findById(id: string | Types.ObjectId): Promise<IMessage | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Message.findById(id).exec();
  },
  async deleteAfter(chatId: string | Types.ObjectId, afterCreatedAt: Date): Promise<void> {
    await Message.deleteMany({ chat: chatId, createdAt: { $gt: afterCreatedAt } }).exec();
  },
  async deleteById(id: string | Types.ObjectId): Promise<void> {
    await Message.deleteOne({ _id: id }).exec();
  },
  async updateContent(id: string | Types.ObjectId, content: string): Promise<void> {
    await Message.updateOne({ _id: id }, { content }).exec();
  },
  async deleteAllForChat(chatId: string | Types.ObjectId): Promise<void> {
    await Message.deleteMany({ chat: chatId }).exec();
  },
};
