import { Chat, IChat } from "../models/chat.model.js";
import { Types } from "mongoose";

export const ChatRepository = {
  async create(userId: Types.ObjectId, data: Partial<IChat> = {}): Promise<IChat> {
    return Chat.create({ user: userId, ...data });
  },
  async findById(id: string | Types.ObjectId): Promise<IChat | null> {
    return Chat.findById(id).exec();
  },
  async findByIdForUser(id: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<IChat | null> {
    return Chat.findOne({ _id: id, user: userId }).exec();
  },
  async listForUser(userId: string | Types.ObjectId, opts: { search?: string; archived?: boolean } = {}): Promise<IChat[]> {
    const filter: Record<string, unknown> = { user: userId };
    if (opts.archived !== undefined) filter.isArchived = opts.archived;
    if (opts.search) filter.title = { $regex: opts.search, $options: "i" };
    return Chat.find(filter).sort({ isPinned: -1, updatedAt: -1 }).exec();
  },
  async rename(id: string | Types.ObjectId, userId: string | Types.ObjectId, title: string): Promise<IChat | null> {
    return Chat.findOneAndUpdate({ _id: id, user: userId }, { title }, { new: true }).exec();
  },
  async setPinned(id: string | Types.ObjectId, userId: string | Types.ObjectId, isPinned: boolean): Promise<IChat | null> {
    return Chat.findOneAndUpdate({ _id: id, user: userId }, { isPinned }, { new: true }).exec();
  },
  async setArchived(id: string | Types.ObjectId, userId: string | Types.ObjectId, isArchived: boolean): Promise<IChat | null> {
    return Chat.findOneAndUpdate({ _id: id, user: userId }, { isArchived }, { new: true }).exec();
  },
  async touch(id: string | Types.ObjectId): Promise<void> {
    await Chat.updateOne({ _id: id }, { updatedAt: new Date() }).exec();
  },
  async delete(id: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<void> {
    await Chat.deleteOne({ _id: id, user: userId }).exec();
  },
};
